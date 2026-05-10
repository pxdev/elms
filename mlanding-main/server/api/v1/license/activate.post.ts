// Public license activation endpoint — called by self-hosted Momentfy
// instances during the install wizard.
//
// Flow:
//   1. Look up the License by hashed key (no plaintext on server logs).
//   2. If license is REVOKED / EXPIRED / inactive — refuse.
//   3. If this fingerprint already has an Activation row, reissue the
//      certificate (idempotent: re-running the installer is harmless).
//   4. Otherwise create a new Activation if count < maxActivations,
//      else 403 'max_activations_reached'.
//   5. Return an Ed25519-signed certificate bound to the fingerprint.
//
// The activationToken stays in the DB as the stable activation identity
// (for deactivate + heartbeat), but the customer-facing artefact is now
// the certificate JSON — that is what the main app persists and verifies.
//
// Rate-limited tightly (5/min/IP) — activations are rare and abuse-prone.

import prisma from '../../../utils/prisma'
import { randomBytes } from 'node:crypto'
import { activateLicenseSchema, validateBody } from '../../../utils/validation'
import { hashLicenseKey, isLicenseKeyShape, normaliseLicenseKey } from '../../../utils/license'
import { signCertificate, type CertificatePayload } from '../../../utils/license-signing'
import { auditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { max: 5, windowSeconds: 60 })
  const body = await validateBody(event, activateLicenseSchema)

  // Accept lightly-malformed input (whitespace, wrong case, common typos
  // in separators) so a customer who pasted their key with trailing
  // whitespace doesn't get a confusing "not found".
  const key = normaliseLicenseKey(body.key)

  if (!isLicenseKeyShape(key)) {
    // Distinct from "not found" — tells the customer to double-check
    // the key they pasted rather than contacting support. Doesn't leak
    // anything an attacker could use for enumeration (an attacker
    // submitting random strings gets this for obviously-wrong formats
    // and "not found" for well-shaped random guesses; both are useless).
    throw createError({
      statusCode: 400,
      statusMessage: 'License key format is invalid',
      data: {
        reason: 'invalid_format',
        hint: 'Expected format: MFY-XXXX-XXXX-XXXX-XXXX-XXXX (letters and digits, no O/I/L/U)'
      }
    })
  }

  const keyHash = hashLicenseKey(key)
  const license = await prisma.license.findUnique({
    where: { keyHash },
    include: {
      plan: { select: { slug: true, name: true } },
      account: { select: { email: true } }
    }
  })

  if (!license) {
    throw createError({
      statusCode: 404,
      statusMessage: 'License key not recognised',
      data: {
        reason: 'not_found',
        hint: 'Check the key in your purchase email. If you just bought, the key may take a minute to sync.'
      }
    })
  }
  if (license.status === 'REVOKED') {
    throw createError({
      statusCode: 403,
      statusMessage: 'License revoked',
      data: {
        reason: 'revoked',
        revokedReason: license.revokedReason,
        hint: 'This key has been revoked by the vendor. Contact support if you believe this is a mistake.'
      }
    })
  }
  if (license.status === 'EXPIRED' || (license.expiresAt && license.expiresAt < new Date())) {
    throw createError({
      statusCode: 403,
      statusMessage: 'License expired',
      data: {
        reason: 'expired',
        expiredAt: license.expiresAt,
        hint: 'Renew your license to reactivate.'
      }
    })
  }

  const ip = getRequestIP(event, { xForwardedFor: true }) || null
  const issuer = process.env.NUXT_PUBLIC_PORTAL_URL || 'momentfy.com'

  // Activation decision tree — all paths inside a single Serializable
  // transaction so the capacity check and the write agree on the same
  // snapshot.
  //
  //   ┌─ existing row for (licenseId, fingerprint)? ─┐
  //   │                                              │
  //   ├─ yes, still active → idempotent refresh      │
  //   │   (re-running installer, same machine, same  │
  //   │   key — no slot consumption, reuse token)    │
  //   │                                              │
  //   ├─ yes, deactivated → revive                   │
  //   │   (key rotated or manually deactivated and   │
  //   │   the same machine is coming back — consumes │
  //   │   a slot, fresh token)                       │
  //   │                                              │
  //   └─ no → create new                             │
  //       (first activation from this machine —      │
  //       consumes a slot, fresh token)              │
  //
  // Reviving rather than inserting a new row matters: the unique index
  // on (licenseId, fingerprint) ignores deactivatedAt, so a naïve
  // INSERT after rotation would collide. Also keeps the audit trail
  // continuous — one Activation row per (license, machine) pairing,
  // whatever its history.
  const newToken = randomBytes(32).toString('base64url')
  let activation: { id: string; createdAt: Date; activationToken: string; wasRevived: boolean } | null = null

  try {
    activation = await prisma.$transaction(async (tx) => {
      const existing = await tx.activation.findUnique({
        where: { licenseId_fingerprint: { licenseId: license.id, fingerprint: body.fingerprint } }
      })
      const now = new Date()

      if (existing && !existing.deactivatedAt) {
        // Still active — idempotent refresh, no slot change, reuse token.
        const updated = await tx.activation.update({
          where: { id: existing.id },
          data: {
            lastSeenAt: now,
            ipAddress: ip,
            appVersion: body.version ?? existing.appVersion,
            hostname: body.hostname ?? existing.hostname
          }
        })
        return {
          id: updated.id,
          createdAt: updated.createdAt,
          activationToken: updated.activationToken,
          wasRevived: false
        }
      }

      // Either reviving a deactivated row or creating a fresh one —
      // both consume a slot.
      const live = await tx.activation.count({
        where: { licenseId: license.id, deactivatedAt: null }
      })
      if (live >= license.maxActivations) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Maximum installs reached for this license',
          data: {
            reason: 'max_activations_reached',
            current: live,
            max: license.maxActivations,
            hint: license.maxActivations === 1
              ? 'This license is already active on another machine. Deactivate it there first, or contact support to reset.'
              : `This license is already installed on ${live} of ${license.maxActivations} allowed machines.`
          }
        })
      }

      if (existing) {
        // Revive: same row, fresh token, cleared deactivatedAt.
        const revived = await tx.activation.update({
          where: { id: existing.id },
          data: {
            deactivatedAt: null,
            activationToken: newToken,
            lastSeenAt: now,
            ipAddress: ip,
            appVersion: body.version ?? null,
            hostname: body.hostname ?? null
          }
        })
        return {
          id: revived.id,
          createdAt: revived.createdAt,
          activationToken: revived.activationToken,
          wasRevived: true
        }
      }

      const created = await tx.activation.create({
        data: {
          licenseId: license.id,
          fingerprint: body.fingerprint,
          hostname: body.hostname ?? null,
          ipAddress: ip,
          appVersion: body.version ?? null,
          activationToken: newToken
        }
      })
      return {
        id: created.id,
        createdAt: created.createdAt,
        activationToken: created.activationToken,
        wasRevived: false
      }
    }, { isolationLevel: 'Serializable' })
  } catch (err: any) {
    if (err && typeof err === 'object' && 'statusCode' in err) throw err
    // Internal error — log it server-side, return a generic message.
    // In non-production, also surface the error text so the operator can
    // debug without terminal access.
    console.error('[license.activate] unexpected error:', err)
    const isProd = process.env.NODE_ENV === 'production'
    throw createError({
      statusCode: 500,
      statusMessage: 'Activation failed due to a server error',
      data: {
        reason: 'server_error',
        hint: 'Try again in a minute. If the problem persists, contact support.',
        ...(isProd ? {} : {
          detail: String(err?.message ?? err),
          code: err?.code,
          meta: err?.meta
        })
      }
    })
  }

  await auditLog({
    actorId: null,
    action: activation.wasRevived ? 'license.reactivated' : 'license.activated',
    targetType: 'Activation',
    targetId: activation.id,
    metadata: {
      licenseId: license.id,
      keyPrefix: license.keyPrefix,
      fingerprint: body.fingerprint,
      hostname: body.hostname,
      version: body.version,
      revived: activation.wasRevived
    }
  })

  return issueCertificate({
    licenseId: license.id,
    keyPrefix: license.keyPrefix,
    customer: license.account.email,
    fingerprint: body.fingerprint,
    activatedAt: new Date(),
    expiresAt: license.expiresAt,
    maxActivations: license.maxActivations,
    issuer,
    activationToken: activation.activationToken
  })
})

function issueCertificate(args: {
  licenseId: string
  keyPrefix: string
  customer: string
  fingerprint: string
  activatedAt: Date
  expiresAt: Date | null
  maxActivations: number
  issuer: string
  activationToken: string
}) {
  const payload: CertificatePayload = {
    v: 1,
    licenseId: args.licenseId,
    keyPrefix: args.keyPrefix,
    customer: args.customer,
    fingerprint: args.fingerprint,
    activatedAt: args.activatedAt.toISOString(),
    expiresAt: args.expiresAt ? args.expiresAt.toISOString() : null,
    maxActivations: args.maxActivations,
    issuer: args.issuer
  }
  const cert = signCertificate(payload)
  // The activationToken is NOT embedded in the cert — it's an optional
  // companion returned for clients that want to call heartbeat/deactivate
  // later. The cert alone is what gates the main app.
  return {
    certificate: cert,
    activationToken: args.activationToken
  }
}

// Periodic check-in from a self-hosted instance.
// The instance is expected to call this every ~6 hours.
//
//   200 + { valid: true, license: {...} }   — keep running
//   401 — activation token unknown / deleted (admin reset)
//   403 — license revoked or expired (instance should display banner)
//
// The instance can degrade gracefully on transient failures (network
// errors, 5xx) for some grace period — but a 403 is a hard signal.

import prisma from '../../../utils/prisma'
import { heartbeatSchema, validateBody } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { max: 60, windowSeconds: 60 })
  const body = await validateBody(event, heartbeatSchema)

  const activation = await prisma.activation.findUnique({
    where: { activationToken: body.activationToken },
    include: {
      license: { include: { plan: { select: { slug: true, name: true } } } }
    }
  })

  if (!activation || activation.deactivatedAt || activation.fingerprint !== body.fingerprint) {
    throw createError({ statusCode: 401, statusMessage: 'Activation invalid', data: { reason: 'unknown_activation' } })
  }

  const license = activation.license
  if (license.status === 'REVOKED') {
    throw createError({ statusCode: 403, statusMessage: 'License revoked', data: { reason: 'revoked', revokedReason: license.revokedReason } })
  }
  if (license.status === 'EXPIRED' || (license.expiresAt && license.expiresAt < new Date())) {
    throw createError({ statusCode: 403, statusMessage: 'License expired', data: { reason: 'expired' } })
  }

  await prisma.activation.update({
    where: { id: activation.id },
    data: {
      lastSeenAt: new Date(),
      appVersion: body.version ?? activation.appVersion,
      ipAddress: getRequestIP(event, { xForwardedFor: true }) || activation.ipAddress
    }
  })

  return {
    valid: true,
    license: {
      plan: license.plan,
      status: license.status,
      maxActivations: license.maxActivations,
      expiresAt: license.expiresAt
    }
  }
})

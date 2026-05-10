// Structured integration status for the Settings admin page.
//
// Reads via integration-settings (DB row → env fallback). Sensitive values
// are surfaced as booleans (`apiKeySet: true`) rather than echoed; non-
// sensitive values (host, port, store id, etc.) come back in full so the
// admin can see what's currently in effect without checking the DB by hand.

import { requireAdmin } from '../../../../utils/auth-guards'
import { getSetting } from '../../../../utils/integration-settings'

function mask(value: string | undefined | null, keepStart = 4, keepEnd = 4): string | null {
  if (!value) return null
  if (value.length <= keepStart + keepEnd + 1) return value.slice(0, keepStart) + '…'
  return value.slice(0, keepStart) + '…' + value.slice(-keepEnd)
}

async function verifyLicenseKeypair(): Promise<boolean> {
  try {
    const { signCertificate, publicKeyFromEnv } = await import('../../../../utils/license-signing')
    const { verify: cryptoVerify } = await import('node:crypto')
    const test = signCertificate({
      v: 1,
      licenseId: 'keypair-check',
      keyPrefix: 'MFY-TEST',
      customer: 'noreply@localhost',
      fingerprint: 'keypair-check',
      activatedAt: new Date().toISOString(),
      expiresAt: null,
      maxActivations: 1,
      issuer: 'self-check'
    })
    const { sig: _sig, ...payload } = test
    const keys = Object.keys(payload).sort()
    const canonical = '{' + keys.map(k => JSON.stringify(k) + ':' + JSON.stringify((payload as any)[k])).join(',') + '}'
    return cryptoVerify(null, Buffer.from(canonical, 'utf8'), publicKeyFromEnv(), Buffer.from(test.sig, 'base64'))
  } catch {
    return false
  }
}

async function verifyGithubToken(token: string | null): Promise<boolean | null> {
  if (!token) return null
  try {
    const res = await $fetch<{ login: string }>('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
      },
      timeout: 5000,
      retry: 0
    })
    return Boolean(res?.login)
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const [
    lsApiKey, lsStoreId, lsStoreDomain, lsWebhookSecret, lsTestMode,
    ghToken, ghOrg, ghTeamSlug, ghRepo,
    smtpHost, smtpPort, smtpFrom, smtpUser
  ] = await Promise.all([
    getSetting('LEMON_SQUEEZY_API_KEY'),
    getSetting('LEMON_SQUEEZY_STORE_ID'),
    getSetting('LEMON_SQUEEZY_STORE_DOMAIN'),
    getSetting('LEMON_SQUEEZY_WEBHOOK_SECRET'),
    getSetting('LEMON_SQUEEZY_TEST_MODE'),
    getSetting('GITHUB_TOKEN'),
    getSetting('GITHUB_ORG'),
    getSetting('GITHUB_TEAM_SLUG'),
    getSetting('GITHUB_REPO'),
    getSetting('SMTP_HOST'),
    getSetting('SMTP_PORT'),
    getSetting('SMTP_FROM'),
    getSetting('SMTP_USER')
  ])

  // Bootstrap secrets (still env-only — see schema comment for rationale).
  const publicKeyHex = process.env.LICENSE_SIGNING_PUBLIC_KEY || null
  const hasPrivate = !!process.env.LICENSE_SIGNING_PRIVATE_KEY
  const licenseKeypairMatches = hasPrivate && publicKeyHex ? await verifyLicenseKeypair() : false

  return {
    licenseSigning: {
      privateKeySet: hasPrivate,
      publicKeyMasked: mask(publicKeyHex ?? undefined, 8, 8),
      keypairMatches: licenseKeypairMatches
    },
    lemonSqueezy: {
      apiKeySet: !!lsApiKey,
      storeId: lsStoreId,
      storeDomain: lsStoreDomain,
      webhookSecretSet: !!lsWebhookSecret,
      testMode: lsTestMode === 'true' || lsTestMode === '1'
    },
    github: {
      tokenSet: !!ghToken,
      org: ghOrg,
      teamSlug: ghTeamSlug,
      repo: ghRepo,
      tokenValid: await verifyGithubToken(ghToken)
    },
    smtp: {
      configured: !!(smtpHost && smtpFrom),
      host: smtpHost,
      port: smtpPort ? Number(smtpPort) : null,
      from: smtpFrom,
      userSet: !!smtpUser
    },
    licensePepperSet: !!process.env.LICENSE_PEPPER,
    portalUrl: process.env.NUXT_PUBLIC_PORTAL_URL || null,
    nodeEnv: process.env.NODE_ENV || 'development',
    sessionCookieSecure: process.env.NUXT_SESSION_COOKIE_SECURE === 'true'
  }
})

// Boot-time environment validation.
//
// Phase 1 vars (auth, DB) are HARD requirements — refuse to boot if missing
// in production; log a loud warning in dev so you notice the misconfig.
//
// Phase 3–5 vars (LS, GitHub, license pepper) are SOFT requirements — the
// server boots fine, but the corresponding feature refuses at request time
// if the env isn't set. We log a summary at boot so you see the gap.

interface EnvCheck {
  name: string
  required: 'always' | 'prod' | 'optional'
  description: string
  feature?: string
}

const CHECKS: EnvCheck[] = [
  // Phase 1 — always required
  { name: 'DATABASE_URL', required: 'always', description: 'Postgres connection string for the portal DB' },
  { name: 'NUXT_SESSION_PASSWORD', required: 'always', description: '32-char hex secret signing the session cookie' },

  // Phase 1 — required in prod
  { name: 'NUXT_SESSION_COOKIE_SECURE', required: 'prod', description: 'Set to "true" behind HTTPS' },
  { name: 'LICENSE_PEPPER', required: 'prod', description: 'Extra secret folded into license-key hashing (phase 2+)' },
  { name: 'LICENSE_SIGNING_PRIVATE_KEY', required: 'prod', description: '64-hex Ed25519 seed used to sign license certificates. Generate via `npx tsx scripts/generate-license-keypair.ts`.' },
  { name: 'LICENSE_SIGNING_PUBLIC_KEY', required: 'prod', description: '64-hex Ed25519 public key (must pair with the private seed). Also compiled into the main Momentfy app as a constant.' },

  // Phase 1 — soft (password reset + license emails silently no-op without it)
  { name: 'SMTP_HOST', required: 'optional', feature: 'transactional email', description: 'SMTP relay host' },
  { name: 'SMTP_FROM', required: 'optional', feature: 'transactional email', description: 'From header, e.g. "Momentfy <support@momentfy.com>"' },

  // Phase 3 — checkout + webhook
  { name: 'LEMON_SQUEEZY_API_KEY', required: 'optional', feature: 'checkout', description: 'LS API key (portal-mediated checkouts)' },
  { name: 'LEMON_SQUEEZY_STORE_ID', required: 'optional', feature: 'checkout', description: 'LS store id' },
  { name: 'LEMON_SQUEEZY_WEBHOOK_SECRET', required: 'optional', feature: 'order webhook', description: 'Shared secret for HMAC verification on /api/webhooks/lemon-squeezy' },

  // Phase 4 — GitHub invites
  { name: 'GITHUB_TOKEN', required: 'optional', feature: 'repo invites', description: 'PAT or fine-grained token with admin:org / Members write' },
  { name: 'GITHUB_ORG', required: 'optional', feature: 'repo invites', description: 'Org slug (e.g. momentfy)' },

  // Phase 5 — license validation callbacks
  { name: 'NUXT_PUBLIC_PORTAL_URL', required: 'optional', feature: 'license validation', description: 'Public base URL self-hosted instances POST to' }
]

export default defineNitroPlugin(() => {
  const isProd = process.env.NODE_ENV === 'production'
  const missing: string[] = []
  const softMissing: Record<string, string[]> = {}

  for (const c of CHECKS) {
    const v = process.env[c.name]
    if (v && v.length > 0) continue

    if (c.required === 'always' || (c.required === 'prod' && isProd)) {
      missing.push(`${c.name}  — ${c.description}`)
    } else if (c.required === 'optional' && c.feature) {
      softMissing[c.feature] ??= []
      softMissing[c.feature].push(c.name)
    }
  }

  if (missing.length) {
    const msg = `[env] missing required environment variables:\n  - ${missing.join('\n  - ')}\n`
    if (isProd) {
      console.error(msg)
      throw new Error('Cannot boot portal server without required env vars. See .env.example.')
    }
    console.warn(msg)
  }

  const features = Object.keys(softMissing)
  if (features.length) {
    console.warn(
      '[env] optional features without env:\n' +
        features.map(f => `  - ${f}: ${softMissing[f]!.join(', ')}`).join('\n')
    )
  }
})

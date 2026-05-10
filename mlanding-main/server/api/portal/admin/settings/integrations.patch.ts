// Save integration settings (Lemon Squeezy / GitHub / SMTP).
//
// Body shape (any combination, undefined = leave alone, '' = clear):
// {
//   lemonSqueezy?: { apiKey?, storeId?, storeDomain?, webhookSecret?, testMode? },
//   github?:       { token?, org?, teamSlug?, repo? },
//   smtp?:         { host?, port?, user?, pass?, from? }
// }

import { z } from 'zod'
import { requireAdmin } from '../../../../utils/auth-guards'
import { setSettings, type SettingsPatch } from '../../../../utils/integration-settings'
import { auditLog } from '../../../../utils/audit'

const optStr = z.string().nullable().optional()
const optBool = z.boolean().optional()

const bodySchema = z.object({
  lemonSqueezy: z.object({
    apiKey: optStr,
    storeId: optStr,
    storeDomain: optStr,
    webhookSecret: optStr,
    testMode: optBool
  }).optional(),
  github: z.object({
    token: optStr,
    org: optStr,
    teamSlug: optStr,
    repo: optStr
  }).optional(),
  smtp: z.object({
    host: optStr,
    port: z.number().int().min(1).max(65535).nullable().optional(),
    user: optStr,
    pass: optStr,
    from: optStr
  }).optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten().fieldErrors })
  }
  const { lemonSqueezy, github, smtp } = parsed.data

  const patch: SettingsPatch = {}
  const sections: string[] = []

  if (lemonSqueezy) {
    sections.push('lemonSqueezy')
    if (lemonSqueezy.apiKey !== undefined) patch.LEMON_SQUEEZY_API_KEY = lemonSqueezy.apiKey
    if (lemonSqueezy.storeId !== undefined) patch.LEMON_SQUEEZY_STORE_ID = lemonSqueezy.storeId
    if (lemonSqueezy.storeDomain !== undefined) patch.LEMON_SQUEEZY_STORE_DOMAIN = lemonSqueezy.storeDomain
    if (lemonSqueezy.webhookSecret !== undefined) patch.LEMON_SQUEEZY_WEBHOOK_SECRET = lemonSqueezy.webhookSecret
    if (lemonSqueezy.testMode !== undefined) patch.LEMON_SQUEEZY_TEST_MODE = lemonSqueezy.testMode ? 'true' : 'false'
  }
  if (github) {
    sections.push('github')
    if (github.token !== undefined) patch.GITHUB_TOKEN = github.token
    if (github.org !== undefined) patch.GITHUB_ORG = github.org
    if (github.teamSlug !== undefined) patch.GITHUB_TEAM_SLUG = github.teamSlug
    if (github.repo !== undefined) patch.GITHUB_REPO = github.repo
  }
  if (smtp) {
    sections.push('smtp')
    if (smtp.host !== undefined) patch.SMTP_HOST = smtp.host
    if (smtp.port !== undefined) patch.SMTP_PORT = smtp.port === null ? null : String(smtp.port)
    if (smtp.user !== undefined) patch.SMTP_USER = smtp.user
    if (smtp.pass !== undefined) patch.SMTP_PASS = smtp.pass
    if (smtp.from !== undefined) patch.SMTP_FROM = smtp.from
  }

  if (Object.keys(patch).length === 0) return { ok: true, changed: 0 }

  await setSettings(patch, user.id)

  // Audit only the keys that changed (don't log values — they may be secrets).
  await auditLog({
    actorId: user.id,
    action: 'integration.settings.updated',
    targetType: 'IntegrationSetting',
    metadata: { sections, keys: Object.keys(patch) }
  })

  return { ok: true, changed: Object.keys(patch).length }
})

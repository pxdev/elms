// Full portal backup — single JSON file with every entity in dependency
// order. Counts are denormalised at the top so the restore endpoint can
// preview without parsing the whole payload.
//
// What's included:
//   - Account (with passwordHash — restorable)
//   - Plan, Feature, PlanFeature
//   - PromoCode
//   - PasswordReset, RepoInvite
//   - Order, License, Activation
//   - IntegrationSetting (ciphertext as-is)
//   - AuditLog
//
// What's NOT included (cannot be):
//   - License plaintext keys — only the SHA-256 hash is stored
//   - Anything from the encryption key (`NUXT_SESSION_PASSWORD`) — restoring
//     IntegrationSetting rows on a deployment with a different session
//     password will fail to decrypt; admin must re-enter those values.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'

const SCHEMA_VERSION = 1

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)

  // Pull every table in parallel.
  const [
    accounts, passwordResets,
    plans, features, planFeatures, promoCodes,
    orders, licenses, activations,
    repoInvites,
    integrationSettings,
    auditLogs
  ] = await Promise.all([
    prisma.account.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.passwordReset.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.plan.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.feature.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.planFeature.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.promoCode.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.order.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.license.findMany({ orderBy: { issuedAt: 'asc' } }),
    prisma.activation.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.repoInvite.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.integrationSetting.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: 'asc' } })
  ])

  const data = {
    accounts, passwordResets,
    plans, features, planFeatures, promoCodes,
    orders, licenses, activations,
    repoInvites,
    integrationSettings,
    auditLogs
  }

  const counts = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v.length])
  )

  const payload = {
    schemaVersion: SCHEMA_VERSION,
    generatedAt: new Date().toISOString(),
    generatedBy: user.email,
    portalUrl: process.env.NUXT_PUBLIC_PORTAL_URL || null,
    counts,
    data
  }

  await auditLog({
    actorId: user.id,
    action: 'backup.exported',
    metadata: { counts }
  })

  // Trigger a file download in the browser.
  const filename = `momentfy-portal-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
  setHeader(event, 'Content-Type', 'application/json; charset=utf-8')
  setHeader(event, 'Content-Disposition', `attachment; filename="${filename}"`)
  return payload
})

// Restore a portal backup. Accepts the exact JSON shape produced by
// /api/portal/admin/backup/export.
//
// Two modes:
//   - merge   — upsert by id; existing rows updated, new rows created.
//               Safe for partial restore / cherry-pick scenarios.
//   - replace — truncate every restorable table in reverse-FK order, then
//               insert everything from the backup. Wipes the current DB.
//               Requires `confirm: 'REPLACE'` in the body to proceed.
//
// All work runs in a single Prisma transaction so a partial failure rolls
// back to the pre-import state.

import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'

// We accept any shape inside `data` — Prisma will reject malformed rows
// inside the transaction, which is more reliable than mirroring every
// schema field in zod here.
const bodySchema = z.object({
  mode: z.enum(['merge', 'replace']),
  confirm: z.string().optional(),
  payload: z.object({
    schemaVersion: z.number(),
    data: z.object({
      accounts: z.array(z.any()).default([]),
      passwordResets: z.array(z.any()).default([]),
      plans: z.array(z.any()).default([]),
      features: z.array(z.any()).default([]),
      planFeatures: z.array(z.any()).default([]),
      promoCodes: z.array(z.any()).default([]),
      orders: z.array(z.any()).default([]),
      licenses: z.array(z.any()).default([]),
      activations: z.array(z.any()).default([]),
      repoInvites: z.array(z.any()).default([]),
      integrationSettings: z.array(z.any()).default([]),
      auditLogs: z.array(z.any()).default([])
    })
  })
})

const SCHEMA_VERSION = 1

// Recursively coerce ISO date strings back to Date objects so Prisma
// accepts them. We can't tell a date string from a regular string just by
// looking, so we restrict conversion to keys whose names suggest a date.
const DATE_KEY = /(At|Date)$/
function reviveDates(row) {
  for (const k of Object.keys(row)) {
    const v = row[k]
    if (typeof v === 'string' && DATE_KEY.test(k) && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
      row[k] = new Date(v)
    }
  }
  return row
}

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid backup file', data: parsed.error.flatten() })
  }
  const { mode, confirm, payload } = parsed.data

  if (payload.schemaVersion !== SCHEMA_VERSION) {
    throw createError({
      statusCode: 400,
      statusMessage: `Unsupported backup schema (got v${payload.schemaVersion}, this server speaks v${SCHEMA_VERSION})`
    })
  }
  if (mode === 'replace' && confirm !== 'REPLACE') {
    throw createError({ statusCode: 400, statusMessage: 'Replace mode requires confirm: "REPLACE"' })
  }

  const d = payload.data
  // Coerce date strings everywhere up front.
  for (const k of Object.keys(d)) d[k] = d[k].map(reviveDates)

  const counts = { created: {}, updated: {}, deleted: {} }

  await prisma.$transaction(async (tx) => {
    // ── REPLACE: wipe everything in reverse FK order ──
    if (mode === 'replace') {
      counts.deleted.auditLogs = (await tx.auditLog.deleteMany()).count
      counts.deleted.activations = (await tx.activation.deleteMany()).count
      counts.deleted.repoInvites = (await tx.repoInvite.deleteMany()).count
      counts.deleted.licenses = (await tx.license.deleteMany()).count
      counts.deleted.orders = (await tx.order.deleteMany()).count
      counts.deleted.promoCodes = (await tx.promoCode.deleteMany()).count
      counts.deleted.planFeatures = (await tx.planFeature.deleteMany()).count
      counts.deleted.features = (await tx.feature.deleteMany()).count
      counts.deleted.passwordResets = (await tx.passwordReset.deleteMany()).count
      counts.deleted.integrationSettings = (await tx.integrationSetting.deleteMany()).count
      counts.deleted.plans = (await tx.plan.deleteMany()).count
      counts.deleted.accounts = (await tx.account.deleteMany()).count
    }

    // ── INSERT in FK-respecting order ──
    // Helper: per-table writer that picks createMany (replace) or upsert (merge).
    async function writeTable(name, model, rows, idField) {
      if (!rows.length) {
        counts.created[name] = 0
        counts.updated[name] = 0
        return
      }
      if (mode === 'replace') {
        const r = await model.createMany({ data: rows, skipDuplicates: true })
        counts.created[name] = r.count
        counts.updated[name] = 0
        return
      }
      // merge: upsert each row by its primary key.
      let created = 0, updated = 0
      for (const row of rows) {
        const idVal = idField === 'composite'
          ? { planId_featureId: { planId: row.planId, featureId: row.featureId } }
          : { [idField]: row[idField] }
        const existing = await model.findUnique({ where: idVal })
        if (existing) {
          await model.update({ where: idVal, data: row })
          updated++
        } else {
          await model.create({ data: row })
          created++
        }
      }
      counts.created[name] = created
      counts.updated[name] = updated
    }

    await writeTable('accounts', tx.account, d.accounts, 'id')
    await writeTable('plans', tx.plan, d.plans, 'id')
    await writeTable('features', tx.feature, d.features, 'id')
    await writeTable('planFeatures', tx.planFeature, d.planFeatures, 'composite')
    await writeTable('promoCodes', tx.promoCode, d.promoCodes, 'id')
    await writeTable('passwordResets', tx.passwordReset, d.passwordResets, 'id')
    await writeTable('repoInvites', tx.repoInvite, d.repoInvites, 'id')
    await writeTable('orders', tx.order, d.orders, 'id')
    await writeTable('licenses', tx.license, d.licenses, 'id')
    await writeTable('activations', tx.activation, d.activations, 'id')
    await writeTable('integrationSettings', tx.integrationSetting, d.integrationSettings, 'key')
    await writeTable('auditLogs', tx.auditLog, d.auditLogs, 'id')
  }, { timeout: 5 * 60 * 1000 }) // 5-minute ceiling for big restores

  await auditLog({
    actorId: user.id,
    action: 'backup.imported',
    metadata: { mode, counts, schemaVersion: payload.schemaVersion }
  })

  return { ok: true, mode, counts }
})

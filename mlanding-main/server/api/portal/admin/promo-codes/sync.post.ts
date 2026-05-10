// One-off "push all to LS" endpoint for backfilling the LS Discount catalog
// after the mirror feature was added. Safe to re-run — codes that already
// have an lsDiscountId are left alone (use PATCH to re-sync those).
//
// POST /api/portal/admin/promo-codes/sync
//   → { synced: number, failed: Array<{ code, error }> }

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'
import { createDiscount } from '../../../../utils/lemon-squeezy'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)

  const unsynced = await prisma.promoCode.findMany({
    where: { lsDiscountId: null, isActive: true },
    include: { plan: { select: { name: true, lsVariantId: true } } }
  })

  const failed: Array<{ code: string, error: string }> = []
  let synced = 0

  for (const c of unsynced) {
    try {
      const lsId = await createDiscount({
        code: c.code,
        name: c.plan ? `${c.code} · ${c.plan.name}` : c.code,
        discountPercent: c.discountPercent,
        lsVariantId: c.plan?.lsVariantId ?? null,
        maxRedemptions: c.maxUses,
        expiresAt: c.expiresAt,
        isActive: c.isActive
      })
      await prisma.promoCode.update({
        where: { id: c.id },
        data: { lsDiscountId: lsId }
      })
      synced++
    } catch (err: any) {
      failed.push({
        code: c.code,
        error: err?.statusMessage || err?.message || 'Unknown'
      })
    }
  }

  await auditLog({
    actorId: user.id,
    action: 'promoCode.bulkSynced',
    targetType: 'PromoCode',
    metadata: { synced, failedCount: failed.length }
  })

  return { synced, failed, total: unsynced.length }
})

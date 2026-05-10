import { createDiscount } from '../../../utils/lemon-squeezy'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const unsynced = await prisma.promoCode.findMany({
    where: { lsDiscountId: null, isActive: true },
    include: { course: { select: { name: true, lsVariantId: true } } }
  })

  const failed: Array<{ code: string; error: string }> = []
  let synced = 0

  for (const c of unsynced) {
    try {
      const lsId = await createDiscount({
        code: c.code,
        name: c.course ? `${c.code} · ${c.course.name}` : c.code,
        discountPercent: c.discountPercent,
        lsVariantId: c.course?.lsVariantId ?? null,
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

  return { synced, failed, total: unsynced.length }
})

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const codes = await prisma.promoCode.findMany({
    orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    include: {
      plan: { select: { id: true, slug: true, name: true } },
      _count: { select: { orders: true } }
    }
  })
  return codes.map(c => ({
    id: c.id,
    code: c.code,
    discountPercent: c.discountPercent,
    planId: c.planId,
    plan: c.plan,
    maxUses: c.maxUses,
    currentUses: c.currentUses,
    expiresAt: c.expiresAt,
    isActive: c.isActive,
    notes: c.notes,
    // Exposed so the admin table can flag rows that haven't been mirrored
    // into Lemon Squeezy yet (null = unsynced → customers won't get the
    // discount at the gateway until the admin re-syncs).
    lsDiscountId: c.lsDiscountId,
    orderCount: c._count.orders,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt
  }))
})

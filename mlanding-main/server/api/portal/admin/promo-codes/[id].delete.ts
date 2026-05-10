// Delete a promo code. Only allowed if no orders reference it — otherwise
// the historical record loses its discount provenance. Deactivate instead.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'
import { deleteDiscount } from '../../../../utils/lemon-squeezy'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  const code = await prisma.promoCode.findUnique({
    where: { id },
    include: { _count: { select: { orders: true } } }
  })
  if (!code) throw createError({ statusCode: 404, statusMessage: 'Promo code not found' })

  if (code._count.orders > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Promo code has been redeemed — deactivate it instead',
      data: { orders: code._count.orders }
    })
  }

  // Best-effort: delete the mirrored LS discount first. A 404 is fine
  // (already gone) and a 5xx just logs — we still delete locally so the
  // admin's click isn't wasted by a transient LS outage.
  let lsSyncError: string | null = null
  if (code.lsDiscountId) {
    try {
      await deleteDiscount(code.lsDiscountId)
    } catch (err: any) {
      lsSyncError = err?.statusMessage || err?.message || 'Unknown LS error'
      console.warn(`[promo-code] LS delete failed for ${code.code}: ${lsSyncError}`)
    }
  }

  await prisma.promoCode.delete({ where: { id } })

  await auditLog({
    actorId: user.id,
    action: 'promoCode.deleted',
    targetType: 'PromoCode',
    targetId: id,
    metadata: { code: code.code, lsSyncError }
  })

  return { ok: true, lsSyncError }
})

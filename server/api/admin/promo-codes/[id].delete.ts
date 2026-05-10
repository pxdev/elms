import { deleteDiscount } from '../../../utils/lemon-squeezy'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = getRouterParam(event, 'id')!
  const code = await prisma.promoCode.findUnique({ where: { id: Number(id) } })
  if (!code) throw createError({ statusCode: 404, statusMessage: 'Promo code not found' })

  // Clean up LS discount if present
  if (code.lsDiscountId) {
    try {
      await deleteDiscount(code.lsDiscountId)
    } catch (err: any) {
      console.warn(`[promo-code] LS delete failed for ${code.code}:`, err?.statusMessage || err?.message)
    }
  }

  await prisma.promoCode.delete({ where: { id: Number(id) } })

  return { ok: true }
})

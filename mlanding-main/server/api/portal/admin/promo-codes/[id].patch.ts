import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'
import { createDiscount, updateDiscount, deleteDiscount } from '../../../../utils/lemon-squeezy'

const bodySchema = z.object({
  // `code` is intentionally not editable — orders reference it. Issue a new one if needed.
  discountPercent: z.number().int().min(1).max(100).optional(),
  planId: z.string().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
  notes: z.string().max(500).nullable().optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten().fieldErrors })
  }

  const before = await prisma.promoCode.findUnique({ where: { id } })
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Promo code not found' })

  // Resolve target plan — needed for LS sync so plan-scoped discounts
  // stay limited to the correct variant.
  let targetPlan: { id: string, name: string, lsVariantId: string | null } | null = null
  const targetPlanId = parsed.data.planId !== undefined ? parsed.data.planId : before.planId
  if (targetPlanId) {
    targetPlan = await prisma.plan.findUnique({
      where: { id: targetPlanId },
      select: { id: true, name: true, lsVariantId: true }
    })
    if (!targetPlan) throw createError({ statusCode: 400, statusMessage: 'Plan not found' })
  }

  const updated = await prisma.promoCode.update({
    where: { id },
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt === undefined
        ? undefined
        : parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null
    }
  })

  // Sync to LS. LS doesn't allow changing the variant-scope relationship
  // on an existing discount, so if the plan scope changed we delete the
  // old LS discount and create a new one — otherwise we PATCH in place.
  const planScopeChanged = before.planId !== updated.planId
  let lsSyncError: string | null = null
  try {
    const discountPayload = {
      code: updated.code,
      name: targetPlan ? `${updated.code} · ${targetPlan.name}` : updated.code,
      discountPercent: updated.discountPercent,
      lsVariantId: targetPlan?.lsVariantId ?? null,
      maxRedemptions: updated.maxUses,
      expiresAt: updated.expiresAt,
      isActive: updated.isActive
    }
    if (updated.lsDiscountId && !planScopeChanged) {
      await updateDiscount(updated.lsDiscountId, discountPayload)
    } else {
      if (updated.lsDiscountId) await deleteDiscount(updated.lsDiscountId).catch(() => {})
      const newId = await createDiscount(discountPayload)
      await prisma.promoCode.update({
        where: { id },
        data: { lsDiscountId: newId }
      })
    }
  } catch (err: any) {
    lsSyncError = err?.statusMessage || err?.message || 'Unknown LS error'
    console.warn(`[promo-code] LS sync failed for ${updated.code}: ${lsSyncError}`)
  }

  await auditLog({
    actorId: user.id,
    action: 'promoCode.updated',
    targetType: 'PromoCode',
    targetId: id,
    metadata: {
      changes: parsed.data,
      previous: { isActive: before.isActive, discountPercent: before.discountPercent, planId: before.planId },
      lsSyncError
    }
  })

  return { id, lsSyncError }
})

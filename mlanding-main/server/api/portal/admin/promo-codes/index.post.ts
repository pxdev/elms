import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'
import { createDiscount } from '../../../../utils/lemon-squeezy'

const bodySchema = z.object({
  code: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/, 'uppercase letters, digits, dashes, underscores'),
  discountPercent: z.number().int().min(1).max(100),
  planId: z.string().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().max(500).nullable().optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten().fieldErrors })
  }

  const exists = await prisma.promoCode.findUnique({ where: { code: parsed.data.code } })
  if (exists) throw createError({ statusCode: 409, statusMessage: 'A promo code with that value already exists' })

  // Resolve the plan up front so we can pass the LS variant id to LS when
  // creating a plan-scoped discount. Without the variant id LS treats the
  // discount as store-wide, which contradicts the portal's planId scope.
  let plan: { id: string, name: string, lsVariantId: string | null } | null = null
  if (parsed.data.planId) {
    plan = await prisma.plan.findUnique({
      where: { id: parsed.data.planId },
      select: { id: true, name: true, lsVariantId: true }
    })
    if (!plan) throw createError({ statusCode: 400, statusMessage: 'Plan not found' })
  }

  const created = await prisma.promoCode.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null
    }
  })

  // Mirror into LS. We catch errors so a broken LS connection can't
  // block admin work — the row is saved, `lsDiscountId` stays null and
  // the admin UI can expose a "re-sync" affordance.
  let lsSyncError: string | null = null
  try {
    const lsId = await createDiscount({
      code: created.code,
      name: plan ? `${created.code} · ${plan.name}` : created.code,
      discountPercent: created.discountPercent,
      lsVariantId: plan?.lsVariantId ?? null,
      maxRedemptions: created.maxUses,
      expiresAt: created.expiresAt,
      isActive: created.isActive
    })
    await prisma.promoCode.update({
      where: { id: created.id },
      data: { lsDiscountId: lsId }
    })
  } catch (err: any) {
    lsSyncError = err?.statusMessage || err?.message || 'Unknown LS error'
    console.warn(`[promo-code] LS sync failed for ${created.code}: ${lsSyncError}`)
  }

  await auditLog({
    actorId: user.id,
    action: 'promoCode.created',
    targetType: 'PromoCode',
    targetId: created.id,
    metadata: {
      code: created.code,
      discountPercent: created.discountPercent,
      planId: created.planId,
      lsSyncError
    }
  })

  return { id: created.id, code: created.code, lsSyncError }
})

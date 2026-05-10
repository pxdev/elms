import { z } from 'zod'
import { createDiscount } from '../../../utils/lemon-squeezy'

const bodySchema = z.object({
  code: z.string().min(2).max(40).regex(/^[A-Z0-9_-]+$/, 'uppercase letters, digits, dashes, underscores'),
  discountPercent: z.number().int().min(1).max(100),
  courseId: z.coerce.number().int().positive().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
  description: z.string().max(500).nullable().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten().fieldErrors })
  }

  const exists = await prisma.promoCode.findUnique({ where: { code: parsed.data.code } })
  if (exists) throw createError({ statusCode: 409, statusMessage: 'A promo code with that value already exists' })

  // Resolve course up front for LS scoped discount
  let course: { id: number; name: string; lsVariantId: string | null } | null = null
  if (parsed.data.courseId) {
    course = await prisma.course.findUnique({
      where: { id: parsed.data.courseId },
      select: { id: true, name: true, lsVariantId: true }
    })
    if (!course) throw createError({ statusCode: 400, statusMessage: 'Course not found' })
  }

  const created = await prisma.promoCode.create({
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null
    }
  })

  // Mirror into LS. Catch errors so a broken LS connection can't block admin work.
  let lsSyncError: string | null = null
  try {
    const lsId = await createDiscount({
      code: created.code,
      name: course ? `${created.code} · ${course.name}` : created.code,
      discountPercent: created.discountPercent,
      lsVariantId: course?.lsVariantId ?? null,
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

  return { id: created.id, code: created.code, lsSyncError }
})

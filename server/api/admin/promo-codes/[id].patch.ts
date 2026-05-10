import { z } from 'zod'
import { createDiscount, updateDiscount, deleteDiscount } from '../../../utils/lemon-squeezy'

const bodySchema = z.object({
  discountPercent: z.number().int().min(1).max(100).optional(),
  courseId: z.coerce.number().int().positive().nullable().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
  description: z.string().max(500).nullable().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = getRouterParam(event, 'id')!
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten().fieldErrors })
  }

  const before = await prisma.promoCode.findUnique({ where: { id: Number(id) } })
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Promo code not found' })

  // Resolve target course for LS sync
  let targetCourse: { id: number; name: string; lsVariantId: string | null } | null = null
  const targetCourseId = parsed.data.courseId !== undefined ? parsed.data.courseId : before.courseId
  if (targetCourseId) {
    targetCourse = await prisma.course.findUnique({
      where: { id: targetCourseId },
      select: { id: true, name: true, lsVariantId: true }
    })
    if (!targetCourse) throw createError({ statusCode: 400, statusMessage: 'Course not found' })
  }

  const updated = await prisma.promoCode.update({
    where: { id: Number(id) },
    data: {
      ...parsed.data,
      expiresAt: parsed.data.expiresAt === undefined
        ? undefined
        : parsed.data.expiresAt
          ? new Date(parsed.data.expiresAt)
          : null
    }
  })

  // Sync to LS. LS doesn't allow changing variant scope on existing discount,
  // so if scope changed we delete + recreate.
  const scopeChanged = before.courseId !== updated.courseId
  let lsSyncError: string | null = null
  try {
    const discountPayload = {
      code: updated.code,
      name: targetCourse ? `${updated.code} · ${targetCourse.name}` : updated.code,
      discountPercent: updated.discountPercent,
      lsVariantId: targetCourse?.lsVariantId ?? null,
      maxRedemptions: updated.maxUses,
      expiresAt: updated.expiresAt,
      isActive: updated.isActive
    }
    if (updated.lsDiscountId && !scopeChanged) {
      await updateDiscount(updated.lsDiscountId, discountPayload)
    } else {
      if (updated.lsDiscountId) await deleteDiscount(updated.lsDiscountId).catch(() => {})
      const newId = await createDiscount(discountPayload)
      await prisma.promoCode.update({
        where: { id: Number(id) },
        data: { lsDiscountId: newId }
      })
    }
  } catch (err: any) {
    lsSyncError = err?.statusMessage || err?.message || 'Unknown LS error'
    console.warn(`[promo-code] LS sync failed for ${updated.code}: ${lsSyncError}`)
  }

  return { id, lsSyncError }
})

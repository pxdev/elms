import { z } from 'zod'

const bodySchema = z.object({
  code: z.string().min(1).max(40),
  courseId: z.coerce.number().int().positive()
})

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { max: 20, windowSeconds: 60 })

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  const code = parsed.data.code.trim().toUpperCase()
  const promo = await prisma.promoCode.findUnique({
    where: { code },
    include: { course: { select: { id: true, name: true } } }
  })

  // Generic "not valid" — same response regardless of reason
  const invalid = { valid: false as const, reason: 'invalid' }

  if (!promo || !promo.isActive) return invalid
  if (promo.expiresAt && promo.expiresAt < new Date()) return invalid
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return invalid
  if (promo.courseId && promo.courseId !== parsed.data.courseId) return invalid

  return {
    valid: true as const,
    code: promo.code,
    discountPercent: promo.discountPercent,
    courseName: promo.course?.name ?? null
  }
})

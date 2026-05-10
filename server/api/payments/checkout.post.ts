import { checkoutSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await parseBody(event, checkoutSchema)

  const course = await prisma.course.findUnique({
    where: { id: body.courseId, isActive: true }
  })

  if (!course) {
    throw createError({ statusCode: 404, message: 'Course not found.' })
  }

  if (!course.lsVariantId) {
    throw createError({ statusCode: 503, message: 'This course is not available for purchase yet.' })
  }

  // Validate optional promo code
  let promoCode: string | undefined
  if (body.promoCode) {
    const code = body.promoCode.trim().toUpperCase()
    const promo = await prisma.promoCode.findUnique({ where: { code } })
    const expired = promo?.expiresAt && promo.expiresAt < new Date()
    const exhausted = promo && promo.maxUses !== null && promo.usedCount >= promo.maxUses
    const wrongCourse = promo?.courseId && promo.courseId !== course.id
    if (!promo || !promo.isActive || expired || exhausted || wrongCourse) {
      throw createError({ statusCode: 400, statusMessage: 'Promo code is invalid for this course' })
    }
    if (!promo.lsDiscountId) {
      console.warn(`[checkout] promo ${promo.code} has no lsDiscountId — LS may reject. Run sync.`)
    }
    promoCode = promo.code
  }

  // Create or find pending enrollment
  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    update: {},
    create: {
      userId: user.id,
      courseId: course.id,
      status: 'PENDING'
    }
  })

  const appUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const url = await createCheckout({
    variantId: course.lsVariantId,
    userId: user.id,
    email: user.email,
    redirectUrl: `${appUrl}/enrollments?success=1`,
    promoCode
  })

  return { url }
})

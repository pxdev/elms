import { checkoutSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await parseBody(event, checkoutSchema)

  const variant = await prisma.courseVariant.findUnique({
    where: { id: body.variantId, isActive: true },
    include: { course: true }
  })

  if (!variant || !variant.course.isActive) {
    throw createError({ statusCode: 404, message: 'Course variant not found.' })
  }

  if (!variant.lsVariantId) {
    throw createError({ statusCode: 503, message: 'This course is not available for purchase yet.' })
  }

  // Create or find pending enrollment
  await prisma.enrollment.upsert({
    where: { userId_courseVariantId: { userId: user.id, courseVariantId: variant.id } },
    update: {},
    create: {
      userId: user.id,
      courseVariantId: variant.id,
      status: 'PENDING'
    }
  })

  const appUrl = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const url = await createCheckout({
    variantId: variant.lsVariantId,
    userId: user.id,
    email: user.email,
    redirectUrl: `${appUrl}/enrollments?success=1`
  })

  return { url }
})

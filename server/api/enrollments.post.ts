export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await readBody<{
    courseVariantId?: number
  }>(event)

  if (!body.courseVariantId) {
    throw createError({ statusCode: 400, message: 'Course variant is required.' })
  }

  const variant = await prisma.courseVariant.findUnique({
    where: { id: body.courseVariantId, isActive: true },
    include: { course: true }
  })

  if (!variant || !variant.course.isActive) {
    throw createError({ statusCode: 404, message: 'Course variant not found.' })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseVariantId: { userId: user.id, courseVariantId: variant.id } }
  })

  if (existing) {
    throw createError({ statusCode: 409, message: 'You are already enrolled in this course variant.' })
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: user.id,
      courseVariantId: variant.id,
      status: 'PENDING'
    },
    include: {
      courseVariant: {
        include: { course: true }
      }
    }
  })

  return { enrollment }
})

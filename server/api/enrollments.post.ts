import { enrollmentSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await parseBody(event, enrollmentSchema)

  const course = await prisma.course.findUnique({
    where: { id: body.courseId, isActive: true }
  })

  if (!course) {
    throw createError({ statusCode: 404, message: 'Course not found.' })
  }

  const existing = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } }
  })

  if (existing) {
    throw createError({ statusCode: 409, message: 'You are already enrolled in this course.' })
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: user.id,
      courseId: course.id,
      status: 'PENDING'
    },
    include: {
      course: true
    }
  })

  return { enrollment }
})

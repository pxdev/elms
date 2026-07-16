export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const course = await prisma.course.findUnique({
    where: { id, isActive: true },
    include: {
      teacher: {
        select: { id: true, name: true, email: true, avatarUrl: true }
      },
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          materials: {
            where: { isPrivate: false }
          }
        }
      }
    }
  })

  if (!course) {
    throw createError({ statusCode: 404, message: 'Course not found.' })
  }

  const session = await getUserSession(event)
  const enrollment = session.user
    ? await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        select: { id: true, status: true, paymentStatus: true }
      })
    : null

  return { course, enrollment }
})

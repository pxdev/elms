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

  return { course }
})

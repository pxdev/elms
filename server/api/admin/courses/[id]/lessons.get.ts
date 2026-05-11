export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const courseId = Number(getRouterParam(event, 'id'))
  if (!courseId) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const lessons = await prisma.courseLesson.findMany({
    where: { courseId },
    orderBy: { order: 'asc' },
    include: {
      materials: true
    }
  })

  return { lessons }
})

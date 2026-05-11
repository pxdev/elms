export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const courseId = Number(getRouterParam(event, 'id'))
  const lessonId = Number(getRouterParam(event, 'lessonId'))
  if (!courseId || !lessonId) {
    throw createError({ statusCode: 400, message: 'Invalid IDs.' })
  }

  await prisma.courseLesson.delete({
    where: { id: lessonId, courseId }
  })

  return { success: true }
})

export default defineEventHandler(async (event) => {
  const courseId = Number(getRouterParam(event, 'id'))
  if (!courseId) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const materials = await prisma.courseMaterial.findMany({
    where: {
      courseId,
      isPrivate: false
    },
    orderBy: { createdAt: 'desc' }
  })

  return { materials }
})

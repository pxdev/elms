export default defineEventHandler(async (event) => {
  await requireRole(event, ['TEACHER', 'ADMIN'])
  const { user } = await requireUserSession(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid availability ID.' })
  }

  await prisma.teacherAvailability.deleteMany({
    where: { id, teacherId: user.id }
  })

  return { success: true }
})

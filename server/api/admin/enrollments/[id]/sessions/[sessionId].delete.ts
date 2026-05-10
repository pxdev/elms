export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const sessionId = Number(getRouterParam(event, 'sessionId'))
  if (!sessionId) {
    throw createError({ statusCode: 400, message: 'Invalid session ID.' })
  }

  await prisma.session.delete({
    where: { id: sessionId }
  })

  return { success: true }
})

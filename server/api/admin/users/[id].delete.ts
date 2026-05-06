export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid user ID.' })
  }

  await prisma.user.delete({ where: { id } })

  return { success: true }
})

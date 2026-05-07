export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))

  const existing = await prisma.blogTag.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
  }

  await prisma.blogTag.delete({ where: { id } })

  return { success: true }
})

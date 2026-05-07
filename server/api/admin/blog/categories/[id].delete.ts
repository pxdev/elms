export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))

  const existing = await prisma.blogCategory.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  await prisma.blogCategory.delete({ where: { id } })

  return { success: true }
})

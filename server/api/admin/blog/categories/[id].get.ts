export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))

  const category = await prisma.blogCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })

  if (!category) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  return { category }
})

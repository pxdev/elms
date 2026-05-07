export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))

  const tag = await prisma.blogTag.findUnique({
    where: { id },
    include: {
      _count: {
        select: { posts: true }
      }
    }
  })

  if (!tag) {
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
  }

  return { tag }
})

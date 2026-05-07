export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const categories = await prisma.blogCategory.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return { categories }
})

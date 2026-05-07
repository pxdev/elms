export default defineEventHandler(async () => {
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

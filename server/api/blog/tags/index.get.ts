export default defineEventHandler(async () => {
  const tags = await prisma.blogTag.findMany({
    include: {
      _count: {
        select: { posts: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return { tags }
})

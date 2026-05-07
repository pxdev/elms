export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

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

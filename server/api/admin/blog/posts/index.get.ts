export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const posts = await prisma.blogPost.findMany({
    include: {
      author: {
        select: { id: true, name: true, email: true }
      },
      category: {
        select: { id: true, name: true }
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { posts }
})

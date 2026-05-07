export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))

  const post = await prisma.blogPost.findUnique({
    where: { id },
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
    }
  })

  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  return { post }
})

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Slug is required' })
  }

  const post = await prisma.blogPost.findFirst({
    where: { slug, published: true },
    include: {
      author: {
        select: { id: true, name: true, email: true, avatarUrl: true }
      },
      category: {
        select: { id: true, name: true, slug: true }
      },
      tags: {
        include: {
          tag: {
            select: { id: true, name: true, slug: true }
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

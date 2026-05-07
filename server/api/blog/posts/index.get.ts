export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const categorySlug = query.category as string | undefined
  const tagSlug = query.tag as string | undefined

  const where: any = { published: true }

  if (categorySlug) {
    const category = await prisma.blogCategory.findUnique({
      where: { slug: categorySlug },
      select: { id: true }
    })
    if (category) {
      where.categoryId = category.id
    }
  }

  if (tagSlug) {
    const tag = await prisma.blogTag.findUnique({
      where: { slug: tagSlug },
      select: { id: true }
    })
    if (tag) {
      where.tags = { some: { tagId: tag.id } }
    }
  }

  const posts = await prisma.blogPost.findMany({
    where,
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
    },
    orderBy: { publishedAt: 'desc' }
  })

  return { posts }
})

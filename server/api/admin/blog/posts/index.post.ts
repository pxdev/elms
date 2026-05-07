import { createBlogPostSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const session = await requireUserSession(event)
  const body = await parseBody(event, createBlogPostSchema)

  const slug = await generateUniqueSlug(body.title, async (s) => {
    const existing = await prisma.blogPost.findUnique({ where: { slug: s } })
    return !!existing
  })

  const post = await prisma.blogPost.create({
    data: {
      title: body.title.trim(),
      slug,
      description: body.description ?? null,
      content: body.content ?? null,
      excerpt: body.excerpt ?? null,
      imageUrl: body.imageUrl?.trim() ?? null,
      published: body.published ?? false,
      publishedAt: body.published ? new Date() : null,
      authorId: session.user.id,
      categoryId: body.categoryId ?? null,
      tags: body.tagIds?.length
        ? {
            create: body.tagIds.map(tagId => ({ tagId }))
          }
        : undefined
    },
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

  return { post }
})

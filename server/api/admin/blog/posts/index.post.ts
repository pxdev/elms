import { createBlogPostSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const session = await requireUserSession(event)
  const body = await parseBody(event, createBlogPostSchema)

  const slug = await generateUniqueSlug(body.title, async (s) => {
    const existing = await prisma.blogPost.findUnique({ where: { slug: s } })
    return !!existing
  })

  const tagConnections: { tagId: number }[] = []

  if (body.tags?.length) {
    for (const tag of body.tags) {
      if (tag.id) {
        tagConnections.push({ tagId: tag.id })
      } else {
        const tagSlug = await generateUniqueSlug(tag.name, async (s) => {
          const existing = await prisma.blogTag.findUnique({ where: { slug: s } })
          return !!existing
        })
        const newTag = await prisma.blogTag.upsert({
          where: { name: tag.name.trim() },
          update: {},
          create: { name: tag.name.trim(), slug: tagSlug }
        })
        tagConnections.push({ tagId: newTag.id })
      }
    }
  }

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
      tags: tagConnections.length
        ? { create: tagConnections }
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

import { updateBlogPostSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  const body = await parseBody(event, updateBlogPostSchema)

  const existing = await prisma.blogPost.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  let slug = existing.slug
  if (body.title && body.title.trim() !== existing.title) {
    slug = await generateUniqueSlug(body.title, async (s) => {
      const dup = await prisma.blogPost.findFirst({ where: { slug: s, id: { not: id } } })
      return !!dup
    })
  }

  const data: any = {
    title: body.title?.trim(),
    slug,
    description: body.description ?? null,
    content: body.content ?? null,
    excerpt: body.excerpt ?? null,
    imageUrl: body.imageUrl?.trim() ?? null,
    categoryId: body.categoryId ?? null
  }

  if (body.published !== undefined) {
    data.published = body.published
    if (body.published && !existing.published) {
      data.publishedAt = new Date()
    }
    if (!body.published) {
      data.publishedAt = null
    }
  }

  if (body.tagIds !== undefined) {
    await prisma.blogPostTag.deleteMany({ where: { postId: id } })
    if (body.tagIds.length) {
      await prisma.blogPostTag.createMany({
        data: body.tagIds.map(tagId => ({ postId: id, tagId }))
      })
    }
  }

  const post = await prisma.blogPost.update({
    where: { id },
    data,
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

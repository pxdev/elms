import { createBlogCategorySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const body = await parseBody(event, createBlogCategorySchema)

  const slug = await generateUniqueSlug(body.name, async (s) => {
    const existing = await prisma.blogCategory.findUnique({ where: { slug: s } })
    return !!existing
  })

  const category = await prisma.blogCategory.create({
    data: {
      name: body.name.trim(),
      slug,
      description: body.description?.trim() ?? null
    }
  })

  return { category }
})

import { updateBlogCategorySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  const body = await parseBody(event, updateBlogCategorySchema)

  const existing = await prisma.blogCategory.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Category not found' })
  }

  let slug = existing.slug
  if (body.name && body.name.trim() !== existing.name) {
    slug = await generateUniqueSlug(body.name, async (s) => {
      const dup = await prisma.blogCategory.findFirst({ where: { slug: s, id: { not: id } } })
      return !!dup
    })
  }

  const category = await prisma.blogCategory.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      slug,
      description: body.description?.trim() ?? null
    }
  })

  return { category }
})

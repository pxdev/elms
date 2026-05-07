import { updateBlogTagSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  const body = await parseBody(event, updateBlogTagSchema)

  const existing = await prisma.blogTag.findUnique({ where: { id } })
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Tag not found' })
  }

  let slug = existing.slug
  if (body.name && body.name.trim() !== existing.name) {
    slug = await generateUniqueSlug(body.name, async (s) => {
      const dup = await prisma.blogTag.findFirst({ where: { slug: s, id: { not: id } } })
      return !!dup
    })
  }

  const tag = await prisma.blogTag.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      slug
    }
  })

  return { tag }
})

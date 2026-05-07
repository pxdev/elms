import { createBlogTagSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const body = await parseBody(event, createBlogTagSchema)

  const slug = await generateUniqueSlug(body.name, async (s) => {
    const existing = await prisma.blogTag.findUnique({ where: { slug: s } })
    return !!existing
  })

  const tag = await prisma.blogTag.create({
    data: {
      name: body.name.trim(),
      slug
    }
  })

  return { tag }
})

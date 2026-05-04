export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const body = await readBody<{
    name?: string
    description?: string
    imageUrl?: string
    teacherId?: number
  }>(event)

  if (!body.name || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Course name is required.' })
  }

  const course = await prisma.course.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      imageUrl: body.imageUrl?.trim() ?? null,
      teacherId: body.teacherId ?? null
    }
  })

  return { course }
})

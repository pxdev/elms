export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const body = await readBody<{
    name?: string
    description?: string
    imageUrl?: string
    teacherId?: number | null
    isActive?: boolean
  }>(event)

  const course = await prisma.course.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      description: body.description?.trim(),
      imageUrl: body.imageUrl?.trim(),
      teacherId: body.teacherId,
      isActive: body.isActive
    }
  })

  return { course }
})

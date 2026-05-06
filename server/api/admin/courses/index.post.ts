import { createCourseSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const body = await parseBody(event, createCourseSchema)

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

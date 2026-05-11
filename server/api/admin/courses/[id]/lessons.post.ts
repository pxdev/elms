import { z } from 'zod'

const createLessonSchema = z.object({
  name: z.string().min(1),
  order: z.coerce.number().int().min(0)
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const courseId = Number(getRouterParam(event, 'id'))
  if (!courseId) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const body = await parseBody(event, createLessonSchema)

  const lesson = await prisma.courseLesson.create({
    data: {
      courseId,
      name: body.name.trim(),
      order: body.order
    }
  })

  return { lesson }
})

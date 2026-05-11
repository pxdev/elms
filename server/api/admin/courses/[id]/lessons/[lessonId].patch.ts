import { z } from 'zod'

const updateLessonSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const courseId = Number(getRouterParam(event, 'id'))
  const lessonId = Number(getRouterParam(event, 'lessonId'))
  if (!courseId || !lessonId) {
    throw createError({ statusCode: 400, message: 'Invalid IDs.' })
  }

  const body = await parseBody(event, updateLessonSchema)

  const lesson = await prisma.courseLesson.update({
    where: { id: lessonId, courseId },
    data: {
      name: body.name?.trim(),
      description: body.description?.trim()
    }
  })

  return { lesson }
})

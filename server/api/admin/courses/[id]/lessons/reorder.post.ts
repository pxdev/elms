import { z } from 'zod'

const reorderSchema = z.object({
  lessonIds: z.array(z.coerce.number().int().positive())
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const courseId = Number(getRouterParam(event, 'id'))
  if (!courseId) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const body = await parseBody(event, reorderSchema)

  const lessons = await prisma.courseLesson.findMany({
    where: { courseId },
    select: { id: true }
  })
  const existingIds = new Set(lessons.map(l => l.id))
  const allPresent = body.lessonIds.every(id => existingIds.has(id))
  const noExtras = body.lessonIds.length === existingIds.size

  if (!allPresent || !noExtras) {
    throw createError({ statusCode: 400, message: 'Invalid lesson IDs.' })
  }

  await prisma.$transaction(
    body.lessonIds.map((lessonId, index) =>
      prisma.courseLesson.update({
        where: { id: lessonId, courseId },
        data: { order: index }
      })
    )
  )

  return { success: true }
})

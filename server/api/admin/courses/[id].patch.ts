import { unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { updateCourseSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const body = await parseBody(event, updateCourseSchema)

  const existing = await prisma.course.findUnique({
    where: { id },
    select: { imageUrl: true }
  })

  const course = await prisma.course.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      description: body.description?.trim(),
      imageUrl: body.imageUrl?.trim(),
      teacherId: body.teacherId,
      isActive: body.isActive,
      price: body.price,
      totalSessions: body.totalSessions,
      lsVariantId: body.lsVariantId?.trim()
    }
  })

  // Sync lessons if totalSessions changed
  if (body.totalSessions != null) {
    const currentLessons = await prisma.courseLesson.findMany({
      where: { courseId: id },
      orderBy: { order: 'asc' }
    })
    const currentCount = currentLessons.length
    const newCount = body.totalSessions

    if (newCount > currentCount) {
      await prisma.courseLesson.createMany({
        data: Array.from({ length: newCount - currentCount }, (_, i) => ({
          courseId: id,
          name: `Session ${currentCount + i + 1}`,
          order: currentCount + i
        }))
      })
    } else if (newCount < currentCount) {
      const toDelete = currentLessons.slice(newCount)
      await prisma.courseLesson.deleteMany({
        where: { id: { in: toDelete.map(l => l.id) } }
      })
    }
  }

  const oldImageUrl = existing?.imageUrl
  const newImageUrl = body.imageUrl?.trim()
  if (oldImageUrl && oldImageUrl.startsWith('/uploads/') && oldImageUrl !== newImageUrl) {
    const filePath = join(process.cwd(), 'public', oldImageUrl)
    try {
      await unlink(filePath)
    } catch {
      // File may not exist; ignore
    }
  }

  return { course }
})

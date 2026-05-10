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

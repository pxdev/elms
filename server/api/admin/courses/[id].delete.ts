import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const course = await prisma.course.findUnique({
    where: { id },
    select: { imageUrl: true }
  })

  await prisma.course.delete({ where: { id } })

  if (course?.imageUrl?.startsWith('/uploads/')) {
    const filePath = join(process.cwd(), 'public', course.imageUrl)
    try {
      await unlink(filePath)
    } catch {
      // File may not exist; ignore
    }
  }

  return { success: true }
})

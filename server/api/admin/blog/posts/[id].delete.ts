import { unlink } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))

  const post = await prisma.blogPost.findUnique({ where: { id } })
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' })
  }

  if (post.imageUrl) {
    try {
      const filePath = join(process.cwd(), 'public', post.imageUrl)
      await unlink(filePath)
    } catch {
      // ignore
    }
  }

  await prisma.blogPost.delete({ where: { id } })

  return { success: true }
})

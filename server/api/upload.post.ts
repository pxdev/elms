import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, message: 'No file provided.' })
  }

  const file = formData.find((f) => f.name === 'file')
  if (!file || !file.filename || !file.data) {
    throw createError({ statusCode: 400, message: 'No file provided.' })
  }

  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.data.length > maxSize) {
    throw createError({ statusCode: 400, message: 'File too large. Max size is 5MB.' })
  }

  const ext = file.filename.split('.').pop() ?? 'jpg'
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const uploadsDir = join(process.cwd(), 'public', 'uploads')
  const filePath = join(uploadsDir, name)

  await writeFile(filePath, file.data)

  return { url: `/uploads/${name}` }
})

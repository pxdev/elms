import { z } from 'zod'

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
  isActive: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid user ID.' })
  }

  const body = await parseBody(event, updateUserSchema)

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: body.name,
      role: body.role,
      isActive: body.isActive
    }
  })

  return { user }
})

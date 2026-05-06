import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).default('STUDENT')
})

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const body = await parseBody(event, createUserSchema)

  const existing = await prisma.user.findUnique({
    where: { email: body.email }
  })

  if (existing) {
    throw createError({ statusCode: 409, message: 'Email already registered.' })
  }

  const passwordHash = await hashPassword(body.password)

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      passwordHash,
      role: body.role,
      isActive: true
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true
    }
  })

  return { user }
})

import { loginSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { email, password } = await parseBody(event, loginSchema)

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.passwordHash) {
    throw createError({ statusCode: 401, message: 'Invalid email or password.' })
  }

  const valid = await verifyPassword(user.passwordHash, password)
  if (!valid) {
    throw createError({ statusCode: 401, message: 'Invalid email or password.' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      timeZone: user.timeZone,
      phone: user.phone,
      country: user.country,
      age: user.age,
      isActive: user.isActive,
      isAvailableForBooking: user.isAvailableForBooking
    } as any,
    loggedInAt: Date.now()
  })

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      timeZone: user.timeZone,
      phone: user.phone,
      country: user.country,
      age: user.age,
      isActive: user.isActive,
      isAvailableForBooking: user.isAvailableForBooking
    }
  }
})

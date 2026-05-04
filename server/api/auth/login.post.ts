export default defineEventHandler(async (event) => {
  const { email, password } = await readBody<{
    email?: string
    password?: string
  }>(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email and password are required.' })
  }

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
      isActive: user.isActive
    },
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
      isActive: user.isActive
    }
  }
})

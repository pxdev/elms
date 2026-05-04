export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      avatarUrl: true,
      role: true,
      timeZone: true,
      phone: true,
      country: true,
      age: true,
      isActive: true,
      emailVerified: true,
      emailVerifiedAt: true,
      createdAt: true
    }
  })

  return { user: dbUser }
})

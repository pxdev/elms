export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      isAvailableForBooking: true,
      emailVerified: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return { users }
})

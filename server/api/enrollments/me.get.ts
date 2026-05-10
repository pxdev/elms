export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      course: {
        select: { id: true, name: true, description: true, imageUrl: true, teacher: { select: { name: true } } }
      },
      sessions: true
    },
    orderBy: { enrolledAt: 'desc' }
  })

  return { enrollments }
})

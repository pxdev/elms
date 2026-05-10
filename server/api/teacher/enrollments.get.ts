export default defineEventHandler(async (event) => {
  await requireRole(event, ['TEACHER', 'ADMIN'])
  const { user } = await requireUserSession(event)

  const enrollments = await prisma.enrollment.findMany({
    where: {
      course: { teacherId: user.id }
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      course: { select: { id: true, name: true } },
      sessions: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return { enrollments }
})

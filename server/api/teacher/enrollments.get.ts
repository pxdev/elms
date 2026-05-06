export default defineEventHandler(async (event) => {
  await requireRole(event, ['TEACHER'])
  const { user } = await requireUserSession(event)

  const enrollments = await prisma.enrollment.findMany({
    where: {
      courseVariant: {
        course: { teacherId: user.id }
      }
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      courseVariant: {
        include: {
          course: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { enrollments }
})

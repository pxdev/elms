export default defineEventHandler(async (event) => {
  await requireRole(event, ['TEACHER'])
  const { user } = await requireUserSession(event)

  const [courses, enrollments, pendingEnrollments] = await Promise.all([
    prisma.course.count({ where: { teacherId: user.id } }),
    prisma.enrollment.count({
      where: {
        course: { teacherId: user.id }
      }
    }),
    prisma.enrollment.count({
      where: {
        status: 'PENDING',
        course: { teacherId: user.id }
      }
    })
  ])

  return { courses, enrollments, pendingEnrollments }
})

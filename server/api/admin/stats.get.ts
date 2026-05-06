export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const [
    usersCount,
    coursesCount,
    enrollmentsCount,
    pendingEnrollmentsCount,
    teachersCount,
    studentsCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.enrollment.count({ where: { status: 'PENDING' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: 'STUDENT' } })
  ])

  return {
    users: usersCount,
    courses: coursesCount,
    enrollments: enrollmentsCount,
    pendingEnrollments: pendingEnrollmentsCount,
    teachers: teachersCount,
    students: studentsCount
  }
})

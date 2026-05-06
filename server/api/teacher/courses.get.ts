export default defineEventHandler(async (event) => {
  await requireRole(event, ['TEACHER'])
  const { user } = await requireUserSession(event)

  const courses = await prisma.course.findMany({
    where: { teacherId: user.id },
    include: { variants: true },
    orderBy: { createdAt: 'desc' }
  })

  return { courses }
})

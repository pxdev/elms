export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: {
      courseVariant: {
        include: {
          course: {
            select: { id: true, name: true, description: true, imageUrl: true }
          }
        }
      }
    },
    orderBy: { enrolledAt: 'desc' }
  })

  return { enrollments }
})

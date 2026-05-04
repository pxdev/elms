export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const enrollments = await prisma.enrollment.findMany({
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      courseVariant: {
        include: {
          course: {
            select: { id: true, name: true }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { enrollments }
})

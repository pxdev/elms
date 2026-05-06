export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const courses = await prisma.course.findMany({
    include: {
      teacher: {
        select: { id: true, name: true, email: true }
      },
      variants: {
        orderBy: { price: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return { courses }
})

export default defineEventHandler(async () => {
  const courses = await prisma.course.findMany({
    where: { isActive: true },
    include: {
      teacher: {
        select: { id: true, name: true, email: true, avatarUrl: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  return { courses }
})

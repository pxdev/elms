export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const sessions = await prisma.session.findMany({
    where: {
      enrollment: { userId: user.id }
    },
    include: {
      enrollment: {
        select: {
          course: {
            select: { id: true, name: true, teacher: { select: { name: true } } }
          }
        }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  })

  return { sessions }
})

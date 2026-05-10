export default defineEventHandler(async (event) => {
  await requireRole(event, ['TEACHER', 'ADMIN'])
  const { user } = await requireUserSession(event)

  const query = getQuery(event)
  const dateParam = query.date as string | undefined

  const startOfDay = dateParam ? new Date(dateParam) : new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setHours(23, 59, 59, 999)

  const sessions = await prisma.session.findMany({
    where: {
      enrollment: {
        course: { teacherId: user.id }
      },
      scheduledAt: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      enrollment: {
        select: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  })

  return { sessions, date: startOfDay.toISOString() }
})

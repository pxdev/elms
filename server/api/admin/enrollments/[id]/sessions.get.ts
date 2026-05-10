export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const enrollmentId = Number(getRouterParam(event, 'id'))
  if (!enrollmentId) {
    throw createError({ statusCode: 400, message: 'Invalid enrollment ID.' })
  }

  const sessions = await prisma.session.findMany({
    where: { enrollmentId },
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

  return { sessions }
})

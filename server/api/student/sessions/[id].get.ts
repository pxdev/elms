export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid session ID.' })
  }

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      enrollment: {
        select: {
          userId: true,
          course: {
            select: {
              id: true,
              name: true,
              teacher: { select: { name: true } },
              materials: {
                where: { isPrivate: false }
              }
            }
          }
        }
      }
    }
  })

  if (!session || session.enrollment.userId !== user.id) {
    throw createError({ statusCode: 404, message: 'Session not found.' })
  }

  return { session }
})

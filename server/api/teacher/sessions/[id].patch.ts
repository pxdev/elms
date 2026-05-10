import { updateSessionSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['TEACHER', 'ADMIN'])
  const { user } = await requireUserSession(event)

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid session ID.' })
  }

  const body = await parseBody(event, updateSessionSchema)

  const existing = await prisma.session.findUnique({
    where: { id },
    include: {
      enrollment: {
        select: {
          course: { select: { teacherId: true } }
        }
      }
    }
  })

  if (!existing || existing.enrollment.course.teacherId !== user.id) {
    throw createError({ statusCode: 404, message: 'Session not found.' })
  }

  const session = await prisma.session.update({
    where: { id },
    data: {
      status: body.status,
      zoomLink: body.zoomLink?.trim(),
      notes: body.notes?.trim()
    }
  })

  return { session }
})

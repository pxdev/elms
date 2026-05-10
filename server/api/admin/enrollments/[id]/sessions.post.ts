import { createSessionSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const enrollmentId = Number(getRouterParam(event, 'id'))
  if (!enrollmentId) {
    throw createError({ statusCode: 400, message: 'Invalid enrollment ID.' })
  }

  const body = await parseBody(event, createSessionSchema)

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: { select: { teacherId: true, totalSessions: true } },
      sessions: true
    }
  })

  if (!enrollment) {
    throw createError({ statusCode: 404, message: 'Enrollment not found.' })
  }

  const bookedCount = enrollment.sessions.filter(s => s.status !== 'CANCELLED').length
  if (bookedCount >= enrollment.course.totalSessions) {
    throw createError({ statusCode: 400, message: 'All sessions for this enrollment have been booked.' })
  }

  const scheduledAt = new Date(body.scheduledAt)

  // Check for overlapping sessions for this teacher
  const teacherEnrollments = await prisma.enrollment.findMany({
    where: { course: { teacherId: enrollment.course.teacherId! } },
    select: { sessions: true }
  })
  const existingSessions = teacherEnrollments.flatMap(e => e.sessions).filter(s => s.status !== 'CANCELLED')

  const durationMs = (body.durationMinutes ?? 60) * 60000
  const overlaps = existingSessions.some(s => {
    const sStart = new Date(s.scheduledAt)
    const sEnd = new Date(sStart.getTime() + s.durationMinutes * 60000)
    return scheduledAt < sEnd && new Date(scheduledAt.getTime() + durationMs) > sStart
  })

  if (overlaps) {
    throw createError({ statusCode: 409, message: 'This time slot overlaps with an existing session.' })
  }

  const session = await prisma.session.create({
    data: {
      enrollmentId: enrollment.id,
      scheduledAt,
      durationMinutes: body.durationMinutes ?? 60,
      zoomLink: body.zoomLink?.trim() ?? null,
      notes: body.notes?.trim() ?? null
    }
  })

  return { session }
})

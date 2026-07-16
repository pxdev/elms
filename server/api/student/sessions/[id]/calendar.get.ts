function escapeIcs(value: string) {
  return value.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n')
}

function icsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const session = await prisma.session.findUnique({
    where: { id },
    include: { enrollment: { include: { course: { include: { teacher: true } } } } }
  })
  if (!session || session.enrollment.userId !== user.id) {
    throw createError({ statusCode: 404, message: 'Session not found.' })
  }
  const end = new Date(session.scheduledAt.getTime() + session.durationMinutes * 60000)
  const course = session.enrollment.course
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ELMS//Student Session//EN',
    'BEGIN:VEVENT', `UID:session-${session.id}@elms`, `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(session.scheduledAt)}`, `DTEND:${icsDate(end)}`,
    `SUMMARY:${escapeIcs(course.name)}`, `DESCRIPTION:${escapeIcs(`Session with ${course.teacher?.name ?? 'teacher'}`)}`,
    ...(session.zoomLink ? [`URL:${session.zoomLink}`] : []),
    'END:VEVENT', 'END:VCALENDAR'
  ]
  setHeader(event, 'content-type', 'text/calendar; charset=utf-8')
  setHeader(event, 'content-disposition', `attachment; filename="${course.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-session.ics"`)
  return lines.join('\r\n')
})

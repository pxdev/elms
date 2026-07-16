import { studentUpdateSessionSchema } from '~~/shared/schemas'
import { generateAvailableSlots } from '../../../utils/slots'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await parseBody(event, studentUpdateSessionSchema)

  const session = await prisma.session.findUnique({
    where: { id },
    include: {
      enrollment: {
        include: {
          course: { include: { teacher: { select: { name: true, email: true, timeZone: true, isAvailableForBooking: true } } } }
        }
      }
    }
  })
  if (!session || session.enrollment.userId !== user.id) {
    throw createError({ statusCode: 404, message: 'Session not found.' })
  }
  if (session.status !== 'SCHEDULED') {
    throw createError({ statusCode: 409, message: 'Only scheduled sessions can be changed.' })
  }

  const cutoff = session.scheduledAt.getTime() - session.enrollment.course.cancellationNoticeHours * 60 * 60 * 1000
  if (Date.now() > cutoff) {
    throw createError({ statusCode: 409, message: `Changes require ${session.enrollment.course.cancellationNoticeHours} hours notice.` })
  }

  if (body.action === 'cancel') {
    const updated = await prisma.session.update({
      where: { id },
      data: { status: 'CANCELLED', cancelReason: body.reason?.trim() || null, cancelledAt: new Date() }
    })
    try {
      await Promise.all([
        sendMail({
          to: user.email,
          subject: `Session cancelled: ${session.enrollment.course.name}`,
          text: `Your session scheduled for ${session.scheduledAt.toLocaleString()} has been cancelled.`
        }),
        session.enrollment.course.teacher?.email
          ? sendMail({
              to: session.enrollment.course.teacher.email,
              subject: `Session cancelled: ${session.enrollment.course.name}`,
              text: `${user.name ?? user.email} cancelled the session scheduled for ${session.scheduledAt.toLocaleString()}.`
            })
          : Promise.resolve()
      ])
    } catch (err) {
      console.error('[session] failed to send cancellation email', err)
    }
    return { session: updated }
  }

  const teacher = session.enrollment.course.teacher
  if (!teacher?.timeZone || !teacher.isAvailableForBooking || !session.enrollment.course.teacherId) {
    throw createError({ statusCode: 409, message: 'The teacher is not available for booking.' })
  }
  const scheduledAt = new Date(body.scheduledAt)
  const earliest = Date.now() + session.enrollment.course.minimumBookingNoticeHours * 60 * 60 * 1000
  if (scheduledAt.getTime() < earliest) {
    throw createError({ statusCode: 400, message: `Sessions require ${session.enrollment.course.minimumBookingNoticeHours} hours notice.` })
  }

  const [availability, enrollments] = await Promise.all([
    prisma.teacherAvailability.findMany({ where: { teacherId: session.enrollment.course.teacherId, isActive: true } }),
    prisma.enrollment.findMany({
      where: { course: { teacherId: session.enrollment.course.teacherId } },
      select: { sessions: true }
    })
  ])
  const existing = enrollments.flatMap(item => item.sessions)
    .filter(item => item.id !== session.id && item.status !== 'CANCELLED')
  const slots = generateAvailableSlots(
    availability,
    teacher.timeZone,
    existing,
    session.durationMinutes,
    90,
    session.enrollment.course.bookingBufferMinutes
  )
  if (!slots.some(slot => slot.startTime.getTime() === scheduledAt.getTime())) {
    throw createError({ statusCode: 409, message: 'This time slot is no longer available.' })
  }

  const updated = await prisma.session.update({
    where: { id },
    data: { scheduledAt, rescheduledAt: new Date() }
  })
  try {
    await Promise.all([
      sendMail({
        to: user.email,
        subject: `Session rescheduled: ${session.enrollment.course.name}`,
        text: `Your session has been moved to ${scheduledAt.toLocaleString()}.`
      }),
      teacher.email
        ? sendMail({
            to: teacher.email,
            subject: `Session rescheduled: ${session.enrollment.course.name}`,
            text: `${user.name ?? user.email} moved the session to ${scheduledAt.toLocaleString()}.`
          })
        : Promise.resolve()
    ])
  } catch (err) {
    console.error('[session] failed to send reschedule email', err)
  }
  return { session: updated }
})

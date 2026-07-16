import { createSessionSchema } from '~~/shared/schemas'
import { generateAvailableSlots } from '../../utils/slots'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await parseBody(event, createSessionSchema)

  const enrollment = await prisma.enrollment.findUnique({
    where: { id: body.enrollmentId },
    include: {
      course: { select: { name: true, teacherId: true, totalSessions: true, minimumBookingNoticeHours: true, bookingBufferMinutes: true, teacher: { select: { name: true, email: true } } } },
      sessions: true
    }
  })

  if (!enrollment || enrollment.userId !== user.id) {
    throw createError({ statusCode: 403, message: 'Invalid enrollment.' })
  }

  if (enrollment.status !== 'ACTIVE') {
    throw createError({ statusCode: 403, message: 'Enrollment must be active to book sessions.' })
  }

  const bookedCount = enrollment.sessions.filter(s => s.status !== 'CANCELLED').length
  if (bookedCount >= enrollment.course.totalSessions) {
    throw createError({ statusCode: 400, message: 'You have already booked all available sessions.' })
  }

  const scheduledAt = new Date(body.scheduledAt)
  const earliestBooking = Date.now() + enrollment.course.minimumBookingNoticeHours * 60 * 60 * 1000
  if (scheduledAt.getTime() < earliestBooking) {
    throw createError({ statusCode: 400, message: `Sessions require ${enrollment.course.minimumBookingNoticeHours} hours notice.` })
  }

  const teacher = await prisma.user.findUnique({
    where: { id: enrollment.course.teacherId ?? undefined },
    select: { timeZone: true, isAvailableForBooking: true }
  })
  if (!teacher?.isAvailableForBooking || !teacher.timeZone || !enrollment.course.teacherId) {
    throw createError({ statusCode: 403, message: 'The teacher is not available for booking.' })
  }

  const availability = await prisma.teacherAvailability.findMany({
    where: { teacherId: enrollment.course.teacherId, isActive: true }
  })

  // Check if slot is already taken by another session for this teacher
  const teacherEnrollments = await prisma.enrollment.findMany({
    where: { course: { teacherId: enrollment.course.teacherId! } },
    select: { sessions: true }
  })
  const existingSessions = teacherEnrollments.flatMap(e => e.sessions).filter(s => s.status !== 'CANCELLED')

  const requestedDuration = body.durationMinutes ?? 60
  const availableSlots = generateAvailableSlots(
    availability,
    teacher.timeZone,
    existingSessions,
    requestedDuration,
    90,
    enrollment.course.bookingBufferMinutes
  )
  if (!availableSlots.some(slot => slot.startTime.getTime() === scheduledAt.getTime())) {
    throw createError({ statusCode: 409, message: 'This time slot is no longer available.' })
  }

  const durationMs = requestedDuration * 60000
  const overlaps = existingSessions.some((s) => {
    const sStart = new Date(s.scheduledAt)
    const sEnd = new Date(sStart.getTime() + s.durationMinutes * 60000)
    return scheduledAt < sEnd && new Date(scheduledAt.getTime() + durationMs) > sStart
  })

  if (overlaps) {
    throw createError({ statusCode: 409, message: 'This time slot is no longer available.' })
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

  try {
    const studentConfirmation = sendMail({
      to: user.email,
      subject: `Session booked: ${enrollment.course.name}`,
      text: `Your session with ${enrollment.course.teacher?.name ?? 'your teacher'} is booked for ${scheduledAt.toLocaleString()}.`,
      html: `<p>Your session for <strong>${enrollment.course.name}</strong> with ${enrollment.course.teacher?.name ?? 'your teacher'} is booked for <strong>${scheduledAt.toLocaleString()}</strong>.</p>`
    })
    const teacherNotification = enrollment.course.teacher?.email
      ? sendMail({
          to: enrollment.course.teacher.email,
          subject: `New session booked: ${enrollment.course.name}`,
          text: `${user.name ?? user.email} booked a session for ${scheduledAt.toLocaleString()}.`
        })
      : Promise.resolve()
    await Promise.all([studentConfirmation, teacherNotification])
  } catch (err) {
    console.error('[session] failed to send booking confirmation', err)
  }

  return { session }
})

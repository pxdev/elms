import { generateAvailableSlots } from '../../utils/slots'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const query = getQuery(event)
  const courseId = Number(query.courseId)
  if (!courseId) {
    throw createError({ statusCode: 400, message: 'courseId is required' })
  }

  // Verify user has an active enrollment for this course
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    include: {
      course: {
        select: { teacherId: true, totalSessions: true }
      },
      sessions: true
    }
  })

  if (!enrollment || enrollment.status !== 'ACTIVE') {
    throw createError({ statusCode: 403, message: 'You must be actively enrolled to book sessions.' })
  }

  // Check if user has already booked all sessions
  const bookedCount = enrollment.sessions.filter(s => s.status !== 'CANCELLED').length
  if (bookedCount >= enrollment.course.totalSessions) {
    return { slots: [], maxReached: true }
  }

  // Get teacher's availability and timezone
  const teacher = await prisma.user.findUnique({
    where: { id: enrollment.course.teacherId ?? undefined },
    select: { timeZone: true, isAvailableForBooking: true }
  })

  if (!teacher?.isAvailableForBooking) {
    return { slots: [], notAvailable: true }
  }

  if (!teacher?.timeZone) {
    throw createError({ statusCode: 503, message: 'Teacher has not set their timezone yet.' })
  }

  const availability = await prisma.teacherAvailability.findMany({
    where: { teacherId: enrollment.course.teacherId!, isActive: true }
  })

  if (availability.length === 0) {
    return { slots: [], noAvailability: true }
  }

  // Get all existing sessions for this teacher to exclude booked slots
  const teacherEnrollments = await prisma.enrollment.findMany({
    where: { course: { teacherId: enrollment.course.teacherId! } },
    select: { sessions: true }
  })
  const existingSessions = teacherEnrollments.flatMap(e => e.sessions).filter(s => s.status !== 'CANCELLED')

  const slots = generateAvailableSlots(
    availability,
    teacher.timeZone,
    existingSessions,
    60,
    90
  )

  return {
    slots: slots.map(s => ({
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString()
    })),
    bookedCount,
    totalSessions: enrollment.course.totalSessions
  }
})

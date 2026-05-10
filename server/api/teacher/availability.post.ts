import { teacherAvailabilitySchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['TEACHER', 'ADMIN'])
  const { user } = await requireUserSession(event)

  const body = await parseBody(event, teacherAvailabilitySchema)

  // Delete existing availability for the dates being updated
  const dates = [...new Set(body.slots.map(s => s.date))]
  if (dates.length > 0) {
    await prisma.teacherAvailability.deleteMany({
      where: { teacherId: user.id, date: { in: dates } }
    })
  }

  if (body.slots.length > 0) {
    await prisma.teacherAvailability.createMany({
      data: body.slots.map(slot => ({
        teacherId: user.id,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime
      }))
    })
  }

  const availability = await prisma.teacherAvailability.findMany({
    where: { teacherId: user.id, isActive: true },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  })

  return { availability }
})

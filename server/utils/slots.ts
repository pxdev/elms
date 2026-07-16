import { addDays, startOfDay, isBefore, isAfter, format } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export interface AvailabilityEntry {
  date: string // YYYY-MM-DD
  startTime: number
  endTime: number
}

export interface TimeSlot {
  startTime: Date
  endTime: Date
}

export function generateAvailableSlots(
  availability: AvailabilityEntry[],
  teacherTimeZone: string,
  existingSessions: { scheduledAt: Date; durationMinutes: number }[],
  durationMinutes = 60,
  daysAhead = 90,
  bufferMinutes = 0
): TimeSlot[] {
  const now = new Date()
  const slots: TimeSlot[] = []

  for (let d = 0; d <= daysAhead; d++) {
    const date = addDays(now, d)
    const dateStr = format(date, 'yyyy-MM-dd')

    const dayAvailability = availability.filter(a => a.date === dateStr)

    for (const avail of dayAvailability) {
      // Create start/end times in the teacher's timezone for this date
      const zonedDate = toZonedTime(date, teacherTimeZone)
      const baseDate = startOfDay(zonedDate)
      const localStart = new Date(baseDate)
      localStart.setHours(Math.floor(avail.startTime / 60), avail.startTime % 60, 0, 0)
      const localEnd = new Date(baseDate)
      localEnd.setHours(Math.floor(avail.endTime / 60), avail.endTime % 60, 0, 0)

      // Convert to UTC
      const utcStart = fromZonedTime(localStart, teacherTimeZone)
      const utcEnd = fromZonedTime(localEnd, teacherTimeZone)

      // If the local end time is before start (shouldn't happen with valid data), skip
      if (isBefore(utcEnd, utcStart)) continue

      // Generate slots
      let slotStart = utcStart
      while (isBefore(slotStart, utcEnd) || slotStart.getTime() === utcEnd.getTime()) {
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000)
        if (isAfter(slotEnd, utcEnd)) break

        // Check if this slot overlaps with an existing session
        const overlaps = existingSessions.some(session => {
          const sessionStart = new Date(session.scheduledAt)
          const sessionEnd = new Date(sessionStart.getTime() + (session.durationMinutes + bufferMinutes) * 60000)
          const bufferedSlotEnd = new Date(slotEnd.getTime() + bufferMinutes * 60000)
          return slotStart < sessionEnd && bufferedSlotEnd > sessionStart
        })

        if (!overlaps && isAfter(slotStart, now)) {
          slots.push({ startTime: slotStart, endTime: slotEnd })
        }

        slotStart = slotEnd
      }
    }
  }

  return slots
}

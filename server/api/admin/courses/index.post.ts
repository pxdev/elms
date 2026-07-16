import { createCourseSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const body = await parseBody(event, createCourseSchema)

  const totalSessions = body.totalSessions ?? 4

  const course = await prisma.course.create({
    data: {
      name: body.name.trim(),
      description: body.description?.trim() ?? null,
      outcomes: body.outcomes?.trim() ?? null,
      prerequisites: body.prerequisites?.trim() ?? null,
      targetAudience: body.targetAudience?.trim() ?? null,
      refundPolicy: body.refundPolicy?.trim() ?? null,
      imageUrl: body.imageUrl?.trim() ?? null,
      teacherId: body.teacherId ?? null,
      price: body.price ?? 0,
      totalSessions,
      cancellationNoticeHours: body.cancellationNoticeHours,
      minimumBookingNoticeHours: body.minimumBookingNoticeHours,
      bookingBufferMinutes: body.bookingBufferMinutes,
      lsVariantId: body.lsVariantId?.trim() ?? null
    }
  })

  // Auto-create lessons
  await prisma.courseLesson.createMany({
    data: Array.from({ length: totalSessions }, (_, i) => ({
      courseId: course.id,
      name: `Session ${i + 1}`,
      order: i
    }))
  })

  return { course }
})

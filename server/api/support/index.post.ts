import { supportRequestSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  enforceRateLimit(event, { max: 5, windowSeconds: 60 })
  const body = await parseBody(event, supportRequestSchema)

  if (body.enrollmentId) {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: body.enrollmentId } })
    if (!enrollment || enrollment.userId !== user.id) {
      throw createError({ statusCode: 403, message: 'Invalid enrollment.' })
    }
  }

  const request = await prisma.supportRequest.create({
    data: {
      userId: user.id,
      enrollmentId: body.enrollmentId,
      subject: body.subject.trim(),
      message: body.message.trim()
    }
  })

  try {
    await sendMail({
      to: process.env.SUPPORT_EMAIL || process.env.MAIL_FROM || 'support@example.com',
      subject: `[ELMS support #${request.id}] ${request.subject}`,
      text: `From: ${user.email}\nEnrollment: ${body.enrollmentId ?? 'n/a'}\n\n${request.message}`
    })
  } catch (err) {
    console.error('[support] failed to send support notification', err)
  }

  return { request }
})

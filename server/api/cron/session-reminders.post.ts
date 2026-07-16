export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET
  if (!secret || getHeader(event, 'authorization') !== `Bearer ${secret}`) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const now = new Date()
  const until = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const sessions = await prisma.session.findMany({
    where: {
      status: 'SCHEDULED',
      reminderSentAt: null,
      scheduledAt: { gt: now, lte: until }
    },
    include: {
      enrollment: {
        include: {
          user: { select: { email: true, name: true } },
          course: { include: { teacher: { select: { name: true } } } }
        }
      }
    }
  })

  let sent = 0
  for (const session of sessions) {
    try {
      await sendMail({
        to: session.enrollment.user.email,
        subject: `Reminder: ${session.enrollment.course.name} session`,
        text: `Your session with ${session.enrollment.course.teacher?.name ?? 'your teacher'} starts at ${session.scheduledAt.toLocaleString()}.${session.zoomLink ? `\nJoin: ${session.zoomLink}` : ''}`
      })
      await prisma.session.update({ where: { id: session.id }, data: { reminderSentAt: new Date() } })
      sent++
    } catch (err) {
      console.error(`[reminders] failed for session ${session.id}`, err)
    }
  }
  return { checked: sessions.length, sent }
})

export default defineEventHandler(async (event) => {
  const { email } = await readBody<{ email?: string }>(event)
  if (!email) {
    throw createError({ statusCode: 400, message: 'Email is required.' })
  }

  const user = await prisma.user.findUnique({ where: { email } })

  // Always respond ok to avoid leaking which emails exist.
  if (!user || user.emailVerified) {
    return { ok: true }
  }

  await revokeOutstandingTokens(user.id, 'email_verify')
  const token = await issueToken(user.id, 'email_verify')
  const link = appUrl(`/api/auth/verify-email/${token}`)

  await sendMail({
    to: user.email,
    subject: 'Verify your email',
    text: `Hi${user.name ? ' ' + user.name : ''},\n\nConfirm your email by visiting:\n${link}\n\nThis link expires in 24 hours.`,
    html: `<p>Hi${user.name ? ' ' + user.name : ''},</p><p>Confirm your email by clicking the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`
  })

  return { ok: true }
})

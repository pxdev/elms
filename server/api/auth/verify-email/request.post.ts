import { resendVerificationSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { email } = await parseBody(event, resendVerificationSchema)

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

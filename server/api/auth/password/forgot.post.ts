import { forgotPasswordSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { email } = await parseBody(event, forgotPasswordSchema)

  const user = await prisma.user.findUnique({ where: { email } })

  // Always respond ok to avoid leaking which emails exist.
  if (!user) return { ok: true }

  await revokeOutstandingTokens(user.id, 'password_reset')
  const token = await issueToken(user.id, 'password_reset')
  const link = appUrl(`/reset-password?token=${token}`)

  await sendMail({
    to: user.email,
    subject: 'Reset your password',
    text: `Hi${user.name ? ' ' + user.name : ''},\n\nReset your password by visiting:\n${link}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
    html: `<p>Hi${user.name ? ' ' + user.name : ''},</p><p>Reset your password by clicking the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>`
  })

  return { ok: true }
})

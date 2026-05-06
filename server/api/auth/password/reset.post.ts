import { resetPasswordSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { token, password } = await parseBody(event, resetPasswordSchema)

  const userId = await consumeToken(token, 'password_reset')
  const passwordHash = await hashPassword(password)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash }
  })

  // Invalidate any other outstanding reset tokens for this user.
  await revokeOutstandingTokens(userId, 'password_reset')

  return { ok: true }
})

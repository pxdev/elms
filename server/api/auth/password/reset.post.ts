export default defineEventHandler(async (event) => {
  const { token, password } = await readBody<{
    token?: string
    password?: string
  }>(event)

  if (!token || !password) {
    throw createError({ statusCode: 400, message: 'Token and password are required.' })
  }
  if (password.length < 8) {
    throw createError({ statusCode: 400, message: 'Password must be at least 8 characters.' })
  }

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

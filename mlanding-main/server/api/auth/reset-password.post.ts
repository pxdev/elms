import prisma from '../../utils/prisma'
import { resetPasswordSchema } from '../../utils/validation'
import { hashToken } from '../../utils/tokens'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { max: 10, windowSeconds: 60 })
  const { token, password } = await validateBody(event, resetPasswordSchema)

  const tokenHash = hashToken(token)
  const reset = await prisma.passwordReset.findUnique({
    where: { token: tokenHash },
    include: { account: true }
  })

  if (!reset || reset.usedAt || reset.expiresAt < new Date()) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid or expired reset link', data: { code: 'INVALID_RESET_LINK' } })
  }
  if (!reset.account.isActive) {
    throw createError({ statusCode: 403, statusMessage: 'Account is deactivated', data: { code: 'ACCOUNT_DEACTIVATED' } })
  }

  const passwordHash = await hashPassword(password)

  await prisma.$transaction([
    prisma.account.update({
      where: { id: reset.accountId },
      data: { passwordHash }
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() }
    })
  ])

  return { success: true }
})

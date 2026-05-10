import prisma from '../../utils/prisma'
import { changePasswordSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  enforceRateLimit(event, { max: 5, windowSeconds: 60 })
  enforceRateLimitKey(`change-password:${user.id}`, { max: 5, windowSeconds: 300 })

  const { currentPassword, newPassword } = await validateBody(event, changePasswordSchema)

  const account = await prisma.account.findUnique({ where: { id: user.id } })
  if (!account || !await verifyPassword(account.passwordHash, currentPassword)) {
    throw createError({ statusCode: 401, statusMessage: 'Current password is incorrect', data: { code: 'CURRENT_PASSWORD_INCORRECT' } })
  }

  await prisma.account.update({
    where: { id: account.id },
    data: { passwordHash: await hashPassword(newPassword) }
  })

  return { success: true }
})

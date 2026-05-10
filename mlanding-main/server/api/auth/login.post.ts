import prisma from '../../utils/prisma'
import { loginSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  // Per-IP brute force defence
  enforceRateLimit(event, { max: 10, windowSeconds: 60 })
  const { email, password } = await validateBody(event, loginSchema)

  // Per-email defence (catches distributed credential stuffing)
  enforceRateLimitKey(`login:${email.toLowerCase()}`, { max: 5, windowSeconds: 60 })

  const account = await prisma.account.findUnique({ where: { email } })
  if (!account || !await verifyPassword(account.passwordHash, password)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid email or password', data: { code: 'INVALID_CREDENTIALS' } })
  }
  if (!account.isActive) {
    throw createError({ statusCode: 403, statusMessage: 'Account is deactivated', data: { code: 'ACCOUNT_DEACTIVATED' } })
  }

  const shouldBootstrapAdmin = !account.isAdmin && isBootstrapAdminEmail(account.email)

  const updated = await prisma.account.update({
    where: { id: account.id },
    data: {
      lastLoginAt: new Date(),
      ...(shouldBootstrapAdmin ? { isAdmin: true } : {})
    }
  })

  if (shouldBootstrapAdmin) {
    await auditLog({
      actorId: account.id,
      action: 'account.bootstrap_admin',
      targetType: 'Account',
      targetId: account.id,
      metadata: { email: account.email, source: 'login' }
    })
  }

  await setUserSession(event, {
    user: {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      isAdmin: updated.isAdmin
    },
    loggedInAt: Date.now()
  })

  return {
    user: {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      isAdmin: updated.isAdmin
    }
  }
})

import prisma from '../../utils/prisma'
import { registerSchema } from '../../utils/validation'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { max: 5, windowSeconds: 60 })
  const data = await validateBody(event, registerSchema)

  const passwordHash = await hashPassword(data.password)
  const email = data.email.toLowerCase()
  const bootstrapAdmin = isBootstrapAdminEmail(email)

  let account
  try {
    account = await prisma.account.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email,
        githubUsername: data.githubUsername || null,
        passwordHash,
        isAdmin: bootstrapAdmin
      }
    })
  } catch (e: any) {
    if (e.code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists', data: { code: 'EMAIL_TAKEN' } })
    }
    throw e
  }

  if (bootstrapAdmin) {
    await auditLog({
      actorId: account.id,
      action: 'account.bootstrap_admin',
      targetType: 'Account',
      targetId: account.id,
      metadata: { email: account.email, source: 'register' }
    })
  }

  await setUserSession(event, {
    user: {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      isAdmin: account.isAdmin
    },
    loggedInAt: Date.now()
  })

  return {
    user: {
      id: account.id,
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      isAdmin: account.isAdmin
    }
  }
})

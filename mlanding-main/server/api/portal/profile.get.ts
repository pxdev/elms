// Current user's profile. Used by /dashboard/profile.

import prisma from '../../utils/prisma'
import { requireSession } from '../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)

  const account = await prisma.account.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      githubUsername: true,
      isAdmin: true,
      createdAt: true,
      lastLoginAt: true
    }
  })
  if (!account) throw createError({ statusCode: 404, statusMessage: 'Account not found' })

  // Latest invite for the GitHub username currently on file (if any).
  const repoInvite = account.githubUsername
    ? await prisma.repoInvite.findUnique({
        where: {
          accountId_githubUsername: {
            accountId: account.id,
            githubUsername: account.githubUsername
          }
        }
      })
    : null

  return { ...account, repoInvite }
})

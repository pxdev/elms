// Admin: retry a failed RepoInvite by calling Octokit again.

import prisma from '../../../../../utils/prisma'
import { requireAdmin } from '../../../../../utils/auth-guards'
import { ensureRepoInvite } from '../../../../../utils/github'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  const invite = await prisma.repoInvite.findUnique({ where: { id } })
  if (!invite) throw createError({ statusCode: 404, statusMessage: 'Invite not found' })

  // Reset to PENDING so ensureRepoInvite() retries cleanly.
  await prisma.repoInvite.update({ where: { id }, data: { status: 'PENDING' } })

  const r = await ensureRepoInvite({
    accountId: invite.accountId,
    githubUsername: invite.githubUsername,
    actorId: user.id
  })
  return r
})

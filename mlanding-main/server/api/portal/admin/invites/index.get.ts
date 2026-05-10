// List RepoInvites for the admin invites page. Newest first.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { status, limit } = getQuery(event) as { status?: string; limit?: string }
  const take = Math.min(Number(limit) || 100, 300)

  const where: any = {}
  if (status && ['PENDING', 'SENT', 'ACCEPTED', 'FAILED'].includes(status)) {
    where.status = status
  }

  return prisma.repoInvite.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    take,
    include: {
      account: { select: { id: true, email: true, firstName: true, lastName: true } }
    }
  })
})

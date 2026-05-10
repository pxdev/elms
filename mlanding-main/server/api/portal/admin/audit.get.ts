// Recent audit log (admin). Newest first, capped.

import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { limit } = getQuery(event) as { limit?: string }
  const take = Math.min(Number(limit) || 100, 500)

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      actor: { select: { id: true, email: true, firstName: true, lastName: true } }
    }
  })

  return logs
})

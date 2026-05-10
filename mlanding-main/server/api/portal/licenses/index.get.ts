// List the current user's licenses.
// Never includes the plaintext key — only prefix + metadata.

import prisma from '../../../utils/prisma'
import { requireSession } from '../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)

  const licenses = await prisma.license.findMany({
    where: { accountId: user.id },
    orderBy: { issuedAt: 'desc' },
    include: {
      plan: { select: { id: true, slug: true, name: true } },
      _count: { select: { activations: { where: { deactivatedAt: null } } } }
    }
  })

  return licenses.map(l => ({
    id: l.id,
    keyPrefix: l.keyPrefix,
    plan: l.plan,
    status: l.status,
    maxActivations: l.maxActivations,
    activeActivations: l._count.activations,
    expiresAt: l.expiresAt,
    issuedAt: l.issuedAt,
    revokedAt: l.revokedAt,
    revokedReason: l.revokedReason
  }))
})

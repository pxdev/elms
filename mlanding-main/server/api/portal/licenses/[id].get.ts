// Detail for a single license owned by the current user. Includes activations.
// Never returns the plaintext key.

import prisma from '../../../utils/prisma'
import { requireSession } from '../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)
  const id = getRouterParam(event, 'id')!

  const license = await prisma.license.findFirst({
    where: { id, accountId: user.id },
    include: {
      plan: { select: { id: true, slug: true, name: true } },
      activations: {
        orderBy: { lastSeenAt: 'desc' }
      }
    }
  })

  if (!license) throw createError({ statusCode: 404, statusMessage: 'License not found' })

  return {
    id: license.id,
    keyPrefix: license.keyPrefix,
    plan: license.plan,
    status: license.status,
    maxActivations: license.maxActivations,
    notes: null,                                  // notes are admin-only
    expiresAt: license.expiresAt,
    issuedAt: license.issuedAt,
    revokedAt: license.revokedAt,
    revokedReason: license.revokedReason,
    activations: license.activations.map(a => ({
      id: a.id,
      fingerprint: a.fingerprint,
      hostname: a.hostname,
      ipAddress: a.ipAddress,
      appVersion: a.appVersion,
      lastSeenAt: a.lastSeenAt,
      deactivatedAt: a.deactivatedAt,
      createdAt: a.createdAt
    }))
  }
})

// List/search all licenses (admin).
// Query params:
//   q       — substring match on keyPrefix or account email
//   status  — ACTIVE | REVOKED | EXPIRED
//   limit   — default 50, max 200

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import type { LicenseStatus } from '../../../../../generated/enums'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { q, status, limit } = getQuery(event) as { q?: string; status?: string; limit?: string }
  const take = Math.min(Number(limit) || 50, 200)

  const where: any = {}
  if (status && ['ACTIVE', 'REVOKED', 'EXPIRED'].includes(status)) {
    where.status = status as LicenseStatus
  }
  if (q) {
    where.OR = [
      { keyPrefix: { contains: q, mode: 'insensitive' } },
      { account: { email: { contains: q, mode: 'insensitive' } } }
    ]
  }

  const licenses = await prisma.license.findMany({
    where,
    orderBy: { issuedAt: 'desc' },
    take,
    include: {
      plan: { select: { name: true, slug: true } },
      account: { select: { id: true, email: true, firstName: true, lastName: true } },
      _count: { select: { activations: { where: { deactivatedAt: null } } } }
    }
  })

  return licenses.map(l => ({
    id: l.id,
    keyPrefix: l.keyPrefix,
    status: l.status,
    maxActivations: l.maxActivations,
    activeActivations: l._count.activations,
    issuedAt: l.issuedAt,
    expiresAt: l.expiresAt,
    notes: l.notes,
    plan: l.plan,
    account: l.account
  }))
})

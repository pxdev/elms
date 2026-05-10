// List customers (admin). Search by email.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { q, limit } = getQuery(event) as { q?: string; limit?: string }
  const take = Math.min(Number(limit) || 50, 200)

  const where = q
    ? { OR: [
        { email: { contains: q, mode: 'insensitive' as const } },
        { firstName: { contains: q, mode: 'insensitive' as const } },
        { lastName: { contains: q, mode: 'insensitive' as const } },
        { githubUsername: { contains: q, mode: 'insensitive' as const } }
      ] }
    : {}

  const users = await prisma.account.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      githubUsername: true,
      isAdmin: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
      _count: { select: { licenses: true, orders: true } }
    }
  })

  return users
})

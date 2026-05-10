// Customer detail with their licenses + orders (admin).

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  const user = await prisma.account.findUnique({
    where: { id },
    include: {
      licenses: {
        orderBy: { issuedAt: 'desc' },
        include: {
          plan: { select: { slug: true, name: true } },
          _count: { select: { activations: { where: { deactivatedAt: null } } } }
        }
      },
      orders: {
        orderBy: { createdAt: 'desc' },
        include: { plan: { select: { slug: true, name: true } } }
      }
    }
  })

  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    githubUsername: user.githubUsername,
    isAdmin: user.isAdmin,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    licenses: user.licenses.map(l => ({
      id: l.id,
      keyPrefix: l.keyPrefix,
      status: l.status,
      maxActivations: l.maxActivations,
      activeActivations: l._count.activations,
      plan: l.plan,
      issuedAt: l.issuedAt,
      notes: l.notes
    })),
    orders: user.orders.map(o => ({
      id: o.id,
      lsOrderNumber: o.lsOrderNumber,
      amountCents: o.amountCents,
      currency: o.currency,
      status: o.status,
      plan: o.plan,
      createdAt: o.createdAt
    }))
  }
})

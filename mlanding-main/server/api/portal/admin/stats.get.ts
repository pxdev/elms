// Admin KPI snapshot. One round trip, everything the dashboard shows.
//
// Revenue is a sum of PAID orders; refunded orders subtract the refunded
// amount from the same currency bucket. Since the portal accepts multiple
// currencies from Lemon Squeezy, we return a map keyed by currency and
// let the UI decide how to display (usually the largest bucket wins as
// the "primary" figure).

import prisma from '../../../utils/prisma'
import { requireAdmin } from '../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const [
    totalUsers,
    adminUsers,
    activeLicenses,
    revokedLicenses,
    expiredLicenses,
    totalActivations,
    activeActivations,
    totalOrders,
    paidOrders,
    refundedOrders,
    pendingInvites,
    revenueRows,
    recentOrders
  ] = await Promise.all([
    prisma.account.count(),
    prisma.account.count({ where: { isAdmin: true } }),
    prisma.license.count({ where: { status: 'ACTIVE' } }),
    prisma.license.count({ where: { status: 'REVOKED' } }),
    prisma.license.count({ where: { status: 'EXPIRED' } }),
    prisma.activation.count(),
    prisma.activation.count({ where: { deactivatedAt: null } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.order.count({ where: { status: 'REFUNDED' } }),
    prisma.repoInvite.count({ where: { status: { in: ['PENDING', 'SENT'] } } }),
    prisma.order.groupBy({
      by: ['currency', 'status'],
      _sum: { amountCents: true }
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        account: { select: { email: true, firstName: true, lastName: true } },
        plan: { select: { name: true, slug: true } }
      }
    })
  ])

  // Build a currency → net-cents map. PAID adds, REFUNDED subtracts.
  const revenueByCurrency: Record<string, number> = {}
  for (const row of revenueRows) {
    const cents = row._sum.amountCents ?? 0
    if (!revenueByCurrency[row.currency]) revenueByCurrency[row.currency] = 0
    if (row.status === 'PAID') revenueByCurrency[row.currency]! += cents
    else if (row.status === 'REFUNDED') revenueByCurrency[row.currency]! -= cents
  }

  return {
    users: { total: totalUsers, admins: adminUsers },
    licenses: {
      active: activeLicenses,
      revoked: revokedLicenses,
      expired: expiredLicenses,
      total: activeLicenses + revokedLicenses + expiredLicenses
    },
    activations: { total: totalActivations, active: activeActivations },
    orders: { total: totalOrders, paid: paidOrders, refunded: refundedOrders },
    pendingInvites,
    revenueByCurrency,
    recentOrders: recentOrders.map(o => ({
      id: o.id,
      createdAt: o.createdAt,
      status: o.status,
      amountCents: o.amountCents,
      currency: o.currency,
      lsOrderNumber: o.lsOrderNumber,
      customerEmail: o.account.email,
      customerName: [o.account.firstName, o.account.lastName].filter(Boolean).join(' ') || null,
      planName: o.plan?.name ?? null
    }))
  }
})

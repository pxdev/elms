// User's order history — used by the dashboard billing tab.

import prisma from '../../utils/prisma'
import { requireSession } from '../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)

  const orders = await prisma.order.findMany({
    where: { accountId: user.id },
    orderBy: { createdAt: 'desc' },
    include: { plan: { select: { slug: true, name: true } } }
  })

  return orders.map(o => ({
    id: o.id,
    lsOrderNumber: o.lsOrderNumber,
    lsReceiptUrl: o.lsReceiptUrl,
    amountCents: o.amountCents,
    currency: o.currency,
    status: o.status,
    plan: o.plan,
    createdAt: o.createdAt,
    refundedAt: o.refundedAt
  }))
})

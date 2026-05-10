// List/search orders (admin). Filter by status + text search across
// customer email, LS order number, and plan slug.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import type { OrderStatus } from '../../../../../generated/enums'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { q, status, limit } = getQuery(event) as { q?: string; status?: string; limit?: string }
  const take = Math.min(Number(limit) || 50, 200)

  const where: any = {}
  if (status && ['PAID', 'REFUNDED', 'PENDING', 'FAILED'].includes(status)) {
    where.status = status as OrderStatus
  }
  if (q) {
    where.OR = [
      { lsOrderNumber: { contains: q, mode: 'insensitive' } },
      { account: { email: { contains: q, mode: 'insensitive' } } },
      { plan: { slug: { contains: q, mode: 'insensitive' } } }
    ]
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
    include: {
      account: { select: { id: true, email: true, firstName: true, lastName: true } },
      plan: { select: { name: true, slug: true } },
      _count: { select: { licenses: true } }
    }
  })

  return orders.map(o => ({
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    amountCents: o.amountCents,
    currency: o.currency,
    lsOrderId: o.lsOrderId,
    lsOrderNumber: o.lsOrderNumber,
    lsReceiptUrl: o.lsReceiptUrl,
    refundedAt: o.refundedAt,
    refundReason: o.refundReason,
    account: o.account,
    plan: o.plan,
    licenseCount: o._count.licenses
  }))
})

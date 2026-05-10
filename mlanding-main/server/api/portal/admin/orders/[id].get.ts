// Order detail view — customer, plan, issued licenses, raw LS payload
// for forensic debugging.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      account: { select: { id: true, email: true, firstName: true, lastName: true, githubUsername: true } },
      plan: { select: { id: true, name: true, slug: true } },
      licenses: {
        select: { id: true, keyPrefix: true, status: true, maxActivations: true, issuedAt: true },
        orderBy: { issuedAt: 'asc' }
      }
    }
  })
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' })

  return order
})

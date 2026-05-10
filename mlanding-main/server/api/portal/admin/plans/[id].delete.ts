// Delete a plan. Only allowed if no licenses or orders reference it —
// otherwise the historical record would lose its plan name. Soft-delete
// via isActive=false is the right tool for in-use plans.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  const plan = await prisma.plan.findUnique({
    where: { id },
    include: { _count: { select: { licenses: true, orders: true } } }
  })
  if (!plan) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })

  if (plan._count.licenses > 0 || plan._count.orders > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Plan is in use — deactivate it instead of deleting',
      data: { licenses: plan._count.licenses, orders: plan._count.orders }
    })
  }

  await prisma.plan.delete({ where: { id } })

  await auditLog({
    actorId: user.id,
    action: 'plan.deleted',
    targetType: 'Plan',
    targetId: id,
    metadata: { slug: plan.slug, name: plan.name }
  })

  return { ok: true }
})

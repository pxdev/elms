// Delete a feature. Cascade removes any PlanFeature attachments.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  const feature = await prisma.feature.findUnique({
    where: { id },
    include: { _count: { select: { plans: true } } }
  })
  if (!feature) throw createError({ statusCode: 404, statusMessage: 'Feature not found' })

  await prisma.feature.delete({ where: { id } })

  await auditLog({
    actorId: user.id,
    action: 'feature.deleted',
    targetType: 'Feature',
    targetId: id,
    metadata: { label: feature.label, detachedFromPlans: feature._count.plans }
  })

  return { ok: true }
})

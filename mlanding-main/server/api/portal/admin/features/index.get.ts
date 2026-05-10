// List features (admin) — feeds the plan feature picker.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const features = await prisma.feature.findMany({
    orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    include: { _count: { select: { plans: true } } }
  })
  return features.map(f => ({
    id: f.id,
    label: f.label,
    labelAr: f.labelAr,
    notes: f.notes,
    sortOrder: f.sortOrder,
    createdAt: f.createdAt,
    planCount: f._count.plans
  }))
})

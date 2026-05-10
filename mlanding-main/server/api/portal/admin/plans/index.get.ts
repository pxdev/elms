// List plans (admin) — feeds the "issue license" form and the plans page.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const plans = await prisma.plan.findMany({
    orderBy: [{ sortOrder: 'asc' }, { priceUsdCents: 'asc' }],
    include: {
      features: {
        orderBy: { sortOrder: 'asc' },
        include: { feature: true }
      },
      _count: { select: { licenses: true, orders: true } }
    }
  })

  return plans.map(p => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    nameAr: p.nameAr,
    description: p.description,
    descriptionAr: p.descriptionAr,
    priceUsdCents: p.priceUsdCents,
    defaultActivations: p.defaultActivations,
    lsVariantId: p.lsVariantId,
    sortOrder: p.sortOrder,
    isActive: p.isActive,
    createdAt: p.createdAt,
    features: p.features.map(pf => ({
      id: pf.feature.id,
      label: pf.feature.label,
      labelAr: pf.feature.labelAr,
      sortOrder: pf.sortOrder
    })),
    _count: p._count
  }))
})

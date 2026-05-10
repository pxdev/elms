// Public list of active plans + their features. Consumed by the marketing
// pricing cards (LandingPricingPlans.vue) so /admin/plans and /admin/features
// edits reflect on the public site without a code change.
//
// No auth — this endpoint describes what's *for sale* on the public site.
// Inactive plans are excluded; admin manages `isActive` from /admin/plans.

import prisma from '../../../utils/prisma'

export default defineEventHandler(async () => {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { priceUsdCents: 'asc' }],
    include: {
      features: {
        orderBy: { sortOrder: 'asc' },
        include: { feature: true }
      }
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
    // Derived display string — the i18n layer controls the currency format,
    // but callers can use this as a sensible default.
    priceDisplay: `$${(p.priceUsdCents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
    defaultActivations: p.defaultActivations,
    sortOrder: p.sortOrder,
    features: p.features.map(pf => ({
      id: pf.feature.id,
      label: pf.feature.label,
      labelAr: pf.feature.labelAr,
      sortOrder: pf.sortOrder
    }))
  }))
})

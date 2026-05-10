// Single endpoint for the order-review page. Resolves plan + optional
// promo code in one round-trip and returns the computed totals, so the
// review page doesn't need to stitch two responses together.
//
// GET /api/portal/checkout/preview/self-install?promo=WELCOME10
//   → { plan, promo, totals }
//
// Public (no auth) — the review page is reachable before login so users
// can see what they'll pay before being pushed through /auth/register.

import prisma from '../../../../utils/prisma'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'planSlug')!
  const rawPromo = getQuery(event).promo
  const promoInput = typeof rawPromo === 'string' ? rawPromo.trim().toUpperCase() : null

  const plan = await prisma.plan.findUnique({
    where: { slug },
    include: {
      features: {
        orderBy: { sortOrder: 'asc' },
        include: { feature: true }
      }
    }
  })
  if (!plan || !plan.isActive) {
    throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  }

  // Resolve promo, if any. An invalid or plan-mismatched code is silently
  // downgraded to `null` so the review page can render the plan regardless
  // and show an inline "couldn't apply" notice if it wants.
  let promo: { code: string, discountPercent: number, planSlug: string | null } | null = null
  if (promoInput) {
    const row = await prisma.promoCode.findUnique({
      where: { code: promoInput },
      include: { plan: { select: { slug: true } } }
    })
    const expired = row?.expiresAt && row.expiresAt < new Date()
    const exhausted = row && row.maxUses !== null && row.currentUses >= row.maxUses
    const wrongPlan = row?.planId && row.planId !== plan.id
    if (row && row.isActive && !expired && !exhausted && !wrongPlan) {
      promo = {
        code: row.code,
        discountPercent: row.discountPercent,
        planSlug: row.plan?.slug ?? null
      }
    }
  }

  const discountCents = promo
    ? Math.round(plan.priceUsdCents * (promo.discountPercent / 100))
    : 0
  // Clamp so a 100% promo doesn't push us below 0 cents (LS rejects 0/negative).
  const totalCents = Math.max(50, plan.priceUsdCents - discountCents)
  const fmt = (cents: number) => `$${(cents / 100).toFixed((cents % 100 === 0) ? 0 : 2)}`

  return {
    plan: {
      id: plan.id,
      slug: plan.slug,
      name: plan.name,
      nameAr: plan.nameAr,
      description: plan.description,
      descriptionAr: plan.descriptionAr,
      priceUsdCents: plan.priceUsdCents,
      defaultActivations: plan.defaultActivations,
      features: plan.features.map(pf => ({
        id: pf.feature.id,
        label: pf.feature.label,
        labelAr: pf.feature.labelAr,
        sortOrder: pf.sortOrder
      }))
    },
    promo,
    totals: {
      subtotalCents: plan.priceUsdCents,
      discountCents,
      totalCents,
      subtotalDisplay: fmt(plan.priceUsdCents),
      discountDisplay: fmt(discountCents),
      totalDisplay: fmt(totalCents)
    }
  }
})

// Authenticated checkout — builds a Lemon Squeezy hosted-checkout URL.
//
// Discounts flow via LS's own Discount catalog: when admin creates a
// PromoCode, we mirror it into LS (see /admin/promo-codes handlers) so
// the `discount_code` we pass here matches an LS-side discount and the
// price reduction is applied on the hosted checkout page. `custom_price`
// is NOT used because it only works on pay-what-you-want variants.
//
// `custom.promo_code` travels alongside so the order-created webhook
// can bind the resulting Order back to the PromoCode row.
//
// Usage (called from the review page):
//   const { url } = await $fetch('/api/portal/checkout/self-install', {
//     method: 'POST',
//     body: { promoCode: 'WELCOME10' }   // optional
//   })
//   window.location.href = url

import { z } from 'zod'
import prisma from '../../../utils/prisma'
import { requireSession } from '../../../utils/auth-guards'
import { createCheckout } from '../../../utils/lemon-squeezy'

const bodySchema = z.object({
  promoCode: z.string().min(1).max(40).optional()
}).optional()

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)
  enforceRateLimit(event, { max: 10, windowSeconds: 60 })

  const slug = getRouterParam(event, 'planSlug')!
  const plan = await prisma.plan.findUnique({ where: { slug } })
  if (!plan || !plan.isActive) {
    throw createError({ statusCode: 404, statusMessage: 'Plan not found' })
  }
  if (!plan.lsVariantId) {
    throw createError({ statusCode: 503, statusMessage: 'This plan is not yet wired to a Lemon Squeezy variant' })
  }

  // Validate optional promo code against our portal rules (scope, expiry,
  // redemption cap, isActive). A bad code is a hard 400 because the
  // review page showed the user the discount applied — silent dropping
  // would surprise them at the gateway.
  //
  // If the code is valid but hasn't been mirrored into LS yet
  // (`lsDiscountId == null`), we still forward the code string — LS will
  // reject it at checkout. Admin sees this in logs and can hit the bulk
  // sync endpoint to backfill.
  let promoCode: string | undefined
  const rawBody = await readBody(event).catch(() => undefined)
  const parsed = bodySchema.safeParse(rawBody)
  if (parsed.success && parsed.data?.promoCode) {
    const code = parsed.data.promoCode.trim().toUpperCase()
    const promo = await prisma.promoCode.findUnique({ where: { code } })
    const expired = promo?.expiresAt && promo.expiresAt < new Date()
    const exhausted = promo && promo.maxUses !== null && promo.currentUses >= promo.maxUses
    const wrongPlan = promo?.planId && promo.planId !== plan.id
    if (!promo || !promo.isActive || expired || exhausted || wrongPlan) {
      throw createError({ statusCode: 400, statusMessage: 'Promo code is invalid for this plan' })
    }
    if (!promo.lsDiscountId) {
      console.warn(`[checkout] promo ${promo.code} has no lsDiscountId — LS will reject. Run /api/portal/admin/promo-codes/sync.`)
    }
    promoCode = promo.code
  }

  const portalUrl = process.env.NUXT_PUBLIC_PORTAL_URL || getRequestURL(event).origin
  const url = await createCheckout({
    variantId: plan.lsVariantId,
    accountId: user.id,
    email: user.email,
    redirectUrl: `${portalUrl}/dashboard?purchased=${plan.slug}`,
    promoCode
  })

  return { url }
})

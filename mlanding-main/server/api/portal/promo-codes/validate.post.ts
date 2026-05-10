// Public promo-code validator. Returns `{ valid, discountPercent, ... }`
// so the pricing page can show the discounted price before checkout.
//
// Accepts `{ code, planSlug }`. `planSlug` is optional — if provided, the
// code must either be plan-agnostic (planId: null) or match that plan.
//
// Rate-limited per IP — 20 requests per 60s — to make brute-forcing codes
// unattractive. The endpoint returns the same shape for "invalid" and
// "expired" (and similar) so we don't leak which codes exist.

import { z } from 'zod'
import prisma from '../../../utils/prisma'

const bodySchema = z.object({
  code: z.string().min(1).max(40),
  planSlug: z.string().min(1).max(60).optional()
})

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { max: 20, windowSeconds: 60 })

  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  const code = parsed.data.code.trim().toUpperCase()
  const promo = await prisma.promoCode.findUnique({
    where: { code },
    include: { plan: { select: { slug: true } } }
  })

  // Generic "not a valid code" — same response regardless of reason so we
  // don't hint whether the code exists, is expired, or doesn't match the plan.
  const invalid = { valid: false as const, reason: 'invalid' }

  if (!promo || !promo.isActive) return invalid
  if (promo.expiresAt && promo.expiresAt < new Date()) return invalid
  if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) return invalid
  if (promo.planId && parsed.data.planSlug && promo.plan?.slug !== parsed.data.planSlug) return invalid

  return {
    valid: true as const,
    code: promo.code,
    discountPercent: promo.discountPercent,
    planSlug: promo.plan?.slug ?? null
  }
})

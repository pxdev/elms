// Lemon Squeezy integration — slimmed for the portal's needs:
//   - verifySignature(rawBody, headerSig)                — HMAC-SHA256, timing-safe
//   - createCheckout({ variantId, accountId, email, redirectUrl, promoCode })
//   - createDiscount / updateDiscount / deleteDiscount   — mirror PromoCode rows to LS
//
// Reference: https://docs.lemonsqueezy.com/api/checkouts
//            https://docs.lemonsqueezy.com/api/discounts
//
// Credentials read via integration-settings (DB row → env fallback).

import { createHmac, timingSafeEqual } from 'node:crypto'
import { getSetting } from './integration-settings'

const LS_API = 'https://api.lemonsqueezy.com/v1'

export async function verifySignature(rawBody: string, headerSig: string | undefined | null): Promise<boolean> {
  if (!headerSig) return false
  const secret = await getSetting('LEMON_SQUEEZY_WEBHOOK_SECRET')
  if (!secret) {
    console.error('[lemon-squeezy] LEMON_SQUEEZY_WEBHOOK_SECRET not set — refusing all webhooks')
    return false
  }
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(expected, 'hex')
  let b: Buffer
  try { b = Buffer.from(headerSig, 'hex') } catch { return false }
  return a.length === b.length && timingSafeEqual(a, b)
}

export interface CreateCheckoutOpts {
  variantId: string
  accountId: string
  email: string
  redirectUrl?: string
  // Portal promo-code identifier, forwarded via LS custom_data so the
  // purchase webhook can attribute the Order to a PromoCode row and
  // bump `currentUses`. Also passed as LS `discount_code` when set, so
  // LS matches its own Discount catalog entry (created by us via the
  // createDiscount helper) and applies the price reduction at checkout.
  promoCode?: string
}

interface LsCheckoutResponse {
  data: { id: string, attributes: { url: string } }
}

export async function createCheckout(opts: CreateCheckoutOpts): Promise<string> {
  const apiKey = await getSetting('LEMON_SQUEEZY_API_KEY')
  const storeId = await getSetting('LEMON_SQUEEZY_STORE_ID')
  if (!apiKey || !storeId) {
    throw createError({ statusCode: 500, statusMessage: 'Lemon Squeezy not configured' })
  }

  // custom.promo_code travels through to the order-created webhook so we
  // can attribute the purchase back to the PromoCode row.
  const custom: Record<string, string> = { account_id: opts.accountId }
  if (opts.promoCode) custom.promo_code = opts.promoCode

  // `discount_code` references an existing LS Discount by its code string.
  // We mirror each PromoCode into LS on admin save (see createDiscount
  // below), so the same uppercase string works on both sides.
  const checkoutData: Record<string, unknown> = { email: opts.email, custom }
  if (opts.promoCode) checkoutData.discount_code = opts.promoCode

  const attributes: Record<string, unknown> = {
    checkout_data: checkoutData,
    product_options: {
      redirect_url: opts.redirectUrl,
      receipt_button_text: 'Return to Dashboard'
    }
  }

  const payload = {
    data: {
      type: 'checkouts' as const,
      attributes,
      relationships: {
        store: { data: { type: 'stores' as const, id: storeId } },
        variant: { data: { type: 'variants' as const, id: opts.variantId } }
      }
    }
  }

  let response: LsCheckoutResponse
  try {
    response = await $fetch<LsCheckoutResponse>(`${LS_API}/checkouts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      },
      body: payload
    })
  } catch (err: any) {
    const msg = err?.data?.errors?.[0]?.detail || err?.message || 'Failed to create checkout'
    throw createError({ statusCode: 502, statusMessage: `Lemon Squeezy: ${msg}` })
  }

  const url = response?.data?.attributes?.url
  if (!url) {
    throw createError({ statusCode: 502, statusMessage: 'Lemon Squeezy: No checkout URL returned' })
  }
  return url
}

// ─── Discounts (mirror of PromoCode rows) ───────────────────────────────
//
// These helpers keep LS's Discount catalog in sync with our PromoCode
// table. Without this mirror, fixed-price variants ignore `custom_price`
// and LS charges the catalog price — i.e. the promo appears to do
// nothing on the hosted checkout page. Creating a matching LS Discount
// (percent-off, optionally limited to one variant) lets LS honour the
// `discount_code` we pass on checkout creation.

export interface DiscountOpts {
  code: string              // uppercase, matches PromoCode.code
  name: string              // admin-facing label in the LS dashboard
  discountPercent: number   // 1–100
  lsVariantId?: string | null // plan-scoped when set (LS-side variant id)
  maxRedemptions?: number | null
  expiresAt?: Date | null
  isActive?: boolean
}

interface LsDiscountResponse {
  data: { id: string, attributes: Record<string, unknown> }
}

async function lsAuthHeaders() {
  const apiKey = await getSetting('LEMON_SQUEEZY_API_KEY')
  const storeId = await getSetting('LEMON_SQUEEZY_STORE_ID')
  if (!apiKey || !storeId) {
    throw createError({ statusCode: 500, statusMessage: 'Lemon Squeezy not configured' })
  }
  return {
    apiKey,
    storeId,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json'
    } as Record<string, string>
  }
}

function discountAttributes(opts: DiscountOpts) {
  return {
    name: opts.name,
    code: opts.code,
    amount: opts.discountPercent,
    amount_type: 'percent' as const,
    // LS uses "cart" duration by default (single-use-per-customer, applied
    // once at checkout) which maps to how we treat one-time license sales.
    duration: 'once' as const,
    is_limited_to_products: !!opts.lsVariantId,
    is_limited_redemptions: typeof opts.maxRedemptions === 'number' && opts.maxRedemptions > 0,
    max_redemptions: opts.maxRedemptions ?? 0,
    expires_at: opts.expiresAt ? opts.expiresAt.toISOString() : null
  }
}

// Creates a new Discount in LS. Returns the LS discount id so callers
// can persist it on PromoCode.lsDiscountId for later PATCH/DELETE.
export async function createDiscount(opts: DiscountOpts): Promise<string> {
  const { storeId, headers } = await lsAuthHeaders()
  const payload: Record<string, unknown> = {
    data: {
      type: 'discounts',
      attributes: discountAttributes(opts),
      relationships: {
        store: { data: { type: 'stores', id: storeId } },
        // Variant relationship only valid when is_limited_to_products is true.
        ...(opts.lsVariantId
          ? { variants: { data: [{ type: 'variants', id: opts.lsVariantId }] } }
          : {})
      }
    }
  }
  try {
    const res = await $fetch<LsDiscountResponse>(`${LS_API}/discounts`, {
      method: 'POST', headers, body: payload
    })
    return res.data.id
  } catch (err: any) {
    const msg = err?.data?.errors?.[0]?.detail || err?.message || 'Failed to create discount'
    throw createError({ statusCode: 502, statusMessage: `Lemon Squeezy: ${msg}` })
  }
}

// Updates an existing LS discount by id. LS doesn't support updating the
// variant relationship on a discount, so plan-scope changes require
// delete + recreate — callers should handle that path.
export async function updateDiscount(lsDiscountId: string, opts: DiscountOpts): Promise<void> {
  const { headers } = await lsAuthHeaders()
  const payload = {
    data: {
      type: 'discounts',
      id: lsDiscountId,
      attributes: discountAttributes(opts)
    }
  }
  try {
    await $fetch(`${LS_API}/discounts/${lsDiscountId}`, {
      method: 'PATCH', headers, body: payload
    })
  } catch (err: any) {
    const msg = err?.data?.errors?.[0]?.detail || err?.message || 'Failed to update discount'
    throw createError({ statusCode: 502, statusMessage: `Lemon Squeezy: ${msg}` })
  }
}

export async function deleteDiscount(lsDiscountId: string): Promise<void> {
  const { headers } = await lsAuthHeaders()
  try {
    await $fetch(`${LS_API}/discounts/${lsDiscountId}`, { method: 'DELETE', headers })
  } catch (err: any) {
    // 404 is fine — the discount was already gone. Anything else is surfaced.
    if (err?.response?.status === 404) return
    const msg = err?.data?.errors?.[0]?.detail || err?.message || 'Failed to delete discount'
    throw createError({ statusCode: 502, statusMessage: `Lemon Squeezy: ${msg}` })
  }
}

import { createHmac, timingSafeEqual } from 'node:crypto'

const LS_API = 'https://api.lemonsqueezy.com/v1'

export async function verifySignature(rawBody: string, headerSig: string | undefined | null): Promise<boolean> {
  if (!headerSig) return false
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  if (!secret) {
    console.error('[lemon-squeezy] LEMON_SQUEEZY_WEBHOOK_SECRET not set — refusing all webhooks')
    return false
  }
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(expected, 'hex')
  let b: Buffer
  try {
    b = Buffer.from(headerSig, 'hex')
  } catch {
    return false
  }
  return a.length === b.length && timingSafeEqual(a, b)
}

export interface CreateCheckoutOpts {
  variantId: string
  userId: number
  email: string
  redirectUrl?: string
  promoCode?: string
}

interface LsCheckoutResponse {
  data: { id: string, attributes: { url: string } }
}

export async function createCheckout(opts: CreateCheckoutOpts): Promise<string> {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID
  if (!apiKey || !storeId) {
    throw createError({ statusCode: 500, statusMessage: 'Lemon Squeezy not configured' })
  }

  const custom: Record<string, string> = { user_id: String(opts.userId) }
  if (opts.promoCode) custom.promo_code = opts.promoCode

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
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.api+json',
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

export interface DiscountOpts {
  code: string
  name: string
  discountPercent: number
  lsVariantId?: string | null
  maxRedemptions?: number | null
  expiresAt?: Date | null
  isActive?: boolean
}

interface LsDiscountResponse {
  data: { id: string, attributes: Record<string, unknown> }
}

async function lsAuthHeaders() {
  const apiKey = process.env.LEMON_SQUEEZY_API_KEY
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID
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
    duration: 'once' as const,
    is_limited_to_products: !!opts.lsVariantId,
    is_limited_redemptions: typeof opts.maxRedemptions === 'number' && opts.maxRedemptions > 0,
    max_redemptions: opts.maxRedemptions ?? 0,
    expires_at: opts.expiresAt ? opts.expiresAt.toISOString() : null
  }
}

export async function createDiscount(opts: DiscountOpts): Promise<string> {
  const { storeId, headers } = await lsAuthHeaders()
  const payload: Record<string, unknown> = {
    data: {
      type: 'discounts',
      attributes: discountAttributes(opts),
      relationships: {
        store: { data: { type: 'stores', id: storeId } },
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
    if (err?.response?.status === 404) return
    const msg = err?.data?.errors?.[0]?.detail || err?.message || 'Failed to delete discount'
    throw createError({ statusCode: 502, statusMessage: `Lemon Squeezy: ${msg}` })
  }
}

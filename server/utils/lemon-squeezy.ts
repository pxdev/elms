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

  const attributes: Record<string, unknown> = {
    checkout_data: { email: opts.email, custom },
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
  } catch (err: unknown) {
    const e = err as { data?: { errors?: Array<{ detail?: string }> }, message?: string }
    const msg = e.data?.errors?.[0]?.detail || e.message || 'Failed to create checkout'
    throw createError({ statusCode: 502, statusMessage: `Lemon Squeezy: ${msg}` })
  }

  const url = response?.data?.attributes?.url
  if (!url) {
    throw createError({ statusCode: 502, statusMessage: 'Lemon Squeezy: No checkout URL returned' })
  }
  return url
}

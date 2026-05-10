// Smoke-test the Lemon Squeezy API key. Hits /v1/users/me which returns
// the authenticated user when the key is valid; any other response means
// the credentials are wrong or the API is unreachable.

import { requireAdmin } from '../../../../utils/auth-guards'
import { getSetting } from '../../../../utils/integration-settings'

interface LsUserResponse { data?: { attributes?: { name?: string; email?: string } } }

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const apiKey = await getSetting('LEMON_SQUEEZY_API_KEY')
  if (!apiKey) {
    throw createError({ statusCode: 400, statusMessage: 'API key not configured' })
  }
  try {
    const res = await $fetch<LsUserResponse>('https://api.lemonsqueezy.com/v1/users/me', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/vnd.api+json'
      },
      timeout: 8000,
      retry: 0
    })
    const attrs = res?.data?.attributes
    return { ok: true, name: attrs?.name || null, email: attrs?.email || null }
  } catch (err: any) {
    const msg = err?.data?.errors?.[0]?.detail || err?.statusMessage || err?.message || 'Request failed'
    throw createError({ statusCode: 502, statusMessage: msg })
  }
})

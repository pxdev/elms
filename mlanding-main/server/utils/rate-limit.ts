// In-memory rate limiter for the portal API. Sliding window per key.
// Single-process — fine for one instance; if we ever scale horizontally
// move this to Redis.

const store = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}, 5 * 60_000)

export interface RateLimitOptions {
  max: number
  windowSeconds: number
}

function _check(key: string, options: RateLimitOptions): boolean {
  const now = Date.now()
  const windowMs = options.windowSeconds * 1000
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= options.max) return false
  entry.count++
  return true
}

export function enforceRateLimit(event: any, options: RateLimitOptions) {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  const path = getRequestURL(event).pathname
  const key = `${ip}:${path}`
  if (!_check(key, options)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many attempts — try again in a minute',
      data: {
        code: 'RATE_LIMITED',
        reason: 'rate_limited',
        windowSeconds: options.windowSeconds,
        hint: `You can retry in up to ${options.windowSeconds} seconds.`
      }
    })
  }
}

export function enforceRateLimitKey(keySuffix: string, options: RateLimitOptions) {
  if (!_check(`key:${keySuffix}`, options)) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many attempts — try again in a minute',
      data: { code: 'RATE_LIMITED', reason: 'rate_limited', windowSeconds: options.windowSeconds }
    })
  }
}

// Server-side auth guards used inside event handlers.
//
//   const { user } = await requireSession(event)        — any logged-in user
//   const { user } = await requireAdmin(event)          — must be isAdmin
//
// Both throw 401 / 403 with no info leak.

import type { H3Event } from 'h3'

export async function requireSession(event: H3Event) {
  const session = await requireUserSession(event)
  if (!session.user) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  return session
}

export async function requireAdmin(event: H3Event) {
  const session = await requireSession(event)
  if (!session.user.isAdmin) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }
  return session
}

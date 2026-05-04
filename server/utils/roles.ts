import type { H3Event } from 'h3'
import type { Role } from '../../prisma/generated/client/client'

export async function requireRole(event: H3Event, allowed: Role[]) {
  const session = await requireUserSession(event)
  if (!allowed.includes(session.user.role)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden. You do not have permission to access this resource.'
    })
  }
  return session
}

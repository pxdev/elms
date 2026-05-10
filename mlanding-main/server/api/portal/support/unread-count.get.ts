// Bell-style unread count for the current user — counts tickets where the
// last activity was an admin reply they haven't opened yet. Cheap query
// (uses the accountId+status index plus the email-fallback OR), polled by
// the portal layout every minute.

import prisma from '../../../utils/prisma'
import { requireSession } from '../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)

  const count = await prisma.supportTicket.count({
    where: {
      unreadByUser: true,
      OR: [
        { accountId: user.id },
        { accountId: null, email: user.email }
      ]
    }
  })

  return { count }
})

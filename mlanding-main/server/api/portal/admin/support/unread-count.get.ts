// Inbox-unread count for admins — every ticket waiting on an admin
// response. Drives the badge next to the Support entry in the admin
// sidebar.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const count = await prisma.supportTicket.count({
    where: { unreadByAdmin: true }
  })

  return { count }
})

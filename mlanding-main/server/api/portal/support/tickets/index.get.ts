// List the current user's support tickets — both CONTACT (anonymous, but
// matched by email back to the now-logged-in account) and CUSTOMER tickets.
//
// We include `accountId == user.id` AND `accountId == null && email == user.email`
// so a visitor who later registers with the same address still owns their
// pre-account contact submissions.

import prisma from '../../../../utils/prisma'
import { requireSession } from '../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)

  const tickets = await prisma.supportTicket.findMany({
    where: {
      OR: [
        { accountId: user.id },
        { accountId: null, email: user.email }
      ]
    },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      subject: true,
      status: true,
      source: true,
      unreadByUser: true,
      lastAdminReplyAt: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } }
    }
  })

  return tickets.map(t => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    source: t.source,
    unread: t.unreadByUser,
    lastAdminReplyAt: t.lastAdminReplyAt,
    messageCount: t._count.messages,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt
  }))
})

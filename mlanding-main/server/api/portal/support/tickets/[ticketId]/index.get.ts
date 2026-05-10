// Single ticket + messages, scoped to the requester. Marks the ticket as
// read by the user as a side-effect (so the bell count clears once they
// opened the thread).

import prisma from '../../../../../utils/prisma'
import { requireSession } from '../../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)
  const ticketId = getRouterParam(event, 'ticketId')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Missing ticketId' })

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      OR: [
        { accountId: user.id },
        { accountId: null, email: user.email }
      ]
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          body: true,
          isAdmin: true,
          createdAt: true,
          senderAccount: { select: { firstName: true, lastName: true, email: true } }
        }
      }
    }
  })
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  // Side-effect: clear the user's unread flag now that they're reading it.
  if (ticket.unreadByUser) {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { unreadByUser: false }
    })
  }

  return {
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    source: ticket.source,
    email: ticket.email,
    name: ticket.name,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    closedAt: ticket.closedAt,
    messages: ticket.messages.map(m => ({
      id: m.id,
      body: m.body,
      isAdmin: m.isAdmin,
      senderName: m.senderAccount
        ? [m.senderAccount.firstName, m.senderAccount.lastName].filter(Boolean).join(' ').trim() || m.senderAccount.email
        : null,
      createdAt: m.createdAt
    }))
  }
})

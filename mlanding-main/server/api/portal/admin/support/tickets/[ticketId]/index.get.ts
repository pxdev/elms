// Admin ticket detail with full message thread and customer context. Marks
// the ticket as read by admin (clears the queue's unread flag).

import prisma from '../../../../../../utils/prisma'
import { requireAdmin } from '../../../../../../utils/auth-guards'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const ticketId = getRouterParam(event, 'ticketId')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Missing ticketId' })

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      account: {
        select: {
          id: true, email: true, firstName: true, lastName: true,
          githubUsername: true, isAdmin: true,
          _count: { select: { licenses: true, orders: true } }
        }
      },
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

  if (ticket.unreadByAdmin) {
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { unreadByAdmin: false }
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
    account: ticket.account,
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

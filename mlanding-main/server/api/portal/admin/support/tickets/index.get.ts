// Admin queue across all tickets — both contact submissions and customer
// support requests. Filters: status (single or list), source, search.
// Default order: open + unread bubble to the top, then most recently
// updated.

import prisma from '../../../../../utils/prisma'
import { requireAdmin } from '../../../../../utils/auth-guards'

const VALID_STATUS = ['OPEN', 'AWAITING_USER', 'RESOLVED', 'CLOSED'] as const
type Status = typeof VALID_STATUS[number]
const VALID_SOURCE = ['CONTACT', 'CUSTOMER'] as const
type Source = typeof VALID_SOURCE[number]

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = getQuery(event)
  const statusParam = typeof query.status === 'string' ? query.status : ''
  const sourceParam = typeof query.source === 'string' ? query.source : ''
  const q = (typeof query.q === 'string' ? query.q : '').trim()

  const statusFilter: Status[] = statusParam
    ? statusParam.split(',').filter((s): s is Status => (VALID_STATUS as readonly string[]).includes(s))
    : []
  const sourceFilter: Source | undefined =
    (VALID_SOURCE as readonly string[]).includes(sourceParam) ? (sourceParam as Source) : undefined

  const tickets = await prisma.supportTicket.findMany({
    where: {
      ...(statusFilter.length ? { status: { in: statusFilter } } : {}),
      ...(sourceFilter ? { source: sourceFilter } : {}),
      ...(q ? {
        OR: [
          { subject: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } }
        ]
      } : {})
    },
    orderBy: [
      { unreadByAdmin: 'desc' },
      { updatedAt: 'desc' }
    ],
    take: 200,
    select: {
      id: true,
      subject: true,
      status: true,
      source: true,
      email: true,
      name: true,
      unreadByAdmin: true,
      lastUserReplyAt: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
      account: { select: { id: true, firstName: true, lastName: true, email: true } }
    }
  })

  return tickets.map(t => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    source: t.source,
    email: t.email,
    name: t.name,
    unread: t.unreadByAdmin,
    lastUserReplyAt: t.lastUserReplyAt,
    messageCount: t._count.messages,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    account: t.account
  }))
})

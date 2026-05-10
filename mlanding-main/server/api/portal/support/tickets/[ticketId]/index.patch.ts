// Customer-side close. Lets the user mark their own ticket as resolved
// (e.g. "I figured it out, never mind"). Admins use a richer endpoint
// under /api/portal/admin/support/tickets/[id].

import { z } from 'zod'
import prisma from '../../../../../utils/prisma'
import { requireSession } from '../../../../../utils/auth-guards'

const bodySchema = z.object({
  status: z.enum(['RESOLVED'])
})

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)
  const ticketId = getRouterParam(event, 'ticketId')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Missing ticketId' })

  const data = await readValidatedBody(event, bodySchema.parse)

  const ticket = await prisma.supportTicket.findFirst({
    where: {
      id: ticketId,
      OR: [
        { accountId: user.id },
        { accountId: null, email: user.email }
      ]
    },
    select: { id: true }
  })
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: { status: data.status, closedAt: new Date() }
  })

  return { success: true }
})

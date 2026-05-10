// Customer-side reply. Refuses to append to closed/resolved tickets — if
// the customer wants to follow up they should reopen via a new ticket so
// admins triage cleanly. Emails the public support inbox so admins can
// notice without polling the queue.

import { z } from 'zod'
import prisma from '../../../../../utils/prisma'
import { requireSession } from '../../../../../utils/auth-guards'
import { sendEmail, emailLayout } from '../../../../../utils/email'
import { useRuntimeConfig } from '#imports'

const SUPPORT_INBOX = 'support@momentfy.com'

const bodySchema = z.object({
  body: z.string().trim().min(1).max(10_000)
})

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

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
    select: { id: true, subject: true, status: true, accountId: true, email: true, name: true }
  })
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  if (ticket.status === 'CLOSED' || ticket.status === 'RESOLVED') {
    throw createError({ statusCode: 409, statusMessage: 'Ticket closed — open a new ticket' })
  }

  const now = new Date()

  // Reattach an anonymous CONTACT ticket to the now-logged-in account if the
  // user replies for the first time from their dashboard.
  const reattach = ticket.accountId == null && ticket.email === user.email

  await prisma.$transaction([
    prisma.supportTicketMessage.create({
      data: {
        ticketId: ticket.id,
        senderAccountId: user.id,
        isAdmin: false,
        body: data.body
      }
    }),
    prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        // User replied → bring back to admin's queue.
        status: 'OPEN',
        unreadByUser: false,
        unreadByAdmin: true,
        lastUserReplyAt: now,
        ...(reattach ? { accountId: user.id, source: 'CUSTOMER' } : {})
      }
    })
  ])

  // Notification email to the support inbox. Best-effort — never fail
  // the reply because the SMTP transport hiccupped.
  try {
    const portalUrl = useRuntimeConfig().public.portalUrl || ''
    const adminLink = portalUrl ? `${portalUrl.replace(/\/$/, '')}/admin/support/${ticket.id}` : null
    const customerName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || user.email
    const html = emailLayout(`Customer reply: ${escape(ticket.subject)}`, `
      <p><strong>${escape(customerName)}</strong> &lt;${escape(user.email)}&gt; replied:</p>
      <blockquote style="margin:16px 0;padding:12px 16px;border-inline-start:3px solid #ddd;background:#fafafa;white-space:pre-wrap">${escape(data.body)}</blockquote>
      ${adminLink
        ? `<p><a href="${adminLink}" style="display:inline-block;padding:10px 18px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Open in admin</a></p>`
        : '<p>Open /admin/support to triage.</p>'}
    `)
    await sendEmail({
      to: SUPPORT_INBOX,
      subject: `[Support] ${ticket.subject}`,
      html,
      replyTo: user.email
    })
  } catch (err) {
    console.error('[support] customer-reply email failed', err)
  }

  return { success: true }
})

// Admin status updates: open, mark resolved, force-close, etc. Sends a
// closure email to the customer when the status flips to RESOLVED or
// CLOSED so they know the ticket is done and can reopen if needed.

import { z } from 'zod'
import prisma from '../../../../../../utils/prisma'
import { requireAdmin } from '../../../../../../utils/auth-guards'
import { sendEmail, emailLayout } from '../../../../../../utils/email'
import { useRuntimeConfig } from '#imports'

const SUPPORT_INBOX = 'support@momentfy.com'

const bodySchema = z.object({
  status: z.enum(['OPEN', 'AWAITING_USER', 'RESOLVED', 'CLOSED'])
})

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default defineEventHandler(async (event) => {
  const { user: admin } = await requireAdmin(event)
  const ticketId = getRouterParam(event, 'ticketId')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Missing ticketId' })

  const data = await readValidatedBody(event, bodySchema.parse)

  const before = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true, subject: true, email: true, name: true, status: true }
  })
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const closing = data.status === 'RESOLVED' || data.status === 'CLOSED'

  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: data.status,
      closedAt: closing ? new Date() : null
    }
  })

  // Only notify the customer when the *terminal* state changes — flipping
  // OPEN ↔ AWAITING_USER doesn't warrant an email. Skip the email if the
  // ticket was already in the same closed state.
  const newlyClosed = closing && before.status !== data.status
  if (newlyClosed) {
    try {
      const portalUrl = useRuntimeConfig().public.portalUrl || ''
      const threadLink = portalUrl ? `${portalUrl.replace(/\/$/, '')}/dashboard/support/${before.id}` : null
      const labelEn = data.status === 'RESOLVED' ? 'resolved' : 'closed'
      const html = emailLayout(`Your ticket was ${labelEn}: ${escape(before.subject)}`, `
        <p>Hi ${escape(before.name || 'there')},</p>
        <p>Your support ticket has been marked as <strong>${labelEn}</strong>.</p>
        <p style="font-size:14px;color:#333"><strong>${escape(before.subject)}</strong></p>
        <p>If your issue is back or you have a follow-up question, please open a new ticket — that helps us pick it up cleanly.</p>
        ${threadLink
          ? `<p><a href="${threadLink}" style="display:inline-block;padding:10px 18px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">View the conversation</a></p>`
          : ''}
      `)
      await sendEmail({
        to: before.email,
        subject: `Your ticket was ${labelEn}: ${before.subject}`,
        html,
        replyTo: admin.email || SUPPORT_INBOX
      })
    } catch (err) {
      console.error('[support] status-change email failed', err)
    }
  }

  return { success: true }
})

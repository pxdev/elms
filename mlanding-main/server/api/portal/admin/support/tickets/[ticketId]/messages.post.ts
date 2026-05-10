// Admin reply. Always switches status to AWAITING_USER and flips the
// unread flag so the customer sees a new-reply badge. Also fires a
// notification email to the customer with the reply body inline so they
// don't have to come back to the dashboard to know they were answered.

import { z } from 'zod'
import prisma from '../../../../../../utils/prisma'
import { requireAdmin } from '../../../../../../utils/auth-guards'
import { sendEmail, emailLayout } from '../../../../../../utils/email'
import { useRuntimeConfig } from '#imports'

const bodySchema = z.object({
  body: z.string().trim().min(1).max(10_000)
})

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const ticketId = getRouterParam(event, 'ticketId')
  if (!ticketId) throw createError({ statusCode: 400, statusMessage: 'Missing ticketId' })

  const data = await readValidatedBody(event, bodySchema.parse)

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: { id: true, subject: true, email: true, name: true }
  })
  if (!ticket) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const now = new Date()
  await prisma.$transaction([
    prisma.supportTicketMessage.create({
      data: {
        ticketId: ticket.id,
        senderAccountId: user.id,
        isAdmin: true,
        body: data.body
      }
    }),
    prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: 'AWAITING_USER',
        unreadByAdmin: false,
        unreadByUser: true,
        lastAdminReplyAt: now
      }
    })
  ])

  // Notification email to the customer. Best-effort — never fail the
  // reply because the SMTP transport hiccupped.
  try {
    const portalUrl = useRuntimeConfig().public.portalUrl || ''
    const threadLink = portalUrl ? `${portalUrl.replace(/\/$/, '')}/dashboard/support/${ticket.id}` : null
    const adminName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Momentfy support'
    const html = emailLayout(`Re: ${escape(ticket.subject)}`, `
      <p>Hi ${escape(ticket.name || 'there')},</p>
      <p>${escape(adminName)} replied to your ticket:</p>
      <blockquote style="margin:16px 0;padding:12px 16px;border-inline-start:3px solid #ddd;background:#fafafa;white-space:pre-wrap">${escape(data.body)}</blockquote>
      ${threadLink
        ? `<p><a href="${threadLink}" style="display:inline-block;padding:10px 18px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Open the conversation</a></p>`
        : '<p>Sign in to your Momentfy portal to read and reply.</p>'}
      <p style="font-size:12px;color:#888;margin-top:24px">Reply to this email or open the conversation in the portal — either way, your reply lands on the same ticket.</p>
    `)
    await sendEmail({
      to: ticket.email,
      subject: `Re: ${ticket.subject}`,
      html,
      replyTo: user.email
    })
  } catch (err) {
    console.error('[support] admin-reply email failed', err)
  }

  return { success: true }
})

// Open a new support ticket as an authenticated customer. Creates the
// SupportTicket plus the first SupportTicketMessage in one transaction so
// admins always see at least one message body when they open the row.
// Also emails the support inbox so admins notice without polling.

import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireSession } from '../../../../utils/auth-guards'
import { sendEmail, emailLayout } from '../../../../utils/email'
import { useRuntimeConfig } from '#imports'

const SUPPORT_INBOX = 'support@momentfy.com'

const bodySchema = z.object({
  subject: z.string().trim().min(3).max(160),
  body: z.string().trim().min(1).max(10_000)
})

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)
  const data = await readValidatedBody(event, bodySchema.parse)

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || null

  const ticket = await prisma.supportTicket.create({
    data: {
      accountId: user.id,
      email: user.email,
      name: fullName,
      source: 'CUSTOMER',
      subject: data.subject,
      // Customer creates → admin needs to look at it.
      unreadByUser: false,
      unreadByAdmin: true,
      lastUserReplyAt: new Date(),
      messages: {
        create: {
          senderAccountId: user.id,
          isAdmin: false,
          body: data.body
        }
      }
    },
    select: { id: true }
  })

  const portalUrl = useRuntimeConfig().public.portalUrl || ''
  const customerName = fullName || user.email

  // Notification to the support inbox — best-effort.
  try {
    const adminLink = portalUrl ? `${portalUrl.replace(/\/$/, '')}/admin/support/${ticket.id}` : null
    const html = emailLayout(`New ticket: ${escape(data.subject)}`, `
      <p><strong>${escape(customerName)}</strong> &lt;${escape(user.email)}&gt; opened a ticket:</p>
      <p style="font-size:14px;color:#333"><strong>${escape(data.subject)}</strong></p>
      <blockquote style="margin:12px 0;padding:12px 16px;border-inline-start:3px solid #ddd;background:#fafafa;white-space:pre-wrap">${escape(data.body)}</blockquote>
      ${adminLink
        ? `<p><a href="${adminLink}" style="display:inline-block;padding:10px 18px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Open in admin</a></p>`
        : '<p>Open /admin/support to triage.</p>'}
    `)
    await sendEmail({
      to: SUPPORT_INBOX,
      subject: `[Support] ${data.subject}`,
      html,
      replyTo: user.email
    })
  } catch (err) {
    console.error('[support] new-ticket admin-email failed', err)
  }

  // Confirmation email to the customer — gives them a paper trail and the
  // direct link back to the thread. Best-effort.
  try {
    const threadLink = portalUrl ? `${portalUrl.replace(/\/$/, '')}/dashboard/support/${ticket.id}` : null
    const html = emailLayout(`We got your ticket: ${escape(data.subject)}`, `
      <p>Hi ${escape(customerName)},</p>
      <p>Thanks for reaching out. Your ticket is open and a member of our team will reply to you here as soon as we can.</p>
      <p style="font-size:14px;color:#333"><strong>${escape(data.subject)}</strong></p>
      <blockquote style="margin:12px 0;padding:12px 16px;border-inline-start:3px solid #ddd;background:#fafafa;white-space:pre-wrap">${escape(data.body)}</blockquote>
      ${threadLink
        ? `<p><a href="${threadLink}" style="display:inline-block;padding:10px 18px;background:#000;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Open the conversation</a></p>`
        : ''}
      <p style="font-size:12px;color:#888;margin-top:24px">You'll get an email when we reply. You can also follow up by replying to this email.</p>
    `)
    await sendEmail({
      to: user.email,
      subject: `We got your ticket: ${data.subject}`,
      html,
      replyTo: SUPPORT_INBOX
    })
  } catch (err) {
    console.error('[support] new-ticket confirmation email failed', err)
  }

  return { id: ticket.id }
})

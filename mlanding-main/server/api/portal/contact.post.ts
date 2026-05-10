// Marketing-site contact form. Persists the message as an anonymous
// SupportTicket (so admins can manage it from /admin/support) AND sends a
// notification email to the inbox advertised on the legal page so a real
// human still sees it land in real time.
//
// If the visitor later registers with the same email, the customer-side
// ticket-list query and the reply handler both reattach the ticket to
// their account so they own their original submission.
//
// Rate-limited per IP; a hidden honeypot field swallows most bot submits.

import { contactSchema, validateBody } from '../../utils/validation'
import { sendEmail, emailLayout } from '../../utils/email'
import prisma from '../../utils/prisma'

const INBOX = 'support@momentfy.com'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { max: 3, windowSeconds: 60 })
  const body = await validateBody(event, contactSchema)

  if (body.website && body.website.length > 0) {
    return { success: true }
  }

  const name = (body.name || '').trim()
  const email = body.email.trim()
  const message = (body.message || '').trim()

  // Derive a subject for the ticket list. Use first line / first 80 chars
  // of the message, falling back to a generic label.
  const firstLine = message.split('\n')[0]?.trim() ?? ''
  const subject = (firstLine.length > 0 ? firstLine.slice(0, 120) : 'Contact form submission')

  // Match an existing account by email so admins see customer context if
  // the visitor is already registered. We don't write to that account —
  // we just attach the ticket so the customer's dashboard sees it too.
  const existingAccount = await prisma.account.findUnique({
    where: { email },
    select: { id: true }
  })

  await prisma.supportTicket.create({
    data: {
      accountId: existingAccount?.id ?? null,
      email,
      name: name || null,
      source: 'CONTACT',
      subject,
      unreadByUser: false,
      unreadByAdmin: true,
      lastUserReplyAt: new Date(),
      messages: {
        create: {
          // null = anonymous initial submission
          senderAccountId: existingAccount?.id ?? null,
          isAdmin: false,
          body: message || '(no message)'
        }
      }
    }
  })

  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  const html = emailLayout('New contact-form message', `
    <p><strong>From:</strong> ${escape(name) || '(no name)'} &lt;${escape(email)}&gt;</p>
    ${message ? `<p style="white-space:pre-wrap;margin-top:16px">${escape(message)}</p>` : '<p style="color:#888">(no message)</p>'}
    <p style="font-size:12px;color:#888;margin-top:24px">Sent from the Momentfy portal contact form. Triage at /admin/support.</p>
  `)

  await sendEmail({
    to: INBOX,
    subject: `Contact form — ${name || email}`,
    html,
    replyTo: email
  })

  // Confirmation back to the visitor — best-effort. Gives them an audit
  // trail of what they sent and the inbox they can reply to.
  try {
    const confirmHtml = emailLayout('Thanks — we got your message', `
      <p>Hi ${escape(name) || 'there'},</p>
      <p>Thanks for reaching out to Momentfy. We've received your message and a member of our team will reply to you at this address as soon as we can.</p>
      ${message ? `<blockquote style="margin:16px 0;padding:12px 16px;border-inline-start:3px solid #ddd;background:#fafafa;white-space:pre-wrap">${escape(message)}</blockquote>` : ''}
      <p style="font-size:12px;color:#888;margin-top:24px">You can reply directly to this email — your reply will reach the same conversation.</p>
    `)
    await sendEmail({
      to: email,
      subject: 'We got your message — Momentfy',
      html: confirmHtml,
      replyTo: INBOX
    })
  } catch (err) {
    console.error('[contact] visitor confirmation email failed', err)
  }

  return { success: true }
})

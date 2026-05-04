import nodemailer, { type Transporter } from 'nodemailer'

let transporter: Transporter | null = null

function getTransporter(): Transporter | null {
  if (transporter) return transporter

  const host = process.env.SMTP_HOST
  if (!host) return null

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined
  })

  return transporter
}

export interface MailMessage {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendMail(message: MailMessage) {
  const t = getTransporter()
  const from = process.env.MAIL_FROM ?? 'no-reply@example.com'

  if (!t) {
    console.warn('[mail] SMTP_HOST not configured — email logged to console only:')
    console.warn(`  to: ${message.to}`)
    console.warn(`  from: ${from}`)
    console.warn(`  subject: ${message.subject}`)
    console.warn(`  text:\n${message.text}`)
    return { delivered: false }
  }

  await t.sendMail({ from, ...message })
  return { delivered: true }
}

export function appUrl(path = '/'): string {
  const base = (process.env.APP_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
}

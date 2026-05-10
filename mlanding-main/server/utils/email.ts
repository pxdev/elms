// Thin nodemailer wrapper. Configured from integration-settings (DB row →
// env fallback) at first use, with a config-hash cache so admin updates
// invalidate the cached transport automatically.
//
// In dev, point SMTP_HOST at Mailpit (`localhost:1025`) to capture mail
// without sending. In prod, any SMTP relay (Resend SMTP, SendGrid SMTP,
// your own MTA).

import nodemailer, { type Transporter } from 'nodemailer'
import { getSetting } from './integration-settings'

interface SmtpConfig { host: string; port: number; user: string | null; pass: string | null; from: string | null }

async function loadConfig(): Promise<SmtpConfig> {
  return {
    host: (await getSetting('SMTP_HOST')) || '',
    port: Number((await getSetting('SMTP_PORT')) || 465),
    user: (await getSetting('SMTP_USER')) || null,
    pass: (await getSetting('SMTP_PASS')) || null,
    from: (await getSetting('SMTP_FROM')) || null
  }
}

let cached: { hash: string; transporter: Transporter } | null = null

function configHash(c: SmtpConfig): string {
  return [c.host, c.port, c.user || '', c.pass ? '<set>' : '<none>'].join('|')
}

async function getTransporter(c: SmtpConfig): Promise<Transporter> {
  const hash = configHash(c)
  if (cached && cached.hash === hash) return cached.transporter
  const transporter = nodemailer.createTransport({
    host: c.host,
    port: c.port,
    secure: c.port === 465,
    auth: c.user ? { user: c.user, pass: c.pass || '' } : undefined
  })
  cached = { hash, transporter }
  return transporter
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  // When set, recipients hitting "Reply" land at this address instead of
  // the SMTP From: header. Used for ticket reply notifications so admins
  // can reply directly to the customer from their own mail client.
  replyTo?: string
}

export async function sendEmail(opts: SendEmailOptions) {
  const cfg = await loadConfig()
  if (!cfg.host) {
    // Dev fallback: log instead of failing. Useful before SMTP is configured.
    console.warn('[email] SMTP_HOST not set — would send:', opts.subject, '→', opts.to)
    return { messageId: 'noop' }
  }
  const transporter = await getTransporter(cfg)
  return transporter.sendMail({
    from: cfg.from || undefined,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo
  })
}

export function emailLayout(title: string, body: string, locale: 'en' | 'ar' = 'en'): string {
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const lang = locale === 'ar' ? 'ar' : 'en'
  return `<!doctype html>
<html lang="${lang}" dir="${dir}"><body style="font-family:-apple-system,Segoe UI,Roboto,'Tahoma','Arial',sans-serif;background:#f6f7f9;margin:0;padding:32px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:14px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
    <h1 style="margin:0 0 16px;font-size:18px;color:#111">${title}</h1>
    ${body}
    <p style="margin-top:32px;font-size:12px;color:#888">— Momentfy</p>
  </div>
</body></html>`
}

// Best-effort locale detection from the request — reads the cookie that
// @nuxtjs/i18n drops (`i18n_redirected`) so emails sent from the AR portal
// land in the user's inbox in Arabic. Falls back to `en` when missing or
// unknown so we never break existing flows.
export function detectLocaleFromEvent(event: any): 'en' | 'ar' {
  try {
    const cookie = getCookie(event, 'i18n_redirected')
    if (cookie === 'ar') return 'ar'
  } catch {}
  return 'en'
}

// Used by the admin "test connection" button.
export async function sendTestEmail(to: string) {
  const cfg = await loadConfig()
  if (!cfg.host) throw new Error('SMTP_HOST not configured')
  const transporter = await getTransporter(cfg)
  return transporter.sendMail({
    from: cfg.from || undefined,
    to,
    subject: 'Momentfy SMTP test',
    text: 'If you received this, your SMTP integration is wired up correctly.',
    html: emailLayout('SMTP test', '<p>If you received this, your SMTP integration is wired up correctly.</p>')
  })
}

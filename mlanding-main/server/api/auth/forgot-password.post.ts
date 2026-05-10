import prisma from '../../utils/prisma'
import { forgotPasswordSchema } from '../../utils/validation'
import { generateToken } from '../../utils/tokens'
import { sendEmail, emailLayout, detectLocaleFromEvent } from '../../utils/email'

const RESET_EMAIL_COPY = {
  en: {
    subject: 'Reset your Momentfy password',
    title: 'Password reset',
    greeting: (name: string | null) => `Hi${name ? ` ${name}` : ''},`,
    body: 'Click the button below to set a new password. The link expires in 1 hour.',
    button: 'Reset password',
    footer: 'If you didn\'t request this, you can safely ignore this email — your current password still works.',
    pathPrefix: '/auth/reset-password'
  },
  ar: {
    subject: 'إعادة تعيين كلمة مرور Momentfy',
    title: 'إعادة تعيين كلمة المرور',
    greeting: (name: string | null) => `أهلاً${name ? ` ${name}` : ''}،`,
    body: 'اضغط على الزر أدناه لتعيين كلمة مرور جديدة. الرابط صالح لمدة ساعة واحدة.',
    button: 'إعادة تعيين كلمة المرور',
    footer: 'إن لم تكن قد طلبت ذلك، يمكنك تجاهل هذه الرسالة — كلمة مرورك الحالية لا تزال تعمل.',
    pathPrefix: '/ar/auth/reset-password'
  }
} as const

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { max: 3, windowSeconds: 60 })
  const { email } = await validateBody(event, forgotPasswordSchema)

  const account = await prisma.account.findUnique({ where: { email: email.toLowerCase() } })

  // Always return success to prevent enumeration
  if (!account || !account.isActive) {
    return { success: true }
  }

  // Invalidate existing unused tokens
  await prisma.passwordReset.updateMany({
    where: { accountId: account.id, usedAt: null },
    data: { usedAt: new Date() }
  })

  const { token, hash } = generateToken(32)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1h

  await prisma.passwordReset.create({
    data: {
      accountId: account.id,
      token: hash,
      expiresAt
    }
  })

  const locale = detectLocaleFromEvent(event)
  const t = RESET_EMAIL_COPY[locale]
  const reqUrl = getRequestURL(event)
  const resetUrl = `${reqUrl.origin}${t.pathPrefix}?token=${token}`

  await sendEmail({
    to: account.email,
    subject: t.subject,
    html: emailLayout(t.title, `
      <p>${t.greeting(account.firstName)}</p>
      <p>${t.body}</p>
      <p style="margin:24px 0">
        <a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;border-radius:8px;text-decoration:none">${t.button}</a>
      </p>
      <p style="font-size:13px;color:#666">${t.footer}</p>
    `, locale)
  })

  return { success: true }
})

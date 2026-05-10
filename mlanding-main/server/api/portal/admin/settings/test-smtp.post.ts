// Send a test email through the configured SMTP relay. The recipient
// defaults to the calling admin's account email; pass a different address
// in the body to send elsewhere.

import { z } from 'zod'
import { requireAdmin } from '../../../../utils/auth-guards'
import { sendTestEmail } from '../../../../utils/email'

const bodySchema = z.object({ to: z.string().email().optional() })

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }
  const recipient = parsed.data.to || user.email
  try {
    const result = await sendTestEmail(recipient)
    return { ok: true, to: recipient, messageId: result.messageId }
  } catch (err: any) {
    throw createError({ statusCode: 502, statusMessage: err?.message || 'SMTP send failed' })
  }
})

// Lemon Squeezy webhook handler.
//
// Events handled:
//   - order_created    → record Order, issue License, email customer
//   - order_refunded   → mark Order REFUNDED, revoke its License(s)
//
// Always returns 2xx after the first processing attempt — LS retries on
// non-2xx and our idempotency key (lsOrderId) prevents double-issuance.
//
// Phase 4 will plug GitHub team-invite into this handler.

import prisma from '../../utils/prisma'
import { verifySignature } from '../../utils/lemon-squeezy'
import { generateLicenseKey } from '../../utils/license'
import { auditLog } from '../../utils/audit'
import { sendEmail, emailLayout } from '../../utils/email'
import { ensureRepoInvite } from '../../utils/github'

interface LSEvent {
  meta?: {
    event_name?: string
    custom_data?: Record<string, string>
  }
  data?: {
    id?: string
    attributes?: any
  }
}

export default defineEventHandler(async (event) => {
  // 1. Read raw body for signature verification.
  const raw = await readRawBody(event)
  if (!raw) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' })
  }

  const sig = getHeader(event, 'x-signature')
  if (!await verifySignature(typeof raw === 'string' ? raw : raw.toString('utf8'), sig)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  let payload: LSEvent
  try {
    payload = JSON.parse(typeof raw === 'string' ? raw : raw.toString('utf8'))
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
  }

  const eventName = payload.meta?.event_name
  const lsOrderId = payload.data?.id
  const attrs = payload.data?.attributes ?? {}

  if (!eventName) return { ok: true, ignored: 'no event_name' }
  if (!lsOrderId) return { ok: true, ignored: 'no data.id' }

  switch (eventName) {
    case 'order_created':
      return await handleOrderCreated({ lsOrderId, attrs, custom: payload.meta?.custom_data || {} })
    case 'order_refunded':
      return await handleOrderRefunded({ lsOrderId })
    default:
      // Subscriptions, license_key_created etc. — not used yet, ack and ignore.
      return { ok: true, ignored: eventName }
  }
})

async function handleOrderCreated(args: {
  lsOrderId: string
  attrs: any
  custom: Record<string, string>
}) {
  const { lsOrderId, attrs, custom } = args

  // Idempotency — replays of the same order are no-ops.
  const existing = await prisma.order.findUnique({
    where: { lsOrderId },
    include: { licenses: true }
  })
  if (existing) {
    return { ok: true, idempotent: true, orderId: existing.id, licenseId: existing.licenses[0]?.id }
  }

  // 1. Resolve account: prefer custom.account_id from checkout binding,
  //    fall back to email match (for orders bought via the marketing-site
  //    fallback URL where we couldn't bind the account).
  const accountId = custom.account_id || ''
  const buyerEmail = (attrs.user_email || attrs.customer_email || '').toLowerCase()

  let account = accountId
    ? await prisma.account.findUnique({ where: { id: accountId } })
    : null
  if (!account && buyerEmail) {
    account = await prisma.account.findUnique({ where: { email: buyerEmail } })
  }
  if (!account) {
    // No portal account to attach to. Persist the raw payload so an admin can
    // reconcile manually; don't 5xx — LS would retry forever.
    console.warn('[ls-webhook] order without matching account', { lsOrderId, buyerEmail })
    return { ok: true, unmatched: true, lsOrderId }
  }

  // 2. Resolve plan by variant id.
  const variantId =
    attrs.first_order_item?.variant_id?.toString() ||
    attrs.variant_id?.toString() || ''
  const plan = variantId
    ? await prisma.plan.findFirst({ where: { lsVariantId: variantId } })
    : null

  if (!plan) {
    console.warn('[ls-webhook] no plan mapped to variant', { variantId, lsOrderId })
    return { ok: true, unmatchedPlan: true, lsOrderId }
  }

  // 3. Generate license key + create Order + License atomically.
  const { key, prefix, hash } = generateLicenseKey()

  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        accountId: account!.id,
        planId: plan.id,
        lsOrderId,
        lsCustomerId: attrs.customer_id?.toString() || null,
        lsOrderNumber: attrs.order_number?.toString() || null,
        lsReceiptUrl: attrs.urls?.receipt || null,
        amountCents: attrs.total ?? attrs.subtotal ?? 0,
        currency: (attrs.currency || 'USD').toUpperCase(),
        status: 'PAID',
        rawPayload: args.attrs as any
      }
    })
    await tx.license.create({
      data: {
        accountId: account!.id,
        orderId: o.id,
        planId: plan.id,
        keyPrefix: prefix,
        keyHash: hash,
        maxActivations: plan.defaultActivations
      }
    })
    return o
  })

  await auditLog({
    actorId: null,
    action: 'license.issued.via.webhook',
    targetType: 'Order',
    targetId: order.id,
    metadata: {
      lsOrderId,
      accountId: account.id,
      accountEmail: account.email,
      plan: plan.slug,
      keyPrefix: prefix
    }
  })

  // 4. GitHub repo invite — best-effort. If githubUsername isn't set yet,
  //    the customer adds it on the profile page later and we trigger from
  //    there.
  let inviteStatus: string | null = null
  if (account.githubUsername) {
    const r = await ensureRepoInvite({
      accountId: account.id,
      githubUsername: account.githubUsername,
      actorId: null
    })
    inviteStatus = r.status
  }

  // 5. Send the customer their key. Best-effort — failure is logged but
  //    never propagated (the license is already issued and visible in the
  //    dashboard; resending the email is a phase-6 admin tool).
  const dashUrl = process.env.NUXT_PUBLIC_PORTAL_URL || ''
  const inviteLine = !account.githubUsername
    ? `<p style="font-size:13px;color:#666">Add your GitHub username on your <a href="${dashUrl}/dashboard/profile">profile page</a> and we'll invite you to the source-code repository team.</p>`
    : inviteStatus === 'SENT' || inviteStatus === 'ACCEPTED'
      ? `<p style="font-size:13px;color:#666">We've sent a GitHub invite to <code>${account.githubUsername}</code> for the source-code repository.</p>`
      : `<p style="font-size:13px;color:#666">We couldn't deliver the GitHub invite to <code>${account.githubUsername}</code>. Please check the username on your <a href="${dashUrl}/dashboard/profile">profile page</a>.</p>`

  await sendEmail({
    to: account.email,
    subject: 'Your Momentfy license is ready',
    html: emailLayout('Your license is ready', `
      <p>Hi${account.firstName ? ` ${account.firstName}` : ''},</p>
      <p>Thanks for your purchase. Here's your license key:</p>
      <p style="margin:16px 0">
        <code style="display:inline-block;padding:10px 14px;background:#f4f4f5;border-radius:8px;font-family:Menlo,monospace;font-size:14px;font-weight:600">${key}</code>
      </p>
      <p>Use it during the install wizard on your Momentfy instance.</p>
      <p style="margin:24px 0">
        <a href="${dashUrl}/dashboard/licenses/" style="display:inline-block;padding:10px 18px;background:#111;color:#fff;border-radius:8px;text-decoration:none">Open dashboard</a>
      </p>
      ${inviteLine}
    `)
  })

  return { ok: true, orderId: order.id, inviteStatus }
}

async function handleOrderRefunded(args: { lsOrderId: string }) {
  const order = await prisma.order.findUnique({
    where: { lsOrderId: args.lsOrderId },
    include: { licenses: true }
  })
  if (!order) return { ok: true, unknown: true }
  if (order.status === 'REFUNDED') return { ok: true, idempotent: true }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { status: 'REFUNDED', refundedAt: new Date(), refundReason: 'lemon_squeezy_refund' }
    }),
    prisma.license.updateMany({
      where: { orderId: order.id, status: 'ACTIVE' },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
        revokedReason: 'order_refunded'
      }
    })
  ])

  await auditLog({
    actorId: null,
    action: 'order.refunded',
    targetType: 'Order',
    targetId: order.id,
    metadata: {
      lsOrderId: args.lsOrderId,
      revokedLicenses: order.licenses.length
    }
  })

  return { ok: true, refundedOrder: order.id, revokedLicenses: order.licenses.length }
}

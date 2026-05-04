interface LSEvent {
  meta?: { event_name?: string, custom_data?: Record<string, string> }
  data?: { id?: string, attributes?: Record<string, unknown> }
}

export default defineEventHandler(async (event) => {
  const raw = await readRawBody(event, 'utf8')
  if (!raw) throw createError({ statusCode: 400, message: 'Empty body' })

  const sig = getHeader(event, 'x-signature')
  if (!await verifySignature(raw, sig)) {
    throw createError({ statusCode: 401, message: 'Invalid signature' })
  }

  let payload: LSEvent
  try {
    payload = JSON.parse(raw)
  } catch {
    throw createError({ statusCode: 400, message: 'Invalid JSON' })
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
      return { ok: true, ignored: eventName }
  }
})

async function handleOrderCreated(args: { lsOrderId: string, attrs: Record<string, unknown>, custom: Record<string, string> }) {
  const { lsOrderId, attrs, custom } = args

  // Idempotency check
  const existing = await prisma.enrollment.findUnique({ where: { lsOrderId } })
  if (existing) return { ok: true, idempotent: true, enrollmentId: existing.id }

  const userId = custom.user_id ? Number(custom.user_id) : null
  const buyerEmail = String(attrs.user_email || attrs.customer_email || '').toLowerCase()

  let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null
  if (!user && buyerEmail) {
    user = await prisma.user.findUnique({ where: { email: buyerEmail } })
  }
  if (!user) {
    console.warn('[ls-webhook] order without matching user', { lsOrderId, buyerEmail })
    return { ok: true, unmatched: true, lsOrderId }
  }

  // Find variant by LS variant id
  const firstOrderItem = (attrs.first_order_item ?? {}) as Record<string, unknown>
  const variantId = String(firstOrderItem.variant_id || attrs.variant_id || '')
  const variant = variantId ? await prisma.courseVariant.findFirst({ where: { lsVariantId: variantId } }) : null

  if (!variant) {
    console.warn('[ls-webhook] no variant mapped to LS variant', { variantId, lsOrderId })
    return { ok: true, unmatchedVariant: true, lsOrderId }
  }

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_courseVariantId: { userId: user.id, courseVariantId: variant.id } },
    update: {
      status: 'ACTIVE',
      lsOrderId,
      lsCustomerId: String(attrs.customer_id || ''),
      amountCents: Math.round((attrs.total || attrs.subtotal || 0) as number * 100),
      currency: String(attrs.currency || 'USD').toUpperCase(),
      paidAt: new Date(),
      paymentStatus: 'PAID'
    },
    create: {
      userId: user.id,
      courseVariantId: variant.id,
      status: 'ACTIVE',
      lsOrderId,
      lsCustomerId: String(attrs.customer_id || ''),
      amountCents: Math.round((attrs.total || attrs.subtotal || 0) as number * 100),
      currency: String(attrs.currency || 'USD').toUpperCase(),
      paidAt: new Date(),
      paymentStatus: 'PAID'
    }
  })

  return { ok: true, enrollmentId: enrollment.id }
}

async function handleOrderRefunded(args: { lsOrderId: string }) {
  const enrollment = await prisma.enrollment.findUnique({ where: { lsOrderId: args.lsOrderId } })
  if (!enrollment) return { ok: true, unknown: true }
  if (enrollment.paymentStatus === 'REFUNDED') return { ok: true, idempotent: true }

  await prisma.enrollment.update({
    where: { id: enrollment.id },
    data: {
      status: 'CANCELLED',
      paymentStatus: 'REFUNDED'
    }
  })

  return { ok: true, refundedEnrollment: enrollment.id }
}

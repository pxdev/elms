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
  const urls = (attrs.urls ?? {}) as Record<string, unknown>

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

  // Find course by LS variant id
  const firstOrderItem = (attrs.first_order_item ?? {}) as Record<string, unknown>
  const variantId = String(firstOrderItem.variant_id || attrs.variant_id || '')
  const course = variantId ? await prisma.course.findFirst({ where: { lsVariantId: variantId } }) : null

  if (!course) {
    console.warn('[ls-webhook] no course mapped to LS variant', { variantId, lsOrderId })
    return { ok: true, unmatchedVariant: true, lsOrderId }
  }

  // Resolve promo code: prefer custom_data, fallback to LS discount code
  let promoCodeId: number | undefined
  const promoCodeStr = custom.promo_code || (attrs.discount_code as string) || ''
  if (promoCodeStr) {
    const promo = await prisma.promoCode.findUnique({ where: { code: promoCodeStr.trim().toUpperCase() } })
    if (promo) promoCodeId = promo.id
  }

  const enrollment = await prisma.$transaction(async (tx) => {
    const e = await tx.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      update: {
        status: 'ACTIVE',
        lsOrderId,
        lsCustomerId: String(attrs.customer_id || ''),
        amountCents: Math.round((attrs.total || attrs.subtotal || 0) as number),
        currency: String(attrs.currency || 'USD').toUpperCase(),
        paidAt: new Date(),
        paymentStatus: 'PAID',
        receiptUrl: typeof urls.receipt === 'string' ? urls.receipt : null,
        promoCodeId: promoCodeId ?? null
      },
      create: {
        userId: user.id,
        courseId: course.id,
        status: 'ACTIVE',
        lsOrderId,
        lsCustomerId: String(attrs.customer_id || ''),
        amountCents: Math.round((attrs.total || attrs.subtotal || 0) as number),
        currency: String(attrs.currency || 'USD').toUpperCase(),
        paidAt: new Date(),
        paymentStatus: 'PAID',
        receiptUrl: typeof urls.receipt === 'string' ? urls.receipt : null,
        promoCodeId: promoCodeId ?? null
      }
    })

    // Bump used count if a promo code was applied
    if (promoCodeId) {
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } }
      })
    }

    return e
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
      paymentStatus: 'REFUNDED',
      refundedAt: new Date()
    }
  })

  return { ok: true, refundedEnrollment: enrollment.id }
}

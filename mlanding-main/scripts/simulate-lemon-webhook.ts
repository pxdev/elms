// Simulate a Lemon Squeezy order_created webhook against your local dev
// server. Same HMAC the real LS calls would carry, so the portal's
// verifySignature passes and the handler runs exactly as it would in prod.
//
// Usage:
//     npx tsx scripts/simulate-lemon-webhook.ts <account_email> [plan_slug]
//
// Examples:
//     npx tsx scripts/simulate-lemon-webhook.ts you@example.com
//     npx tsx scripts/simulate-lemon-webhook.ts you@example.com we-install
//
// Prints whatever the handler returns (usually { ok: true, orderId, ... }).

import 'dotenv/config'
import { createHmac, randomUUID } from 'node:crypto'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client'

const email = process.argv[2]
const planSlug = process.argv[3] || 'self-install'
if (!email) {
  console.error('usage: npx tsx scripts/simulate-lemon-webhook.ts <email> [plan_slug]')
  process.exit(1)
}

const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
if (!secret) {
  console.error('LEMON_SQUEEZY_WEBHOOK_SECRET must be set in .env')
  process.exit(1)
}

const portalUrl = process.env.NUXT_PUBLIC_PORTAL_URL || 'http://localhost:5173'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! })
})

async function main() {
  const account = await prisma.account.findUnique({ where: { email } })
  if (!account) {
    console.error(`No Account with email=${email}. Register first at ${portalUrl}/auth/register`)
    process.exit(1)
  }
  const plan = await prisma.plan.findUnique({ where: { slug: planSlug } })
  if (!plan || !plan.lsVariantId) {
    console.error(`Plan "${planSlug}" missing or has no lsVariantId`)
    process.exit(1)
  }

  const fakeOrderId = String(Math.floor(Date.now() / 1000))
  const payload = {
    meta: {
      event_name: 'order_created',
      custom_data: { account_id: account.id }
    },
    data: {
      id: fakeOrderId,
      type: 'orders',
      attributes: {
        user_email: email,
        customer_id: '999',
        order_number: Math.floor(Math.random() * 100000),
        currency: 'USD',
        subtotal: plan.priceUsdCents,
        total: plan.priceUsdCents,
        urls: { receipt: `https://momentfy.lemonsqueezy.com/receipts/fake/${fakeOrderId}` },
        first_order_item: { variant_id: plan.lsVariantId }
      }
    }
  }

  const raw = JSON.stringify(payload)
  const signature = createHmac('sha256', secret).update(raw).digest('hex')

  console.log(`→ POST ${portalUrl}/api/webhooks/lemon-squeezy`)
  console.log(`  event     : order_created`)
  console.log(`  ls order  : ${fakeOrderId}`)
  console.log(`  account   : ${account.email} (${account.id})`)
  console.log(`  plan      : ${plan.slug} ($${plan.priceUsdCents / 100})`)
  console.log()

  const res = await fetch(`${portalUrl}/api/webhooks/lemon-squeezy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-event-name': 'order_created',
      'x-signature': signature
    },
    body: raw
  })
  const text = await res.text()
  console.log(`← ${res.status} ${res.statusText}`)
  console.log(text)

  if (res.ok) {
    console.log()
    const license = await prisma.license.findFirst({
      where: { accountId: account.id, order: { lsOrderId: fakeOrderId } },
      include: { plan: { select: { slug: true } } }
    })
    if (license) {
      console.log(`✓ License issued: ${license.keyPrefix}… (plan: ${license.plan.slug}, maxActivations: ${license.maxActivations})`)
      console.log(`  Sign in at ${portalUrl}/dashboard to see it.`)
      console.log(`  Plaintext key is in the customer email (or server log if SMTP is unset) — we don't re-print it.`)
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err)
    await prisma.$disconnect()
    process.exit(1)
  })

// Seed the portal DB with the plans, features and promo codes the marketing
// site advertises. Idempotent — safe to re-run.
//
//   npm run db:seed

import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/client'

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not set — check your .env')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

// ── Plans ─────────────────────────────────────────────────────────
const plans = [
  {
    slug: 'self-install',
    name: 'Self-install',
    nameAr: 'تنصيب ذاتي',
    description: 'You install. Lifetime updates.',
    descriptionAr: 'أنت تتولى النشر. تحديثات مدى الحياة.',
    priceUsdCents: 19900,
    defaultActivations: 1,
    sortOrder: 0
  },
  {
    slug: 'we-install',
    name: 'Done-for-you',
    nameAr: 'تنصيب كامل',
    description: 'We install on your VPS. Lifetime updates.',
    descriptionAr: 'نقوم بالنشر والضبط والتسليم. تحديثات مدى الحياة.',
    priceUsdCents: 29900,
    defaultActivations: 1,
    sortOrder: 1
  }
]

// ── Features (full catalog) ───────────────────────────────────────
// Labels match the original landing.json verbatim and double as the
// idempotency key for re-seeding.
const features = [
  { label: 'Full source code', labelAr: 'شيفرة مصدرية كاملة', sortOrder: 10 },
  { label: 'Unlimited tenants', labelAr: 'حسابات ومنشآت بلا حدود', sortOrder: 20 },
  { label: 'All 9 core modules', labelAr: 'كل الوحدات الأساسية التسع', sortOrder: 30 },
  { label: 'All 15 add-ons', labelAr: 'كل الإضافات الخمس عشرة', sortOrder: 40 },
  { label: 'ZATCA + ETA compliance', labelAr: 'امتثال ZATCA و ETA', sortOrder: 50 },
  { label: 'Bilingual AR + EN', labelAr: 'العربية + الإنجليزية', sortOrder: 60 },
  { label: 'Lifetime updates (every release, forever)', labelAr: 'تحديثات مدى الحياة (كل إصدار، للأبد)', sortOrder: 70 },
  { label: 'Docker Compose install guide', labelAr: 'دليل تنصيب Docker Compose', sortOrder: 80 },
  { label: 'Email support (48h response)', labelAr: 'دعم بريد إلكتروني (رد خلال 48 ساعة)', sortOrder: 90 },
  { label: 'Everything in Self-install', labelAr: 'كل ما في التنصيب الذاتي', sortOrder: 100 },
  { label: 'We deploy on your VPS (or ours)', labelAr: 'ننشر على VPS الخاص بك (أو لدينا)', sortOrder: 110 },
  { label: 'Tenant setup + branding configured', labelAr: 'إعداد أول منشأة مع الهوية البصرية', sortOrder: 120 },
  { label: 'ZATCA / ETA activated for your region', labelAr: 'تفعيل ZATCA / ETA لمنطقتك', sortOrder: 130 },
  { label: 'Data import from your current system', labelAr: 'استيراد بيانات من نظامك الحالي', sortOrder: 140 },
  { label: '60-minute operator training session', labelAr: 'جلسة تدريب مشغّلين 60 دقيقة', sortOrder: 150 },
  { label: 'Priority email support (24h response)', labelAr: 'دعم مميز (رد خلال 24 ساعة)', sortOrder: 160 }
]

// ── Plan-feature mapping (by label, in display order) ─────────────
const planFeatureMap: Record<string, string[]> = {
  'self-install': [
    'Full source code',
    'Unlimited tenants',
    'All 9 core modules',
    'All 15 add-ons',
    'ZATCA + ETA compliance',
    'Bilingual AR + EN',
    'Lifetime updates (every release, forever)',
    'Docker Compose install guide',
    'Email support (48h response)'
  ],
  'we-install': [
    'Everything in Self-install',
    'We deploy on your VPS (or ours)',
    'Tenant setup + branding configured',
    'ZATCA / ETA activated for your region',
    'Data import from your current system',
    '60-minute operator training session',
    'Priority email support (24h response)',
    'Lifetime updates (every release, forever)'
  ]
}

// ── Sample promo codes ────────────────────────────────────────────
const promoCodes = [
  {
    code: 'WELCOME10',
    discountPercent: 10,
    planSlug: null as string | null,
    maxUses: null as number | null,
    isActive: true,
    notes: 'Default welcome discount — any plan, unlimited uses.'
  },
  {
    code: 'LAUNCH25',
    discountPercent: 25,
    planSlug: 'we-install',
    maxUses: 100,
    isActive: true,
    notes: 'Launch-week 25% off the Done-for-you tier. First 100 orders.'
  }
]

async function main() {
  // Plans — upsert by slug
  const planBySlug = new Map<string, { id: string }>()
  for (const p of plans) {
    const existing = await prisma.plan.findUnique({ where: { slug: p.slug } })
    const saved = existing
      ? await prisma.plan.update({ where: { slug: p.slug }, data: p })
      : await prisma.plan.create({ data: p })
    planBySlug.set(p.slug, { id: saved.id })
    console.log(`${existing ? '✓' : '+'} plan ${existing ? 'updated' : 'created'}: ${p.slug}`)
  }

  // Features — upsert by label (Feature has no unique on label, so findFirst)
  const featureByLabel = new Map<string, { id: string }>()
  for (const f of features) {
    const existing = await prisma.feature.findFirst({ where: { label: f.label } })
    const saved = existing
      ? await prisma.feature.update({
          where: { id: existing.id },
          data: { labelAr: f.labelAr, sortOrder: f.sortOrder }
        })
      : await prisma.feature.create({ data: f })
    featureByLabel.set(f.label, { id: saved.id })
    if (!existing) console.log(`+ feature created: ${f.label}`)
  }
  console.log(`✓ ${features.length} features ready`)

  // PlanFeature links — rebuild each plan's feature list to match the map
  // exactly so seed is authoritative. Uses sortOrder = (i+1) * 10 so admin
  // can re-order with headroom to insert in between.
  for (const [slug, labels] of Object.entries(planFeatureMap)) {
    const plan = planBySlug.get(slug)
    if (!plan) continue
    await prisma.planFeature.deleteMany({ where: { planId: plan.id } })
    for (let i = 0; i < labels.length; i++) {
      const feat = featureByLabel.get(labels[i])
      if (!feat) {
        console.warn(`⚠ feature "${labels[i]}" not found — skipping for plan ${slug}`)
        continue
      }
      await prisma.planFeature.create({
        data: { planId: plan.id, featureId: feat.id, sortOrder: (i + 1) * 10 }
      })
    }
    console.log(`✓ plan ${slug} linked to ${labels.length} features`)
  }

  // Promo codes — upsert by code
  for (const c of promoCodes) {
    const planId = c.planSlug ? planBySlug.get(c.planSlug)?.id ?? null : null
    const existing = await prisma.promoCode.findUnique({ where: { code: c.code } })
    const data = {
      discountPercent: c.discountPercent,
      planId,
      maxUses: c.maxUses,
      isActive: c.isActive,
      notes: c.notes
    }
    if (existing) {
      await prisma.promoCode.update({ where: { code: c.code }, data })
      console.log(`✓ promo updated: ${c.code}`)
    } else {
      await prisma.promoCode.create({ data: { code: c.code, ...data } })
      console.log(`+ promo created: ${c.code}`)
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

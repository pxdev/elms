<script setup>
definePageMeta({ layout: 'landing' })

useLandingSeo({
  ar: {
    title: 'Momentfy — منصة واحدة لإدارة أعمالك كاملةً',
    description: 'كل ما يحتاجه عملك في منصة واحدة: حجوزات، نقاط بيع، محاسبة، مخزون، موارد بشرية، عملاء، وبوابة بهويتك — ثنائية اللغة وجاهزة لمتطلبات ZATCA و ETA.'
  },
  en: {
    title: 'Momentfy — The Operating System for Booking Businesses',
    description: 'All-in-one platform for bookings, POS, accounting, inventory, HR, CRM, and a branded client portal. Multi-tenant, bilingual, and ZATCA & ETA e-invoicing ready.'
  }
})

// Organization is already emitted globally via schemaOrg.identity in nuxt.config.
// SoftwareApplication adds product-level rich result eligibility for the home page.
useSchemaOrg([
  defineSoftwareApp({
    name: 'Momentfy',
    description: 'Self-hosted operating system for service businesses: bookings, POS, accounting, inventory, HR, CRM and a branded client portal. Bilingual AR/EN, ZATCA Phase 2 + ETA e-invoicing ready.',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, iOS, Android',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      url: '/portal/pricing'
    }
  })
])
</script>

<template>
  <div>
    <LandingHero />
    <LandingProofBand />
    <LandingWhy />
    <LandingModuleExplorer />
    <LandingIndustries />
    <LandingPortalShowcase />
    <LandingTrust />
    <LandingPricing />
    <LandingROI />
    <LandingFaq />
    <LandingCTA />
  </div>
</template>

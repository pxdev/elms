<script setup>
definePageMeta({ layout: 'landing' });
const copy = useLandingCopy();
const { locale } = useI18n();
const route = useRoute();
// Plans are DB-driven via /api/portal/plans — fetch once so we can map
// card index → slug when navigating to the review page. Falls back to
// the published slug list if the endpoint is unreachable (e.g. SSG).
const { data: livePlans } = await useFetch('/api/portal/plans', { default: () => [] });
const PLAN_SLUGS = computed(() =>
    livePlans.value?.length
        ? livePlans.value.map(p => p.slug)
        : ['self-install', 'we-install']
);

const checkoutLoading = ref(null);
const localePath = useLocalePath();
// Clicking a plan navigates to the dedicated /portal/checkout/[slug]
// review page. That page is responsible for entering/validating promo
// codes and pushing to Lemon Squeezy. The pricing page stays purely
// informational — no discount UI here.
async function goToReview(idx) {
    const slug = PLAN_SLUGS.value[idx];
    if (!slug)
        return;
    // Carry a deep-link promo (e.g. /portal/pricing?promo=WELCOME10)
    // straight through to the review page URL so the user doesn't have
    // to re-type it.
    const carried = typeof route.query.promo === 'string' ? route.query.promo : '';
    const q = carried ? { promo: carried } : undefined;
    checkoutLoading.value = idx;
    await navigateTo({ path: localePath(`/portal/checkout/${slug}`), query: q });
    checkoutLoading.value = null;
}
// Legacy deep-links with ?buy=<slug> land here; forward to the review
// page instead of auto-pushing to the gateway.
onMounted(async () => {
    const buy = route.query.buy;
    if (typeof buy === 'string' && buy) {
        const idx = PLAN_SLUGS.value.indexOf(buy);
        if (idx >= 0) await goToReview(idx);
    }
});
useLandingSeo({
    ar: {
        title: 'الأسعار — Momentfy',
        description: 'ادفع مرة واحدة وامتلك الكود. استضافة ذاتية، حسابات ومنشآت بلا حدود، وتحديثات مدى الحياة. الفرق الوحيد بين الخطتين: هل تنصّب بنفسك، أم ننصّب عنك؟'
    },
    en: {
        title: 'Pricing — Momentfy',
        description: 'One-time pricing for self-hosted source code with unlimited tenants and lifetime updates. The only difference is whether you install it yourself or we install it for you.'
    }
});
// Each item now ships its own icon via copy.pricing.includedAll[i].icon — no
// parallel array needed. Keeping the constant removed deliberately.
</script>

<template>
  <!-- ═══ Hero ═══ -->
  <LandingPageHero
    :crumb-label="copy.pricingPage.eyebrow"
    :headline="copy.pricingPage.h1a + ' ' + copy.pricingPage.h1b"
    :sub="copy.pricingPage.sub"
  >
    <template #background>
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(40rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-secondary-500 blur-[150px] opacity-[0.15] rounded-full" />
    </template>

    <div class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-infinity" class="size-3.5 text-emerald-500" />
        {{ copy.ui.lifetimeUpdates }}
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-lock" class="size-3.5 text-emerald-500" />
        {{ copy.ui.secureCheckout }}
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-shield-check" class="size-3.5 text-emerald-500" />
        {{ copy.ui.lifetimeLicense }}
      </div>
    </div>
  </LandingPageHero>

  <!-- ═══ A) Pick your installation path — plans up top so the price sits above the fold ═══ -->
  <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="flex items-baseline gap-3 mb-12 pb-4 border-b border-black/10 dark:border-white/10">
        <span class="text-[11px] tabular-nums text-gray-400">A</span>
        <p class="text-[11px] uppercase tracking-[0.25em] text-gray-400">{{ copy.pricing.windowLabel }}</p>
      </div>

      <LandingPricingPlans
        interactive
        show-features
        :loading-index="checkoutLoading"
        @select="(idx) => goToReview(idx)"
      />
    </div>
  </section>

  <!-- ═══ B) What every plan includes ═══ -->
  <!-- Each item ships an icon + headline + one-line value-prop hint. Two-column
       grid on desktop so the hint stays readable instead of orphan-line wrapping
       on tighter four-column shelves. No "INCLUDED IN EVERY PLAN" subtitle —
       the section header already says it. -->
  <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <!-- Section header: index marker + sharper headline + supporting line -->
      <div class="mb-12 pb-6 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-end gap-4">
        <span class="text-[11px] tabular-nums text-gray-400 font-bold">B</span>
        <div class="flex-1">
          <p class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-gray-900 dark:text-white max-w-3xl leading-tight">
            {{ copy.pricing.includedAllLabel }}
          </p>
          <p v-if="copy.pricing.includedAllSub" class="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
            {{ copy.pricing.includedAllSub }}
          </p>
        </div>
        <span class="text-[10px] tabular-nums text-gray-400 font-semibold whitespace-nowrap">
          {{ String(copy.pricing.includedAll.length).padStart(2, '0') }} included
        </span>
      </div>

      <!-- Two-column grid: each row is icon + label + value-prop hint -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 lg:gap-y-3">
        <div
          v-for="(item, i) in copy.pricing.includedAll"
          :key="item.label"
          class="group flex items-start gap-4 py-4 border-b border-black/[0.06] dark:border-white/[0.06]"
        >
          <!-- Numbered + iconed tile: visual anchor that ties the row to a position in the list -->
          <div class="flex flex-col items-center gap-1 shrink-0">
            <span class="inline-flex items-center justify-center size-10 rounded-xl bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 ring-1 ring-secondary-500/20 transition-colors group-hover:bg-secondary-500 group-hover:text-white">
              <UIcon :name="item.icon" class="size-5" />
            </span>
            <span class="text-[10px] tabular-nums text-gray-400 font-bold">
              {{ String(i + 1).padStart(2, '0') }}
            </span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-base sm:text-lg font-bold tracking-tight text-gray-900 dark:text-white leading-snug">
              {{ item.label }}
            </p>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {{ item.hint }}
            </p>
          </div>
          <!-- Trailing checkmark — quietly reinforces "yes, this ships" -->
          <UIcon name="i-lucide-check-circle-2" class="size-4 text-emerald-500 shrink-0 mt-1.5 opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ SaaS comparison ═══ -->
  <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="3"
        :label="copy.pricingPage.compareEyebrow"
        :heading="copy.pricingPage.compareHeading"
        :sub="copy.pricingPage.compareBody"
      />

      <!-- Side-by-side comparison, no cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 border-t border-black/10 dark:border-white/10 pt-10">
        <div>
          <p class="text-xs uppercase tracking-[0.25em] text-red-500 font-bold">{{ copy.pricingPage.saasLabel }}</p>
          <p class="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-red-600 dark:text-red-400 leading-none break-words">{{ copy.pricingPage.saasValue }}</p>
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed">{{ copy.pricingPage.saasBody }}</p>
        </div>
        <div class="md:border-s md:border-black/10 md:dark:border-white/10 md:ps-10 sm:md:ps-16 rtl:md:border-s-0 rtl:md:border-e rtl:md:ps-0 rtl:md:pe-10 sm:rtl:md:pe-16">
          <p class="text-xs uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold">{{ copy.pricingPage.momentfyLabel }}</p>
          <p class="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight bg-gradient-to-br from-emerald-500 to-emerald-600 bg-clip-text text-transparent leading-none break-words">{{ copy.pricingPage.momentfyValue }}</p>
          <p class="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-sm leading-relaxed">{{ copy.pricingPage.momentfyBody }}</p>
        </div>
      </div>

    </div>
  </section>

  <!-- ═══ Pricing FAQ ═══ -->
  <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="4"
        :label="copy.pricingPage.faq.eyebrow"
        :heading="copy.pricingPage.faq.heading"
      >
        <template #meta>
          <NuxtLink :to="localePath('/portal/faq')" class="ms-auto group inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary dark:hover:text-white transition-colors">
            <span class="relative">
              {{ copy.ui.fullFaq }}
              <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <UIcon name="i-lucide-arrow-right" class="size-3 rtl:rotate-180" />
          </NuxtLink>
        </template>
      </LandingSectionHeading>

      <div class="border-t border-black/10 dark:border-white/10">
        <details v-for="(f, i) in copy.pricingPage.faq.items" :key="f.q"
          class="group border-b border-black/10 dark:border-white/10 open:bg-black/[0.02] dark:open:bg-white/[0.02] transition-colors"
        >
          <summary class="list-none cursor-pointer flex items-center gap-3 sm:gap-4 py-5 px-3 sm:px-5">
            <span class="hidden sm:inline-block w-6 shrink-0 text-xs tabular-nums text-gray-400">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="flex-1 min-w-0 text-base sm:text-lg font-bold tracking-tight leading-snug">{{ f.q }}</span>
            <span class="shrink-0 size-8 rounded-full flex items-center justify-center border border-black/10 dark:border-white/15 transition-all group-open:bg-primary group-open:text-white group-open:border-primary group-open:rotate-180">
              <UIcon name="i-lucide-plus" class="size-3.5 group-open:hidden" />
              <UIcon name="i-lucide-minus" class="size-3.5 hidden group-open:block" />
            </span>
          </summary>
          <div class="pb-5 px-3 sm:px-5 sm:ps-[3.25rem]">
            <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">{{ f.a }}</p>
          </div>
        </details>
      </div>
    </div>
  </section>

  <LandingCTA />
</template>

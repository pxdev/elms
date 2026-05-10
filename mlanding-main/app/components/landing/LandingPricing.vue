<script setup>
const copy = useLandingCopy()
const localePath = useLocalePath()

// Same flow as /portal/pricing — clicking a card jumps straight to the
// /portal/checkout/[slug] review page instead of bouncing through the
// pricing page first.
const checkoutLoading = ref(null)
async function goToReview(idx, plan) {
  const slug = plan?.slug
  if (!slug) return
  checkoutLoading.value = idx
  await navigateTo(localePath(`/portal/checkout/${slug}`))
  checkoutLoading.value = null
}
</script>

<template>
  <section
    id="pricing"
    class="relative py-24 sm:py-32 overflow-hidden"
  >
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10"
    />
    <div
      aria-hidden="true"
      class="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(800px,90vw)] h-[min(400px,60vw)] sm:h-[400px] bg-secondary-500 blur-[150px] opacity-[0.08] dark:opacity-15 rounded-full"
    />

    <div class="relative max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="6"
        :label="copy.pricingPage.eyebrow"
        :heading="`${copy.pricingPage.h1a} ${copy.pricingPage.h1b}`"
        :sub="copy.pricingPage.sub"
      >
        <template #meta>
          <NuxtLink
            :to="localePath('/portal/pricing')"
            class="ms-auto group inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary dark:hover:text-white transition-colors"
          >
            <span class="relative">
              {{ copy.ui.fullPricingDetails }}
              <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <UIcon name="i-lucide-arrow-right" class="size-3 rtl:rotate-180" />
          </NuxtLink>
        </template>
      </LandingSectionHeading>

      <!-- Trust badges — horizontal row -->
      <div class="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500 mb-16 sm:mb-20">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-infinity"
            class="size-3.5 text-emerald-500"
          />
          {{ copy.ui.lifetimeUpdates }}
        </div>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-lock"
            class="size-3.5 text-emerald-500"
          />
          {{ copy.ui.secureCheckout }}
        </div>
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-shield-check"
            class="size-3.5 text-emerald-500"
          />
          {{ copy.ui.lifetimeLicense }}
        </div>
      </div>

      <!-- A) What every plan includes — sharp headline, two-column rows with
           icon + label + value-prop hint. No redundant subtitle. -->
      <div class="mb-20">
        <div class="mb-10 pb-5 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-end gap-3">
          <span class="text-[11px] tabular-nums text-gray-400 font-bold">A</span>
          <div class="flex-1">
            <p class="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-900 dark:text-white max-w-3xl leading-tight">
              {{ copy.pricing.includedAllLabel }}
            </p>
            <p v-if="copy.pricing.includedAllSub" class="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
              {{ copy.pricing.includedAllSub }}
            </p>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-1">
          <div
            v-for="(item, i) in copy.pricing.includedAll"
            :key="item.label"
            class="group flex items-start gap-3 py-3 border-b border-black/[0.06] dark:border-white/[0.06]"
          >
            <span class="inline-flex items-center justify-center size-9 rounded-lg bg-secondary-500/10 text-secondary-600 dark:text-secondary-400 ring-1 ring-secondary-500/20 shrink-0 transition-colors group-hover:bg-secondary-500 group-hover:text-white">
              <UIcon :name="item.icon" class="size-4" />
            </span>
            <div class="flex-1 min-w-0">
              <p class="text-sm sm:text-base font-bold leading-snug">{{ item.label }}</p>
              <p class="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ item.hint }}</p>
            </div>
            <UIcon name="i-lucide-check" class="size-4 text-emerald-500 shrink-0 mt-1 opacity-60 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
          </div>
        </div>
      </div>

      <!-- B) Pick your install path — premium plan cards (shared component) -->
      <div>
        <div class="flex items-baseline gap-3 mb-12 pb-4 border-b border-black/10 dark:border-white/10">
          <span class="text-[11px] tabular-nums text-gray-400">B</span>
          <p class="text-[11px] uppercase tracking-[0.25em] text-gray-400">
            {{ copy.pricing.windowLabel }}
          </p>
        </div>

        <LandingPricingPlans
          interactive
          show-features
          :loading-index="checkoutLoading"
          @select="goToReview"
        />
      </div>

      <!-- Footer -->
      <p class="mt-20 flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-[0.2em]">
        <UIcon
          name="i-simple-icons-lemonsqueezy"
          class="size-4"
        />
        {{ copy.pricing.footer }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const copy = useLandingCopy()
const { locale } = useI18n()

// Same model as the full ROI page, but the home section is non-interactive.
// We pre-compute one realistic scenario (3 locations × $50/mo × 3 yrs)
// to anchor the headline number; visitors who care can drill into the
// /portal/roi page to play with their own inputs.
const SCENARIO = { saasMonthly: 50, locations: 3, years: 3, license: 199, hostingMonthly: 9 }
const months = SCENARIO.years * 12
const saasTotal = SCENARIO.saasMonthly * months * SCENARIO.locations
const momentfyTotal = SCENARIO.license + SCENARIO.hostingMonthly * months
const savings = saasTotal - momentfyTotal
const ratio = Math.round(saasTotal / momentfyTotal)

const currencyFmt = computed(() => new Intl.NumberFormat(
  locale.value === 'ar' ? 'ar-SA' : 'en-US',
  { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }
))
</script>

<template>
  <section class="relative py-24 sm:py-32 overflow-hidden bg-gray-50 dark:bg-white/[0.02]">
    <div aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10" />
    <div aria-hidden="true" class="absolute -top-20 start-1/2 -translate-x-1/2 w-[min(36rem,90vw)] h-[min(36rem,90vw)] rounded-full bg-emerald-500 blur-[130px] opacity-[0.08]" />

    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="7"
        :label="copy.roiPage.homeSection.eyebrow"
        :heading="copy.roiPage.homeSection.heading"
      />
      <p class="mt-6 max-w-2xl text-base sm:text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
        {{ copy.roiPage.homeSection.sub }}
      </p>

      <div class="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- SaaS card -->
        <article class="lg:col-span-4 rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-rose-500/5 via-white to-transparent dark:from-rose-500/10 dark:via-black/40 dark:to-transparent p-8 sm:p-8 flex flex-col justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-rose-600 dark:text-rose-400 inline-flex items-center gap-2">
              <UIcon name="i-lucide-trending-up" class="size-3.5" />
              {{ copy.roiPage.output.saasLabel }}
            </p>
            <p class="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight tabular-nums text-rose-700 dark:text-rose-400 leading-none break-words">
              {{ currencyFmt.format(saasTotal) }}
            </p>
          </div>
          <p class="mt-6 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            ${{ SCENARIO.saasMonthly }}/mo × {{ SCENARIO.locations }} × {{ SCENARIO.years * 12 }}m
          </p>
        </article>

        <!-- Momentfy card -->
        <article class="lg:col-span-4 rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-500/5 via-white to-transparent dark:from-emerald-500/10 dark:via-black/40 dark:to-transparent p-8 sm:p-8 flex flex-col justify-between">
          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-2">
              <UIcon name="i-lucide-server" class="size-3.5" />
              {{ copy.roiPage.output.momentfyLabel }}
            </p>
            <p class="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight tabular-nums text-emerald-700 dark:text-emerald-400 leading-none break-words">
              {{ currencyFmt.format(momentfyTotal) }}
            </p>
          </div>
          <p class="mt-6 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
            ${{ SCENARIO.license }} + ${{ SCENARIO.hostingMonthly }}/mo × {{ SCENARIO.years * 12 }}m
          </p>
        </article>

        <!-- Savings + CTA card -->
        <article class="lg:col-span-4 group relative overflow-hidden rounded-2xl bg-primary text-white p-8 sm:p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-primary/30 transition-shadow">
          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] font-bold opacity-80 inline-flex items-center gap-2">
              <UIcon name="i-lucide-piggy-bank" class="size-3.5" />
              {{ copy.roiPage.output.savingsLabel }}
            </p>
            <p class="mt-4 text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight tabular-nums leading-none break-words">
              {{ currencyFmt.format(savings) }}
            </p>
            <p class="mt-2 text-sm font-semibold opacity-80 tabular-nums">
              ≈ {{ ratio }}× the license
            </p>
          </div>
          <NuxtLink
            :to="localePath('/portal/roi')"
            class="mt-6 inline-flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-sm text-sm font-semibold transition-colors"
          >
            <span>{{ copy.roiPage.homeSection.cta }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
          </NuxtLink>
        </article>
      </div>
    </div>
  </section>
</template>

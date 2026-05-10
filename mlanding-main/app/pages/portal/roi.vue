<script setup lang="ts">
definePageMeta({ layout: 'landing' })

const copy = useLandingCopy()
const localePath = useLocalePath()
const { locale } = useI18n()

useLandingSeo({
  ar: {
    title: 'حاسبة العائد — Momentfy',
    description: 'احسب كم توفّر مقارنة باشتراكات SaaS التقليدية. ترخيص لمرة واحدة، تحديثات مدى الحياة، فروع بلا حدود.'
  },
  en: {
    title: 'ROI calculator — Momentfy',
    description: 'See how much you save vs. SaaS rent. One-time license, lifetime updates, unlimited locations.'
  }
})

// ── Inputs ─────────────────────────────────────────────────────────
const saasMonthly = ref(50)        // USD per location per month
const locations = ref(3)           // number of tenants/locations
const years = ref(5)               // projection horizon (3, 5, or 10)
const licenseUsd = ref(199)        // one-time Momentfy license
const hostingMonthly = ref(9)      // Hostinger VPS / shared plans start at $9/mo

// ── Derived totals ────────────────────────────────────────────────
const months = computed(() => years.value * 12)

const saasTotal = computed(
  () => saasMonthly.value * months.value * locations.value
)

const momentfyTotal = computed(
  () => licenseUsd.value + hostingMonthly.value * months.value
)

const savings = computed(() => Math.max(0, saasTotal.value - momentfyTotal.value))

const savingsPercent = computed(() => {
  if (saasTotal.value === 0) return 0
  return Math.round((savings.value / saasTotal.value) * 100)
})

// Break-even: month at which SaaS cumulative > Momentfy cumulative.
// SaaS(m) = saasMonthly × m × locations
// Momentfy(m) = licenseUsd + hostingMonthly × m
// Solve: saasMonthly × m × locations >= licenseUsd + hostingMonthly × m
//        m × (saasMonthly × locations − hostingMonthly) >= licenseUsd
const breakevenMonth = computed<number | null>(() => {
  const monthlyDelta = saasMonthly.value * locations.value - hostingMonthly.value
  if (monthlyDelta <= 0) return null              // SaaS is cheaper than hosting alone — never breaks even
  const m = licenseUsd.value / monthlyDelta
  if (m <= 0) return 0                            // Already worth it from month zero
  return Math.ceil(m)
})

const numberFmt = computed(() => new Intl.NumberFormat(
  locale.value === 'ar' ? 'ar-SA' : 'en-US',
  { maximumFractionDigits: 0 }
))
const currencyFmt = computed(() => new Intl.NumberFormat(
  locale.value === 'ar' ? 'ar-SA' : 'en-US',
  { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }
))

// ── Locale-friendly substitutions for output sub-labels ───────────
const sub = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''))

// ── Visual: bar widths for the comparison chart ───────────────────
const maxTotal = computed(() => Math.max(saasTotal.value, momentfyTotal.value, 1))
const saasBarPct = computed(() => (saasTotal.value / maxTotal.value) * 100)
const momentfyBarPct = computed(() => (momentfyTotal.value / maxTotal.value) * 100)

// Year-radio options keyed by integer
const yearOptions = [3, 5, 10] as const

// Quick-pick presets for the SaaS slider so the page feels "alive"
const saasPresets = [25, 50, 100, 200]
</script>

<template>
  <LandingPageHero
    :crumb-label="copy.roiPage.eyebrow"
    :headline="copy.roiPage.h1"
    :sub="copy.roiPage.sub"
  >
    <template #background>
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(40rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-emerald-500 blur-[150px] opacity-[0.1] rounded-full" />
    </template>
  </LandingPageHero>

  <!-- ─── Calculator ─── -->
  <section class="pb-24">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- INPUTS -->
        <div class="lg:col-span-5 space-y-6">
          <div class="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 p-6 sm:p-8 space-y-8">
            <!-- SaaS monthly -->
            <div>
              <label for="saasMonthly" class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span class="text-sm font-bold tracking-tight">{{ copy.roiPage.inputs.saasLabel }}</span>
                <span class="text-2xl sm:text-3xl font-black tabular-nums text-rose-600 dark:text-rose-400">
                  ${{ numberFmt.format(saasMonthly) }}
                </span>
              </label>
              <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {{ copy.roiPage.inputs.saasHelp }}
              </p>
              <input
                id="saasMonthly"
                v-model.number="saasMonthly"
                type="range"
                min="0" max="500" step="5"
                class="mt-4 w-full accent-rose-500"
              >
              <div class="mt-3 flex flex-wrap gap-1.5">
                <button
                  v-for="p in saasPresets" :key="p"
                  type="button"
                  class="px-2.5 py-1 rounded-full text-[11px] font-bold tabular-nums ring-1 transition"
                  :class="saasMonthly === p
                    ? 'bg-rose-500 text-white ring-rose-500'
                    : 'ring-black/10 dark:ring-white/15 hover:bg-rose-500/10 hover:ring-rose-500/40'"
                  @click="saasMonthly = p"
                >
                  ${{ p }}
                </button>
              </div>
            </div>

            <!-- Locations -->
            <div class="pt-8 border-t border-black/10 dark:border-white/10">
              <label for="locations" class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span class="text-sm font-bold tracking-tight">{{ copy.roiPage.inputs.locationsLabel }}</span>
                <span class="text-2xl sm:text-3xl font-black tabular-nums">{{ numberFmt.format(locations) }}</span>
              </label>
              <p class="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {{ copy.roiPage.inputs.locationsHelp }}
              </p>
              <input
                id="locations"
                v-model.number="locations"
                type="range"
                min="1" max="20" step="1"
                class="mt-4 w-full accent-primary"
              >
            </div>

            <!-- Years -->
            <div class="pt-8 border-t border-black/10 dark:border-white/10">
              <p class="text-sm font-bold tracking-tight mb-3">
                {{ copy.roiPage.inputs.yearsLabel }}
              </p>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="(y, i) in yearOptions" :key="y"
                  type="button"
                  class="px-3 py-2.5 rounded-xl text-sm font-bold tabular-nums ring-1 transition"
                  :class="years === y
                    ? 'bg-primary text-white ring-primary'
                    : 'ring-black/10 dark:ring-white/15 hover:bg-primary/5 hover:ring-primary/30'"
                  @click="years = y"
                >
                  {{ copy.roiPage.inputs.yearOptions[i] }}
                </button>
              </div>
            </div>
          </div>

          <!-- Assumptions / advanced -->
          <details class="group rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 overflow-hidden">
            <summary class="cursor-pointer list-none p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition">
              <span class="flex items-center gap-2 text-sm font-bold tracking-tight">
                <UIcon name="i-lucide-sliders-horizontal" class="size-4 text-gray-500" />
                {{ copy.roiPage.assumptions.label }}
              </span>
              <UIcon name="i-lucide-chevron-down" class="size-4 transition-transform group-open:rotate-180" />
            </summary>
            <div class="px-5 sm:px-6 pb-6 space-y-5">
              <div>
                <label for="licenseUsd" class="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
                  {{ copy.roiPage.assumptions.license }}
                </label>
                <div class="mt-1 flex items-center gap-3">
                  <span class="text-gray-500 text-sm">$</span>
                  <input
                    id="licenseUsd"
                    v-model.number="licenseUsd"
                    type="number" min="0" step="50"
                    class="flex-1 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                </div>
                <p class="mt-1 text-[11px] text-gray-500">{{ copy.roiPage.assumptions.licenseDesc }}</p>
              </div>
              <div>
                <label for="hostingMonthly" class="text-xs font-bold uppercase tracking-[0.15em] text-gray-500">
                  {{ copy.roiPage.assumptions.hosting }}
                </label>
                <div class="mt-1 flex items-center gap-3">
                  <span class="text-gray-500 text-sm">$</span>
                  <input
                    id="hostingMonthly"
                    v-model.number="hostingMonthly"
                    type="number" min="0" step="1"
                    class="flex-1 px-3 py-2 rounded-lg bg-black/[0.03] dark:bg-white/[0.04] text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                </div>
                <p class="mt-1 text-[11px] text-gray-500">{{ copy.roiPage.assumptions.hostingDesc }}</p>
              </div>
              <p class="text-[11px] text-gray-500 pt-3 border-t border-black/10 dark:border-white/10 flex items-start gap-2">
                <UIcon name="i-lucide-info" class="size-3.5 shrink-0 mt-0.5 text-emerald-500" />
                <span>{{ copy.roiPage.assumptions.multiTenant }}</span>
              </p>
              <p class="text-[11px] text-gray-500 flex items-start gap-2">
                <UIcon name="i-lucide-globe" class="size-3.5 shrink-0 mt-0.5 text-sky-500" />
                <span>{{ copy.roiPage.assumptions.currencyNote }}</span>
              </p>
            </div>
          </details>
        </div>

        <!-- OUTPUT -->
        <div class="lg:col-span-7 space-y-6">
          <!-- Savings hero card -->
          <div class="relative overflow-hidden rounded-2xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-emerald-500/10 via-white to-emerald-500/5 dark:from-emerald-500/15 dark:via-black/40 dark:to-emerald-500/5 p-8 sm:p-10">
            <div aria-hidden="true" class="absolute -top-20 -end-20 w-72 h-72 rounded-full bg-emerald-500 blur-[120px] opacity-15 pointer-events-none" />
            <p class="text-[11px] uppercase tracking-[0.2em] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <UIcon name="i-lucide-trending-down" class="size-3.5" />
              {{ copy.roiPage.output.savingsLabel }}
            </p>
            <p class="mt-3 text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight tabular-nums text-emerald-600 dark:text-emerald-400 leading-none break-words">
              {{ currencyFmt.format(savings) }}
            </p>
            <p class="mt-3 text-sm sm:text-base font-semibold text-emerald-700/80 dark:text-emerald-400/80">
              {{ sub(copy.roiPage.output.savingsPercentLabel, { percent: savingsPercent }) }}
            </p>

            <!-- Comparison bars -->
            <div class="mt-8 space-y-4">
              <div>
                <div class="flex items-baseline justify-between gap-3 text-sm">
                  <span class="font-bold text-rose-700 dark:text-rose-400">{{ copy.roiPage.output.saasLabel }}</span>
                  <span class="font-black tabular-nums text-rose-700 dark:text-rose-400">{{ currencyFmt.format(saasTotal) }}</span>
                </div>
                <div class="mt-2 h-3 rounded-full bg-rose-500/10 overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-500 ease-out"
                    :style="{ width: saasBarPct + '%' }"
                  />
                </div>
                <p class="mt-1.5 text-[11px] text-gray-500 tabular-nums">
                  {{ sub(copy.roiPage.output.saasSubLabel, { years, monthly: saasMonthly, locations }) }}
                </p>
              </div>
              <div>
                <div class="flex items-baseline justify-between gap-3 text-sm">
                  <span class="font-bold text-emerald-700 dark:text-emerald-400">{{ copy.roiPage.output.momentfyLabel }}</span>
                  <span class="font-black tabular-nums text-emerald-700 dark:text-emerald-400">{{ currencyFmt.format(momentfyTotal) }}</span>
                </div>
                <div class="mt-2 h-3 rounded-full bg-emerald-500/10 overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
                    :style="{ width: momentfyBarPct + '%' }"
                  />
                </div>
                <p class="mt-1.5 text-[11px] text-gray-500 tabular-nums">
                  {{ sub(copy.roiPage.output.momentfySubLabel, { license: licenseUsd, hosting: hostingMonthly, months }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Break-even + CTA -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="sm:col-span-1 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-black/40 p-5">
              <p class="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-500">
                {{ copy.roiPage.output.breakevenLabel }}
              </p>
              <p class="mt-2 text-3xl font-black tabular-nums tracking-tight">
                <template v-if="breakevenMonth === null">
                  <span class="text-base text-gray-500 font-semibold">{{ copy.roiPage.output.breakevenNever }}</span>
                </template>
                <template v-else-if="breakevenMonth === 0">
                  <span class="text-emerald-600 dark:text-emerald-400">{{ copy.roiPage.output.breakevenImmediate }}</span>
                </template>
                <template v-else>
                  <span class="text-emerald-600 dark:text-emerald-400">
                    {{ sub(copy.roiPage.output.breakevenValueLabel, { month: breakevenMonth }) }}
                  </span>
                </template>
              </p>
            </div>
            <NuxtLink
              :to="localePath(copy.roiPage.ctaHref)"
              class="sm:col-span-2 group relative overflow-hidden rounded-2xl bg-primary text-white p-5 sm:p-6 flex items-center justify-between gap-4 hover:scale-[1.01] transition-transform shadow-xl shadow-primary/20"
            >
              <div>
                <p class="text-[10px] uppercase tracking-[0.18em] font-bold opacity-70">
                  {{ copy.roiPage.eyebrow }}
                </p>
                <p class="mt-2 text-xl sm:text-2xl font-black tracking-tight leading-snug">
                  {{ copy.roiPage.ctaLabel }}
                </p>
              </div>
              <UIcon name="i-lucide-arrow-right" class="size-8 shrink-0 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

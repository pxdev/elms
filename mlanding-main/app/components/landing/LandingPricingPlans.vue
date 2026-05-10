<script setup>
// "Pick your installation path" plans — used both on the landing home
// (read-only NuxtLinks) and the dedicated /portal/pricing page (interactive
// — emits `select` so the host can drive checkout).
//
// Visual: editorial split with warmth. Two columns separated by a single
// hairline divider, NO boxed cards. Each column has:
//   - a soft radial glow background tinted to the plan's accent color
//   - a giant ghost index numeral ("01"/"02") behind the content
//   - a plan icon tile in the eyebrow row
//   - a hero duration number (gradient-tinted on the featured plan)
//   - a small-caps "What's included" header before the feature list
//   - price + arrow CTA at the bottom
//
// Data source: merges `/api/portal/plans` (DB — name, price, features) with
// i18n metadata (durationValue, tagline, mostPopular, etc.) by slug. i18n is
// the fallback if the API fails — keeps the page populated even offline.

const props = defineProps({
  to: { type: String, default: '/portal/pricing' },
  interactive: { type: Boolean, default: false },
  showFeatures: { type: Boolean, default: false },
  loadingIndex: { type: [Number, null], default: null },
  discountPercent: { type: Number, default: 0 }
})
const emit = defineEmits(['select'])

const copy = useLandingCopy()
const { locale } = useI18n()
const NuxtLinkRef = resolveComponent('NuxtLink')

const { data: dbPlans } = await useFetch('/api/portal/plans', {
  default: () => [],
  server: true
})

const I18N_SLUGS = ['self-install', 'we-install']

// Single brand accent across all plans. The icon distinguishes the path,
// not the hue — keeps the editorial split visually unified.
const BRAND_ACCENT = { glow: 'bg-secondary-500', text: 'text-secondary-600 dark:text-secondary-400', textGradient: 'from-secondary-500 to-secondary-700' }
const planAccents = {
  'self-install': { icon: 'i-lucide-terminal-square', ...BRAND_ACCENT },
  'we-install':   { icon: 'i-lucide-rocket',          ...BRAND_ACCENT }
}
const fallbackAccents = [
  planAccents['self-install'],
  planAccents['we-install']
]

function accentFor(plan, idx) {
  return planAccents[plan.slug] ?? fallbackAccents[idx] ?? fallbackAccents[0]
}

function formatPrice(cents, discountPercent) {
  const discounted = Math.round(cents * (1 - (discountPercent || 0) / 100))
  const dollars = discounted / 100
  const rounded = Math.abs(dollars - Math.round(dollars)) < 0.005
    ? Math.round(dollars).toString()
    : dollars.toFixed(2)
  return `$${rounded}`
}

const plans = computed(() => {
  const i18nPlans = copy.value.pricing?.plans ?? []
  const ar = locale.value === 'ar'
  if (!dbPlans.value?.length) return i18nPlans

  return dbPlans.value.map((dbPlan, apiIndex) => {
    const i18nIndex = I18N_SLUGS.indexOf(dbPlan.slug)
    const i18n = (i18nIndex >= 0 ? i18nPlans[i18nIndex] : null) ?? i18nPlans[apiIndex] ?? {}

    const name = ar && dbPlan.nameAr ? dbPlan.nameAr : dbPlan.name
    const price = formatPrice(dbPlan.priceUsdCents, props.discountPercent)
    const features = dbPlan.features?.length
      ? dbPlan.features.map(f => (ar && f.labelAr ? f.labelAr : f.label))
      : i18n.features

    return {
      ...i18n,
      slug: dbPlan.slug,
      name,
      price,
      features
    }
  })
})

function onClick(idx, p) {
  if (props.interactive) emit('select', idx, p)
}
</script>

<template>
  <!-- Editorial split: two columns, single hairline divider, no boxed cards. -->
  <div
    class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-black/10 dark:divide-white/10 rtl:md:divide-x-reverse"
  >
    <article
      v-for="(p, idx) in plans"
      :key="p.slug || p.name"
      class="group/plan relative isolate overflow-hidden px-1 sm:px-2 md:px-12 py-12 sm:py-16 first:pt-0 last:pb-0 md:first:py-2 md:last:py-2 md:first:pe-12 md:first:ps-0 md:last:ps-12 md:last:pe-0 flex flex-col"
    >
      <!-- Soft radial glow (decorative, low opacity, no border) -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -top-32 start-1/2 -translate-x-1/2 size-[34rem] rounded-full blur-[140px] opacity-[0.10] dark:opacity-[0.18] -z-10 transition-opacity duration-700 group-hover/plan:opacity-[0.16] dark:group-hover/plan:opacity-[0.28]"
        :class="accentFor(p, idx).glow"
      />
      <!-- Ghost index numeral behind the content -->
      <span
        aria-hidden="true"
        class="pointer-events-none select-none absolute -top-6 end-0 sm:-top-10 sm:end-2 text-[14rem] sm:text-[18rem] leading-none font-black tracking-tighter text-black/[0.025] dark:text-white/[0.035] -z-10 tabular-nums"
      >{{ String(idx + 1).padStart(2, '0') }}</span>

      <!-- Eyebrow row: icon tile + plan name + index counter -->
      <div class="flex items-center gap-3 mb-8">
        <span
          class="inline-flex items-center justify-center size-10 rounded-xl bg-black/[0.04] dark:bg-white/[0.06]"
          :class="accentFor(p, idx).text"
        >
          <UIcon :name="accentFor(p, idx).icon" class="size-4" />
        </span>
        <p class="text-[11px] uppercase tracking-[0.25em] font-black text-gray-700 dark:text-gray-200">
          {{ p.name }}
        </p>
        <span class="ms-auto text-[10px] tabular-nums text-gray-400 font-semibold">
          {{ String(idx + 1).padStart(2, '0') }} / {{ String(plans.length).padStart(2, '0') }}
        </span>
      </div>

      <!-- "Most popular" — inline pill, no glow ring -->
      <div v-if="p.featured && p.mostPopular" class="mb-4">
        <span class="inline-flex items-center gap-1.5 ps-2 pe-3 h-6 rounded-full bg-gradient-to-r text-white text-[10px] font-black uppercase tracking-[0.18em] shadow-md shadow-secondary-500/20"
          :class="accentFor(p, idx).textGradient"
        >
          <UIcon name="i-lucide-sparkles" class="size-3" />
          {{ p.mostPopular }}
        </span>
      </div>

      <!-- Hero price — visual anchor at the top of the column -->
      <div class="flex items-baseline gap-3 leading-[0.85] mb-4">
        <span
          class="font-black tracking-tight tabular-nums text-6xl sm:text-7xl lg:text-8xl"
          :class="p.featured
            ? `bg-gradient-to-br bg-clip-text text-transparent ${accentFor(p, idx).textGradient}`
            : 'text-primary dark:text-white'"
        >{{ p.price }}</span>
        <span class="text-xs sm:text-sm font-black uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
          {{ p.priceSuffix }}
        </span>
      </div>

      <!-- Supporting duration meta (∞ LIFETIME UPDATES) — sits below the price as a value-prop, not the hero -->
      <div class="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-black text-gray-500 dark:text-gray-400 mb-2">
        <span class="inline-flex items-baseline gap-1">
          <UIcon name="i-lucide-infinity" class="size-3.5" :class="accentFor(p, idx).text" />
          <span class="tabular-nums">{{ p.durationValue }}</span>
        </span>
        <span aria-hidden="true" class="size-1 rounded-full bg-current opacity-30" />
        <span>{{ p.durationLabel }}</span>
      </div>

      <!-- Coverage bar — slim, accent-tinted fill -->
      <div class="mt-8 mb-8">
        <div class="relative h-1 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
          <div
            class="absolute inset-y-0 start-0 rounded-full transition-all duration-1000"
            :class="p.durationProgress === 100
              ? `bg-gradient-to-r ${accentFor(p, idx).textGradient}`
              : 'bg-gray-700 dark:bg-gray-300'"
            :style="{ width: p.durationProgress + '%' }"
          />
          <span
            v-if="p.durationProgress < 100"
            aria-hidden="true"
            class="absolute top-1/2 -translate-y-1/2 size-2 rounded-full bg-gray-800 dark:bg-white ring-2 ring-white dark:ring-black"
            :style="{ insetInlineStart: `calc(${p.durationProgress}% - 0.25rem)` }"
          />
        </div>
        <div class="mt-2 flex justify-between items-center text-[10px] uppercase tracking-[0.2em] text-gray-400">
          <span>{{ copy.pricing.durationAxisStart }}</span>
          <span
            v-if="p.durationProgress === 100"
            class="inline-flex items-center gap-1 font-bold"
            :class="accentFor(p, idx).text"
          >
            <UIcon name="i-lucide-infinity" class="size-3" />
            {{ copy.pricing.durationAxisEndForever }}
          </span>
        </div>
      </div>

      <!-- Tagline -->
      <p class="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-md">
        {{ p.tagline }}
      </p>

      <!-- Per-plan features — small-caps header + hairline list -->
      <div v-if="showFeatures && p.features?.length" class="mt-10">
        <div class="flex items-center gap-3 mb-3">
          <span aria-hidden="true" class="h-px w-5 bg-current opacity-40" :class="accentFor(p, idx).text" />
          <p class="text-[10px] uppercase tracking-[0.25em] font-black" :class="accentFor(p, idx).text">
            {{ copy.ui.includedInEveryPlan || 'What\'s included' }}
          </p>
        </div>
        <dl class="border-t border-black/[0.06] dark:border-white/[0.06]">
          <div
            v-for="f in p.features"
            :key="f"
            class="flex items-start gap-3 py-3 border-b border-black/[0.06] dark:border-white/[0.06]"
          >
            <span class="inline-flex items-center justify-center size-5 rounded-full mt-0.5 shrink-0 bg-emerald-500/10">
              <UIcon name="i-lucide-check" class="size-3 text-emerald-600 dark:text-emerald-400" />
            </span>
            <span class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ f }}</span>
          </div>
        </dl>
      </div>

      <!-- Spacer pushes the CTA to the bottom on desktop -->
      <div class="mt-auto pt-10">
        <!-- CTA: filled rounded pill, full-width on mobile, comfortable size -->
        <component
          :is="interactive ? 'button' : NuxtLinkRef"
          :to="interactive ? undefined : to"
          :type="interactive ? 'button' : undefined"
          :disabled="interactive && loadingIndex !== null"
          :class="[
            'group/cta inline-flex items-center justify-center gap-3 w-full sm:w-auto sm:min-w-[16rem] h-16 ps-5 pe-6 rounded-full text-sm font-bold transition-all',
            p.featured
              ? 'bg-secondary-500 text-white hover:bg-secondary-600 hover:-translate-y-0.5'
              : 'bg-primary text-white dark:bg-white dark:text-primary hover:opacity-90 hover:-translate-y-0.5',
            interactive && loadingIndex !== null ? 'cursor-wait opacity-70' : ''
          ]"
          @click="onClick(idx, p)"
        >
          <span>{{ p.cta }}</span>
          <UIcon
            :name="loadingIndex === idx ? 'i-lucide-loader-circle' : 'i-lucide-arrow-right'"
            class="size-4 rtl:rotate-180 transition-transform group-hover/cta:translate-x-1 rtl:group-hover/cta:-translate-x-1"
            :class="{ 'animate-spin': loadingIndex === idx }"
          />
        </component>
      </div>
    </article>
  </div>
</template>

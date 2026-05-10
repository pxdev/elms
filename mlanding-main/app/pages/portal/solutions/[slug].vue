<script setup>
const localePath = useLocalePath()
definePageMeta({ layout: 'landing', scrollToTop: true });
const copy = useLandingCopy();
const { locale } = useI18n();
const route = useRoute();
const slug = computed(() => String(route.params.slug || ''));
const solution = computed(() => copy.value.solutionDetails[slug.value]);
const sp = computed(() => copy.value.solutionsPage);
// All solution slugs in the order they appear in the footer + showcase rollup.
// Used for prev/next pager and for the "browse all" fallback.
const solutionOrder = [
    'salon', 'dental', 'medical', 'barber', 'fitness', 'pet',
    'therapy', 'photo', 'nails', 'events', 'wellness', 'driving', 'education',
    'professional', 'auto', 'optical', 'carwash', 'coworking',
    'multi-tenant', 'mobile', 'memberships'
];
const solutions = computed(() => solutionOrder
    .map(id => ({ id, ...(copy.value.solutionDetails[id] || {}) }))
    .filter(s => s.title));
const idx = computed(() => solutionOrder.indexOf(slug.value));
const total = computed(() => String(solutions.value.length).padStart(2, '0'));
const prev = computed(() => idx.value > 0 ? solutions.value[idx.value - 1] : null);
const next = computed(() => idx.value >= 0 && idx.value < solutions.value.length - 1 ? solutions.value[idx.value + 1] : null);
useHead(() => ({
    title: solution.value ? `${solution.value.title} — Momentfy` : 'Solutions — Momentfy',
    meta: [{
            name: 'description',
            content: solution.value?.tagline || (locale.value === 'ar'
                ? 'حلول Momentfy — مصنوعة على مقاس كل قطاع وكل شكل عمل.'
                : 'Momentfy solutions for every vertical and business shape.')
        }]
}));
if (!solution.value) {
    throw createError({ statusCode: 404, statusMessage: 'Solution not found', fatal: true });
}
</script>

<template>
  <template v-if="solution">
    <!-- ═══ Hero — compact title block + autoplay video ═══ -->
    <section class="relative pt-10 sm:pt-16 pb-10 sm:pb-16 overflow-hidden">
      <div aria-hidden="true" class="absolute inset-0 -z-10">
        <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(40rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] blur-[160px] opacity-20 rounded-full bg-gradient-to-br" :class="solution.accent" />
      </div>

      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-gray-500 mb-6" aria-label="Breadcrumb">
          <NuxtLink :to="localePath('/portal/solutions')" class="hover:text-primary dark:hover:text-white transition-colors uppercase tracking-[0.2em]">{{ sp.breadcrumb }}</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3 rtl:rotate-180" />
          <span class="uppercase tracking-[0.2em]">{{ String(idx + 1).padStart(2, '0') }} / {{ total }}</span>
        </nav>

        <!-- Compact title row -->
        <div class="flex items-center gap-5 sm:gap-6 mb-3">
          <div class="shrink-0 size-16 sm:size-16 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-xl" :class="solution.accent">
            <UIcon :name="solution.icon" class="size-8 sm:size-8" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xs uppercase tracking-[0.25em] text-gray-400 mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>—— {{ solution.category }}</span>
              <span aria-hidden="true" class="hidden sm:inline h-px w-4 bg-black/15 dark:bg-white/15" />
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <span class="size-1.5 rounded-full" :class="solution.dot" />
                {{ sp.breadcrumb }}
              </span>
            </p>
            <h1 class="font-black tracking-tight leading-[0.95] text-4xl sm:text-5xl lg:text-6xl">
              {{ solution.title }}
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl mb-8 sm:mb-10">
          {{ solution.tagline }}
        </p>

        <!-- Hero CTA row -->
        <div class="flex flex-wrap items-center gap-4 sm:gap-5">
          <NuxtLink :to="localePath('/portal/pricing')"
            class="group inline-flex items-center gap-3 h-12 ps-4 pe-5 rounded-full bg-primary text-white dark:bg-white dark:text-primary text-sm font-bold transition-transform hover:-translate-y-0.5"
          >
            <span>{{ sp.ctaPrimary }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </NuxtLink>
          <NuxtLink :to="localePath('/portal/features')"
            class="inline-flex items-center gap-2 h-12 px-4 text-sm text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            <span>{{ sp.ctaSecondary }}</span>
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══ Long overview + pains ═══ -->
    <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6 lg:gap-12">
          <div class="col-span-12 lg:col-span-5">
            <div class="lg:sticky lg:top-28">
              <LandingSectionEyebrow :label="sp.painsTitle" class="mb-4" />
              <h2 class="font-black tracking-tight leading-[0.95] text-4xl sm:text-5xl lg:text-6xl">
                {{ solution.title }}
              </h2>
              <p class="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">{{ solution.long }}</p>
              <p class="mt-5 text-sm text-gray-500 dark:text-gray-500 max-w-xl">{{ sp.painsBody }}</p>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-7">
            <ul class="border-t border-black/10 dark:border-white/10">
              <li v-for="(p, pi) in solution.pains" :key="p"
                class="flex items-start gap-4 py-5 border-b border-black/10 dark:border-white/10"
              >
                <span class="text-xs tabular-nums text-gray-400 w-6 shrink-0 mt-0.5">{{ String(pi + 1).padStart(2, '0') }}</span>
                <UIcon name="i-lucide-x-circle" class="size-5 shrink-0 mt-0.5 text-red-400" />
                <span class="text-base sm:text-lg text-gray-800 dark:text-gray-200 leading-relaxed">{{ p }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Capabilities ═══ -->
    <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6 mb-10">
          <div class="col-span-12 sm:col-span-4 lg:col-span-3">
            <LandingSectionEyebrow :label="sp.capsTitle" />
            <p class="mt-3 text-sm text-gray-500 max-w-[16rem]">{{ sp.capsBody }}</p>
          </div>
          <div class="col-span-12 sm:col-span-8 lg:col-span-9">
            <h2 class="font-black tracking-tight leading-[0.9] text-3xl sm:text-4xl lg:text-5xl max-w-3xl">{{ sp.capsTitle }}.</h2>
          </div>
        </div>

        <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 border-t border-black/10 dark:border-white/10 pt-10">
          <li v-for="(c, ci) in solution.capabilities" :key="c"
            class="flex items-start gap-4 py-3"
          >
            <span class="text-xs tabular-nums text-gray-400 w-6 shrink-0 mt-0.5">{{ String(ci + 1).padStart(2, '0') }}</span>
            <UIcon name="i-lucide-check" class="size-5 shrink-0 mt-0.5 text-emerald-500" />
            <span class="text-base text-gray-800 dark:text-gray-200 leading-relaxed">{{ c }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- ═══ Stats strip ═══ -->
    <section class="py-16 sm:py-16 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="flex items-center gap-2 mb-6">
          <UIcon name="i-lucide-info" class="size-3.5 text-amber-500" />
          <span class="text-[10px] uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 font-bold">{{ copy.ui.illustrativeBenchmarks }}</span>
        </div>
        <div class="grid grid-cols-3 gap-8">
          <div v-for="s in solution.stats" :key="s.k">
            <p class="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-br bg-clip-text text-transparent leading-none" :class="solution.accent">{{ s.v }}</p>
            <p class="mt-3 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-500">{{ s.k }}</p>
          </div>
        </div>
        <p class="mt-8 text-xs text-gray-500 max-w-2xl leading-relaxed">{{ sp.statsNote }}</p>
      </div>
    </section>

    <!-- ═══ Stack chips ═══ -->
    <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6 mb-10">
          <div class="col-span-12 sm:col-span-4 lg:col-span-3">
            <LandingSectionEyebrow :label="sp.stackTitle" />
            <p class="mt-3 text-sm text-gray-500 max-w-[16rem]">{{ sp.stackBody }}</p>
          </div>
          <div class="col-span-12 sm:col-span-8 lg:col-span-9">
            <div class="flex flex-wrap gap-x-2 gap-y-3">
              <span v-for="s in solution.stack" :key="s"
                class="inline-flex items-center gap-2 px-3 h-10 rounded-full border border-black/10 dark:border-white/15 bg-white dark:bg-white/[0.03] text-sm text-gray-700 dark:text-gray-200"
              >
                <span class="size-1.5 rounded-full" :class="solution.dot" />
                {{ s }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Use cases ═══ -->
    <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6 mb-10">
          <div class="col-span-12 sm:col-span-4 lg:col-span-3">
            <LandingSectionEyebrow :label="sp.useCasesTitle" />
            <p class="mt-3 text-sm text-gray-500 max-w-[16rem]">{{ sp.useCasesBody }}</p>
          </div>
          <div class="col-span-12 sm:col-span-8 lg:col-span-9">
            <h2 class="font-black tracking-tight leading-[0.9] text-3xl sm:text-4xl lg:text-5xl max-w-3xl">{{ solution.whoFor }}</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-8 border-t border-black/10 dark:border-white/10 pt-10">
          <div v-for="(u, ui) in solution.useCases" :key="u" class="flex flex-col gap-3">
            <span class="text-xs tabular-nums text-gray-400">{{ String(ui + 1).padStart(2, '0') }}</span>
            <span aria-hidden="true" class="h-px w-8 bg-gradient-to-r" :class="solution.accent" />
            <p class="text-base text-gray-800 dark:text-gray-200 leading-relaxed">{{ u }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Mini FAQ (optional) ═══ -->
    <section v-if="solution.faq && solution.faq.length" class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-3xl mx-auto px-5 sm:px-8">
        <LandingSectionEyebrow :label="sp.faqTitle" class="mb-4" />
        <div class="divide-y divide-black/10 dark:divide-white/10 border-t border-b border-black/10 dark:border-white/10">
          <details v-for="(f, fi) in solution.faq" :key="fi" class="group py-5">
            <summary class="flex items-center justify-between cursor-pointer list-none gap-4">
              <span class="text-base sm:text-lg font-semibold">{{ f.q }}</span>
              <UIcon name="i-lucide-plus" class="size-5 shrink-0 text-gray-400 group-open:rotate-45 transition-transform" />
            </summary>
            <p class="mt-3 text-gray-600 dark:text-gray-400 leading-relaxed">{{ f.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ═══ CTA ═══ -->
    <section class="py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-4xl mx-auto px-5 sm:px-8 text-center">
        <LandingSectionEyebrow :label="sp.ctaTitle" class="mb-6" />
        <h2 class="font-black tracking-tight leading-[0.9] text-4xl sm:text-5xl lg:text-6xl mb-6">{{ sp.ctaTitle }}</h2>
        <p class="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">{{ sp.ctaBody }}</p>
        <div class="flex flex-wrap items-center justify-center gap-6">
          <NuxtLink :to="localePath('/portal/pricing')" class="group inline-flex items-center gap-3 text-sm font-bold">
            <span class="size-12 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
              <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
            </span>
            <span class="relative">
              {{ sp.ctaPrimary }}
              <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors" />
            </span>
          </NuxtLink>
          <NuxtLink :to="localePath('/portal/solutions')" class="text-sm text-gray-500 hover:text-primary dark:hover:text-white transition-colors inline-flex items-center gap-1.5">
            {{ sp.ctaSecondary }}
            <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══ Prev / Next pager ═══ -->
    <section v-if="prev || next" class="py-16 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:divide-x md:divide-black/10 md:dark:divide-white/10 rtl:md:divide-x-reverse">
          <NuxtLink v-if="prev" :to="localePath(`/portal/solutions/${prev.id}`)"
            class="group flex items-center gap-4 md:pe-10"
          >
            <span class="size-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors group-hover:bg-primary group-hover:text-white">
              <UIcon name="i-lucide-arrow-left" class="size-4 rtl:rotate-180" />
            </span>
            <div class="text-start">
              <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400">{{ copy.ui.previousModule }}</p>
              <p class="text-lg font-black tracking-tight">{{ prev.title }}</p>
            </div>
          </NuxtLink>
          <div v-else />

          <NuxtLink v-if="next" :to="localePath(`/portal/solutions/${next.id}`)"
            class="group flex items-center justify-end gap-4 md:ps-10"
          >
            <div class="text-end">
              <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400">{{ copy.ui.nextModule }}</p>
              <p class="text-lg font-black tracking-tight">{{ next.title }}</p>
            </div>
            <span class="size-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors group-hover:bg-primary group-hover:text-white">
              <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
            </span>
          </NuxtLink>
        </div>
      </div>
    </section>

    <LandingCTA />
  </template>

  <!-- Unknown slug fallback -->
  <template v-else>
    <section class="py-28">
      <div class="max-w-2xl mx-auto px-5 text-center">
        <LandingSectionEyebrow :label="sp.notFoundEyebrow" class="mb-4" />
        <h1 class="font-black tracking-tight text-4xl sm:text-5xl mb-4">{{ sp.notFoundBody }}</h1>
        <NuxtLink :to="localePath('/portal/solutions')" class="group inline-flex items-center gap-3 text-sm font-bold mt-6">
          <span class="size-12 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
          </span>
          <span class="relative">
            {{ sp.browseAll }}
            <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors" />
          </span>
        </NuxtLink>
      </div>
    </section>
  </template>
</template>

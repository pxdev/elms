<script setup>
const localePath = useLocalePath()
definePageMeta({ layout: 'landing', scrollToTop: true });
const copy = useLandingCopy();
const { locale } = useI18n();
const route = useRoute();
const addonKey = computed(() => String(route.params.key || ''));
// Two-tone palette: Compliance items get the success tone (semantic — they
// signal regulatory approval); everything else uses the brand blue. The icon
// itself differentiates each addon — no per-key hue rainbow.
const COMPLIANCE = { accent: 'from-emerald-500 to-emerald-700', iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' };
const BRAND      = { accent: 'from-secondary-500 to-secondary-700', iconBg: 'bg-secondary-500/10', iconText: 'text-secondary-600 dark:text-secondary-400', dot: 'bg-secondary-500' };
const addonMeta = {
    zatca:      { icon: 'i-lucide-shield-check',    cat: 'Compliance',   ...COMPLIANCE },
    eta:        { icon: 'i-lucide-file-check',      cat: 'Compliance',   ...COMPLIANCE },
    ai:         { icon: 'i-lucide-sparkles',        cat: 'Intelligence', ...BRAND },
    gcal:       { icon: 'i-lucide-calendar-check',  cat: 'Intelligence', ...BRAND },
    insurance:  { icon: 'i-lucide-heart-pulse',     cat: 'Clinical',     ...BRAND },
    dental:     { icon: 'i-hugeicons-dental-tooth', cat: 'Clinical',     ...BRAND },
    imaging:    { icon: 'i-lucide-scan',            cat: 'Clinical',     ...BRAND },
    labs:       { icon: 'i-lucide-flask-conical',   cat: 'Clinical',     ...BRAND },
    rx:         { icon: 'i-lucide-pill',            cat: 'Clinical',     ...BRAND },
    records:    { icon: 'i-lucide-folder-heart',    cat: 'Clinical',     ...BRAND },
    resources:  { icon: 'i-lucide-armchair',        cat: 'Operations',   ...BRAND },
    attendance: { icon: 'i-lucide-log-in',          cat: 'Operations',   ...BRAND },
    loyalty:    { icon: 'i-lucide-award',           cat: 'Growth',       ...BRAND },
    events:     { icon: 'i-lucide-calendar-heart',  cat: 'Growth',       ...BRAND },
    followup:   { icon: 'i-lucide-list-checks',     cat: 'Growth',       ...BRAND }
};
const addonItem = computed(() => copy.value.addons.items.find(a => a.key === addonKey.value));
const detail = computed(() => copy.value.addonDetails[addonKey.value]);
const meta = computed(() => addonMeta[addonKey.value]);
const allAddons = computed(() => copy.value.addons.items);
const addonIndex = computed(() => allAddons.value.findIndex(a => a.key === addonKey.value));
const totalAddons = computed(() => String(allAddons.value.length).padStart(2, '0'));
const manualHref = computed(() => {
    const raw = manualLinkForAddon(addonKey.value);
    return raw ? localePath(raw) : null;
});
const prevAddon = computed(() => addonIndex.value > 0 ? allAddons.value[addonIndex.value - 1] : null);
const nextAddon = computed(() => addonIndex.value < allAddons.value.length - 1 ? allAddons.value[addonIndex.value + 1] : null);
// Sibling add-ons in the same category
const siblings = computed(() => {
    if (!meta.value)
        return [];
    return allAddons.value.filter(a => a.key !== addonKey.value && addonMeta[a.key]?.cat === meta.value.cat).slice(0, 3);
});
useHead(() => ({
    title: addonItem.value ? `${addonItem.value.label} — Momentfy` : 'Add-on — Momentfy',
    meta: [{
            name: 'description',
            content: detail.value?.long || addonItem.value?.desc || ''
        }]
}));
if (!addonItem.value || !detail.value) {
    throw createError({ statusCode: 404, statusMessage: 'Add-on not found', fatal: true });
}
</script>

<template>
  <template v-if="addonItem && detail">
    <!-- ═══ Hero ═══ -->
    <section class="relative py-20 sm:py-28 overflow-hidden">
      <div aria-hidden="true" class="absolute inset-0 -z-10">
        <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(40rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] blur-[160px] opacity-20 rounded-full bg-gradient-to-br" :class="meta?.accent" />
      </div>

      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center gap-2 text-xs text-gray-500 mb-10" aria-label="Breadcrumb">
          <NuxtLink :to="localePath('/portal/addons')" class="hover:text-primary dark:hover:text-white transition-colors uppercase tracking-[0.2em]">{{ copy.ui.breadcrumbAddons }}</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-3 rtl:rotate-180" />
          <span class="uppercase tracking-[0.2em] inline-flex items-center gap-1.5">
            <span class="size-1.5 rounded-full" :class="meta?.dot" />
            {{ meta?.cat ? copy.ui.addonCategoryLabels[meta.cat] : '' }}
          </span>
          <UIcon name="i-lucide-chevron-right" class="size-3 rtl:rotate-180" />
          <span class="uppercase tracking-[0.2em]">{{ String(addonIndex + 1).padStart(2, '0') }} / {{ totalAddons }}</span>
        </nav>

        <div class="grid grid-cols-12 gap-6 items-end">
          <div class="col-span-12 sm:col-span-4 lg:col-span-3">
            <!-- Big gradient icon tile -->
            <div class="size-20 rounded-3xl bg-gradient-to-br text-white flex items-center justify-center shadow-2xl mb-8" :class="meta?.accent">
              <UIcon :name="meta?.icon" class="size-10" />
            </div>
            <LandingSectionEyebrow class="mb-2">{{ meta?.cat ? copy.ui.addonCategoryLabels[meta.cat] : '' }} {{ copy.ui.addonCategorySuffix }}</LandingSectionEyebrow>
            <p class="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-bold text-emerald-600 dark:text-emerald-400">
              <UIcon name="i-lucide-check-circle-2" class="size-3" />
              {{ copy.ui.includedInEveryPlan }}
            </p>
          </div>
          <div class="col-span-12 sm:col-span-8 lg:col-span-9">
            <h1 class="font-black tracking-tight leading-[0.9] text-4xl sm:text-6xl lg:text-7xl xl:text-8xl break-words">
              <span class="block">{{ addonItem.label }}</span>
            </h1>
            <p class="mt-6 text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl font-light">
              {{ addonItem.desc }}
            </p>
            <NuxtLink v-if="manualHref"
              :to="manualHref"
              class="mt-6 group inline-flex items-center gap-2 ps-3 pe-4 h-10 rounded-full bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-black/10 dark:ring-white/10 text-sm font-semibold hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-primary transition-colors"
            >
              <UIcon name="i-lucide-book-open" class="size-4" />
              <span>{{ copy.ui.readTheManual }}</span>
              <UIcon name="i-lucide-arrow-right" class="size-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Long description ═══ -->
    <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6 lg:gap-12">
          <div class="col-span-12 sm:col-span-4 lg:col-span-3">
            <LandingSectionEyebrow :label="copy.ui.whatItDoes" />
          </div>
          <div class="col-span-12 sm:col-span-8 lg:col-span-9">
            <p class="text-xl sm:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl font-light">{{ detail.long }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Bullets — detailed features ═══ -->
    <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6 lg:gap-12">
          <div class="col-span-12 lg:col-span-5">
            <div class="lg:sticky lg:top-28">
              <LandingSectionEyebrow :label="copy.ui.keyCapabilities" class="mb-4" />
              <h2 class="font-black tracking-tight leading-[0.95] text-4xl sm:text-5xl">{{ copy.ui.everyMovingPart }}</h2>
            </div>
          </div>
          <div class="col-span-12 lg:col-span-7">
            <dl class="border-t border-black/10 dark:border-white/10">
              <div v-for="(s, bi) in detail.sections" :key="s.heading"
                class="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3rem_1fr] gap-x-3 sm:gap-x-4 gap-y-2 py-8 border-b border-black/10 dark:border-white/10"
              >
                <span class="text-xs tabular-nums text-gray-400 mt-1.5">{{ String(bi + 1).padStart(2, '0') }}</span>
                <dt class="flex items-start gap-2 text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug">
                  <UIcon name="i-lucide-check" class="size-5 shrink-0 mt-0.5" :class="meta?.iconText" />
                  <span>{{ s.heading }}</span>
                </dt>
                <span aria-hidden="true" />
                <dd class="ps-8 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{{ s.body }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Who for ═══ -->
    <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 sm:col-span-4 lg:col-span-3">
            <LandingSectionEyebrow :label="copy.ui.whoItsFor" />
          </div>
          <div class="col-span-12 sm:col-span-8 lg:col-span-9">
            <p class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-[1.15] max-w-3xl">"{{ detail.whoFor }}"</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Setup steps ═══ -->
    <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6 mb-12">
          <div class="col-span-12 sm:col-span-4 lg:col-span-3">
            <LandingSectionEyebrow :label="copy.ui.setupTitle" />
            <p class="mt-3 text-sm text-gray-500 max-w-[16rem]">{{ copy.ui.setupBody }}</p>
          </div>
          <div class="col-span-12 sm:col-span-8 lg:col-span-9">
            <h2 class="font-black tracking-tight leading-[0.9] text-4xl sm:text-5xl lg:text-6xl">{{ copy.ui.fromDisabledToLive }}</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 md:divide-x md:divide-black/10 md:dark:divide-white/10 rtl:md:divide-x-reverse">
          <div v-for="(step, si) in detail.setupSteps" :key="step"
            class="py-6 md:py-0 md:px-6 first:md:ps-0 last:md:pe-0 border-b md:border-b-0 border-black/10 dark:border-white/10 last:border-b-0"
          >
            <p class="text-xs tabular-nums text-gray-400 mb-3">{{ String(si + 1).padStart(2, '0') }}</p>
            <p class="text-base sm:text-lg font-semibold leading-relaxed">{{ step }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Integrates with ═══ -->
    <section v-if="detail.integrates?.length" class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6">
          <div class="col-span-12 sm:col-span-4 lg:col-span-3">
            <LandingSectionEyebrow :label="copy.ui.integratesWith" />
            <p class="mt-3 text-sm text-gray-500 max-w-[16rem]">{{ copy.ui.integratesBody }}</p>
          </div>
          <div class="col-span-12 sm:col-span-8 lg:col-span-9">
            <div class="flex flex-wrap gap-x-8 gap-y-3 text-2xl sm:text-3xl font-black tracking-tight">
              <template v-for="(m, mi) in detail.integrates" :key="m">
                <span>{{ m }}</span>
                <span v-if="mi < detail.integrates.length - 1" aria-hidden="true" class="text-gray-300 dark:text-gray-700">·</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Siblings: other add-ons in same chapter ═══ -->
    <section v-if="siblings.length" class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-12 gap-6 mb-10">
          <div class="col-span-12 sm:col-span-4 lg:col-span-3">
            <LandingSectionEyebrow>{{ copy.ui.moreFromCategoryPrefix }}{{ meta?.cat }}</LandingSectionEyebrow>
          </div>
          <div class="col-span-12 sm:col-span-8 lg:col-span-9">
            <h2 class="font-black tracking-tight leading-[0.9] text-4xl sm:text-5xl">{{ copy.ui.exploreTheChapter }}</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 border-t border-black/10 dark:border-white/10 pt-10">
          <NuxtLink v-for="s in siblings" :key="s.key" :to="localePath(`/portal/addons/${s.key}`)"
            class="group flex items-start gap-4"
          >
            <div class="shrink-0 size-12 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110" :class="addonMeta[s.key]?.iconBg">
              <UIcon :name="addonMeta[s.key]?.icon" class="size-5" :class="addonMeta[s.key]?.iconText" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base sm:text-lg font-bold leading-tight">
                <span class="relative inline-block align-baseline">
                  {{ s.label }}
                  <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-[1.5px] origin-start scale-x-0 group-hover:scale-x-100 transition-transform duration-300" :class="addonMeta[s.key]?.dot" />
                </span>
              </h3>
              <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ s.desc }}</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- ═══ Prev / Next pager ═══ -->
    <section class="py-16 border-t border-black/10 dark:border-white/10">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:divide-x md:divide-black/10 md:dark:divide-white/10 rtl:md:divide-x-reverse">
          <NuxtLink v-if="prevAddon" :to="localePath(`/portal/addons/${prevAddon.key}`)"
            class="group flex items-center gap-4 md:pe-10"
          >
            <span class="size-10 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-colors group-hover:bg-primary group-hover:text-white">
              <UIcon name="i-lucide-arrow-left" class="size-4 rtl:rotate-180" />
            </span>
            <div class="text-start">
              <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400">{{ copy.ui.previousAddon }}</p>
              <p class="text-lg font-black tracking-tight">{{ prevAddon.label }}</p>
            </div>
          </NuxtLink>
          <div v-else />

          <NuxtLink v-if="nextAddon" :to="localePath(`/portal/addons/${nextAddon.key}`)"
            class="group flex items-center justify-end gap-4 md:ps-10"
          >
            <div class="text-end">
              <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400">{{ copy.ui.nextAddon }}</p>
              <p class="text-lg font-black tracking-tight">{{ nextAddon.label }}</p>
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

  <!-- Unknown key fallback -->
  <template v-else>
    <section class="py-28">
      <div class="max-w-2xl mx-auto px-5 text-center">
        <LandingSectionEyebrow :label="copy.ui.addonNotFoundEyebrow" class="mb-4" />
        <h1 class="font-black tracking-tight text-4xl sm:text-5xl mb-4">{{ copy.ui.noAddonWithKey }}</h1>
        <p class="text-gray-600 dark:text-gray-400 mb-8">{{ copy.ui.checkUrlAddons }}</p>
        <NuxtLink :to="localePath('/portal/addons')" class="group inline-flex items-center gap-3 text-sm font-bold">
          <span class="size-12 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
          </span>
          <span class="relative">
            {{ copy.ui.browseAllAddons }}
            <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors" />
          </span>
        </NuxtLink>
      </div>
    </section>
  </template>
</template>

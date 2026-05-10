<script setup>
const localePath = useLocalePath()
definePageMeta({ layout: 'landing' });
const copy = useLandingCopy();
const { locale } = useI18n();
useLandingSeo({
    ar: {
        title: 'القطاعات — Momentfy',
        description: 'منصة واحدة تفهم كل تخصص: صالونات، سبا، عيادات أسنان وطبية، حلاقة، لياقة، بيطرة، واستوديوهات تصوير — كلها بنفس الكود، بهوية كل قطاع.'
    },
    en: {
        title: 'Showcase — Momentfy',
        description: 'One platform, every vertical. Salons, spas, dental and medical clinics, barbers, gyms, pet care and photo studios.'
    }
});
const visuals = {
    salon: { icon: 'i-lucide-scissors', accent: 'from-pink-500 to-rose-600', mockId: 'calendar', dot: 'bg-rose-500', soft: 'bg-rose-500/8', text: 'text-rose-600 dark:text-rose-400' },
    dental: { icon: 'i-hugeicons-dental-tooth', accent: 'from-sky-500 to-blue-600', mockId: 'dental', dot: 'bg-sky-500', soft: 'bg-sky-500/8', text: 'text-sky-600 dark:text-sky-400' },
    medical: { icon: 'i-lucide-heart-pulse', accent: 'from-red-500 to-orange-500', mockId: 'medical', dot: 'bg-red-500', soft: 'bg-red-500/8', text: 'text-red-600 dark:text-red-400' },
    barber: { icon: 'i-lucide-user', accent: 'from-stone-500 to-neutral-700', mockId: 'barber', dot: 'bg-stone-500', soft: 'bg-stone-500/8', text: 'text-stone-600 dark:text-stone-400' },
    fitness: { icon: 'i-lucide-dumbbell', accent: 'from-lime-500 to-emerald-600', mockId: 'fitness', dot: 'bg-emerald-500', soft: 'bg-emerald-500/8', text: 'text-emerald-600 dark:text-emerald-400' },
    pet: { icon: 'i-lucide-paw-print', accent: 'from-amber-500 to-yellow-600', mockId: 'pet', dot: 'bg-amber-500', soft: 'bg-amber-500/8', text: 'text-amber-600 dark:text-amber-400' },
    education: { icon: 'i-lucide-graduation-cap', accent: 'from-blue-500 to-indigo-600', mockId: 'fitness', dot: 'bg-blue-500', soft: 'bg-blue-500/8', text: 'text-blue-600 dark:text-blue-400' },
    professional: { icon: 'i-lucide-briefcase', accent: 'from-slate-600 to-gray-800', mockId: 'clients', dot: 'bg-slate-600', soft: 'bg-slate-500/8', text: 'text-slate-700 dark:text-slate-300' },
    auto: { icon: 'i-lucide-car', accent: 'from-zinc-600 to-slate-800', mockId: 'calendar', dot: 'bg-zinc-600', soft: 'bg-zinc-500/8', text: 'text-zinc-700 dark:text-zinc-300' },
    optical: { icon: 'i-lucide-glasses', accent: 'from-cyan-500 to-blue-600', mockId: 'sales', dot: 'bg-cyan-500', soft: 'bg-cyan-500/8', text: 'text-cyan-600 dark:text-cyan-400' },
    carwash: { icon: 'i-lucide-droplets', accent: 'from-sky-400 to-blue-600', mockId: 'calendar', dot: 'bg-sky-500', soft: 'bg-sky-500/8', text: 'text-sky-600 dark:text-sky-400' },
    photo: { icon: 'i-lucide-camera', accent: 'from-purple-500 to-fuchsia-600', mockId: 'calendar', dot: 'bg-purple-500', soft: 'bg-purple-500/8', text: 'text-purple-600 dark:text-purple-400' },
    wellness: { icon: 'i-lucide-flower-2', accent: 'from-violet-400 to-fuchsia-500', mockId: 'calendar', dot: 'bg-violet-500', soft: 'bg-violet-500/8', text: 'text-violet-600 dark:text-violet-400' },
    coworking: { icon: 'i-lucide-laptop', accent: 'from-teal-500 to-cyan-600', mockId: 'portal', dot: 'bg-teal-500', soft: 'bg-teal-500/8', text: 'text-teal-600 dark:text-teal-400' }
};

// Addon key → { label, icon, accent } for the paired-add-ons band.
// Keeps the showcase self-contained even when the addon copy shape changes.
const addonMeta = {
    zatca: { icon: 'i-lucide-shield-check' },
    eta: { icon: 'i-lucide-file-check' },
    ai: { icon: 'i-lucide-sparkles' },
    gcal: { icon: 'i-lucide-calendar-check' },
    insurance: { icon: 'i-lucide-heart-pulse' },
    dental: { icon: 'i-hugeicons-dental-tooth' },
    imaging: { icon: 'i-lucide-scan' },
    labs: { icon: 'i-lucide-flask-conical' },
    rx: { icon: 'i-lucide-pill' },
    records: { icon: 'i-lucide-folder-heart' },
    resources: { icon: 'i-lucide-armchair' },
    attendance: { icon: 'i-lucide-log-in' },
    loyalty: { icon: 'i-lucide-award' },
    events: { icon: 'i-lucide-calendar-heart' },
    followup: { icon: 'i-lucide-list-checks' }
};
const addonLabelFor = (k) => copy.value.addons?.items?.find(a => a.key === k)?.label || k;
const chapterNav = computed(() => copy.value.showcasePage.verticals.map(v => ({
    id: v.id,
    label: v.title,
    dot: visuals[v.id].dot,
    count: undefined
})));
</script>

<template>
  <!-- ═══ Hero ═══ -->
  <LandingPageHero
    :crumb-label="copy.showcasePage.eyebrow"
    :headline="copy.showcasePage.h1a + ' ' + copy.showcasePage.h1b"
    :sub="copy.showcasePage.sub"
  >
    <template #background>
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(50rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-secondary-500 blur-[150px] opacity-[0.12] rounded-full" />
    </template>

    <div class="mt-6 flex items-start gap-2 text-[11px] text-gray-500 dark:text-gray-500">
      <UIcon name="i-lucide-info" class="size-3.5 shrink-0 mt-0.5 text-amber-500" />
      <span class="leading-relaxed">{{ copy.showcasePage.statsNote }}</span>
    </div>
  </LandingPageHero>

  <!-- Sticky chapter nav -->
  <LandingChapterNav :items="chapterNav" />

  <!-- ═══ Vertical list ═══ -->
  <section class="py-16 sm:py-20">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 border-t border-black/10 dark:border-white/10">
      <article
        v-for="(v, i) in copy.showcasePage.verticals" :key="v.id" :id="v.id"
        class="group relative py-16 sm:py-20 border-b border-black/10 dark:border-white/10"
      >
        <!-- ── Top zigzag: hero on one side, mock on the other ── -->
        <div class="grid grid-cols-12 gap-6 lg:gap-12">
          <!-- Content side (flips on odd rows for magazine feel) -->
          <div class="col-span-12 lg:col-span-7 flex flex-col" :class="i % 2 === 1 ? 'lg:order-2' : ''">
            <div class="flex items-baseline gap-3 mb-6">
              <span class="text-xs tabular-nums text-gray-400">{{ String(i + 1).padStart(2, '0') }}</span>
              <span aria-hidden="true" class="h-px w-6 bg-black/20 dark:bg-white/20" />
              <span class="text-xs uppercase tracking-[0.2em] text-gray-500 inline-flex items-center gap-1.5">
                <span class="size-1.5 rounded-full" :class="visuals[v.id].dot" />
                {{ v.title }}
              </span>
            </div>

            <!-- Small gradient icon tile -->
            <div class="size-12 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-lg mb-6 transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-[6deg]" :class="visuals[v.id].accent">
              <UIcon :name="visuals[v.id].icon" class="size-5" />
            </div>

            <!-- Big hero -->
            <h2 class="font-black tracking-tight leading-[0.95] text-3xl sm:text-4xl lg:text-5xl max-w-xl">{{ v.hero }}</h2>

            <!-- Longer summary paragraph -->
            <p v-if="v.summary" class="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">{{ v.summary }}</p>

            <!-- Compliance chips -->
            <div v-if="v.compliance?.length" class="mt-6 flex flex-wrap gap-2">
              <span v-for="c in v.compliance" :key="c"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[10px] uppercase tracking-[0.15em] font-bold"
                :class="visuals[v.id].text"
              >
                <UIcon name="i-lucide-shield-check" class="size-3" />
                {{ c }}
              </span>
            </div>

            <!-- Stats row -->
            <div class="mt-8 pt-6 border-t border-black/10 dark:border-white/10">
              <div class="flex items-center gap-2 mb-4">
                <UIcon name="i-lucide-info" class="size-3.5 text-amber-500" />
                <span class="text-[10px] uppercase tracking-[0.25em] text-amber-600 dark:text-amber-400 font-bold">{{ copy.ui.illustrativeBenchmarks }}</span>
              </div>
              <div class="grid grid-cols-3 gap-4">
                <div v-for="s in v.stats" :key="s.k">
                  <p class="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-br bg-clip-text text-transparent leading-none" :class="visuals[v.id].accent">{{ s.v }}</p>
                  <p class="mt-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">{{ s.k }}</p>
                </div>
              </div>
            </div>

            <!-- Ships-with chips -->
            <div class="mt-8">
              <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-3">{{ copy.showcasePage.shipsWith }}</p>
              <div class="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                <template v-for="(m, mi) in v.setup" :key="m">
                  <span class="inline-flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                    <span class="size-1 rounded-full" :class="visuals[v.id].dot" />
                    {{ m }}
                  </span>
                  <span v-if="mi < v.setup.length - 1" aria-hidden="true" class="text-gray-300 dark:text-gray-700">·</span>
                </template>
              </div>
            </div>

            <!-- CTAs -->
            <div class="mt-10 flex flex-wrap gap-6 items-center">
              <NuxtLink :to="localePath('/portal/features')" class="group/cta inline-flex items-center gap-3 text-sm font-bold">
                <span class="size-10 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover/cta:scale-110">
                  <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
                </span>
                <span class="relative">
                  {{ copy.showcasePage.cta1 }}
                  <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover/cta:bg-secondary-500 transition-colors" />
                </span>
              </NuxtLink>
              <NuxtLink :to="localePath('/portal/addons')" class="text-sm text-gray-500 hover:text-primary dark:hover:text-white transition-colors inline-flex items-center gap-1.5">
                {{ copy.showcasePage.cta2 }}
                <UIcon name="i-lucide-arrow-up-right" class="size-3.5" />
              </NuxtLink>
            </div>
          </div>

          <!-- Visual side: mock in soft frame -->
          <div class="col-span-12 lg:col-span-5 relative" :class="i % 2 === 1 ? 'lg:order-1' : ''">
            <div class="relative rounded-2xl bg-gray-50 dark:bg-white/[0.025] overflow-hidden lg:sticky lg:top-32">
              <div class="p-5 sm:p-6">
                <LandingModuleMock :id="visuals[v.id].mockId" :color="visuals[v.id].accent" />
              </div>
            </div>
          </div>
        </div>

        <!-- ── Pains × Capabilities: parallel columns ── -->
        <div v-if="v.pains?.length || v.capabilities?.length" class="mt-16 sm:mt-20 grid grid-cols-12 gap-6 lg:gap-12">
          <!-- Pains (red-tinted) -->
          <div v-if="v.pains?.length" class="col-span-12 lg:col-span-5">
            <div class="flex items-baseline gap-3 mb-6 pb-4 border-b border-black/10 dark:border-white/10">
              <UIcon name="i-lucide-alert-triangle" class="size-3.5 text-red-500" />
              <span class="text-[10px] uppercase tracking-[0.25em] text-red-500 font-bold">{{ copy.showcasePage.painsTitle }}</span>
            </div>
            <ul class="space-y-4">
              <li v-for="p in v.pains" :key="p" class="flex items-start gap-3">
                <span class="mt-2 size-1.5 rounded-full bg-red-500 shrink-0" />
                <span class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed line-through decoration-red-500/40 decoration-[1.5px]">{{ p }}</span>
              </li>
            </ul>
          </div>

          <!-- Capabilities (emerald-tinted) -->
          <div v-if="v.capabilities?.length" class="col-span-12 lg:col-span-7">
            <div class="flex items-baseline gap-3 mb-6 pb-4 border-b border-black/10 dark:border-white/10">
              <UIcon name="i-lucide-check-circle-2" class="size-3.5 text-emerald-500" />
              <span class="text-[10px] uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold">{{ copy.showcasePage.capsTitle }}</span>
              <span class="ms-auto text-[10px] tabular-nums text-gray-400">{{ v.capabilities.length }}</span>
            </div>
            <ul class="grid sm:grid-cols-2 gap-x-4 gap-y-2.5 sm:gap-x-6 sm:gap-y-3">
              <li v-for="c in v.capabilities" :key="c" class="flex items-start gap-2.5 text-sm leading-relaxed">
                <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-0.5 text-emerald-500" />
                <span class="text-gray-800 dark:text-gray-200">{{ c }}</span>
              </li>
            </ul>
          </div>
        </div>

        <!-- ── Day-in-the-life flow stepper ── -->
        <div v-if="v.flow?.length" class="mt-16 sm:mt-20">
          <div class="flex items-baseline gap-3 mb-8">
            <UIcon name="i-lucide-route" class="size-3.5" :class="visuals[v.id].text" />
            <span class="text-[10px] uppercase tracking-[0.25em] font-bold" :class="visuals[v.id].text">{{ copy.showcasePage.flowTitle }}</span>
          </div>
          <ol class="grid grid-cols-1 md:grid-cols-5 gap-y-8 md:gap-x-0 relative">
            <li v-for="(step, si) in v.flow" :key="step" class="relative md:px-5 first:md:ps-0 last:md:pe-0 md:border-e md:border-black/10 md:dark:border-white/10 last:md:border-e-0 rtl:md:border-e-0 rtl:md:border-s last:rtl:md:border-s-0">
              <div class="flex items-center gap-3 mb-3">
                <div class="size-8 rounded-full bg-gradient-to-br text-white text-[11px] font-black flex items-center justify-center shadow-sm shrink-0" :class="visuals[v.id].accent">{{ si + 1 }}</div>
                <span aria-hidden="true" class="h-px flex-1" :class="visuals[v.id].soft" />
              </div>
              <p class="text-sm leading-relaxed text-gray-800 dark:text-gray-200">{{ step }}</p>
            </li>
          </ol>
        </div>

        <!-- ── Paired add-ons ── -->
        <div v-if="v.addons?.length" class="mt-16 sm:mt-20">
          <div class="flex items-baseline gap-3 mb-6 pb-4 border-b border-black/10 dark:border-white/10">
            <UIcon name="i-lucide-puzzle" class="size-3.5" :class="visuals[v.id].text" />
            <span class="text-[10px] uppercase tracking-[0.25em] font-bold" :class="visuals[v.id].text">{{ copy.showcasePage.addonsTitle }}</span>
            <span class="ms-auto text-[10px] tabular-nums text-gray-400">{{ v.addons.length }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <NuxtLink v-for="k in v.addons" :key="k" :to="localePath(`/portal/addons/${k}`)"
              class="group/addon flex items-center gap-2.5 p-3 rounded-xl ring-1 ring-black/10 dark:ring-white/10 hover:ring-secondary-500/50 hover:bg-secondary-500/[0.04] transition-all"
            >
              <div class="size-10 shrink-0 rounded-lg flex items-center justify-center" :class="[visuals[v.id].soft, visuals[v.id].text]">
                <UIcon :name="addonMeta[k]?.icon || 'i-lucide-puzzle'" class="size-4" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold truncate">{{ addonLabelFor(k) }}</p>
                <p class="text-[10px] uppercase tracking-[0.15em] text-gray-400 truncate">{{ copy.showcasePage.exploreAddon }}</p>
              </div>
              <UIcon name="i-lucide-arrow-up-right" class="size-3.5 text-gray-400 group-hover/addon:text-secondary-500 transition-colors" />
            </NuxtLink>
          </div>
        </div>
      </article>
    </div>
  </section>

  <LandingCTA />
</template>

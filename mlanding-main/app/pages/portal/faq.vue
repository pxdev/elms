<script setup>
const localePath = useLocalePath()
definePageMeta({ layout: 'landing' });
const copy = useLandingCopy();
const { locale } = useI18n();

useLandingSeo({
    ar: {
        title: 'أسئلة شائعة — Momentfy',
        description: 'إجابات واضحة على ما يهمك: الترخيص، النشر، التحديثات، الامتثال، والدعم — كل ما قد تحتاج لمعرفته قبل البدء.'
    },
    en: {
        title: 'FAQ — Momentfy',
        description: 'Frequently asked questions about Momentfy — licensing, deployment, updates, compliance and support.'
    }
});

// Flatten all FAQ sections into a single FAQPage — Google treats the schema
// as page-level, not per-section.
useSchemaOrg(
    copy.value.faqPage.sections
        .flatMap(s => s.items)
        .map(it => defineQuestion({ name: it.q, acceptedAnswer: it.a }))
);
const sectionDots = ['bg-secondary-500', 'bg-amber-500', 'bg-violet-500', 'bg-emerald-500', 'bg-sky-500', 'bg-rose-500'];
const openSet = ref(new Set());
function toggle(key) {
    if (openSet.value.has(key))
        openSet.value.delete(key);
    else
        openSet.value.add(key);
    openSet.value = new Set(openSet.value);
}
function slugify(s) {
    return s.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-+|-+$/g, '');
}
const chapterNav = computed(() => copy.value.faqPage.sections.map((s, i) => ({
    id: slugify(s.title),
    label: s.title,
    dot: sectionDots[i % sectionDots.length],
    count: s.items.length
})));
</script>

<template>
  <!-- ═══ Hero ═══ -->
  <LandingPageHero
    :crumb-label="copy.faqPage.eyebrow"
    :headline="copy.faqPage.h1"
    :sub="copy.faqPage.sub"
  >
    <template #background>
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(40rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-secondary-500 blur-[150px] opacity-[0.1] rounded-full" />
    </template>

    <p class="mt-4 text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
      <NuxtLink :to="localePath('/portal/download#contact')" class="text-primary dark:text-white font-semibold underline underline-offset-4 decoration-secondary-500 hover:decoration-2">{{ copy.faqPage.contactLink }}</NuxtLink>.
    </p>
  </LandingPageHero>

  <!-- Sticky chapter nav -->
  <LandingChapterNav :items="chapterNav" />

  <!-- ═══ FAQ chapters ═══ -->
  <section class="py-16 sm:py-20">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 space-y-16 sm:space-y-20">
      <div v-for="(section, si) in copy.faqPage.sections" :key="section.title" :id="slugify(section.title)">
        <!-- Chapter header -->
        <div class="flex items-end justify-between pb-5 mb-6 border-b border-black/10 dark:border-white/10">
          <div class="flex items-baseline gap-4 sm:gap-6 min-w-0">
            <span class="shrink-0 text-sm tabular-nums text-gray-400">{{ String(si + 1).padStart(2, '0') }}</span>
            <div class="flex items-baseline gap-3 min-w-0">
              <span aria-hidden="true" class="size-2.5 rounded-full shrink-0" :class="sectionDots[si % sectionDots.length]" />
              <h2 class="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase truncate">
                {{ section.title }}
              </h2>
            </div>
          </div>
          <span class="shrink-0 text-[10px] uppercase tracking-[0.25em] text-gray-400">
            {{ String(section.items.length).padStart(2, '0') }} / {{ copy.ui.questionsLabel }}
          </span>
        </div>

        <!-- Bare accordion — just hairline rules -->
        <div>
          <div v-for="(it, ii) in section.items" :key="it.q"
            class="group border-b border-black/10 dark:border-white/10"
            :class="openSet.has(section.title + '|' + it.q) ? 'bg-black/[0.02] dark:bg-white/[0.02]' : 'hover:bg-black/[0.015] dark:hover:bg-white/[0.01]'"
          >
            <button
              type="button"
              class="w-full flex items-center gap-3 sm:gap-6 py-6 sm:py-8 px-3 sm:px-6 text-start transition-colors"
              :aria-expanded="openSet.has(section.title + '|' + it.q)"
              :aria-controls="`faq-panel-${si}-${ii}`"
              @click="toggle(section.title + '|' + it.q)"
            >
              <span class="hidden sm:inline-block w-6 shrink-0 text-xs tabular-nums text-gray-400">{{ String(ii + 1).padStart(2, '0') }}</span>
              <span class="flex-1 min-w-0 text-base sm:text-lg lg:text-xl font-bold tracking-tight leading-tight">{{ it.q }}</span>
              <span class="shrink-0 size-10 rounded-full flex items-center justify-center transition-all border border-black/10 dark:border-white/15"
                :class="openSet.has(section.title + '|' + it.q) ? 'bg-primary text-white border-primary rotate-180' : 'group-hover:border-secondary-500/40'"
              >
                <UIcon :name="openSet.has(section.title + '|' + it.q) ? 'i-lucide-minus' : 'i-lucide-plus'" class="size-4" />
              </span>
            </button>
            <Transition
              enter-active-class="transition-all duration-300 ease-out overflow-hidden"
              enter-from-class="opacity-0 max-h-0"
              enter-to-class="opacity-100 max-h-96"
              leave-active-class="transition-all duration-200 ease-in overflow-hidden"
              leave-from-class="opacity-100 max-h-96"
              leave-to-class="opacity-0 max-h-0"
            >
              <div v-if="openSet.has(section.title + '|' + it.q)" :id="`faq-panel-${si}-${ii}`" role="region" class="pb-6 sm:pb-8 px-3 sm:px-6 sm:ps-[3.75rem]">
                <p class="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">{{ it.a }}</p>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </section>

  <LandingCTA />
</template>

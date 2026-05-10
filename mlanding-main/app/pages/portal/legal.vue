<script setup>
definePageMeta({ layout: 'landing' })

const copy = useLandingCopy()
const { locale } = useI18n()

useHead(() => ({
  title: locale.value === 'ar' ? 'قانوني — Momentfy' : 'Legal — Momentfy',
  meta: [{
    name: 'description',
    content: locale.value === 'ar'
      ? 'الترخيص، شروط الخدمة، الخصوصية، سياسة البيع، ومعلومات الشركة — كلها في صفحة واحدة، بلغة واضحة يفهمها الجميع.'
      : 'License, Terms of Service, Privacy, Sales policy and company info — all on one page, plainly written.'
  }]
}))
</script>

<template>
  <!-- ═══ Hero ═══ -->
  <LandingPageHero
    :crumb-label="copy.legalPage.eyebrow"
    :headline="copy.legalPage.h1"
    :sub="copy.legalPage.sub"
  >
    <template #background>
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(40rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-secondary-500 blur-[150px] opacity-[0.1] rounded-full" />
    </template>
    <p class="mt-4 text-[11px] uppercase tracking-[0.2em] text-gray-400">{{ copy.legalPage.lastUpdated }}</p>
  </LandingPageHero>

  <!-- ═══ Legal body — section per chapter ═══ -->
  <section class="py-8 sm:py-16">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div v-for="s in copy.legalPage.sections" :key="s.id" :id="s.id"
        class="grid grid-cols-12 gap-6 lg:gap-12 py-12 sm:py-16 border-t border-black/10 dark:border-white/10"
      >
        <div class="col-span-12 lg:col-span-3">
          <div class="lg:sticky lg:top-28">
            <p class="text-xs tabular-nums text-gray-400">{{ s.num }}</p>
            <h2 class="mt-2 text-2xl sm:text-3xl font-black tracking-tight uppercase">{{ s.title }}</h2>
          </div>
        </div>

        <div class="col-span-12 lg:col-span-9 space-y-8">
          <p class="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">{{ s.body }}</p>

          <!-- License can / cannot split columns (only shown if both arrays exist) -->
          <div v-if="s.can?.length || s.cannot?.length" class="grid grid-cols-1 sm:grid-cols-2 gap-10 max-w-4xl">
            <div v-if="s.can?.length">
              <p class="text-[11px] uppercase tracking-[0.25em] font-bold text-emerald-600 dark:text-emerald-400 mb-4">
                {{ copy.ui.legalCan }}
              </p>
              <ul>
                <li v-for="item in s.can" :key="item"
                  class="flex items-start gap-3 py-2.5 border-t border-black/10 dark:border-white/10 last:border-b last:border-b-black/10 dark:last:border-b-white/10"
                >
                  <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ item }}</span>
                </li>
              </ul>
            </div>
            <div v-if="s.cannot?.length">
              <p class="text-[11px] uppercase tracking-[0.25em] font-bold text-red-600 dark:text-red-400 mb-4">
                {{ copy.ui.legalCannot }}
              </p>
              <ul>
                <li v-for="item in s.cannot" :key="item"
                  class="flex items-start gap-3 py-2.5 border-t border-black/10 dark:border-white/10 last:border-b last:border-b-black/10 dark:last:border-b-white/10"
                >
                  <UIcon name="i-lucide-x" class="size-4 shrink-0 mt-0.5 text-red-500" />
                  <span class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- key/value rows for Terms, Privacy, Sales, Company -->
          <dl v-if="s.items?.length" class="max-w-3xl">
            <div v-for="row in s.items" :key="row.k"
              class="grid grid-cols-[8rem_1fr] sm:grid-cols-[11rem_1fr] gap-4 py-4 border-t border-black/10 dark:border-white/10 last:border-b items-baseline"
            >
              <dt class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ row.k }}</dt>
              <dd class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{{ row.v }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  </section>

  <LandingCTA />
</template>

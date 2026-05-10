<script setup>
const localePath = useLocalePath()
definePageMeta({ layout: 'landing' })

const copy = useLandingCopy()
const { locale } = useI18n()

useHead(() => ({
  title: locale.value === 'ar' ? 'التوثيق — Momentfy' : 'Docs — Momentfy',
  meta: [{
    name: 'description',
    content: locale.value === 'ar'
      ? 'متطلبات النظام، تكلفة الاستضافة، خطوات النشر، الوصول إلى المستودع، التحديثات، النسخ الاحتياطي، والمتغيرات — كل ما تحتاجه لتنطلق.'
      : 'System requirements, hosting cost, deployment, repo access, backups, environment variables and license.'
  }]
}))
const chapterNav = computed(() => copy.value.docsPage.sections.map(s => ({
  id: s.id,
  label: s.title,
  dot: 'bg-secondary-500',
  count: undefined
})))
</script>

<template>
  <!-- ═══ Hero ═══ -->
  <LandingPageHero
    :crumb-label="copy.docsPage.eyebrow"
    :headline="copy.docsPage.h1"
    :sub="copy.docsPage.sub"
  >
    <template #background>
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(40rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-secondary-500 blur-[150px] opacity-[0.1] rounded-full" />
    </template>
  </LandingPageHero>

  <!-- Sticky chapter nav -->
  <LandingChapterNav :items="chapterNav" />

  <!-- ═══ Docs body — editorial chapters ═══ -->
  <section class="py-8 sm:py-16">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div v-for="s in copy.docsPage.sections" :key="s.id" :id="s.id"
        class="grid grid-cols-12 gap-6 lg:gap-12 py-12 sm:py-16 border-t border-black/10 dark:border-white/10"
      >
        <!-- Left: chapter label -->
        <div class="col-span-12 lg:col-span-3">
          <div class="lg:sticky lg:top-28">
            <p class="text-xs tabular-nums text-gray-400">{{ s.num }}</p>
            <h2 class="mt-2 text-2xl sm:text-3xl font-black tracking-tight uppercase">{{ s.title }}</h2>
          </div>
        </div>

        <!-- Right: body -->
        <div class="col-span-12 lg:col-span-9 space-y-6">
          <p class="text-base sm:text-lg text-gray-700 dark:text-gray-300 leading-relaxed max-w-3xl">{{ s.body }}</p>

          <!-- key/value spec table -->
          <dl v-if="s.kv?.length" class="max-w-3xl">
            <div v-for="row in s.kv" :key="row.k"
              class="grid grid-cols-[9rem_1fr] sm:grid-cols-[11rem_1fr] gap-4 py-3 border-t border-black/10 dark:border-white/10 last:border-b items-baseline"
            >
              <dt class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ row.k }}</dt>
              <dd class="text-sm sm:text-base text-gray-800 dark:text-gray-200">{{ row.v }}</dd>
            </div>
          </dl>

          <!-- bullet list -->
          <ul v-if="s.items?.length" class="max-w-3xl">
            <li v-for="item in s.items" :key="item"
              class="flex items-start gap-3 py-3 border-t border-black/10 dark:border-white/10 last:border-b"
            >
              <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-1 text-emerald-500" />
              <span class="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">{{ item }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Bottom hand-off: legal + download -->
  <section class="py-12 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 flex flex-wrap items-center justify-between gap-6">
      <div>
        <p class="text-xs uppercase tracking-[0.25em] text-gray-400">{{ copy.ui.readyKicker }}</p>
        <p class="mt-2 text-2xl sm:text-3xl font-black tracking-tight">{{ copy.ui.buyCloneTagline }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-6">
        <NuxtLink :to="localePath('/portal/legal')" class="group inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary dark:hover:text-white transition-colors">
          <UIcon name="i-lucide-scale" class="size-3.5" />
          <span class="relative">
            {{ copy.ui.readLicense }}
            <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </NuxtLink>
        <NuxtLink :to="localePath('/portal/pricing')" class="group inline-flex items-center gap-3 text-sm font-bold">
          <span class="size-12 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
          </span>
          <span class="relative">
            {{ copy.downloadPage.buy }}
            <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors" />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>

  <LandingCTA />
</template>

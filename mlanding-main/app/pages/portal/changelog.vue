<script setup>
definePageMeta({ layout: 'landing' })

const { locale } = useI18n()

useLandingSeo({
  ar: {
    title: 'سجل التحديثات — Momentfy',
    description: 'كل تحديث، كل ميزة جديدة، كل إصلاح — بتسلسل زمني واضح. لأن "تحديثات مدى الحياة" تحتاج إثباتاً، لا وعداً.'
  },
  en: {
    title: 'Changelog — Momentfy',
    description: 'Every update, new feature and fix — a transparent release timeline. Because "lifetime updates" deserves proof, not just a promise.'
  }
})

// Seed timeline. New entries prepend to this array and will land here automatically.
// Shape: { version, date (ISO), tag: 'major' | 'minor' | 'patch', title: {ar,en}, items: { added?, changed?, fixed? } }
const entries = [
  {
    version: '1.0.0',
    date: '2026-04-24',
    tag: 'major',
    title: {
      ar: 'الإصدار الأول',
      en: 'Initial release'
    },
    items: {
      added: {
        ar: [
          'وحدات متكاملة: التقويم، المبيعات، المخزون، العملاء، المحاسبة، الموارد البشرية، التقارير',
          'بوابة العميل ذات الهوية البيضاء',
          'دعم ثنائي اللغة (عربي/إنجليزي) مع RTL أصلي',
          'امتثال ZATCA المرحلة الثانية و ETA للفوترة الإلكترونية',
          'المساعد الذكي المدمج للحجوزات',
          'وضع متعدد المستأجرين — منشآت وحسابات بلا حدود'
        ],
        en: [
          'Core modules: calendar, sales, inventory, clients, accounting, HR, reports',
          'White-label branded client portal',
          'Bilingual AR/EN support with native RTL',
          'ZATCA Phase 2 and ETA e-invoicing compliance',
          'Built-in AI booking assistant',
          'Multi-tenant — unlimited tenants and users'
        ]
      }
    }
  }
]

const tagColor = {
  major: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 ring-rose-500/20',
  minor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 ring-sky-500/20',
  patch: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20'
}

const sectionLabels = {
  added: { ar: 'جديد', en: 'Added' },
  changed: { ar: 'تغييرات', en: 'Changed' },
  fixed: { ar: 'إصلاحات', en: 'Fixed' }
}

const dateFormat = computed(() => new Intl.DateTimeFormat(
  locale.value === 'ar' ? 'ar-SA' : 'en-US',
  { year: 'numeric', month: 'long', day: 'numeric' }
))
</script>

<template>
  <LandingPageHero
    :crumb-label="locale === 'ar' ? 'سجل التحديثات' : 'Changelog'"
    :headline="locale === 'ar' ? 'كل تحديث، بكامل التفاصيل' : 'Every update, in full detail'"
    :sub="locale === 'ar'
      ? '\'تحديثات مدى الحياة\' ليست شعاراً — هنا سجل حقيقي لكل ميزة ومُعالجة منذ الإصدار الأول.'
      : '\'Lifetime updates\' isn\'t a slogan — this is the real log of every feature and fix since v1.0.'"
  >
    <template #background>
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(40rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-secondary-500 blur-[150px] opacity-[0.1] rounded-full" />
    </template>
  </LandingPageHero>

  <section class="pb-20">
    <div class="max-w-4xl mx-auto px-5 sm:px-8">
      <ol class="relative border-s border-black/10 dark:border-white/10">
        <li v-for="e in entries" :key="e.version" class="ms-6 pb-12 last:pb-0">
          <span class="absolute -start-1.5 flex items-center justify-center w-3 h-3 rounded-full bg-primary ring-4 ring-white dark:ring-black" />

          <div class="flex flex-wrap items-baseline gap-3 mb-2">
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight">v{{ e.version }}</h2>
            <span class="text-[11px] uppercase tracking-[0.2em] ring-1 rounded-full px-2 py-0.5" :class="tagColor[e.tag]">
              {{ e.tag }}
            </span>
            <time class="text-xs text-gray-500" :datetime="e.date">{{ dateFormat.format(new Date(e.date)) }}</time>
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400 mb-5">
            {{ e.title[locale === 'ar' ? 'ar' : 'en'] }}
          </p>

          <div class="space-y-5">
            <div v-for="section in ['added', 'changed', 'fixed']" v-show="e.items[section]" :key="section">
              <h3 class="text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-2">
                {{ sectionLabels[section][locale === 'ar' ? 'ar' : 'en'] }}
              </h3>
              <ul class="space-y-1.5">
                <li v-for="(item, i) in e.items[section]?.[locale === 'ar' ? 'ar' : 'en'] || []" :key="i"
                  class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex items-start gap-2"
                >
                  <UIcon name="i-lucide-check" class="size-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ol>
    </div>
  </section>

  <LandingCTA />
</template>

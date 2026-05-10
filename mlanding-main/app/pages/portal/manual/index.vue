<script setup lang="ts">
const localePath = useLocalePath()
definePageMeta({ layout: 'manual' })

const manual = useManualCopy()
const { locale } = useI18n()

useHead(() => ({
  title: locale.value === 'ar'
    ? 'دليل المستخدم — Momentfy'
    : 'User Manual — Momentfy',
  meta: [{
    name: 'description',
    content: locale.value === 'ar'
      ? 'دليل مستخدم Momentfy الرسمي. شروحات خطوة بخطوة لكل موديول في النظام — التقويم، المبيعات، العملاء والمزيد.'
      : 'The official Momentfy user manual. Step-by-step how-tos for every module in the app — Calendar, Sales, Clients and more.'
  }]
}))
</script>

<template>
  <div>
    <!-- Header -->
    <header class="border-b border-black/10 dark:border-white/10 pb-10 mb-10">
      <p class="text-xs uppercase tracking-[0.25em] text-gray-400">{{ manual.home.eyebrow }}</p>
      <h1 class="mt-3 text-3xl sm:text-5xl font-black tracking-tight">{{ manual.home.title }}</h1>
      <p class="mt-4 max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
        {{ manual.home.sub }}
      </p>
    </header>

    <!-- Module grid -->
    <section>
      <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-black tracking-tight">{{ manual.home.modulesHeading }}</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ manual.home.modulesSub }}</p>
      </div>

      <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <li v-for="m in manual.modules" :key="m.id">
          <NuxtLink
            v-if="m.status === 'ready'"
            :to="localePath(`/portal/manual/${m.id}`)"
            class="group relative flex items-start gap-4 p-5 rounded-2xl border border-black/10 dark:border-white/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 bg-white dark:bg-black transition h-full"
          >
            <div class="shrink-0 size-12 rounded-xl flex items-center justify-center transition bg-primary/10 text-primary dark:bg-white/10 dark:text-white group-hover:bg-primary group-hover:text-white">
              <UIcon :name="m.icon" class="size-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-bold tracking-tight">{{ m.label }}</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ m.summary }}</p>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="size-4 mt-1 text-gray-400 group-hover:text-primary transition rtl:-scale-x-100" />
          </NuxtLink>

          <div
            v-else
            class="relative flex items-start gap-4 p-5 rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] cursor-not-allowed h-full"
          >
            <div class="shrink-0 size-12 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 text-gray-400">
              <UIcon :name="m.icon" class="size-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold tracking-tight text-gray-500 dark:text-gray-400">{{ m.label }}</h3>
                <span class="inline-flex items-center px-2 h-5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                  {{ manual.statusLabels.soon }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ m.summary }}</p>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Add-ons grid -->
    <section v-if="manual.addons && manual.addons.length" class="mt-16">
      <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-black tracking-tight">{{ manual.home.addonsHeading || 'Add-ons' }}</h2>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ manual.home.addonsSub || '' }}</p>
      </div>

      <ul class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <li v-for="a in manual.addons" :key="a.id">
          <NuxtLink
            v-if="a.status === 'ready'"
            :to="localePath(`/portal/manual/${a.id}`)"
            class="group relative flex items-start gap-4 p-5 rounded-2xl border border-black/10 dark:border-white/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 bg-white dark:bg-black transition h-full"
          >
            <div class="shrink-0 size-12 rounded-xl flex items-center justify-center transition bg-secondary-500/10 text-secondary-500 dark:bg-white/10 dark:text-white group-hover:bg-secondary-500 group-hover:text-white">
              <UIcon :name="a.icon" class="size-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base font-bold tracking-tight">{{ a.label }}</h3>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ a.summary }}</p>
            </div>
            <UIcon name="i-lucide-arrow-up-right" class="size-4 mt-1 text-gray-400 group-hover:text-primary transition rtl:-scale-x-100" />
          </NuxtLink>

          <div
            v-else
            class="relative flex items-start gap-4 p-5 rounded-2xl border border-dashed border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02] cursor-not-allowed h-full"
          >
            <div class="shrink-0 size-12 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/5 text-gray-400">
              <UIcon :name="a.icon" class="size-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-base font-bold tracking-tight text-gray-500 dark:text-gray-400">{{ a.label }}</h3>
                <span class="inline-flex items-center px-2 h-5 rounded-full text-[10px] uppercase tracking-wider font-bold bg-black/5 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                  {{ manual.statusLabels.soon }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ a.summary }}</p>
            </div>
          </div>
        </li>
      </ul>
    </section>

    <!-- Bottom CTA -->
    <section class="mt-16 rounded-2xl border border-black/10 dark:border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-black/[0.02] dark:bg-white/[0.02]">
      <div class="flex-1">
        <h3 class="text-lg sm:text-xl font-bold tracking-tight">{{ manual.home.footerCtaTitle }}</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ manual.home.footerCtaBody }}</p>
      </div>
      <NuxtLink
        :to="localePath('/portal/faq')"
        class="inline-flex items-center gap-2 px-5 h-12 rounded-full text-sm font-semibold bg-primary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all self-start sm:self-center"
      >
        {{ manual.home.footerCtaButton }}
        <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
      </NuxtLink>
    </section>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
definePageMeta({ layout: 'manual' })

const route = useRoute()
const router = useRouter()
const manual = useManualCopy()
const { locale } = useI18n()

const moduleId = computed(() => String(route.params.id || ''))
const moduleEntry = computed(() => {
  const id = moduleId.value
  return manual.value.modules.find(m => m.id === id)
    || manual.value.addons?.find(a => a.id === id)
})
const article = computed(() => manual.value.articles[moduleId.value])

// Unknown slug — bounce to the manual home.
watchEffect(() => {
  if (!moduleEntry.value) router.replace(localePath('/portal/manual'))
})

const isComingSoon = computed(() => moduleEntry.value?.status === 'soon')

useHead(() => ({
  title: article.value
    ? (locale.value === 'ar'
        ? `${article.value.title} — دليل المستخدم — Momentfy`
        : `${article.value.title} — User Manual — Momentfy`)
    : (locale.value === 'ar' ? 'دليل المستخدم — Momentfy' : 'User Manual — Momentfy'),
  meta: [{
    name: 'description',
    content: article.value?.tagline || moduleEntry.value?.summary || ''
  }]
}))
</script>

<template>
  <div v-if="article">
    <ManualArticle :module-id="moduleId" :article="article" />
  </div>

  <div v-else-if="isComingSoon" class="max-w-2xl py-16">
    <nav class="mb-6 text-sm" aria-label="Breadcrumb">
      <NuxtLink
        :to="localePath('/portal/manual')"
        class="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary dark:hover:text-white transition"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4 rtl:rotate-180" />
        {{ manual.nav.backToHome }}
      </NuxtLink>
    </nav>

    <p class="text-xs uppercase tracking-[0.25em] text-gray-400">{{ manual.statusLabels.soon }}</p>
    <h1 class="mt-3 text-3xl sm:text-4xl font-black tracking-tight">{{ moduleEntry?.label }}</h1>
    <p class="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
      {{ moduleEntry?.summary }}
    </p>

    <div class="mt-8 rounded-xl border border-dashed border-black/15 dark:border-white/15 p-6 bg-black/[0.02] dark:bg-white/[0.02] flex items-start gap-3">
      <UIcon name="i-lucide-hard-hat" class="size-5 shrink-0 text-gray-500 mt-0.5" />
      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {{ locale === 'ar'
          ? 'هذا الموديول موثّق قريبًا. لو احتجت مساعدة عاجلة، تواصل مع الدعم.'
          : 'Documentation for this module is on the way. In the meantime, contact support if you need help now.' }}
      </p>
    </div>
  </div>
</template>

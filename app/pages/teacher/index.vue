<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: ['TEACHER'] })

useSeoMeta({ title: `${t('nav.dashboard')} · ${t('app.title')}` })

const { data: stats } = await useFetch('/api/teacher/stats')

const cards = computed(() => [
  { label: t('nav.courses'), value: stats.value?.courses ?? 0, icon: 'i-lucide-book-open', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: t('nav.enrollments'), value: stats.value?.enrollments ?? 0, icon: 'i-lucide-users', color: 'text-green-500', bg: 'bg-green-500/10' },
  { label: t('dashboard.verifyBanner.title'), value: stats.value?.pendingEnrollments ?? 0, icon: 'i-lucide-clock', color: 'text-amber-500', bg: 'bg-amber-500/10' }
])
</script>

<template>
  <div class="space-y-6">
    <AdminPageHeader :title="t('nav.dashboard')" />

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="card in cards" :key="card.label" class="relative overflow-hidden">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">{{ card.label }}</p>
            <p class="text-3xl font-bold mt-1">{{ card.value }}</p>
          </div>
          <div class="p-3 rounded-lg" :class="card.bg">
            <UIcon :name="card.icon" class="text-xl" :class="card.color" />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

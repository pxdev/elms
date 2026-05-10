<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('nav.admin')} · ${t('app.title')}` })

const { data: stats } = await useFetch('/api/admin/stats')

const cards = computed(() => [
  { label: t('nav.courses'), value: stats.value?.courses ?? 0, icon: 'i-lucide-book-open', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: t('nav.enrollments'), value: stats.value?.enrollments ?? 0, icon: 'i-lucide-users', color: 'text-green-500', bg: 'bg-green-500/10' },
  { label: t('dashboard.verifyBanner.title'), value: stats.value?.pendingEnrollments ?? 0, icon: 'i-lucide-clock', color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: t('fields.name'), value: stats.value?.users ?? 0, icon: 'i-lucide-user-cog', color: 'text-purple-500', bg: 'bg-purple-500/10' }
])
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">


      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UCard>
          <template #header>
            <h3 class="font-semibold">{{ t('roles.TEACHER') }}</h3>
          </template>
          <div class="flex items-center gap-4">
            <UIcon name="i-lucide-user-check" class="text-3xl text-primary" />
            <div>
              <p class="text-2xl font-bold">{{ stats?.teachers ?? 0 }}</p>
              <p class="text-sm text-muted-foreground">Total teachers</p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <h3 class="font-semibold">{{ t('roles.STUDENT') }}</h3>
          </template>
          <div class="flex items-center gap-4">
            <UIcon name="i-lucide-graduation-cap" class="text-3xl text-primary" />
            <div>
              <p class="text-2xl font-bold">{{ stats?.students ?? 0 }}</p>
              <p class="text-sm text-muted-foreground">Total students</p>
            </div>
          </div>
        </UCard>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UButton
          to="/admin/promo-codes"
          variant="soft"
          color="primary"
          class="h-auto py-4 justify-start"
          icon="i-lucide-ticket-percent"
        >
          <div class="text-left">
            <div class="font-semibold">Promo Codes</div>
            <div class="text-xs text-muted-foreground">Manage discounts</div>
          </div>
        </UButton>
      </div>
    </div>
  </UContainer>
</template>

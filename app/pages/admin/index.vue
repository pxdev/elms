<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `Admin · ${t('app.title')}` })

const { data: users, refresh } = await useFetch('/api/admin/users')
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <h1 class="text-2xl font-semibold">
      Admin Panel
    </h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">
              Users
            </h2>
            <UButton
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              @click="() => refresh()"
            >
              {{ t('dashboard.refresh') }}
            </UButton>
          </div>
        </template>

        <pre class="text-sm overflow-auto">{{ users }}</pre>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ t('admin.courses.title') }}
          </h2>
        </template>

        <p class="text-sm text-neutral-500 mb-4">
          {{ t('admin.courses.description') }}
        </p>

        <UButton
          to="/admin/courses"
          color="primary"
          variant="solid"
        >
          {{ t('common.manage') }}
        </UButton>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="font-semibold">
            {{ t('admin.enrollments.title') }}
          </h2>
        </template>

        <p class="text-sm text-neutral-500 mb-4">
          {{ t('admin.enrollments.description') }}
        </p>

        <UButton
          to="/admin/enrollments"
          color="primary"
          variant="solid"
        >
          {{ t('common.manage') }}
        </UButton>
      </UCard>
    </div>
  </UContainer>
</template>

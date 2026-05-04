<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('admin.enrollments.title')} · ${t('app.title')}` })

const { data, refresh, status } = await useFetch('/api/admin/enrollments')
const enrollments = computed(() => data.value?.enrollments ?? [])

const statusOptions = [
  { value: 'PENDING', label: t('enrollments.status.PENDING') },
  { value: 'ACTIVE', label: t('enrollments.status.ACTIVE') },
  { value: 'COMPLETED', label: t('enrollments.status.COMPLETED') },
  { value: 'CANCELLED', label: t('enrollments.status.CANCELLED') }
]

const statusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'PENDING': return 'warning'
    case 'COMPLETED': return 'primary'
    case 'CANCELLED': return 'error'
    default: return 'neutral'
  }
}

const updating = ref<number | null>(null)

async function updateStatus(id: number, newStatus: string) {
  updating.value = id
  try {
    await $fetch(`/api/admin/enrollments/${id}`, {
      method: 'PATCH',
      body: { status: newStatus }
    })
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }, message?: string }
    alert(e.data?.message ?? e.message ?? t('errors.generic'))
  } finally {
    updating.value = null
  }
}
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">
        {{ t('admin.enrollments.title') }}
      </h1>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        icon="i-lucide-refresh-cw"
        :loading="status === 'pending'"
        @click="() => refresh()"
      >
        {{ t('dashboard.refresh') }}
      </UButton>
    </div>

    <UCard>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2 px-3 font-medium">
              {{ t('fields.student') }}
            </th>
            <th class="text-left py-2 px-3 font-medium">
              {{ t('fields.course') }}
            </th>
            <th class="text-left py-2 px-3 font-medium">
              {{ t('fields.variant') }}
            </th>
            <th class="text-left py-2 px-3 font-medium">
              {{ t('fields.status') }}
            </th>
            <th class="text-left py-2 px-3 font-medium">
              {{ t('fields.enrolledAt') }}
            </th>
            <th class="text-right py-2 px-3 font-medium">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="enrollment in enrollments"
            :key="enrollment.id"
            class="border-b last:border-0"
          >
            <td class="py-2 px-3">
              <div>{{ enrollment.user.name }}</div>
              <div class="text-xs text-muted">
                {{ enrollment.user.email }}
              </div>
            </td>
            <td class="py-2 px-3">
              {{ enrollment.courseVariant.course.name }}
            </td>
            <td class="py-2 px-3">
              {{ enrollment.courseVariant.name }}
            </td>
            <td class="py-2 px-3">
              <UBadge
                :label="t(`enrollments.status.${enrollment.status}`)"
                :color="statusColor(enrollment.status)"
                variant="subtle"
                size="sm"
              />
            </td>
            <td class="py-2 px-3">
              {{ new Date(enrollment.enrolledAt).toLocaleDateString() }}
            </td>
            <td class="py-2 px-3 text-right">
              <USelect
                :model-value="enrollment.status"
                :items="statusOptions"
                size="xs"
                class="w-36 ml-auto"
                :loading="updating === enrollment.id"
                @update:model-value="updateStatus(enrollment.id, $event)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </UContainer>
</template>

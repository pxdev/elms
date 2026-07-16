<script setup lang="ts">
const { t } = useI18n()
definePageMeta({ layout: 'dashboard', authorize: ['ADMIN'] })
const { data, refresh } = await useFetch('/api/admin/support')
const changing = ref<number | null>(null)
async function setStatus(id: number, status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED') {
  changing.value = id
  try {
    await $fetch(`/api/admin/support/${id}`, { method: 'PATCH', body: { status } })
    await refresh()
  } finally {
    changing.value = null
  }
}
</script>

<template>
  <UContainer class="py-8 space-y-6">
    <div><h1 class="text-2xl font-bold">{{ t('support.adminTitle') }}</h1><p class="text-muted">{{ t('support.adminDescription') }}</p></div>
    <div v-if="data?.requests?.length" class="space-y-3">
      <UCard v-for="request in data.requests" :key="request.id">
        <div class="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div class="space-y-2">
            <div class="flex items-center gap-2"><p class="font-semibold">#{{ request.id }} · {{ request.subject }}</p><UBadge :label="request.status" variant="soft" /></div>
            <p class="text-sm">{{ request.message }}</p>
            <p class="text-xs text-muted">{{ request.user.name ?? request.user.email }} · {{ request.user.email }}</p>
            <p v-if="request.enrollment" class="text-xs text-muted">{{ request.enrollment.course.name }} · {{ request.enrollment.paymentStatus }} · {{ request.enrollment.lsOrderId ?? '-' }}</p>
          </div>
          <div class="flex gap-2">
            <UButton size="xs" variant="soft" :loading="changing === request.id" @click="setStatus(request.id, 'IN_PROGRESS')">{{ t('support.inProgress') }}</UButton>
            <UButton size="xs" color="success" variant="soft" :loading="changing === request.id" @click="setStatus(request.id, 'RESOLVED')">{{ t('support.resolve') }}</UButton>
          </div>
        </div>
      </UCard>
    </div>
    <UAlert v-else color="neutral" variant="soft" :title="t('support.noRequests')" />
  </UContainer>
</template>

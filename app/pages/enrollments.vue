<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

definePageMeta({ authorize: true })

useSeoMeta({ title: `${t('enrollments.title')} · ${t('app.title')}` })

const { data, refresh, status } = await useFetch('/api/enrollments/me')
const enrollments = computed(() => data.value?.enrollments ?? [])

const statusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'success'
    case 'PENDING': return 'warning'
    case 'COMPLETED': return 'primary'
    case 'CANCELLED': return 'error'
    default: return 'neutral'
  }
}

const paymentStatusColor = (status?: string) => {
  switch (status) {
    case 'PAID': return 'success'
    case 'PENDING': return 'warning'
    case 'FAILED': return 'error'
    default: return 'neutral'
  }
}

function formatAmount(cents?: number) {
  if (cents == null) return undefined
  return `$${(cents / 100).toFixed(2)}`
}
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <UAlert
      v-if="route.query.success === '1'"
      color="success"
      variant="soft"
      icon="i-lucide-check-circle"
      :title="t('enrollments.paymentSuccess')"
      class="mb-4"
    />

    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">
        {{ t('enrollments.title') }}
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

    <div
      v-if="enrollments.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <UCard
        v-for="enrollment in enrollments"
        :key="enrollment.id"
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h2 class="font-semibold">
              {{ enrollment.courseVariant.course.name }}
            </h2>
            <UBadge
              :label="t(`enrollments.status.${enrollment.status}`)"
              :color="statusColor(enrollment.status)"
              variant="subtle"
              size="sm"
            />
          </div>
          <p class="text-sm text-muted">
            {{ enrollment.courseVariant.name }}
          </p>
          <p class="text-sm text-muted">
            {{ t('courses.sessionsPerMonth', { count: enrollment.courseVariant.sessionsPerMonth }) }}
          </p>
          <p class="text-sm text-muted">
            {{ t('enrollments.enrolledAt') }}: {{ new Date(enrollment.enrolledAt).toLocaleDateString() }}
          </p>
          <div
            v-if="enrollment.paymentStatus || enrollment.status === 'PENDING'"
            class="flex items-center gap-2"
          >
            <UBadge
              :label="t(`enrollments.paymentStatus.${enrollment.paymentStatus ?? 'PENDING'}`)"
              :color="paymentStatusColor(enrollment.paymentStatus ?? undefined)"
              variant="subtle"
              size="sm"
            />
            <span
              v-if="enrollment.amountCents != null"
              class="text-sm font-medium"
            >
              {{ formatAmount(enrollment.amountCents) }}
            </span>
          </div>
          <p
            v-if="enrollment.paidAt"
            class="text-sm text-muted"
          >
            {{ t('enrollments.paidAt') }}: {{ new Date(enrollment.paidAt).toLocaleDateString() }}
          </p>
        </div>

        <template #footer>
          <UButton
            :to="`/courses/${enrollment.courseVariant.course.id}`"
            block
            color="primary"
            variant="subtle"
          >
            {{ t('courses.viewDetails') }}
          </UButton>
        </template>
      </UCard>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-book-open"
      :title="t('enrollments.empty.title')"
      :description="t('enrollments.empty.description')"
    />
  </UContainer>
</template>

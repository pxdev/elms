<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

definePageMeta({ layout: 'dashboard', authorize: true })

useSeoMeta({ title: `${t('enrollments.title')} · ${t('app.title')}` })

const { data, refresh, status } = await useFetch('/api/enrollments/me')
const enrollments = computed(() => data.value?.enrollments ?? [])

onMounted(async () => {
  if (route.query.success !== '1') return
  for (let attempt = 0; attempt < 5; attempt++) {
    await refresh()
    if (enrollments.value.some(enrollment => enrollment.status === 'ACTIVE')) break
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
})

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

function sessionProgress(enrollment: any) {
  const total = enrollment.course.totalSessions ?? 0
  const booked = (enrollment.sessions ?? []).filter((s: any) => s.status !== 'CANCELLED').length
  return { total, booked, remaining: Math.max(0, total - booked) }
}
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <UAlert
      v-if="route.query.success === '1'"
      color="success"
      variant="soft"
      icon="i-lucide-check-circle"
      :title="t('enrollments.paymentProcessing')"
      :description="t('enrollments.paymentProcessingDescription')"
      class="mb-4"
    />

    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">
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
              {{ enrollment.course.name }}
            </h2>
            <UBadge
              :label="t(`enrollments.status.${enrollment.status}`)"
              :color="statusColor(enrollment.status)"
              variant="subtle"
              size="sm"
            />
          </div>
          <p class="text-sm text-muted">
            {{ t('courses.teacher') }}: {{ enrollment.course.teacher?.name ?? t('common.notAssigned') }}
          </p>
          <p class="text-sm text-muted">
            {{ t('enrollments.enrolledAt') }}: {{ new Date(enrollment.enrolledAt).toLocaleDateString() }}
          </p>
          <div
            v-if="enrollment.paymentStatus || enrollment.status === 'PENDING'"
            class="flex items-center gap-2"
          >
            <UBadge
              :label="t(`payments.status.${enrollment.paymentStatus ?? 'PENDING'}`)"
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

          <!-- Session progress -->
          <div v-if="enrollment.status === 'ACTIVE'" class="pt-2 border-t">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">
                {{ t('sessions.progress') }}
              </span>
              <span class="font-medium">
                {{ sessionProgress(enrollment).booked }} / {{ sessionProgress(enrollment).total }}
              </span>
            </div>
            <div class="w-full bg-neutral-100 rounded-full h-2 mt-1">
              <div
                class="bg-primary rounded-full h-2 transition-all"
                :style="{ width: `${sessionProgress(enrollment).total > 0 ? (sessionProgress(enrollment).booked / sessionProgress(enrollment).total) * 100 : 0}%` }"
              />
            </div>
          </div>
        </div>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-if="enrollment.status === 'ACTIVE' && sessionProgress(enrollment).remaining > 0"
              :to="`/student/sessions/book?enrollment=${enrollment.id}`"
              color="primary"
              variant="soft"
              class="flex-1"
            >
              {{ t('sessions.bookSession') }}
            </UButton>
            <UButton
              :to="`/courses/${enrollment.course.id}`"
              color="neutral"
              variant="ghost"
              class="flex-1"
            >
              {{ t('courses.viewDetails') }}
            </UButton>
            <UButton
              v-if="enrollment.receiptUrl"
              :to="enrollment.receiptUrl"
              external
              target="_blank"
              color="neutral"
              variant="ghost"
              icon="i-lucide-receipt-text"
            >
              {{ t('payments.receipt') }}
            </UButton>
            <UButton
              :to="`/support?enrollment=${enrollment.id}`"
              color="neutral"
              variant="ghost"
              icon="i-lucide-life-buoy"
            >
              {{ t('support.getHelp') }}
            </UButton>
            <UButton
              v-if="enrollment.paymentStatus === 'PAID'"
              :to="`/support?enrollment=${enrollment.id}&type=refund`"
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-rotate-ccw"
            >
              {{ t('support.requestRefund') }}
            </UButton>
          </div>
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

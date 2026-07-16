<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

definePageMeta({ layout: 'dashboard', authorize: true })

useSeoMeta({ title: `${t('sessions.bookSession')} · ${t('app.title')}` })

const enrollmentId = computed(() => Number(route.query.enrollment))
const rescheduleSessionId = computed(() => Number(route.query.reschedule) || null)

const { data: slotsData, status: slotsStatus } = await useFetch('/api/student/slots', {
  query: computed(() => ({ enrollmentId: enrollmentId.value })),
  watch: [enrollmentId]
})

const selectedSlot = ref<string | null>(null)
const booking = ref(false)
const bookingError = ref<string | null>(null)

async function bookSession() {
  if (!selectedSlot.value || !enrollmentId.value) return
  bookingError.value = null
  booking.value = true
  try {
    if (rescheduleSessionId.value) {
      await $fetch(`/api/student/sessions/${rescheduleSessionId.value}`, {
        method: 'PATCH',
        body: { action: 'reschedule', scheduledAt: selectedSlot.value }
      })
    } else {
      await $fetch('/api/student/sessions', {
        method: 'POST',
        body: { enrollmentId: enrollmentId.value, scheduledAt: selectedSlot.value }
      })
    }
    await navigateTo('/student/sessions')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }, message?: string }
    bookingError.value = e.data?.message ?? e.message ?? t('errors.generic')
  } finally {
    booking.value = false
  }
}

function formatSlot(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const slotsByDate = computed(() => {
  const slots = slotsData.value?.slots ?? []
  const grouped: Record<string, typeof slots> = {}
  for (const slot of slots) {
    const date = new Date(slot.startTime).toLocaleDateString()
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(slot)
  }
  return grouped
})
</script>

<template>
  <UContainer class="py-12 max-w-2xl">
    <div class="mb-6 space-y-2">
      <UButton
        to="/enrollments"
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
      >
        {{ t('sessions.backToEnrollments') }}
      </UButton>
      <h1 class="text-2xl font-bold">
        {{ rescheduleSessionId ? t('sessions.reschedule') : t('sessions.bookSession') }}
      </h1>
      <p class="text-sm text-muted">
        {{ t('sessions.timeZoneNote', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }) }}
      </p>
    </div>
    <UCard>

      <div v-if="slotsStatus === 'pending'" class="py-8 text-center text-muted-foreground">
        {{ t('common.loading') }}
      </div>

      <div v-else-if="(slotsData as any)?.maxReached" class="py-8 text-center">
        <UIcon name="i-lucide-check-circle" class="text-4xl text-success mx-auto mb-2" />
        <p class="text-muted-foreground">{{ t('sessions.maxReached') }}</p>
      </div>

      <div v-else-if="(slotsData as any)?.noAvailability" class="py-8 text-center">
        <UIcon name="i-lucide-calendar-x" class="text-4xl text-warning mx-auto mb-2" />
        <p class="text-muted-foreground">{{ t('sessions.noAvailability') }}</p>
      </div>

      <div v-else-if="!slotsData?.slots?.length" class="py-8 text-center text-muted-foreground">
        {{ t('sessions.noSlots') }}
      </div>

      <div v-else class="space-y-6">
        <UAlert
          v-if="bookingError"
          color="error"
          variant="soft"
          icon="i-lucide-alert-circle"
          :title="bookingError"
        />
        <div
          v-for="(daySlots, dateKey) in slotsByDate"
          :key="dateKey"
          class="space-y-2"
        >
          <h3 class="text-sm font-medium text-muted-foreground">
            {{ dateKey }}
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <UButton
              v-for="slot in daySlots"
              :key="slot.startTime"
              :variant="selectedSlot === slot.startTime ? 'solid' : 'soft'"
              :color="selectedSlot === slot.startTime ? 'primary' : 'neutral'"
              size="sm"
              @click="selectedSlot = slot.startTime"
            >
              {{ formatSlot(slot.startTime) }}
            </UButton>
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t">
          <UButton
            color="primary"
            size="xl"
            :loading="booking"
            :disabled="!selectedSlot"
            @click="bookSession"
          >
            {{ rescheduleSessionId ? t('sessions.confirmReschedule') : t('sessions.confirmBooking') }}
          </UButton>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

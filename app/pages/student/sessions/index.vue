<script setup lang="ts">
import { format, parseISO, isPast } from 'date-fns'

const { t } = useI18n()

definePageMeta({ layout: 'dashboard', authorize: true })

useSeoMeta({ title: `${t('sessions.title')} · ${t('app.title')}` })

const { data, refresh, status } = await useFetch('/api/student/sessions')

function formatDateTime(dateStr: string) {
  const d = parseISO(dateStr)
  return format(d, 'MMM d, yyyy · h:mm a')
}

const upcomingSessions = computed(() => {
  return (data.value?.sessions ?? []).filter((s: any) => {
    const d = parseISO(s.scheduledAt)
    return !isPast(d) || s.status === 'SCHEDULED'
  })
})

const pastSessions = computed(() => {
  return (data.value?.sessions ?? []).filter((s: any) => {
    const d = parseISO(s.scheduledAt)
    return isPast(d) && s.status !== 'SCHEDULED'
  })
})
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <div class="flex items-center justify-between">
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

    <!-- Upcoming Sessions -->
    <div class="space-y-4">
      <h2 class="text-lg font-medium">{{ t('sessions.upcoming') }}</h2>

      <div v-if="upcomingSessions.length" class="space-y-3">
        <UCard v-for="session in upcomingSessions" :key="session.id">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="font-semibold">{{ session.enrollment.course.name }}</div>
              <div class="text-sm text-muted-foreground">
                {{ t('courses.teacher') }}: {{ session.enrollment.course.teacher?.name ?? '-' }}
              </div>
              <div class="text-sm font-medium text-primary">
                {{ formatDateTime(session.scheduledAt) }}
              </div>
              <div v-if="session.notes" class="text-sm text-muted-foreground">
                {{ session.notes }}
              </div>
            </div>
            <div class="flex flex-col items-end gap-2">
              <UBadge
                :label="t(`enrollments.status.${session.status}`)"
                color="primary"
                variant="soft"
                size="sm"
              />
              <a
                v-if="session.zoomLink"
                :href="session.zoomLink"
                target="_blank"
                class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <UIcon name="i-lucide-video" />
                Zoom
              </a>
            </div>
          </div>
        </UCard>
      </div>

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        icon="i-lucide-calendar"
        :title="t('sessions.noSessions')"
      />
    </div>

    <!-- Past Sessions -->
    <div v-if="pastSessions.length" class="space-y-4">
      <h2 class="text-lg font-medium">{{ t('sessions.past') }}</h2>
      <div class="space-y-3">
        <UCard v-for="session in pastSessions" :key="session.id" class="opacity-70">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="font-semibold">{{ session.enrollment.course.name }}</div>
              <div class="text-sm text-muted-foreground">
                {{ formatDateTime(session.scheduledAt) }}
              </div>
            </div>
            <UBadge
              :label="t(`enrollments.status.${session.status}`)"
              :color="session.status === 'COMPLETED' ? 'success' : 'neutral'"
              variant="soft"
              size="sm"
            />
          </div>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>

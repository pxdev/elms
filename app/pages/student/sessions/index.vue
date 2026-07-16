<script setup lang="ts">
import { format, parseISO, isPast } from 'date-fns'

const { t } = useI18n()

definePageMeta({ layout: 'dashboard', authorize: true })

useSeoMeta({ title: `${t('sessions.title')} · ${t('app.title')}` })

const { data, refresh, status } = await useFetch('/api/student/sessions')
const changingSession = ref<number | null>(null)

async function cancelSession(session: { id: number }) {
  if (!confirm(t('sessions.cancelConfirm'))) return
  changingSession.value = session.id
  try {
    await $fetch(`/api/student/sessions/${session.id}`, {
      method: 'PATCH',
      body: { action: 'cancel' }
    })
    await refresh()
  } finally {
    changingSession.value = null
  }
}

function formatDateTime(dateStr: string) {
  const d = parseISO(dateStr)
  return format(d, 'MMM d, yyyy · h:mm a')
}

function calendarDetails(session: any) {
  const start = new Date(session.scheduledAt)
  const end = new Date(start.getTime() + session.durationMinutes * 60_000)
  const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const title = `${session.enrollment.course.name} · ${session.enrollment.course.teacher?.name ?? ''}`
  return { start: stamp(start), end: stamp(end), title }
}

function googleCalendarUrl(session: any) {
  const item = calendarDetails(session)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}&dates=${item.start}/${item.end}`
}

function outlookCalendarUrl(session: any) {
  const start = new Date(session.scheduledAt)
  const end = new Date(start.getTime() + session.durationMinutes * 60_000)
  const title = calendarDetails(session).title
  return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${encodeURIComponent(title)}&startdt=${encodeURIComponent(start.toISOString())}&enddt=${encodeURIComponent(end.toISOString())}`
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
      <h1 class="text-2xl font-bold">
        {{ t('sessions.title') }}
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
              <div v-if="session.status === 'SCHEDULED'" class="flex flex-wrap justify-end gap-1">
                <UButton
                  :to="`/student/sessions/book?enrollment=${session.enrollmentId}&reschedule=${session.id}`"
                  size="xs"
                  color="neutral"
                  variant="soft"
                  icon="i-lucide-calendar-sync"
                >
                  {{ t('sessions.reschedule') }}
                </UButton>
                <UButton
                  :to="googleCalendarUrl(session)"
                  external
                  target="_blank"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-simple-icons-googlecalendar"
                  :aria-label="t('sessions.addToGoogleCalendar')"
                />
                <UButton
                  :to="outlookCalendarUrl(session)"
                  external
                  target="_blank"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-calendar-days"
                  :aria-label="t('sessions.addToOutlookCalendar')"
                />
                <UButton
                  :to="`/api/student/sessions/${session.id}/calendar`"
                  external
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-calendar-plus"
                >
                  {{ t('sessions.addToCalendar') }}
                </UButton>
                <UButton
                  size="xs"
                  color="error"
                  variant="ghost"
                  :loading="changingSession === session.id"
                  @click="cancelSession(session)"
                >
                  {{ t('common.cancel') }}
                </UButton>
              </div>
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
        :description="t('sessions.noSessionsDescription')"
      />
      <UButton
        v-if="!upcomingSessions.length"
        to="/enrollments"
        variant="soft"
        icon="i-lucide-calendar-plus"
      >
        {{ t('sessions.chooseEnrollment') }}
      </UButton>
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

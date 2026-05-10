<script setup lang="ts">
import { format, addDays, isSameDay, parseISO } from 'date-fns'

const { t } = useI18n()

definePageMeta({ authorize: ['TEACHER', 'ADMIN'] })

useSeoMeta({ title: `${t('teacher.sessions')} · ${t('app.title')}` })

const selectedDate = ref(new Date().toISOString().split('T')[0])

const { data, refresh } = await useFetch('/api/teacher/sessions', {
  query: computed(() => ({ date: selectedDate.value })),
  watch: [selectedDate]
})

const sessionCount = computed(() => data.value?.sessions?.length ?? 0)

function formatTime(dateStr: string) {
  return format(parseISO(dateStr), 'h:mm a')
}

function formatDateLabel(dateStr: string | undefined) {
  if (!dateStr) return ''
  const d = parseISO(dateStr)
  if (isSameDay(d, new Date())) return t('common.today')
  if (isSameDay(d, addDays(new Date(), 1))) return t('common.tomorrow')
  return format(d, 'EEE, MMM d')
}

const updatingId = ref<number | null>(null)

async function updateStatus(sessionId: number, status: string) {
  updatingId.value = sessionId
  try {
    await $fetch(`/api/teacher/sessions/${sessionId}`, {
      method: 'PATCH',
      body: { status }
    })
    await refresh()
  } finally {
    updatingId.value = null
  }
}

const statusColor = (status: string) => {
  switch (status) {
    case 'SCHEDULED': return 'primary'
    case 'COMPLETED': return 'success'
    case 'CANCELLED': return 'error'
    case 'NO_SHOW': return 'warning'
    default: return 'neutral'
  }
}
</script>

<template>
  <div>
    <AdminPageHeader :title="t('teacher.sessions')" :description="`${sessionCount} ${t('sessions.sessionCount')}`" />

    <div class="flex items-center gap-4 mb-6">
      <UButton
        variant="soft"
        size="sm"
        @click="selectedDate = new Date().toISOString().split('T')[0]"
      >
        {{ t('common.today') }}
      </UButton>
      <UButton
        variant="soft"
        size="sm"
        @click="selectedDate = new Date(Date.now() + 86400000).toISOString().split('T')[0]"
      >
        {{ t('common.tomorrow') }}
      </UButton>
      <UInput
        v-model="selectedDate"
        type="date"
        size="md"
        class="w-44"
      />
      <span class="text-sm text-muted-foreground ml-auto">
        {{ formatDateLabel(selectedDate) }}
      </span>
    </div>

    <div v-if="!data?.sessions?.length" class="text-center py-12 text-muted-foreground">
      {{ t('sessions.noSessions') }}
    </div>

    <div v-else class="relative space-y-4">
      <!-- Timeline line -->
      <div class="absolute left-4 top-2 bottom-2 w-px bg-neutral-200" />

      <div
        v-for="session in data.sessions"
        :key="session.id"
        class="relative pl-10"
      >
        <!-- Dot -->
        <div class="absolute left-2.5 top-3 w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />

        <UCard class="shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-lg">{{ formatTime(session.scheduledAt) }}</span>
                <UBadge
                  :color="statusColor(session.status)"
                  variant="soft"
                  size="sm"
                >
                  {{ t(`enrollments.status.${session.status}`) }}
                </UBadge>
              </div>
              <div class="text-sm text-muted-foreground">
                {{ session.enrollment.course.name }} · {{ session.enrollment.user.name }}
              </div>
              <div v-if="session.notes" class="text-sm text-muted-foreground mt-1">
                {{ session.notes }}
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <a
                v-if="session.zoomLink"
                :href="session.zoomLink"
                target="_blank"
                class="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <UIcon name="i-lucide-video" />
                Zoom
              </a>

              <UDropdownMenu
                :items="[
                  [{ label: t('sessions.markComplete'), onSelect: () => updateStatus(session.id, 'COMPLETED') }],
                  [{ label: t('sessions.markNoShow'), onSelect: () => updateStatus(session.id, 'NO_SHOW') }],
                  [{ label: t('sessions.markCancelled'), onSelect: () => updateStatus(session.id, 'CANCELLED') }]
                ]"
              >
                <UButton
                  size="xs"
                  variant="ghost"
                  icon="i-lucide-more-vertical"
                  :loading="updatingId === session.id"
                />
              </UDropdownMenu>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { updateEnrollmentSchema } from '~~/shared/schemas'
import { format, parseISO, isPast } from 'date-fns'

const { t } = useI18n()
const route = useRoute()
const id = Number(route.params.id)

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('admin.enrollments.title')} · ${t('nav.admin')} · ${t('app.title')}` })

const { data, refresh } = await useFetch(`/api/admin/enrollments/${id}`)
const enrollment = computed(() => data.value?.enrollment)

const statusOptions = [
  { value: 'PENDING', label: t('enrollments.status.PENDING') },
  { value: 'ACTIVE', label: t('enrollments.status.ACTIVE') },
  { value: 'COMPLETED', label: t('enrollments.status.COMPLETED') },
  { value: 'CANCELLED', label: t('enrollments.status.CANCELLED') }
]

const state = reactive({
  status: 'PENDING' as 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
})

watchEffect(() => {
  if (enrollment.value) {
    state.status = enrollment.value.status
  }
})

const saving = ref(false)
const errorMessage = ref<string | null>(null)
const formatZodErrors = useZodErrorFormatter()

async function onSubmit() {
  errorMessage.value = null
  saving.value = true
  try {
    await $fetch(`/api/admin/enrollments/${id}`, {
      method: 'PATCH',
      body: { status: state.status }
    })
    await refresh()
    await navigateTo('/admin/enrollments')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      errorMessage.value = formatZodErrors(e.data.issues as any)
    } else {
      errorMessage.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    saving.value = false
  }
}

// ── Sessions ───────────────────────────────────────────────────────
const showAddSession = ref(false)
const sessionForm = reactive({
  scheduledAt: '',
  zoomLink: '',
  notes: ''
})
const addingSession = ref(false)
const sessionError = ref<string | null>(null)
const deletingSession = ref<number | null>(null)

const sessions = computed(() => enrollment.value?.sessions ?? [])
const upcomingSessions = computed(() =>
  sessions.value.filter((s: any) => !isPast(parseISO(s.scheduledAt)) || s.status === 'SCHEDULED')
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
)
const pastSessions = computed(() =>
  sessions.value.filter((s: any) => isPast(parseISO(s.scheduledAt)) && s.status !== 'SCHEDULED')
    .sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
)

const sessionProgress = computed(() => {
  const total = enrollment.value?.course.totalSessions ?? 0
  const booked = sessions.value.filter((s: any) => s.status !== 'CANCELLED').length
  return { total, booked, remaining: Math.max(0, total - booked) }
})

function formatSessionTime(dateStr: string) {
  return format(parseISO(dateStr), 'MMM d, yyyy · h:mm a')
}

async function addSession() {
  sessionError.value = null
  addingSession.value = true
  try {
    await $fetch(`/api/admin/enrollments/${id}/sessions`, {
      method: 'POST',
      body: {
        scheduledAt: sessionForm.scheduledAt,
        zoomLink: sessionForm.zoomLink || undefined,
        notes: sessionForm.notes || undefined
      }
    })
    sessionForm.scheduledAt = ''
    sessionForm.zoomLink = ''
    sessionForm.notes = ''
    showAddSession.value = false
    await refresh()
  } catch (err: any) {
    sessionError.value = err.data?.message || err.message || 'Failed to create session'
  } finally {
    addingSession.value = false
  }
}

async function deleteSession(sessionId: number) {
  if (!confirm(t('common.delete') + '?')) return
  deletingSession.value = sessionId
  try {
    await $fetch(`/api/admin/enrollments/${id}/sessions/${sessionId}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deletingSession.value = null
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
  <UContainer class="py-8">
    <div class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-6">
          <!-- Edit form -->
          <UCard>
            <template #header>
              <h2 class="text-lg font-semibold">{{ t('common.edit') }}</h2>
            </template>

            <UForm :state="state" class="space-y-4" @submit="onSubmit">
              <UFormField :label="t('fields.status')" name="status">
                <USelect v-model="state.status" :items="statusOptions" size="xl" class="w-full" />
              </UFormField>

              <UAlert
                v-if="errorMessage"
                color="error"
                variant="soft"
                icon="i-lucide-alert-circle"
                :title="errorMessage"
              />

              <div class="flex gap-2">
                <UButton type="submit" color="primary" size="xl" :loading="saving" :disabled="saving">
                  {{ t('common.save') }}
                </UButton>
                <UButton to="/admin/enrollments" variant="ghost" color="neutral" size="xl">
                  {{ t('common.cancel') }}
                </UButton>
              </div>
            </UForm>
          </UCard>

          <!-- Sessions -->
          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-semibold">{{ t('sessions.title') }}</h2>
                  <UBadge v-if="sessionProgress.remaining > 0" color="primary" variant="soft" size="sm">
                    {{ sessionProgress.booked }} / {{ sessionProgress.total }}
                  </UBadge>
                </div>
                <UButton
                  v-if="sessionProgress.remaining > 0"
                  size="sm"
                  variant="soft"
                  color="primary"
                  icon="i-lucide-plus"
                  @click="showAddSession = !showAddSession"
                >
                  {{ t('common.add') }}
                </UButton>
              </div>
            </template>

            <!-- Add session form -->
            <div v-if="showAddSession" class="mb-4 p-4 bg-neutral-50/50 rounded-lg space-y-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <UFormField :label="t('fields.scheduledAt')" required>
                  <UInput
                    v-model="sessionForm.scheduledAt"
                    type="datetime-local"
                    size="xl"
                    class="w-full"
                  />
                </UFormField>
                <UFormField :label="t('fields.zoomLink')">
                  <UInput
                    v-model="sessionForm.zoomLink"
                    size="xl"
                    class="w-full"
                    :placeholder="t('fields.zoomLink')"
                  />
                </UFormField>
              </div>
              <UFormField :label="t('fields.notes')">
                <UTextarea
                  v-model="sessionForm.notes"
                  size="xl"
                  class="w-full"
                  :placeholder="t('fields.notes')"
                  :rows="2"
                />
              </UFormField>
              <UAlert
                v-if="sessionError"
                color="error"
                variant="soft"
                icon="i-lucide-alert-circle"
                :title="sessionError"
                size="sm"
              />
              <div class="flex gap-2">
                <UButton
                  size="sm"
                  color="primary"
                  :loading="addingSession"
                  :disabled="addingSession || !sessionForm.scheduledAt"
                  @click="addSession"
                >
                  {{ t('common.save') }}
                </UButton>
                <UButton
                  size="sm"
                  variant="ghost"
                  color="neutral"
                  @click="showAddSession = false"
                >
                  {{ t('common.cancel') }}
                </UButton>
              </div>
            </div>

            <!-- Session list -->
            <div v-if="upcomingSessions.length || pastSessions.length" class="space-y-4">
              <div v-if="upcomingSessions.length" class="space-y-2">
                <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {{ t('sessions.upcoming') }}
                </div>
                <div
                  v-for="session in upcomingSessions"
                  :key="session.id"
                  class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-neutral-50/60 transition-colors group"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-2 h-2 rounded-full shrink-0" :class="statusColor(session.status) === 'primary' ? 'bg-primary' : 'bg-success'" />
                    <div class="min-w-0">
                      <div class="text-sm font-medium">{{ formatSessionTime(session.scheduledAt) }}</div>
                      <div v-if="session.zoomLink" class="text-xs">
                        <a :href="session.zoomLink" target="_blank" class="text-primary hover:underline">Zoom</a>
                      </div>
                      <div v-if="session.notes" class="text-xs text-muted-foreground truncate">{{ session.notes }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <UBadge
                      :label="t(`enrollments.status.${session.status}`)"
                      :color="statusColor(session.status)"
                      variant="soft"
                      size="xs"
                    />
                    <UButton
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      icon="i-lucide-trash"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                      :loading="deletingSession === session.id"
                      @click="deleteSession(session.id)"
                    />
                  </div>
                </div>
              </div>

              <div v-if="pastSessions.length" class="space-y-2 pt-2 border-t">
                <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {{ t('sessions.past') }}
                </div>
                <div
                  v-for="session in pastSessions"
                  :key="session.id"
                  class="flex items-center justify-between py-2 px-3 rounded-lg opacity-60"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-neutral-300 shrink-0" />
                    <div class="text-sm">{{ formatSessionTime(session.scheduledAt) }}</div>
                  </div>
                  <UBadge
                    :label="t(`enrollments.status.${session.status}`)"
                    :color="statusColor(session.status)"
                    variant="soft"
                    size="xs"
                  />
                </div>
              </div>
            </div>

            <div v-else class="text-center py-8 text-muted-foreground text-sm">
              {{ t('sessions.noSessions') }}
            </div>
          </UCard>
        </div>

        <!-- Sidebar info -->
        <div class="space-y-4">
          <UCard>
            <template #header>
              <h3 class="font-semibold">{{ t('fields.student') }}</h3>
            </template>
            <p class="font-medium">{{ enrollment?.user.name }}</p>
            <p class="text-sm text-muted-foreground">{{ enrollment?.user.email }}</p>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-semibold">{{ t('fields.course') }}</h3>
            </template>
            <p class="font-medium">{{ enrollment?.course.name }}</p>
            <p class="text-sm text-muted-foreground">{{ t('fields.totalSessions') }}: {{ enrollment?.course.totalSessions }}</p>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-semibold">{{ t('fields.enrolledAt') }}</h3>
            </template>
            <p>{{ enrollment?.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '-' }}</p>
          </UCard>

          <UCard v-if="enrollment?.amountCents">
            <template #header>
              <h3 class="font-semibold">{{ t('fields.paymentStatus') }}</h3>
            </template>
            <p class="font-medium">{{ enrollment.paymentStatus ?? '-' }}</p>
            <p class="text-sm text-muted-foreground">{{ enrollment.amountCents / 100 }} {{ enrollment.currency }}</p>
          </UCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>

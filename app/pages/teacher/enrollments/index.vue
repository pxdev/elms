<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { format, parseISO, isPast } from 'date-fns'

const { t } = useI18n()

definePageMeta({ authorize: ['TEACHER'] })

useSeoMeta({ title: `${t('nav.enrollments')} · ${t('app.title')}` })

const { data } = await useFetch('/api/teacher/enrollments')

const page = ref(1)
const pageSize = ref(10)
const search = ref('')

const statusClass = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'bg-green-50 text-green-700'
    case 'PENDING': return 'bg-amber-50 text-amber-700'
    case 'COMPLETED': return 'bg-blue-50 text-blue-700'
    case 'CANCELLED': return 'bg-red-50 text-red-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const filtered = computed(() => {
  if (!search.value) return data.value?.enrollments ?? []
  const q = search.value.toLowerCase()
  return (data.value?.enrollments ?? []).filter((e: any) =>
    e.user.name?.toLowerCase().includes(q) ||
    e.user.email?.toLowerCase().includes(q) ||
    e.course.name?.toLowerCase().includes(q)
  )
})

// ── Session modal ──────────────────────────────────────────────────
const sessionModalOpen = ref(false)
const selectedEnrollment = ref<any>(null)

function openSessionModal(enrollment: any) {
  selectedEnrollment.value = enrollment
  sessionModalOpen.value = true
}

const modalUpcomingSessions = computed(() => {
  if (!selectedEnrollment.value) return []
  return (selectedEnrollment.value.sessions ?? [])
    .filter((s: any) => !isPast(parseISO(s.scheduledAt)) || s.status === 'SCHEDULED')
    .sort((a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
})

const modalPastSessions = computed(() => {
  if (!selectedEnrollment.value) return []
  return (selectedEnrollment.value.sessions ?? [])
    .filter((s: any) => isPast(parseISO(s.scheduledAt)) && s.status !== 'SCHEDULED')
    .sort((a: any, b: any) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime())
})

function formatSessionTime(dateStr: string) {
  return format(parseISO(dateStr), 'MMM d, yyyy · h:mm a')
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

const columns = computed<TableColumn<any>[]>(() => [
  {
    accessorKey: 'user.name',
    header: t('fields.student'),
    cell: ({ row }) => h('div', {}, [
      h('div', {}, row.original.user.name),
      h('div', { class: 'text-xs text-muted-foreground' }, row.original.user.email)
    ])
  },
  {
    accessorKey: 'course.name',
    header: t('fields.course'),
    cell: ({ row }) => h('span', {}, row.original.course.name)
  },
  {
    accessorKey: 'status',
    header: t('fields.status'),
    cell: ({ row }) => h('span', { class: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(row.getValue('status'))}` }, t(`enrollments.status.${row.getValue('status')}`))
  },
  {
    accessorKey: 'sessions',
    header: t('fields.sessions'),
    cell: ({ row }) => {
      const total = row.original.course.totalSessions ?? 0
      const booked = (row.original.sessions ?? []).filter((s: any) => s.status !== 'CANCELLED').length
      return h('span', {}, `${booked} / ${total}`)
    }
  },
  {
    accessorKey: 'enrolledAt',
    header: t('fields.enrolledAt'),
    cell: ({ row }) => h('span', {}, new Date(row.getValue('enrolledAt')).toLocaleDateString())
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => {
      const Btn = resolveComponent('UButton') as any
      return h(Btn, { size: 'xs', color: 'neutral', variant: 'ghost', icon: 'i-lucide-eye', onClick: () => openSessionModal(row.original) })
    }
  }
])
</script>

<template>
  <div>


    <UCard>
      <div class="flex items-center gap-2 mb-4">
        <UInput v-model="search" :placeholder="t('fields.name')" icon="i-lucide-search" class="max-w-xs" size="xl" />
      </div>

      <AdminDataTable v-model:page="page" v-model:page-size="pageSize" :data="filtered" :columns="columns" />
    </UCard>

    <!-- Session detail modal -->
    <UModal v-model:open="sessionModalOpen" :title="selectedEnrollment?.user?.name"
    >
      <template #body>
        <div class="space-y-1 mb-4">
          <p class="text-sm text-muted-foreground">{{ selectedEnrollment?.user?.email }}</p>
          <p class="text-sm font-medium">{{ selectedEnrollment?.course?.name }}</p>
        </div>

        <div class="max-h-[50vh] overflow-auto space-y-4">
          <div v-if="!modalUpcomingSessions.length && !modalPastSessions.length" class="text-center py-8 text-muted-foreground text-sm">
            {{ t('sessions.noSessions') }}
          </div>

          <div v-if="modalUpcomingSessions.length" class="space-y-2">
            <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {{ t('sessions.upcoming') }}
            </div>
            <div
              v-for="session in modalUpcomingSessions"
              :key="session.id"
              class="flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-50/50"
            >
              <div class="min-w-0">
                <div class="text-sm font-medium">{{ formatSessionTime(session.scheduledAt) }}</div>
                <div v-if="session.zoomLink" class="text-xs">
                  <a :href="session.zoomLink" target="_blank" class="text-primary hover:underline">Zoom</a>
                </div>
              </div>
              <UBadge
                :label="t(`enrollments.status.${session.status}`)"
                :color="statusColor(session.status)"
                variant="soft"
                size="xs"
              />
            </div>
          </div>

          <div v-if="modalPastSessions.length" class="space-y-2 pt-2 border-t">
            <div class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {{ t('sessions.past') }}
            </div>
            <div
              v-for="session in modalPastSessions"
              :key="session.id"
              class="flex items-center justify-between py-2 px-3 rounded-lg opacity-60"
            >
              <div class="text-sm">{{ formatSessionTime(session.scheduledAt) }}</div>
              <UBadge
                :label="t(`enrollments.status.${session.status}`)"
                :color="statusColor(session.status)"
                variant="soft"
                size="xs"
              />
            </div>
          </div>
        </div>
      </template>
    </UModal>
  </div>
</template>

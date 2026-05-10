<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

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
  </div>
</template>

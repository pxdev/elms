<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('admin.enrollments.title')} · ${t('nav.admin')} · ${t('app.title')}` })

const { data } = await useFetch('/api/admin/enrollments')

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
    e.courseVariant.course.name?.toLowerCase().includes(q) ||
    e.courseVariant.name?.toLowerCase().includes(q)
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
    accessorKey: 'courseVariant.course.name',
    header: t('fields.course'),
    cell: ({ row }) => h('span', {}, row.original.courseVariant.course.name)
  },
  {
    accessorKey: 'courseVariant.name',
    header: t('fields.variant'),
    cell: ({ row }) => h('span', {}, row.original.courseVariant.name)
  },
  {
    accessorKey: 'status',
    header: t('fields.status'),
    cell: ({ row }) => {
      const Badge = resolveComponent('UBadge') as any
      return h(Badge, {
        label: t(`enrollments.status.${row.getValue('status')}`),
        color: row.getValue('status') === 'ACTIVE' ? 'success' : row.getValue('status') === 'PENDING' ? 'warning' : row.getValue('status') === 'COMPLETED' ? 'primary' : 'error',
        variant: 'subtle',
        size: 'sm'
      })
    }
  },
  {
    accessorKey: 'enrolledAt',
    header: t('fields.enrolledAt'),
    cell: ({ row }) => h('span', {}, new Date(row.getValue('enrolledAt')).toLocaleDateString())
  },
  {
    id: 'actions',
    header: t('common.actions'),
    cell: ({ row }) => {
      const Btn = resolveComponent('UButton') as any
      return h('div', { class: 'flex gap-1' }, [
        h(Btn, { size: 'xs', color: 'neutral', variant: 'ghost', icon: 'i-lucide-pencil', to: `/admin/enrollments/${row.original.id}/edit` })
      ])
    }
  }
])
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <AdminPageHeader :title="t('admin.enrollments.title')" :description="t('admin.enrollments.description')" />

      <UCard class="border-accented">
        <div class="flex items-center gap-2 mb-4">
          <UInput v-model="search" :placeholder="t('fields.name')" icon="i-lucide-search" size="xl" class="max-w-xs" />
        </div>

        <AdminDataTable v-model:page="page" v-model:page-size="pageSize" :data="filtered" :columns="columns" />
      </UCard>
    </div>
  </UContainer>
</template>

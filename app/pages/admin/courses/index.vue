<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('admin.courses.title')} · ${t('nav.admin')} · ${t('app.title')}` })

const { data, refresh } = await useFetch('/api/admin/courses')

const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const deleting = ref<number | null>(null)

const filtered = computed(() => {
  if (!search.value) return data.value?.courses ?? []
  const q = search.value.toLowerCase()
  return (data.value?.courses ?? []).filter(c =>
    c.name.toLowerCase().includes(q) ||
    (c.teacher?.name?.toLowerCase() ?? '').includes(q)
  )
})

async function onDelete(id: number) {
  if (!confirm(t('admin.courses.confirmDelete'))) return
  deleting.value = id
  try {
    await $fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deleting.value = null
  }
}

const columns = computed<TableColumn<any>[]>(() => [
  { accessorKey: 'name', header: t('fields.name') },
  { accessorKey: 'teacher.name', header: t('fields.teacher'), cell: ({ row }) => h('span', {}, row.original.teacher?.name ?? '-') },
  { accessorKey: 'price', header: t('fields.price'), cell: ({ row }) => h('span', {}, row.original.price != null ? `$${Number(row.original.price).toFixed(2)}` : '-') },
  { accessorKey: 'totalSessions', header: t('fields.totalSessions') },
  { accessorKey: 'isActive', header: t('fields.status'), cell: ({ row }) => {
    const Badge = resolveComponent('UBadge') as any
    return h(Badge, { label: row.getValue('isActive') ? t('common.active') : t('common.inactive'), color: row.getValue('isActive') ? 'success' : 'neutral', variant: 'subtle', size: 'sm' })
  } },
  {
    id: 'actions',
    header: t('common.actions'),
    cell: ({ row }) => {
      const Btn = resolveComponent('UButton') as any
      return h('div', { class: 'flex gap-1' }, [
        h(Btn, { size: 'xs', color: 'neutral', variant: 'ghost', icon: 'i-lucide-pencil', to: `/admin/courses/${row.original.id}/edit` }),
        h(Btn, { size: 'xs', color: 'neutral', variant: 'ghost', icon: 'i-lucide-paperclip', to: `/admin/courses/${row.original.id}/materials` }),
        h(Btn, { size: 'xs', color: 'error', variant: 'ghost', icon: 'i-lucide-trash', loading: deleting.value === row.original.id, onClick: () => onDelete(row.original.id) })
      ])
    }
  }
])
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <AdminPageHeader :title="t('admin.courses.title')" :description="t('admin.courses.description')" :create-label="t('admin.courses.create')" create-to="/admin/courses/new" />

      <UCard>
        <div class="flex items-center gap-2 mb-4">
          <UInput v-model="search" :placeholder="t('fields.name')" icon="i-lucide-search" size="xl" class="max-w-xs" />
        </div>

        <AdminDataTable v-model:page="page" v-model:page-size="pageSize" :data="filtered" :columns="columns" />
      </UCard>
    </div>
  </UContainer>
</template>

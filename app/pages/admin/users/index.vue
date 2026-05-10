<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `Users · ${t('nav.admin')} · ${t('app.title')}` })

const { data, refresh } = await useFetch('/api/admin/users')

const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const deleting = ref<number | null>(null)

const filtered = computed(() => {
  if (!search.value) return data.value?.users ?? []
  const q = search.value.toLowerCase()
  return (data.value?.users ?? []).filter(u =>
    u.email.toLowerCase().includes(q) ||
    (u.name?.toLowerCase() ?? '').includes(q)
  )
})

async function onDelete(id: number) {
  if (!confirm('Are you sure you want to delete this user?')) return
  deleting.value = id
  try {
    await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deleting.value = null
  }
}

const columns = computed<TableColumn<any>[]>(() => [
  { accessorKey: 'name', header: t('fields.name') },
  { accessorKey: 'email', header: t('fields.email') },
  { accessorKey: 'role', header: t('fields.role'), cell: ({ row }) => h('span', {}, t(`roles.${row.getValue('role')}`)) },
  { accessorKey: 'isAvailableForBooking', header: t('fields.isAvailableForBooking'), cell: ({ row }) => {
    const Badge = resolveComponent('UBadge') as any
    const val = row.getValue('isAvailableForBooking')
    return h(Badge, { label: val ? t('common.yes') : t('common.no'), color: val ? 'success' : 'neutral', variant: 'subtle', size: 'sm' })
  } },
  { accessorKey: 'emailVerified', header: t('fields.emailVerified'), cell: ({ row }) => {
    const Badge = resolveComponent('UBadge') as any
    return h(Badge, { label: row.getValue('emailVerified') ? t('common.yes') : t('common.no'), color: row.getValue('emailVerified') ? 'success' : 'neutral', variant: 'subtle', size: 'sm' })
  } },
  {
    id: 'actions',
    header: t('common.actions'),
    cell: ({ row }) => {
      const Btn = resolveComponent('UButton') as any
      return h('div', { class: 'flex gap-1' }, [
        h(Btn, { size: 'xs', color: 'neutral', variant: 'ghost', icon: 'i-lucide-pencil', to: `/admin/users/${row.original.id}/edit` }),
        h(Btn, { size: 'xs', color: 'error', variant: 'ghost', icon: 'i-lucide-trash', loading: deleting.value === row.original.id, onClick: () => onDelete(row.original.id) })
      ])
    }
  }
])
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <AdminPageHeader :title="t('fields.name')" description="Manage system users and their roles" create-label="Add User" create-to="/admin/users/new" />

      <UCard>
        <div class="flex items-center gap-2 mb-4">
          <UInput v-model="search" placeholder="Search users..." icon="i-lucide-search" size="xl" class="max-w-xs" />
        </div>

        <AdminDataTable v-model:page="page" v-model:page-size="pageSize" :data="filtered" :columns="columns" />
      </UCard>
    </div>
  </UContainer>
</template>

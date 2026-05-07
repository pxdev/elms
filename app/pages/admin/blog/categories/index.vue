<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('blog.categories')} · ${t('nav.admin')} · ${t('app.title')}` })

const { data, refresh } = await useFetch('/api/admin/blog/categories')

const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const deleting = ref<number | null>(null)

const filtered = computed(() => {
  if (!search.value) return data.value?.categories ?? []
  const q = search.value.toLowerCase()
  return (data.value?.categories ?? []).filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.slug.toLowerCase().includes(q)
  )
})

async function onDelete(id: number) {
  if (!confirm(t('blog.confirmDeleteCategory'))) return
  deleting.value = id
  try {
    await $fetch(`/api/admin/blog/categories/${id}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deleting.value = null
  }
}

const columns = computed<TableColumn<any>[]>(() => [
  { accessorKey: 'name', header: t('fields.name') },
  { accessorKey: 'slug', header: t('fields.slug') },
  { accessorKey: '_count.posts', header: t('fields.posts'), cell: ({ row }) => h('span', {}, row.original._count?.posts ?? 0) },
  {
    id: 'actions',
    header: t('common.actions'),
    cell: ({ row }) => {
      const Btn = resolveComponent('UButton') as any
      return h('div', { class: 'flex gap-1' }, [
        h(Btn, { size: 'xs', color: 'neutral', variant: 'ghost', icon: 'i-lucide-pencil', to: `/admin/blog/categories/${row.original.id}/edit` }),
        h(Btn, { size: 'xs', color: 'error', variant: 'ghost', icon: 'i-lucide-trash', loading: deleting.value === row.original.id, onClick: () => onDelete(row.original.id) })
      ])
    }
  }
])
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <AdminPageHeader :title="t('blog.categories')" :description="t('blog.manageCategories')" :create-label="t('common.add')" create-to="/admin/blog/categories/new" />

      <UCard class="border-accented">
        <div class="flex items-center gap-2 mb-4">
          <UInput v-model="search" :placeholder="t('fields.name')" icon="i-lucide-search" size="xl" class="max-w-xs" />
        </div>

        <AdminDataTable v-model:page="page" v-model:page-size="pageSize" :data="filtered" :columns="columns" />
      </UCard>
    </div>
  </UContainer>
</template>

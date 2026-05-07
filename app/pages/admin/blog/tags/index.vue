<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('blog.tags')} · ${t('nav.admin')} · ${t('app.title')}` })

const { data, refresh } = await useFetch('/api/admin/blog/tags')

const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const deleting = ref<number | null>(null)

const filtered = computed(() => {
  if (!search.value) return data.value?.tags ?? []
  const q = search.value.toLowerCase()
  return (data.value?.tags ?? []).filter(tg =>
    tg.name.toLowerCase().includes(q) ||
    tg.slug.toLowerCase().includes(q)
  )
})

async function onDelete(id: number) {
  if (!confirm(t('blog.confirmDeleteTag'))) return
  deleting.value = id
  try {
    await $fetch(`/api/admin/blog/tags/${id}`, { method: 'DELETE' })
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
        h(Btn, { size: 'xs', color: 'neutral', variant: 'ghost', icon: 'i-lucide-pencil', to: `/admin/blog/tags/${row.original.id}/edit` }),
        h(Btn, { size: 'xs', color: 'error', variant: 'ghost', icon: 'i-lucide-trash', loading: deleting.value === row.original.id, onClick: () => onDelete(row.original.id) })
      ])
    }
  }
])
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <AdminPageHeader :title="t('blog.tags')" :description="t('blog.manageTags')" :create-label="t('common.add')" create-to="/admin/blog/tags/new" />

      <UCard class="border-accented">
        <div class="flex items-center gap-2 mb-4">
          <UInput v-model="search" :placeholder="t('fields.name')" icon="i-lucide-search" size="xl" class="max-w-xs" />
        </div>

        <AdminDataTable v-model:page="page" v-model:page-size="pageSize" :data="filtered" :columns="columns" />
      </UCard>
    </div>
  </UContainer>
</template>

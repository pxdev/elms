<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('blog.posts')} · ${t('nav.admin')} · ${t('app.title')}` })

const { data, refresh } = await useFetch('/api/admin/blog/posts')

const page = ref(1)
const pageSize = ref(10)
const search = ref('')
const deleting = ref<number | null>(null)

const filtered = computed(() => {
  if (!search.value) return data.value?.posts ?? []
  const q = search.value.toLowerCase()
  return (data.value?.posts ?? []).filter(p =>
    p.title.toLowerCase().includes(q) ||
    (p.author?.name?.toLowerCase() ?? '').includes(q) ||
    (p.category?.name?.toLowerCase() ?? '').includes(q)
  )
})

async function onDelete(id: number) {
  if (!confirm(t('blog.confirmDeletePost'))) return
  deleting.value = id
  try {
    await $fetch(`/api/admin/blog/posts/${id}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deleting.value = null
  }
}

const columns = computed<TableColumn<any>[]>(() => [
  { accessorKey: 'title', header: t('fields.title') },
  { accessorKey: 'author.name', header: t('fields.author'), cell: ({ row }) => h('span', {}, row.original.author?.name ?? '-') },
  { accessorKey: 'category.name', header: t('fields.category'), cell: ({ row }) => h('span', {}, row.original.category?.name ?? '-') },
  { accessorKey: 'published', header: t('fields.published'), cell: ({ row }) => {
    const Badge = resolveComponent('UBadge') as any
    return h(Badge, {
      label: row.getValue('published') ? t('blog.published') : t('blog.draft'),
      color: row.getValue('published') ? 'success' : 'neutral',
      variant: 'subtle',
      size: 'sm'
    })
  } },
  { accessorKey: 'publishedAt', header: t('fields.publishedAt'), cell: ({ row }) => {
    const date = row.getValue('publishedAt') as string | null
    return h('span', {}, date ? new Date(date).toLocaleDateString() : '-')
  } },
  {
    id: 'actions',
    header: t('common.actions'),
    cell: ({ row }) => {
      const Btn = resolveComponent('UButton') as any
      return h('div', { class: 'flex gap-1' }, [
        h(Btn, { size: 'xs', color: 'neutral', variant: 'ghost', icon: 'i-lucide-pencil', to: `/admin/blog/posts/${row.original.id}/edit` }),
        h(Btn, { size: 'xs', color: 'error', variant: 'ghost', icon: 'i-lucide-trash', loading: deleting.value === row.original.id, onClick: () => onDelete(row.original.id) })
      ])
    }
  }
])
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <AdminPageHeader :title="t('blog.posts')" :description="t('blog.managePosts')" :create-label="t('blog.createPost')" create-to="/admin/blog/posts/new" />

      <UCard>
        <div class="flex items-center gap-2 mb-4">
          <UInput v-model="search" :placeholder="t('fields.title')" icon="i-lucide-search" size="xl" class="max-w-xs" />
        </div>

        <AdminDataTable v-model:page="page" v-model:page-size="pageSize" :data="filtered" :columns="columns" />
      </UCard>
    </div>
  </UContainer>
</template>

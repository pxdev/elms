<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'

const { t } = useI18n()

definePageMeta({ authorize: ['TEACHER'] })

useSeoMeta({ title: `${t('nav.courses')} · ${t('app.title')}` })

const { data } = await useFetch('/api/teacher/courses')

const page = ref(1)
const pageSize = ref(10)

const columns = computed<TableColumn<any>[]>(() => [
  { accessorKey: 'name', header: t('fields.name') },
  { accessorKey: 'variants', header: t('fields.variants'), cell: ({ row }) => h('span', {}, row.original.variants?.length ?? 0) },
  { accessorKey: 'isActive', header: t('fields.status'), cell: ({ row }) => h('span', { class: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${row.getValue('isActive') ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'}` }, row.getValue('isActive') ? t('common.active') : t('common.inactive')) }
])
</script>

<template>
  <div>
    <AdminPageHeader :title="t('nav.courses')" />

    <UCard>
      <AdminDataTable v-model:page="page" v-model:page-size="pageSize" :data="data?.courses ?? []" :columns="columns" />
    </UCard>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import type { TableColumn } from '@nuxt/ui'

const props = defineProps<{
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
}>()

const page = defineModel<number>('page', { default: 1 })
const pageSize = defineModel<number>('pageSize', { default: 10 })

const paginatedData = computed(() => {
  const start = (page.value - 1) * pageSize.value
  const end = start + pageSize.value
  return props.data.slice(start, end)
})

const totalPages = computed(() => Math.ceil(props.data.length / pageSize.value))
</script>

<template>
  <div>
    <UTable
      :data="paginatedData"
      :columns="columns"
      :loading="loading"
      class="w-full"
    />

    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 px-2">
      <p class="text-sm text-muted-foreground">
        {{ data.length }} total
      </p>
      <UPagination
        v-model:page="page"
        :items-per-page="pageSize"
        :total="data.length"
        show-edges
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('admin.courses.title')} · ${t('app.title')}` })

const { data, refresh, status } = await useFetch('/api/courses')
const courses = computed(() => data.value?.courses ?? [])

const deleting = ref<number | null>(null)

async function removeCourse(id: number) {
  if (!confirm(t('admin.courses.confirmDelete'))) return
  deleting.value = id
  try {
    await $fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }, message?: string }
    alert(e.data?.message ?? e.message ?? t('errors.generic'))
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">
        {{ t('admin.courses.title') }}
      </h1>
      <div class="flex gap-2">
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-refresh-cw"
          :loading="status === 'pending'"
          @click="() => refresh()"
        >
          {{ t('dashboard.refresh') }}
        </UButton>
        <UButton
          to="/admin/courses/new"
          color="primary"
          icon="i-lucide-plus"
        >
          {{ t('admin.courses.create') }}
        </UButton>
      </div>
    </div>

    <UCard>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2 px-3 font-medium">
              {{ t('fields.name') }}
            </th>
            <th class="text-left py-2 px-3 font-medium">
              {{ t('fields.teacher') }}
            </th>
            <th class="text-left py-2 px-3 font-medium">
              {{ t('fields.variants') }}
            </th>
            <th class="text-left py-2 px-3 font-medium">
              {{ t('fields.status') }}
            </th>
            <th class="text-right py-2 px-3 font-medium">
              {{ t('common.actions') }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="course in courses"
            :key="course.id"
            class="border-b last:border-0"
          >
            <td class="py-2 px-3">
              {{ course.name }}
            </td>
            <td class="py-2 px-3">
              {{ course.teacher?.name ?? '-' }}
            </td>
            <td class="py-2 px-3">
              {{ course.variants?.length ?? 0 }}
            </td>
            <td class="py-2 px-3">
              <UBadge
                :label="course.isActive ? t('common.active') : t('common.inactive')"
                :color="course.isActive ? 'success' : 'neutral'"
                variant="subtle"
                size="sm"
              />
            </td>
            <td class="py-2 px-3 text-right">
              <div class="flex justify-end gap-1">
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-pencil"
                  :to="`/admin/courses/${course.id}/edit`"
                />
                <UButton
                  size="xs"
                  color="error"
                  variant="ghost"
                  icon="i-lucide-trash"
                  :loading="deleting === course.id"
                  @click="removeCourse(course.id)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </UCard>
  </UContainer>
</template>

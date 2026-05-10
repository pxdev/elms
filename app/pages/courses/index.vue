<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({ title: `${t('courses.title')} · ${t('app.title')}` })

const { data, refresh, status } = await useFetch('/api/courses')
const courses = computed(() => data.value?.courses ?? [])
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <div class="flex items-center justify-between">
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
    </div>

    <div
      v-if="courses.length"
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <UCard
        v-for="course in courses"
        :key="course.id"
        class="flex flex-col"
      >
        <div
          v-if="course.imageUrl"
          class="aspect-video -mx-4 -mt-4 mb-4 overflow-hidden rounded-t-lg"
        >
          <img
            :src="course.imageUrl"
            :alt="course.name"
            class="w-full h-full object-cover"
          >
        </div>

        <div class="space-y-2 flex-1">
          <h2 class="font-semibold text-lg">
            {{ course.name }}
          </h2>
          <p
            v-if="course.description"
            class="text-sm text-muted line-clamp-2"
          >
            {{ course.description }}
          </p>

          <div
            v-if="course.teacher"
            class="flex items-center gap-2 text-sm text-muted"
          >
            <UIcon name="i-lucide-user" />
            <span>{{ course.teacher.name ?? course.teacher.email }}</span>
          </div>

          <div class="flex flex-wrap gap-2 pt-2">
            <UBadge
              color="primary"
              variant="subtle"
              size="sm"
            >
              {{ course.totalSessions }} {{ t('fields.sessions') }}
            </UBadge>
            <UBadge
              color="neutral"
              variant="subtle"
              size="sm"
            >
              ${{ course.price }}
            </UBadge>
          </div>
        </div>

        <template #footer>
          <UButton
            :to="`/courses/${course.id}`"
            block
            color="primary"
          >
            {{ t('courses.viewDetails') }}
          </UButton>
        </template>
      </UCard>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-book-open"
      :title="t('courses.empty.title')"
      :description="t('courses.empty.description')"
    />
  </UContainer>
</template>

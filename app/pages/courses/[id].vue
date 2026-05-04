<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { loggedIn } = useUserSession()

const courseId = computed(() => Number(route.params.id))

const { data, status } = await useFetch(() => `/api/courses/${courseId.value}`)
const course = computed(() => data.value?.course)

const enrolling = ref(false)
const enrolled = ref(false)
const enrollError = ref<string | null>(null)

async function enroll(variantId: number) {
  enrollError.value = null
  enrolling.value = true
  try {
    const res = await $fetch<{ url: string }>('/api/payments/checkout', {
      method: 'POST',
      body: { variantId }
    })
    window.location.href = res.url
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }, message?: string }
    enrollError.value = e.data?.message ?? e.message ?? t('errors.generic')
  } finally {
    enrolling.value = false
  }
}

useSeoMeta({
  title: computed(() => course.value ? `${course.value.name} · ${t('app.title')}` : t('app.title'))
})
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <UButton
      to="/courses"
      variant="ghost"
      color="neutral"
      icon="i-lucide-arrow-left"
      class="mb-2"
    >
      {{ t('courses.back') }}
    </UButton>

    <div v-if="course">
      <div
        v-if="course.imageUrl"
        class="aspect-video w-full rounded-lg overflow-hidden mb-6"
      >
        <img
          :src="course.imageUrl"
          :alt="course.name"
          class="w-full h-full object-cover"
        >
      </div>

      <div class="space-y-2 mb-6">
        <h1 class="text-3xl font-bold">
          {{ course.name }}
        </h1>
        <p
          v-if="course.description"
          class="text-muted"
        >
          {{ course.description }}
        </p>
        <div
          v-if="course.teacher"
          class="flex items-center gap-2 text-sm"
        >
          <UIcon name="i-lucide-user" />
          <span>{{ t('courses.teacher') }}: {{ course.teacher.name ?? course.teacher.email }}</span>
        </div>
      </div>

      <UAlert
        v-if="enrolled"
        color="success"
        variant="soft"
        icon="i-lucide-check-circle"
        :title="t('courses.enrolled')"
        class="mb-4"
      />

      <UAlert
        v-if="enrollError"
        color="error"
        variant="soft"
        icon="i-lucide-alert-circle"
        :title="enrollError"
        class="mb-4"
      />

      <h2 class="text-xl font-semibold mb-4">
        {{ t('courses.variants') }}
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard
          v-for="variant in course.variants"
          :key="variant.id"
        >
          <div class="space-y-2">
            <h3 class="font-semibold">
              {{ variant.name }}
            </h3>
            <div class="text-sm text-muted">
              <p>{{ t('courses.sessionsPerMonth', { count: variant.sessionsPerMonth }) }}</p>
            </div>
            <p class="text-2xl font-bold text-primary">
              ${{ variant.price }}
            </p>
          </div>

          <template #footer>
            <UButton
              v-if="loggedIn"
              block
              color="primary"
              :loading="enrolling"
              :disabled="enrolled || enrolling"
              @click="enroll(variant.id)"
            >
              {{ enrolled ? t('courses.enrolled') : t('courses.payAndEnroll') }}
            </UButton>
            <UButton
              v-else
              to="/login"
              block
              color="neutral"
              variant="subtle"
            >
              {{ t('courses.signInToEnroll') }}
            </UButton>
          </template>
        </UCard>
      </div>
    </div>

    <UAlert
      v-else-if="status !== 'pending'"
      color="error"
      variant="soft"
      icon="i-lucide-alert-circle"
      :title="t('courses.notFound')"
    />
  </UContainer>
</template>

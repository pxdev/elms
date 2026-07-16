<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { loggedIn } = useUserSession()

const courseId = computed(() => Number(route.params.id))

const { data, status } = await useFetch(() => `/api/courses/${courseId.value}`)
const course = computed(() => data.value?.course)

const enrolling = ref(false)
const enrolled = computed(() => ['ACTIVE', 'COMPLETED'].includes(data.value?.enrollment?.status ?? ''))
const enrollError = ref<string | null>(null)

// Promo code state
const promoCode = ref('')
const validatingPromo = ref(false)
const promoError = ref<string | null>(null)
const validPromo = ref<{ valid: true; code: string; discountPercent: number; courseName: string | null } | null>(null)

const formatPrice = (value: number | string) => new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD'
}).format(Number(value))
const lines = (value?: string | null) => (value ?? '').split('\n').map(item => item.trim()).filter(Boolean)

async function validatePromo() {
  promoError.value = null
  validPromo.value = null
  if (!promoCode.value.trim()) return

  validatingPromo.value = true
  try {
    const res = await $fetch('/api/promo-codes/validate', {
      method: 'POST',
      body: { code: promoCode.value.trim(), courseId: courseId.value }
    })
    if (res.valid) {
      validPromo.value = res
    } else {
      promoError.value = 'Invalid promo code'
    }
  } catch (err: any) {
    promoError.value = err.statusMessage || err.message || 'Invalid promo code'
  } finally {
    validatingPromo.value = false
  }
}

function discountedPrice(price: number, discountPercent: number): number {
  return Math.round(price * (1 - discountPercent / 100) * 100) / 100
}

async function enroll() {
  enrollError.value = null
  enrolling.value = true
  try {
    const res = await $fetch<{ url: string }>('/api/payments/checkout', {
      method: 'POST',
      body: {
        courseId: courseId.value,
        promoCode: validPromo.value?.code
      }
    })
    window.location.href = res.url
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }, message?: string }
    enrollError.value = e.data?.message ?? e.message ?? t('errors.generic')
  } finally {
    enrolling.value = false
  }
}

function materialIcon(type: string) {
  switch (type) {
    case 'LINK': return 'i-lucide-link'
    case 'VIDEO': return 'i-lucide-video'
    case 'PDF': return 'i-lucide-file-text'
    case 'IMAGE': return 'i-lucide-image'
    case 'ZIP': return 'i-lucide-file-archive'
    case 'AUDIO': return 'i-lucide-headphones'
    case 'DOC': return 'i-lucide-file-word'
    case 'SLIDE': return 'i-lucide-presentation'
    default: return 'i-lucide-file'
  }
}

const expandedLessons = ref<Set<number>>(new Set())

function toggleLesson(lessonId: number) {
  const next = new Set(expandedLessons.value)
  if (next.has(lessonId)) {
    next.delete(lessonId)
  } else {
    next.add(lessonId)
  }
  expandedLessons.value = next
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
      <div class="mb-6">
        <h1 class="text-3xl font-bold tracking-tight">
          {{ course.name }}
        </h1>
      </div>
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

      <div
        v-if="course.outcomes || course.prerequisites || course.targetAudience"
        class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
      >
        <UCard v-if="course.outcomes">
          <h2 class="font-semibold mb-3">{{ t('courses.outcomes') }}</h2>
          <ul class="space-y-2 text-sm">
            <li v-for="item in lines(course.outcomes)" :key="item" class="flex gap-2">
              <UIcon name="i-lucide-circle-check" class="text-success mt-0.5 shrink-0" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </UCard>
        <UCard v-if="course.targetAudience">
          <h2 class="font-semibold mb-3">{{ t('courses.targetAudience') }}</h2>
          <p class="text-sm text-muted">{{ course.targetAudience }}</p>
        </UCard>
        <UCard v-if="course.prerequisites">
          <h2 class="font-semibold mb-3">{{ t('courses.prerequisites') }}</h2>
          <p class="text-sm text-muted">{{ course.prerequisites }}</p>
        </UCard>
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
        v-if="data?.enrollment?.status === 'PENDING'"
        color="warning"
        variant="soft"
        icon="i-lucide-clock-3"
        :title="t('courses.paymentPending')"
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

      <UCard v-if="!enrolled" class="mb-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold">
                {{ t('courses.enrollNow') }}
              </h2>
              <p class="text-sm text-muted">
                {{ course.totalSessions }} {{ t('fields.sessions') }}
              </p>
            </div>
            <div class="text-right">
              <p v-if="validPromo" class="text-2xl font-bold text-primary">
                {{ formatPrice(discountedPrice(Number(course.price), validPromo.discountPercent)) }}
              </p>
              <p v-else class="text-2xl font-bold text-primary">
                {{ formatPrice(course.price) }}
              </p>
              <p v-if="validPromo" class="text-sm text-muted line-through">
                {{ formatPrice(course.price) }}
              </p>
            </div>
          </div>

          <div class="flex gap-2">
            <UInput
              v-model="promoCode"
              placeholder="Promo code"
              class="flex-1"
              size="xl"
            />
            <UButton
              size="xl"
              variant="soft"
              color="neutral"
              :loading="validatingPromo"
              @click="validatePromo"
            >
              Apply
            </UButton>
          </div>
          <UAlert
            v-if="promoError"
            color="error"
            variant="soft"
            icon="i-lucide-alert-circle"
            :title="promoError"
            size="sm"
          />
          <UAlert
            v-if="validPromo"
            color="success"
            variant="soft"
            icon="i-lucide-check-circle"
            :title="`${validPromo.discountPercent}% off applied`"
            size="sm"
          />

          <UButton
            v-if="loggedIn"
            block
            color="primary"
            size="xl"
            :loading="enrolling"
            :disabled="enrolled || enrolling"
            @click="enroll"
          >
            {{ enrolled ? t('courses.enrolled') : t('courses.payAndEnroll') }}
          </UButton>
          <div v-if="course.refundPolicy" class="flex gap-2 text-sm text-muted">
            <UIcon name="i-lucide-shield-check" class="text-success mt-0.5 shrink-0" />
            <span>{{ course.refundPolicy }}</span>
          </div>
          <UButton
            v-else
            :to="{ path: '/login', query: { redirect: route.fullPath } }"
            block
            color="neutral"
            variant="subtle"
            size="xl"
          >
            {{ t('courses.signInToEnroll') }}
          </UButton>
        </div>
      </UCard>

      <!-- Course Curriculum -->
      <div v-if="course.lessons?.length" class="space-y-4">
        <h2 class="text-xl font-semibold">
          {{ t('lessons.curriculum') }}
        </h2>
        <div class="border rounded-lg divide-y divide-neutral-100 overflow-hidden">
          <div
            v-for="(lesson, idx) in course.lessons"
            :key="lesson.id"
          >
            <button
              class="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors text-start"
              :aria-expanded="expandedLessons.has(lesson.id)"
              :aria-controls="`lesson-${lesson.id}`"
              @click="toggleLesson(lesson.id)"
            >
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                {{ idx + 1 }}
              </div>
              <span class="font-medium flex-1">{{ lesson.name }}</span>
              <UIcon
                :name="expandedLessons.has(lesson.id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="text-muted-foreground"
              />
            </button>
            <div
              :id="`lesson-${lesson.id}`"
              v-show="expandedLessons.has(lesson.id)"
              class="px-4 pb-4 space-y-2"
            >
              <p v-if="lesson.description" class="text-sm text-muted-foreground px-11">
                {{ lesson.description }}
              </p>
              <div v-if="lesson.materials?.length" class="space-y-2 px-11">
                <div
                  v-for="material in lesson.materials"
                  :key="material.id"
                  class="flex items-center gap-3 p-3 rounded-lg border border-neutral-100 hover:border-primary/30 transition-colors"
                >
                  <UIcon :name="materialIcon(material.type)" class="text-lg text-primary" />
                  <div class="flex-1 min-w-0">
                    <a
                      v-if="material.url"
                      :href="material.url"
                      target="_blank"
                      class="font-medium text-sm hover:underline block truncate"
                    >
                      {{ material.title }}
                    </a>
                    <p v-else class="font-medium text-sm truncate">{{ material.title }}</p>
                    <p class="text-xs text-muted-foreground">{{ material.type }}</p>
                  </div>
                  <UButton
                    v-if="material.url"
                    size="xs"
                    variant="ghost"
                    color="primary"
                    icon="i-lucide-download"
                    :to="material.url"
                    target="_blank"
                  />
                </div>
              </div>
              <p v-else class="text-sm text-muted-foreground px-11">
                {{ t('lessons.noMaterials') }}
              </p>
            </div>
          </div>
        </div>
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

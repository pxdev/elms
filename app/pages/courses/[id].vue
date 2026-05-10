<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { loggedIn } = useUserSession()

const courseId = computed(() => Number(route.params.id))

const { data, status } = await useFetch(() => `/api/courses/${courseId.value}`)
const course = computed(() => data.value?.course)

const { data: materialsData } = await useFetch(() => `/api/courses/${courseId.value}/materials`)
const materials = computed(() => materialsData.value?.materials ?? [])

const enrolling = ref(false)
const enrolled = ref(false)
const enrollError = ref<string | null>(null)

// Promo code state
const promoCode = ref('')
const validatingPromo = ref(false)
const promoError = ref<string | null>(null)
const validPromo = ref<{ valid: true; code: string; discountPercent: number; courseName: string | null } | null>(null)

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

      <UCard class="mb-6">
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
                ${{ discountedPrice(Number(course.price), validPromo.discountPercent) }}
              </p>
              <p v-else class="text-2xl font-bold text-primary">
                ${{ course.price }}
              </p>
              <p v-if="validPromo" class="text-sm text-muted line-through">
                ${{ course.price }}
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
          <UButton
            v-else
            to="/login"
            block
            color="neutral"
            variant="subtle"
            size="xl"
          >
            {{ t('courses.signInToEnroll') }}
          </UButton>
        </div>
      </UCard>

      <!-- Course Materials -->
      <div v-if="materials.length" class="space-y-4">
        <h2 class="text-xl font-semibold">
          {{ t('materials.title') }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UCard v-for="material in materials" :key="material.id">
            <div class="flex items-center gap-3">
              <UIcon
                :name="material.type === 'LINK' ? 'i-lucide-link' : material.type === 'PDF' ? 'i-lucide-file-text' : 'i-lucide-presentation'"
                class="text-xl text-primary"
              />
              <div>
                <a
                  v-if="material.url"
                  :href="material.url"
                  target="_blank"
                  class="font-medium hover:underline"
                >
                  {{ material.title }}
                </a>
                <p v-else class="font-medium">{{ material.title }}</p>
                <p class="text-xs text-muted-foreground">{{ material.type }}</p>
              </div>
            </div>
          </UCard>
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

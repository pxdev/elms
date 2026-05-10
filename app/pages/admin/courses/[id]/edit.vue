<script setup lang="ts">
import { updateCourseSchema } from '~~/shared/schemas'

const { t } = useI18n()
const route = useRoute()

const id = Number(route.params.id)

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('admin.courses.edit')} · ${t('app.title')}` })

const { data, refresh } = await useFetch(`/api/admin/courses/${id}`)

const course = computed(() => data.value?.course)

const { data: teachersData } = await useFetch('/api/admin/teachers')
const teacherItems = computed(() =>
  (teachersData.value?.teachers ?? []).map((t) => ({
    label: t.name ? `${t.name} (${t.email})` : t.email,
    value: t.id
  })))

const courseState = reactive({
  name: '',
  description: '',
  imageUrl: '',
  teacherId: undefined as number | undefined,
  isActive: false,
  price: undefined as number | undefined,
  totalSessions: undefined as number | undefined,
  lsVariantId: ''
})

const savingCourse = ref(false)
const courseError = ref<string | null>(null)

watchEffect(() => {
  if (course.value) {
    courseState.name = course.value.name ?? ''
    courseState.description = course.value.description ?? ''
    courseState.imageUrl = course.value.imageUrl ?? ''
    courseState.teacherId = course.value.teacherId ?? undefined
    courseState.isActive = course.value.isActive ?? false
    courseState.price = course.value.price != null ? Number(course.value.price) : undefined
    courseState.totalSessions = course.value.totalSessions ?? undefined
    courseState.lsVariantId = course.value.lsVariantId ?? ''
  }
})

const validateCourse = useZodForm(updateCourseSchema)
const formatZodErrors = useZodErrorFormatter()

async function onSubmitCourse() {
  courseError.value = null
  savingCourse.value = true
  try {
    await $fetch(`/api/admin/courses/${id}`, {
      method: 'PATCH',
      body: {
        name: courseState.name,
        description: courseState.description || undefined,
        imageUrl: courseState.imageUrl || undefined,
        teacherId: courseState.teacherId,
        isActive: courseState.isActive,
        price: courseState.price,
        totalSessions: courseState.totalSessions,
        lsVariantId: courseState.lsVariantId || undefined
      }
    })
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      courseError.value = formatZodErrors(e.data.issues)
    } else {
      courseError.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    savingCourse.value = false
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <UButton
          to="/admin/courses"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          {{ t('common.cancel') }}
        </UButton>
      </div>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">
            {{ t('fields.name') }}
          </h2>
        </template>

        <UForm
          :state="courseState"
          :validate="validateCourse"
          class="space-y-4"
          @submit="onSubmitCourse"
        >
          <UFormField
            :label="t('fields.name')"
            name="name"
            required
          >
            <UInput
              v-model="courseState.name"
              size="xl"
              class="w-full"
              :placeholder="t('fields.name')"
            />
          </UFormField>

          <UFormField
            :label="t('fields.description')"
            name="description"
          >
            <UTextarea
              v-model="courseState.description"
              size="xl"
              class="w-full"
              :placeholder="t('fields.description')"
            />
          </UFormField>

          <UFormField
            :label="t('fields.imageUrl')"
            name="imageUrl"
          >
            <AppImageUpload v-model="courseState.imageUrl" />
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField
              :label="t('fields.teacherId')"
              name="teacherId"
            >
              <USelect
                v-model="courseState.teacherId"
                :items="teacherItems"
                size="xl"
                class="w-full"
                :placeholder="t('fields.teacherId')"
              />
            </UFormField>

            <UFormField
              :label="t('fields.price')"
              name="price"
            >
              <UInput
                v-model="courseState.price"
                type="number"
                size="xl"
                class="w-full"
                :placeholder="t('fields.price')"
              />
            </UFormField>

            <UFormField
              :label="t('fields.totalSessions')"
              name="totalSessions"
            >
              <UInput
                v-model="courseState.totalSessions"
                type="number"
                size="xl"
                class="w-full"
                :placeholder="t('fields.totalSessions')"
              />
            </UFormField>

            <UFormField
              :label="t('fields.lsVariantId')"
              name="lsVariantId"
            >
              <UInput
                v-model="courseState.lsVariantId"
                size="xl"
                class="w-full"
                :placeholder="t('fields.lsVariantId')"
              />
            </UFormField>
          </div>

          <UFormField
            :label="t('fields.isActive')"
            name="isActive"
          >
            <USwitch v-model="courseState.isActive" />
          </UFormField>

          <UAlert
            v-if="courseError"
            color="error"
            variant="soft"
            icon="i-lucide-alert-circle"
            :title="courseError"
          />

          <div class="flex gap-2">
            <UButton
              type="submit"
              color="primary"
              size="xl"
              :loading="savingCourse"
              :disabled="savingCourse"
            >
              {{ t('common.save') }}
            </UButton>
            <UButton
              to="/admin/courses"
              variant="ghost"
              color="neutral"
              size="xl"
            >
              {{ t('common.cancel') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </UContainer>
</template>

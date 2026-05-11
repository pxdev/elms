<script setup lang="ts">
import { createCourseSchema } from '~~/shared/schemas'

const { t } = useI18n()
const { createImageHandler } = useEditorImageUpload()
const editorHandlers = { image: createImageHandler() }

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('admin.courses.create')} · ${t('app.title')}` })

const state = reactive({
  name: '',
  description: '',
  imageUrl: '',
  teacherId: undefined as number | undefined,
  price: undefined as number | undefined,
  totalSessions: undefined as number | undefined,
  lsVariantId: ''
})

const { data: teachersData } = await useFetch('/api/admin/teachers')
const teacherItems = computed(() =>
  (teachersData.value?.teachers ?? []).map((t) => ({
    label: t.name ? `${t.name} (${t.email})` : t.email,
    value: t.id
  }))
)

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const validate = useZodForm(createCourseSchema)
const formatZodErrors = useZodErrorFormatter()

async function onSubmit() {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch('/api/admin/courses', {
      method: 'POST',
      body: {
        name: state.name,
        description: state.description || undefined,
        imageUrl: state.imageUrl || undefined,
        teacherId: state.teacherId,
        price: state.price,
        totalSessions: state.totalSessions,
        lsVariantId: state.lsVariantId || undefined
      }
    })
    await navigateTo('/admin/courses')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      errorMessage.value = formatZodErrors(e.data.issues)
    } else {
      errorMessage.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-8">
    <UCard>

      <UForm
        :state="state"
        :validate="validate"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('fields.name')"
          name="name"
          required
        >
          <UInput
            v-model="state.name"
            size="xl"
            class="w-full"
            :placeholder="t('fields.name')"
          />
        </UFormField>

        <UFormField
          :label="t('fields.description')"
          name="description"
        >
          <ClientOnly>
            <UEditor
              v-model="state.description"
              :handlers="editorHandlers"
              :placeholder="t('fields.description')"
              class="w-full min-h-[200px]"
            />
          </ClientOnly>
        </UFormField>

        <UFormField
          :label="t('fields.imageUrl')"
          name="imageUrl"
        >
          <AppImageUpload v-model="state.imageUrl" />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField
            :label="t('fields.teacherId')"
            name="teacherId"
          >
            <USelect
              v-model="state.teacherId"
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
              v-model="state.price"
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
              v-model="state.totalSessions"
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
              v-model="state.lsVariantId"
              size="xl"
              class="w-full"
              :placeholder="t('fields.lsVariantId')"
            />
          </UFormField>
        </div>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          icon="i-lucide-alert-circle"
          :title="errorMessage"
        />

        <div class="flex gap-2">
          <UButton
            type="submit"
            color="primary"
            size="xl"
            :loading="loading"
            :disabled="loading"
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
  </UContainer>
</template>

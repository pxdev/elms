<script setup lang="ts">
import { courseMaterialSchema } from '~~/shared/schemas'

const { t } = useI18n()
const route = useRoute()
const id = Number(route.params.id)

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('materials.title')} · ${t('app.title')}` })

const { data, refresh } = await useFetch(`/api/admin/courses/${id}/materials`)
const materials = computed(() => data.value?.materials ?? [])

const { data: lessonsData } = await useFetch(`/api/admin/courses/${id}/lessons`)
const lessons = computed(() => lessonsData.value?.lessons ?? [])
const lessonItems = computed(() =>
  lessons.value.map((l: any) => ({ label: l.name, value: l.id }))
)

const state = reactive({
  title: '',
  type: 'LINK' as 'LINK' | 'PDF' | 'SLIDE',
  url: '',
  isPrivate: false,
  enrollmentId: undefined as number | undefined,
  lessonId: undefined as number | undefined
})

const adding = ref(false)
const deleting = ref<number | null>(null)
const errorMessage = ref<string | null>(null)
const uploadingFile = ref(false)

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const validate = useZodForm(courseMaterialSchema)
const formatZodErrors = useZodErrorFormatter()

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  selectedFile.value = file
  if (file && !state.title) {
    state.title = file.name.replace(/\.[^.]+$/, '')
  }
}

async function uploadFile(): Promise<string | null> {
  if (!selectedFile.value) return null
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  const res = await $fetch('/api/upload', { method: 'POST', body: formData })
  return (res as any).url ?? null
}

const onSubmit = useThrottleFn(async () => {
  errorMessage.value = null
  adding.value = true
  try {
    let url = state.url || undefined
    if (selectedFile.value) {
      uploadingFile.value = true
      const uploaded = await uploadFile()
      if (uploaded) url = uploaded
      uploadingFile.value = false
    }
    await $fetch(`/api/admin/courses/${id}/materials`, {
      method: 'POST',
      body: {
        title: state.title,
        type: state.type,
        url: url,
        isPrivate: state.isPrivate,
        enrollmentId: state.enrollmentId,
        lessonId: state.lessonId
      }
    })
    state.title = ''
    state.url = ''
    state.type = 'LINK'
    state.isPrivate = false
    state.enrollmentId = undefined
    state.lessonId = undefined
    selectedFile.value = null
    if (fileInput.value) fileInput.value.value = ''
    await refresh()
  } catch (err: unknown) {
    uploadingFile.value = false
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      errorMessage.value = formatZodErrors(e.data.issues)
    } else {
      errorMessage.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    adding.value = false
  }
}, 1000)

async function onDelete(materialId: number) {
  if (!confirm(t('common.delete'))) return
  deleting.value = materialId
  try {
    await $fetch(`/api/admin/courses/${id}/materials/${materialId}`, { method: 'DELETE' })
    await refresh()
  } finally {
    deleting.value = null
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <UButton
          :to="`/admin/courses/${id}/edit`"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          {{ t('common.back') }}
        </UButton>
      </div>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">
            {{ t('materials.addMaterial') }}
          </h2>
        </template>

        <UForm
          :state="state"
          :validate="validate"
          class="space-y-4"
          @submit="onSubmit"
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField
              :label="t('fields.title')"
              name="title"
              required
            >
              <UInput
                v-model="state.title"
                size="xl"
                class="w-full"
                :placeholder="t('fields.title')"
              />
            </UFormField>

            <UFormField
              :label="t('fields.type')"
              name="type"
              required
            >
              <USelect
                v-model="state.type"
                :items="[
                  { label: 'Link', value: 'LINK' },
                  { label: 'PDF', value: 'PDF' },
                  { label: 'Slide', value: 'SLIDE' }
                ]"
                size="xl"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField
            v-if="state.type === 'LINK'"
            :label="t('fields.url')"
            name="url"
          >
            <UInput
              v-model="state.url"
              size="xl"
              class="w-full"
              :placeholder="t('fields.url')"
            />
          </UFormField>

          <UFormField
            v-else
            :label="t('fields.file')"
          >
            <UFileUpload
              v-model="selectedFile"
              accept="*"
              :label="t('fields.file')"
              :description="t('materials.dropFileHere')"
              :file-delete="true"
              :preview="true"
              @change="onFileChange"
            />
          </UFormField>

          <UFormField
            :label="t('fields.isPrivate')"
            name="isPrivate"
          >
            <USwitch v-model="state.isPrivate" />
          </UFormField>

          <UFormField
            :label="t('fields.lesson')"
            name="lessonId"
          >
            <USelect
              v-model="state.lessonId"
              :items="lessonItems"
              size="xl"
              class="w-full"
              :placeholder="t('fields.lesson')"
            />
          </UFormField>

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-alert-circle"
            :title="errorMessage"
          />

          <UButton
            type="submit"
            color="primary"
            size="xl"
            :loading="adding || uploadingFile"
            :disabled="adding || uploadingFile"
          >
            {{ t('common.add') }}
          </UButton>
        </UForm>
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">
            {{ t('materials.allMaterials') }}
          </h2>
        </template>

        <div v-if="materials.length" class="space-y-3">
          <div
            v-for="material in materials"
            :key="material.id"
            class="flex items-center justify-between p-4 border rounded-lg"
          >
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
                <p class="text-xs text-muted-foreground">
                  {{ material.type }} · {{ material.isPrivate ? t('materials.private') : t('materials.shared') }}
                  <span v-if="material.lesson"> · {{ material.lesson.name }}</span>
                </p>
              </div>
            </div>
            <UButton
              size="xs"
              color="error"
              variant="ghost"
              icon="i-lucide-trash"
              :loading="deleting === material.id"
              @click="onDelete(material.id)"
            />
          </div>
        </div>

        <div v-else class="text-center py-8 text-muted-foreground">
          {{ t('materials.noMaterials') }}
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

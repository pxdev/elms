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

// ── Lessons ────────────────────────────────────────────────────────
const { data: lessonsData, refresh: refreshLessons } = await useFetch(`/api/admin/courses/${id}/lessons`)
const lessons = computed(() => lessonsData.value?.lessons ?? [])

const editingLesson = ref<number | null>(null)
const editingName = ref('')
const savingLesson = ref(false)

function startEditLesson(lesson: any) {
  editingLesson.value = lesson.id
  editingName.value = lesson.name
}

async function saveLessonName(lessonId: number) {
  if (!editingName.value.trim()) return
  savingLesson.value = true
  try {
    await $fetch(`/api/admin/courses/${id}/lessons/${lessonId}`, {
      method: 'PATCH',
      body: { name: editingName.value.trim() }
    })
    await refreshLessons()
    editingLesson.value = null
  } catch (err: any) {
    alert(err.data?.message || err.message)
  } finally {
    savingLesson.value = false
  }
}

// ── Lesson Resources ───────────────────────────────────────────────
const resourceModalOpen = ref(false)
const activeLessonId = ref<number | null>(null)
const resourceState = reactive({
  title: '',
  type: 'LINK' as 'LINK' | 'VIDEO' | 'PDF' | 'IMAGE' | 'ZIP' | 'AUDIO' | 'DOC' | 'SLIDE',
  url: ''
})
const addingResource = ref(false)
const resourceError = ref<string | null>(null)
const deletingResource = ref<number | null>(null)

const resourceFileInput = ref<HTMLInputElement | null>(null)
const selectedResourceFile = ref<File | null>(null)

function openResourceModal(lessonId: number) {
  activeLessonId.value = lessonId
  resourceState.title = ''
  resourceState.type = 'LINK'
  resourceState.url = ''
  selectedResourceFile.value = null
  resourceError.value = null
  if (resourceFileInput.value) resourceFileInput.value.value = ''
  resourceModalOpen.value = true
}

function onResourceFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  selectedResourceFile.value = file
  if (file && !resourceState.title) {
    resourceState.title = file.name.replace(/\.[^.]+$/, '')
  }
}

async function uploadResourceFile(): Promise<string | null> {
  if (!selectedResourceFile.value) return null
  const formData = new FormData()
  formData.append('file', selectedResourceFile.value)
  const res = await $fetch('/api/upload', { method: 'POST', body: formData })
  return (res as any).url ?? null
}

async function saveResource() {
  if (!activeLessonId.value) return
  if (!resourceState.title.trim()) {
    resourceError.value = 'Title is required'
    return
  }
  if (['LINK', 'VIDEO'].includes(resourceState.type) && !resourceState.url.trim()) {
    resourceError.value = 'URL is required for links and videos'
    return
  }

  addingResource.value = true
  resourceError.value = null
  try {
    let url = resourceState.url.trim() || undefined
    if (selectedResourceFile.value) {
      const uploaded = await uploadResourceFile()
      if (uploaded) url = uploaded
    }

    if (!url) {
      resourceError.value = 'Please provide a URL or upload a file'
      addingResource.value = false
      return
    }

    await $fetch(`/api/admin/courses/${id}/materials`, {
      method: 'POST',
      body: {
        title: resourceState.title.trim(),
        type: resourceState.type,
        url,
        lessonId: activeLessonId.value
      }
    })
    await refreshLessons()
    resourceModalOpen.value = false
  } catch (err: any) {
    resourceError.value = err.data?.message || err.message || 'Failed to add resource'
  } finally {
    addingResource.value = false
  }
}

async function deleteResource(materialId: number) {
  if (!confirm(t('common.delete'))) return
  deletingResource.value = materialId
  try {
    await $fetch(`/api/admin/courses/${id}/materials/${materialId}`, { method: 'DELETE' })
    await refreshLessons()
  } catch (err: any) {
    alert(err.data?.message || err.message)
  } finally {
    deletingResource.value = null
  }
}

const managingSessions = ref(false)

async function addSession() {
  managingSessions.value = true
  try {
    const nextOrder = lessons.value.length
    await $fetch(`/api/admin/courses/${id}/lessons`, {
      method: 'POST',
      body: { name: `Session ${nextOrder + 1}`, order: nextOrder }
    })
    await $fetch(`/api/admin/courses/${id}`, {
      method: 'PATCH',
      body: { totalSessions: lessons.value.length + 1 }
    })
    await refresh()
    await refreshLessons()
  } catch (err: any) {
    alert(err.data?.message || err.message)
  } finally {
    managingSessions.value = false
  }
}

async function removeLastSession() {
  if (!lessons.value.length) return
  if (!confirm(t('common.delete'))) return
  managingSessions.value = true
  try {
    const last = lessons.value[lessons.value.length - 1]
    if (!last) return
    await $fetch(`/api/admin/courses/${id}/lessons/${last.id}`, { method: 'DELETE' })
    await $fetch(`/api/admin/courses/${id}`, {
      method: 'PATCH',
      body: { totalSessions: lessons.value.length - 1 }
    })
    await refresh()
    await refreshLessons()
  } catch (err: any) {
    alert(err.data?.message || err.message)
  } finally {
    managingSessions.value = false
  }
}

async function deleteLesson(lessonId: number) {
  if (!confirm(t('common.delete'))) return
  managingSessions.value = true
  try {
    await $fetch(`/api/admin/courses/${id}/lessons/${lessonId}`, { method: 'DELETE' })
    await $fetch(`/api/admin/courses/${id}`, {
      method: 'PATCH',
      body: { totalSessions: lessons.value.length - 1 }
    })
    await refresh()
    await refreshLessons()
  } catch (err: any) {
    alert(err.data?.message || err.message)
  } finally {
    managingSessions.value = false
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
    await refreshLessons()
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

      <!-- Lessons / Sessions -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ t('lessons.title') }}</h2>
          <div class="flex items-center gap-2">
            <UButton
              size="sm"
              variant="soft"
              color="error"
              icon="i-lucide-minus"
              :loading="managingSessions"
              :disabled="managingSessions || !lessons.length"
              @click="removeLastSession"
            >
              {{ t('common.remove') }}
            </UButton>
            <UButton
              size="sm"
              variant="soft"
              color="primary"
              icon="i-lucide-plus"
              :loading="managingSessions"
              :disabled="managingSessions"
              @click="addSession"
            >
              {{ t('common.add') }}
            </UButton>
          </div>
        </div>

        <div v-if="lessons.length" class="space-y-4">
          <UCard
            v-for="(lesson, idx) in lessons"
            :key="lesson.id"
          >
            <div class="space-y-4">
              <!-- Lesson Header -->
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                  {{ idx + 1 }}
                </div>

                <div v-if="editingLesson === lesson.id" class="flex-1 flex items-center gap-2">
                  <UInput
                    v-model="editingName"
                    size="sm"
                    class="flex-1"
                    @keyup.enter="saveLessonName(lesson.id)"
                  />
                  <UButton
                    size="xs"
                    color="primary"
                    icon="i-lucide-check"
                    :loading="savingLesson"
                    @click="saveLessonName(lesson.id)"
                  />
                  <UButton
                    size="xs"
                    variant="ghost"
                    color="neutral"
                    icon="i-lucide-x"
                    @click="editingLesson = null"
                  />
                </div>

                <div v-else class="flex-1 flex items-center justify-between">
                  <span class="font-medium">{{ lesson.name }}</span>
                  <div class="flex items-center gap-1">
                    <UButton
                      size="xs"
                      variant="ghost"
                      color="neutral"
                      icon="i-lucide-pencil"
                      @click="startEditLesson(lesson)"
                    />
                    <UButton
                      size="xs"
                      variant="ghost"
                      color="error"
                      icon="i-lucide-trash"
                      :loading="managingSessions"
                      @click="deleteLesson(lesson.id)"
                    />
                  </div>
                </div>
              </div>

              <!-- Materials List -->
              <div v-if="lesson.materials?.length" class="space-y-2">
                <div
                  v-for="material in lesson.materials"
                  :key="material.id"
                  class="flex items-center justify-between p-3 rounded-lg border border-neutral-100 hover:border-primary/30 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <UIcon :name="materialIcon(material.type)" class="text-lg text-primary" />
                    <div>
                      <a
                        v-if="material.url"
                        :href="material.url"
                        target="_blank"
                        class="font-medium text-sm hover:underline"
                      >
                        {{ material.title }}
                      </a>
                      <p v-else class="font-medium text-sm">{{ material.title }}</p>
                      <p class="text-xs text-muted-foreground">{{ material.type }}</p>
                    </div>
                  </div>
                  <UButton
                    size="xs"
                    color="error"
                    variant="ghost"
                    icon="i-lucide-trash"
                    :loading="deletingResource === material.id"
                    @click="deleteResource(material.id)"
                  />
                </div>
              </div>

              <!-- Add Resource Button -->
              <UButton
                size="sm"
                variant="soft"
                color="primary"
                icon="i-lucide-plus"
                @click="openResourceModal(lesson.id)"
              >
                {{ t('materials.addMaterial') }}
              </UButton>
            </div>
          </UCard>
        </div>

        <div v-else class="text-center py-8 text-muted-foreground text-sm">
          No lessons found.
        </div>
      </div>

      <!-- Add Resource Modal -->
      <UModal v-model:open="resourceModalOpen" :title="t('materials.addMaterial')">
        <template #body>
          <div class="space-y-4">
            <UFormField :label="t('fields.title')" required>
              <UInput
                v-model="resourceState.title"
                size="xl"
                class="w-full"
                :placeholder="t('fields.title')"
              />
            </UFormField>

            <UFormField :label="t('fields.type')" required>
              <USelect
                v-model="resourceState.type"
                :items="[
                  { label: 'Link', value: 'LINK' },
                  { label: 'Video', value: 'VIDEO' },
                  { label: 'PDF', value: 'PDF' },
                  { label: 'Image', value: 'IMAGE' },
                  { label: 'Zip', value: 'ZIP' },
                  { label: 'Audio', value: 'AUDIO' },
                  { label: 'Document', value: 'DOC' },
                  { label: 'Slide', value: 'SLIDE' }
                ]"
                size="xl"
                class="w-full"
              />
            </UFormField>

            <UFormField
              v-if="resourceState.type === 'LINK' || resourceState.type === 'VIDEO'"
              :label="t('fields.url')"
              required
            >
              <UInput
                v-model="resourceState.url"
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
                v-model="selectedResourceFile"
                accept="*"
                :label="t('fields.file')"
                :description="t('materials.dropFileHere')"
                :file-delete="true"
                :preview="true"
                @change="onResourceFileChange"
              />
            </UFormField>

            <UAlert
              v-if="resourceError"
              color="error"
              variant="soft"
              icon="i-lucide-alert-circle"
              :title="resourceError"
            />

            <div class="flex gap-2 justify-end">
              <UButton
                variant="ghost"
                color="neutral"
                @click="resourceModalOpen = false"
              >
                {{ t('common.cancel') }}
              </UButton>
              <UButton
                color="primary"
                :loading="addingResource"
                :disabled="addingResource"
                @click="saveResource"
              >
                {{ t('common.add') }}
              </UButton>
            </div>
          </div>
        </template>
      </UModal>
    </div>
  </UContainer>
</template>

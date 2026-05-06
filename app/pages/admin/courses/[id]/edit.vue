<script setup lang="ts">
import { updateCourseSchema, createVariantSchema } from '~~/shared/schemas'

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
  isActive: false
})

const variantState = reactive({
  name: '',
  sessionsPerMonth: undefined as number | undefined,
  price: undefined as number | undefined,
  lsVariantId: ''
})

const editingVariantId = ref<number | null>(null)
const editingVariantState = reactive({
  name: '',
  sessionsPerMonth: undefined as number | undefined,
  price: undefined as number | undefined,
  lsVariantId: ''
})

const savingCourse = ref(false)
const addingVariant = ref(false)
const updatingVariant = ref<number | null>(null)
const deletingVariant = ref<number | null>(null)
const courseError = ref<string | null>(null)
const variantError = ref<string | null>(null)

watchEffect(() => {
  if (course.value) {
    courseState.name = course.value.name ?? ''
    courseState.description = course.value.description ?? ''
    courseState.imageUrl = course.value.imageUrl ?? ''
    courseState.teacherId = course.value.teacherId ?? undefined
    courseState.isActive = course.value.isActive ?? false
  }
})

const validateCourse = useZodForm(updateCourseSchema)
const validateVariant = useZodForm(createVariantSchema)
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
        isActive: courseState.isActive
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

async function onAddVariant() {
  variantError.value = null
  addingVariant.value = true
  try {
    await $fetch(`/api/admin/courses/${id}/variants`, {
      method: 'POST',
      body: {
        name: variantState.name,
        sessionsPerMonth: variantState.sessionsPerMonth,
        price: variantState.price,
        lsVariantId: variantState.lsVariantId || undefined
      }
    })
    variantState.name = ''
    variantState.sessionsPerMonth = undefined
    variantState.price = undefined
    variantState.lsVariantId = ''
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      variantError.value = formatZodErrors(e.data.issues)
    } else {
      variantError.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    addingVariant.value = false
  }
}

function startEditVariant(variant: { id: number, name: string, sessionsPerMonth: number, price: number | string, lsVariantId?: string | null }) {
  editingVariantId.value = variant.id
  editingVariantState.name = variant.name ?? ''
  editingVariantState.sessionsPerMonth = variant.sessionsPerMonth ?? undefined
  editingVariantState.price = typeof variant.price === 'string' ? Number(variant.price) : variant.price ?? undefined
  editingVariantState.lsVariantId = variant.lsVariantId ?? ''
}

function cancelEditVariant() {
  editingVariantId.value = null
}

async function onUpdateVariant(variantId: number) {
  variantError.value = null
  updatingVariant.value = variantId
  try {
    await $fetch(`/api/admin/courses/${id}/variants/${variantId}`, {
      method: 'PATCH',
      body: {
        name: editingVariantState.name,
        sessionsPerMonth: editingVariantState.sessionsPerMonth,
        price: editingVariantState.price,
        lsVariantId: editingVariantState.lsVariantId || undefined
      }
    })
    editingVariantId.value = null
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      variantError.value = formatZodErrors(e.data.issues)
    } else {
      variantError.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    updatingVariant.value = null
  }
}

async function onDeleteVariant(variantId: number) {
  if (!confirm(t('common.delete'))) return
  variantError.value = null
  deletingVariant.value = variantId
  try {
    await $fetch(`/api/admin/courses/${id}/variants/${variantId}`, {
      method: 'DELETE'
    })
    await refresh()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      variantError.value = formatZodErrors(e.data.issues)
    } else {
      variantError.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    deletingVariant.value = null
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">
          {{ t('admin.courses.edit') }}
        </h1>
        <UButton
          to="/admin/courses"
          color="neutral"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          {{ t('common.cancel') }}
        </UButton>
      </div>

      <UCard class="border-accented">
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

      <USeparator />

      <UCard class="border-accented">
        <template #header>
          <h2 class="text-lg font-semibold">
            {{ t('admin.courses.variantsTitle') }}
          </h2>
        </template>

        <div class="space-y-6">
          <div class="space-y-3">
            <UCard
              v-for="variant in course?.variants ?? []"
              :key="variant.id"
              class="border-accented"
            >
              <div class="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
                <UFormField :label="t('fields.variantName')" class="sm:col-span-1">
                  <UInput
                    v-if="editingVariantId === variant.id"
                    v-model="editingVariantState.name"
                    size="xl"
                    :placeholder="t('fields.variantName')"
                  />
                  <p v-else class="text-sm font-medium">{{ variant.name }}</p>
                </UFormField>

                <UFormField :label="t('fields.sessionsPerMonth')" class="sm:col-span-1">
                  <UInput
                    v-if="editingVariantId === variant.id"
                    v-model="editingVariantState.sessionsPerMonth"
                    type="number"
                    size="xl"
                    :placeholder="t('fields.sessionsPerMonth')"
                  />
                  <p v-else class="text-sm">{{ variant.sessionsPerMonth }}</p>
                </UFormField>

                <UFormField :label="t('fields.price')" class="sm:col-span-1">
                  <UInput
                    v-if="editingVariantId === variant.id"
                    v-model="editingVariantState.price"
                    type="number"
                    size="xl"
                    :placeholder="t('fields.price')"
                  />
                  <p v-else class="text-sm">{{ variant.price }}</p>
                </UFormField>

                <UFormField :label="t('fields.lsVariantId')" class="sm:col-span-1">
                  <UInput
                    v-if="editingVariantId === variant.id"
                    v-model="editingVariantState.lsVariantId"
                    size="xl"
                    :placeholder="t('fields.lsVariantId')"
                  />
                  <p v-else class="text-sm text-muted-foreground">{{ variant.lsVariantId ?? '-' }}</p>
                </UFormField>

                <div class="flex justify-end gap-1 sm:col-span-1">
                  <template v-if="editingVariantId === variant.id">
                    <UButton
                      size="xs"
                      color="primary"
                      icon="i-lucide-check"
                      :loading="updatingVariant === variant.id"
                      @click="onUpdateVariant(variant.id)"
                    />
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-x"
                      @click="cancelEditVariant"
                    />
                  </template>
                  <template v-else>
                    <UButton
                      size="xs"
                      color="neutral"
                      variant="ghost"
                      icon="i-lucide-pencil"
                      @click="startEditVariant(variant)"
                    />
                    <UButton
                      size="xs"
                      color="error"
                      variant="ghost"
                      icon="i-lucide-trash"
                      :loading="deletingVariant === variant.id"
                      @click="onDeleteVariant(variant.id)"
                    />
                  </template>
                </div>
              </div>
            </UCard>

            <div v-if="(course?.variants ?? []).length === 0" class="text-center py-8 text-muted-foreground">
              {{ t('admin.courses.noVariants') }}
            </div>
          </div>

          <USeparator />

          <UForm
            :state="variantState"
            :validate="validateVariant"
            class="space-y-4"
            @submit="onAddVariant"
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <UFormField
                :label="t('fields.variantName')"
                name="name"
                required
              >
                <UInput
                  v-model="variantState.name"
                  size="xl"
                  class="w-full"
                  :placeholder="t('fields.variantName')"
                />
              </UFormField>

              <UFormField
                :label="t('fields.sessionsPerMonth')"
                name="sessionsPerMonth"
                required
              >
                <UInput
                  v-model="variantState.sessionsPerMonth"
                  type="number"
                  size="xl"
                  class="w-full"
                  :placeholder="t('fields.sessionsPerMonth')"
                />
              </UFormField>

              <UFormField
                :label="t('fields.price')"
                name="price"
                required
              >
                <UInput
                  v-model="variantState.price"
                  type="number"
                  size="xl"
                  class="w-full"
                  :placeholder="t('fields.price')"
                />
              </UFormField>

              <UFormField
                :label="t('fields.lsVariantId')"
                name="lsVariantId"
              >
                <UInput
                  v-model="variantState.lsVariantId"
                  size="xl"
                  class="w-full"
                  :placeholder="t('fields.lsVariantId')"
                />
              </UFormField>
            </div>

            <UAlert
              v-if="variantError"
              color="error"
              variant="soft"
              icon="i-lucide-alert-circle"
              :title="variantError"
            />

            <UButton
              type="submit"
              color="primary"
              size="xl"
              icon="i-lucide-plus"
              :loading="addingVariant"
              :disabled="addingVariant"
            >
              {{ t('common.add') }}
            </UButton>
          </UForm>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
import { updateBlogCategorySchema } from '~~/shared/schemas'

const { t } = useI18n()
const route = useRoute()
const id = Number(route.params.id)

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('common.edit')} ${t('fields.category')} · ${t('app.title')}` })

const { data, refresh } = await useFetch(`/api/admin/blog/categories/${id}`)
const category = computed(() => data.value?.category)

const state = reactive({
  name: '',
  description: ''
})

watchEffect(() => {
  if (category.value) {
    state.name = category.value.name ?? ''
    state.description = category.value.description ?? ''
  }
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const validate = useZodForm(updateBlogCategorySchema)
const formatZodErrors = useZodErrorFormatter()

async function onSubmit() {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch(`/api/admin/blog/categories/${id}`, {
      method: 'PATCH',
      body: {
        name: state.name || undefined,
        description: state.description || undefined
      }
    })
    await refresh()
    await navigateTo('/admin/blog/categories')
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
    <UCard class="border-accented">
      <template #header>
        <h1 class="text-xl font-semibold">
          {{ t('common.edit') }} {{ t('fields.category') }}
        </h1>
      </template>

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
          <UTextarea
            v-model="state.description"
            size="xl"
            class="w-full"
            :placeholder="t('fields.description')"
          />
        </UFormField>

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
            to="/admin/blog/categories"
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

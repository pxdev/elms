<script setup lang="ts">
import { createBlogCategorySchema } from '~~/shared/schemas'

const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('common.add')} ${t('fields.category')} · ${t('app.title')}` })

const state = reactive({
  name: '',
  description: ''
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const validate = useZodForm(createBlogCategorySchema)
const formatZodErrors = useZodErrorFormatter()

async function onSubmit() {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch('/api/admin/blog/categories', {
      method: 'POST',
      body: {
        name: state.name,
        description: state.description || undefined
      }
    })
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
    <UCard>
      <template #header>
        <h2 class="text-lg font-semibold">
          {{ t('common.add') }} {{ t('fields.category') }}
        </h2>
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

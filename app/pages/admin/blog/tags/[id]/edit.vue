<script setup lang="ts">
import { updateBlogTagSchema } from '~~/shared/schemas'

const { t } = useI18n()
const route = useRoute()
const id = Number(route.params.id)

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('common.edit')} ${t('fields.tag')} · ${t('app.title')}` })

const { data, refresh } = await useFetch(`/api/admin/blog/tags/${id}`)
const tag = computed(() => data.value?.tag)

const state = reactive({
  name: ''
})

watchEffect(() => {
  if (tag.value) {
    state.name = tag.value.name ?? ''
  }
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const validate = useZodForm(updateBlogTagSchema)
const formatZodErrors = useZodErrorFormatter()

async function onSubmit() {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch(`/api/admin/blog/tags/${id}`, {
      method: 'PATCH',
      body: {
        name: state.name || undefined
      }
    })
    await refresh()
    await navigateTo('/admin/blog/tags')
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
          {{ t('common.edit') }} {{ t('fields.tag') }}
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
            to="/admin/blog/tags"
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

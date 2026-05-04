<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('admin.courses.create')} · ${t('app.title')}` })

const state = reactive({
  name: '',
  description: '',
  imageUrl: '',
  teacherId: undefined as number | undefined
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

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
        teacherId: state.teacherId
      }
    })
    await navigateTo('/admin/courses')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }, message?: string }
    errorMessage.value = e.data?.message ?? e.message ?? t('errors.generic')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-12">
    <UCard class="max-w-lg mx-auto">
      <template #header>
        <h1 class="text-xl font-semibold">
          {{ t('admin.courses.create') }}
        </h1>
      </template>

      <UForm
        :state="state"
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
            class="w-full"
            :placeholder="t('fields.description')"
          />
        </UFormField>

        <UFormField
          :label="t('fields.imageUrl')"
          name="imageUrl"
        >
          <UInput
            v-model="state.imageUrl"
            class="w-full"
            :placeholder="t('fields.imageUrl')"
          />
        </UFormField>

        <UFormField
          :label="t('fields.teacherId')"
          name="teacherId"
        >
          <UInput
            v-model="state.teacherId"
            type="number"
            class="w-full"
            :placeholder="t('fields.teacherId')"
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
            :loading="loading"
            :disabled="loading"
          >
            {{ t('common.save') }}
          </UButton>
          <UButton
            to="/admin/courses"
            variant="ghost"
            color="neutral"
          >
            {{ t('common.cancel') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>

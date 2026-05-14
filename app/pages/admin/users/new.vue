<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('common.add')} ${t('fields.name')} · ${t('nav.admin')} · ${t('app.title')}` })

const state = reactive({
  email: '',
  name: '',
  password: '',
  role: 'STUDENT' as 'ADMIN' | 'TEACHER' | 'STUDENT'
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const onSubmit = useThrottleFn(async () => {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch('/api/admin/users', {
      method: 'POST',
      body: {
        email: state.email,
        name: state.name || undefined,
        password: state.password,
        role: state.role
      }
    })
    await navigateTo('/admin/users')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    errorMessage.value = e.data?.message ?? e.message ?? t('errors.generic')
  } finally {
    loading.value = false
  }
}, 1000)
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">


      <UCard>
        <UForm :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField :label="t('fields.email')" name="email" required>
            <UInput v-model="state.email" type="email" size="xl" class="w-full" :placeholder="t('fields.email')" />
          </UFormField>

          <UFormField :label="t('fields.name')" name="name">
            <UInput v-model="state.name" size="xl" class="w-full" :placeholder="t('fields.name')" />
          </UFormField>

          <UFormField :label="t('auth.password')" name="password" required>
            <UInput v-model="state.password" type="password" size="xl" class="w-full" :placeholder="t('auth.password')" />
          </UFormField>

          <UFormField :label="t('fields.role')" name="role" required>
            <USelect v-model="state.role" :items="['ADMIN', 'TEACHER', 'STUDENT']" size="xl" class="w-full" />
          </UFormField>

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-alert-circle"
            :title="errorMessage"
          />

          <div class="flex gap-2">
            <UButton type="submit" color="primary" size="xl" :loading="loading" :disabled="loading">
              {{ t('common.save') }}
            </UButton>
            <UButton to="/admin/users" variant="ghost" color="neutral" size="xl">
              {{ t('common.cancel') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </UContainer>
</template>

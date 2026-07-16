<script setup lang="ts">
import { z } from 'zod'

const { t } = useI18n()

definePageMeta({ guest: true })

useSeoMeta({ title: `${t('auth.resetPassword.title')} · ${t('app.title')}` })

const route = useRoute()
const token = computed(() => String(route.query.token ?? ''))

const state = reactive({
  password: '',
  confirm: ''
})

const loading = ref(false)
const success = ref(false)
const errorMessage = ref<string | null>(null)
const showPassword = ref(false)

const resetPasswordClientSchema = z.object({
  password: z.string().min(8),
  confirm: z.string().min(1)
}).refine(data => data.password === data.confirm, {
  message: 'passwords_match',
  path: ['confirm']
})

const validate = useZodForm(resetPasswordClientSchema)
const formatZodErrors = useZodErrorFormatter()

const onSubmit = useThrottleFn(async () => {
  errorMessage.value = null

  if (!token.value) {
    errorMessage.value = t('errors.validation.invalid')
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/password/reset', {
      method: 'POST',
      body: { token: token.value, password: state.password }
    })
    success.value = true
  } catch (err) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      errorMessage.value = formatZodErrors(e.data.issues)
    } else {
      errorMessage.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    loading.value = false
  }
}, 1000)
</script>

<template>
  <UContainer class="py-12">
    <UCard class="max-w-md mx-auto">
      <template #header>
        <h1 class="text-xl font-semibold">
          {{ t('auth.resetPassword.title') }}
        </h1>
      </template>

      <div
        v-if="success"
        class="space-y-4"
      >
        <UAlert
          color="success"
          variant="soft"
          icon="i-lucide-check"
          :title="t('auth.resetPassword.successTitle')"
          :description="t('auth.resetPassword.successDescription')"
        />
        <UButton
          to="/login"
          block
        >
          {{ t('auth.resetPassword.continue') }}
        </UButton>
      </div>

      <UForm
        v-else
        :state="state"
        :validate="validate"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UAlert
          v-if="!token"
          color="error"
          variant="soft"
          icon="i-lucide-link-2-off"
          :title="t('auth.resetPassword.invalidTitle')"
          :description="t('auth.resetPassword.invalidDescription')"
        />

        <UFormField
          :label="t('auth.newPassword')"
          name="password"
          required
          :help="t('auth.register.passwordHint')"
        >
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full"
            :placeholder="t('auth.newPassword')"
            size="xl"
          >
            <template #trailing>
              <UButton type="button" color="neutral" variant="ghost" size="xs" :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')" @click="showPassword = !showPassword" />
            </template>
          </UInput>
        </UFormField>

        <UFormField
          :label="t('auth.confirmPassword')"
          name="confirm"
          required
        >
          <UInput
            v-model="state.confirm"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full"
            :placeholder="t('auth.confirmPassword')"
          size="xl" />
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
          block
          :loading="loading"
          :disabled="loading || !token"
         size="xl">
          {{ t('auth.resetPassword.submit') }}
        </UButton>
      </UForm>
    </UCard>
  </UContainer>
</template>

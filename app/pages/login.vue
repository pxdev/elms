<script setup lang="ts">
import { loginSchema } from '~~/shared/schemas'

const { t } = useI18n()

definePageMeta({ guest: true })

useSeoMeta({ title: `${t('auth.login.title')} · ${t('app.title')}` })

const { fetch: refreshSession } = useUserSession()

const state = reactive({
  email: '',
  password: ''
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const validate = useZodForm(loginSchema)
const formatZodErrors = useZodErrorFormatter()

const route = useRoute()
if (route.query.error === 'oauth') {
  errorMessage.value = t('errors.oauth')
}

async function onSubmit() {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: state
    })
    await refreshSession()
    await navigateTo('/dashboard')
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
}
</script>

<template>
  <UContainer class="py-12">
    <UCard class="max-w-md mx-auto">
      <template #header>
        <h1 class="text-xl font-semibold">
          {{ t('auth.login.title') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('auth.login.description') }}
        </p>
      </template>

      <UButton
        to="/api/auth/google"
        external
        block
        color="neutral"
        variant="subtle"
        icon="i-simple-icons-google"
        class="mb-4"
      >
        {{ t('auth.google') }}
      </UButton>

      <USeparator
        :label="t('auth.or')"
        class="mb-4"
      />

      <UForm
        :state="state"
        :validate="validate"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('auth.email')"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            autocomplete="email"
            class="w-full"
            :placeholder="t('auth.email')"
          />
        </UFormField>

        <UFormField
          :label="t('auth.password')"
          name="password"
          required
        >
          <template #hint>
            <NuxtLink
              to="/forgot-password"
              class="text-xs text-primary hover:underline"
            >
              {{ t('auth.forgotPassword') }}
            </NuxtLink>
          </template>
          <UInput
            v-model="state.password"
            type="password"
            autocomplete="current-password"
            class="w-full"
            :placeholder="t('auth.password')"
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
          block
          :loading="loading"
          :disabled="loading"
        >
          {{ t('auth.login.submit') }}
        </UButton>
      </UForm>

      <template #footer>
        <p class="text-sm text-muted text-center">
          {{ t('auth.noAccount') }}
          <NuxtLink
            to="/register"
            class="text-primary hover:underline"
          >
            {{ t('nav.signUp') }}
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </UContainer>
</template>

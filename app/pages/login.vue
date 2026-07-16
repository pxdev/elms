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
const showPassword = ref(false)
const errorMessage = ref<string | null>(null)

const validate = useZodForm(loginSchema)
const formatZodErrors = useZodErrorFormatter()

const route = useRoute()
const redirectTo = computed(() => {
  const value = String(route.query.redirect ?? '')
  return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard'
})
if (route.query.error === 'oauth') {
  errorMessage.value = t('errors.oauth')
}

const onSubmit = useThrottleFn(async () => {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: state
    })
    await refreshSession()
    await navigateTo(redirectTo.value)
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
          size="xl" />
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
              {{ t('auth.forgotPasswordLink') }}
            </NuxtLink>
          </template>
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            class="w-full"
            :placeholder="t('auth.password')"
            size="xl"
          >
            <template #trailing>
              <UButton
                type="button"
                color="neutral"
                variant="ghost"
                size="xs"
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
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
         size="xl">
          {{ t('auth.login.submit') }}
        </UButton>
      </UForm>

      <template #footer>
        <p class="text-sm text-muted text-center">
          {{ t('auth.noAccount') }}
          <NuxtLink
            :to="{ path: '/register', query: route.query.redirect ? { redirect: route.query.redirect } : {} }"
            class="text-primary hover:underline"
          >
            {{ t('nav.signUp') }}
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </UContainer>
</template>

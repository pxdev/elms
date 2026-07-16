<script setup lang="ts">
import { registerSchema } from '~~/shared/schemas'

const { t } = useI18n()

definePageMeta({ guest: true })

useSeoMeta({ title: `${t('auth.register.title')} · ${t('app.title')}` })

const { fetch: refreshSession } = useUserSession()
const route = useRoute()
const redirectTo = computed(() => {
  const value = String(route.query.redirect ?? '')
  return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard'
})

const state = reactive({
  name: '',
  email: '',
  password: '',
  timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
})

const loading = ref(false)
const showPassword = ref(false)
const errorMessage = ref<string | null>(null)

const validate = useZodForm(registerSchema)
const formatZodErrors = useZodErrorFormatter()

const onSubmit = useThrottleFn(async () => {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: state
    })
    await refreshSession()
    await navigateTo({ path: '/verify-email', query: { redirect: redirectTo.value } })
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
          {{ t('auth.register.title') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('auth.register.description') }}
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
          :label="t('auth.name')"
          name="name"
        >
          <UInput
            v-model="state.name"
            autocomplete="name"
            class="w-full"
            :placeholder="t('auth.name')"
          size="xl" />
        </UFormField>

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
          :help="t('auth.register.passwordHint')"
        >
          <UInput
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            class="w-full"
            :placeholder="t('auth.password')"
            size="xl"
          >
            <template #trailing>
              <UButton type="button" color="neutral" variant="ghost" size="xs" :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" :aria-label="showPassword ? t('auth.hidePassword') : t('auth.showPassword')" @click="showPassword = !showPassword" />
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
          {{ t('auth.register.submit') }}
        </UButton>
      </UForm>

      <template #footer>
        <p class="text-sm text-muted text-center">
          {{ t('auth.hasAccount') }}
          <NuxtLink
            :to="{ path: '/login', query: route.query.redirect ? { redirect: route.query.redirect } : {} }"
            class="text-primary hover:underline"
          >
            {{ t('nav.signIn') }}
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </UContainer>
</template>

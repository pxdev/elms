<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ guest: true })

useSeoMeta({ title: `${t('auth.register.title')} · ${t('app.title')}` })

const { fetch: refreshSession } = useUserSession()

const state = reactive({
  name: '',
  email: '',
  password: '',
  timeZone: '',
  phone: '',
  country: '',
  age: undefined as number | undefined
})

const loading = ref(false)
const errorMessage = ref<string | null>(null)

async function onSubmit() {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: state
    })
    await refreshSession()
    await navigateTo('/verify-email')
  } catch (err) {
    const e = err as { data?: { message?: string }, message?: string }
    errorMessage.value = e.data?.message ?? e.message ?? t('errors.generic')
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
          />
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
          />
        </UFormField>

        <UFormField
          :label="t('auth.password')"
          name="password"
          required
          :help="t('auth.register.passwordHint')"
        >
          <UInput
            v-model="state.password"
            type="password"
            autocomplete="new-password"
            class="w-full"
            :placeholder="t('auth.password')"
          />
        </UFormField>

        <USeparator class="my-2" />

        <UFormField
          :label="t('auth.timeZone')"
          name="timeZone"
        >
          <UInput
            v-model="state.timeZone"
            class="w-full"
            :placeholder="t('auth.timeZone')"
          />
        </UFormField>

        <UFormField
          :label="t('auth.phone')"
          name="phone"
        >
          <UInput
            v-model="state.phone"
            type="tel"
            class="w-full"
            :placeholder="t('auth.phone')"
          />
        </UFormField>

        <UFormField
          :label="t('auth.country')"
          name="country"
        >
          <UInput
            v-model="state.country"
            class="w-full"
            :placeholder="t('auth.country')"
          />
        </UFormField>

        <UFormField
          :label="t('auth.age')"
          name="age"
        >
          <UInput
            v-model="state.age"
            type="number"
            class="w-full"
            :placeholder="t('auth.age')"
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
          {{ t('auth.register.submit') }}
        </UButton>
      </UForm>

      <template #footer>
        <p class="text-sm text-muted text-center">
          {{ t('auth.hasAccount') }}
          <NuxtLink
            to="/login"
            class="text-primary hover:underline"
          >
            {{ t('nav.signIn') }}
          </NuxtLink>
        </p>
      </template>
    </UCard>
  </UContainer>
</template>

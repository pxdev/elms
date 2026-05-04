<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ guest: true })

useSeoMeta({ title: `${t('auth.forgotPassword.title')} · ${t('app.title')}` })

const state = reactive({ email: '' })
const loading = ref(false)
const sent = ref(false)
const errorMessage = ref<string | null>(null)

async function onSubmit() {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch('/api/auth/password/forgot', {
      method: 'POST',
      body: state
    })
    sent.value = true
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
          {{ t('auth.forgotPassword.title') }}
        </h1>
        <p class="text-sm text-muted mt-1">
          {{ t('auth.forgotPassword.description') }}
        </p>
      </template>

      <UAlert
        v-if="sent"
        color="success"
        variant="soft"
        icon="i-lucide-check"
        :title="t('auth.forgotPassword.sentTitle')"
        :description="t('auth.forgotPassword.sentDescription')"
      />

      <UForm
        v-else
        :state="state"
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
          {{ t('auth.forgotPassword.submit') }}
        </UButton>
      </UForm>

      <template #footer>
        <p class="text-sm text-muted text-center">
          {{ t('auth.rememberedPassword') }}
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

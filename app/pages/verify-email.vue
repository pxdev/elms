<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({ title: `${t('auth.verifyEmail.titlePending')} · ${t('app.title')}` })

const route = useRoute()
const status = computed(() => String(route.query.status ?? 'pending'))
const continueTo = computed(() => {
  const value = String(route.query.redirect ?? '')
  return value.startsWith('/') && !value.startsWith('//') ? value : '/dashboard'
})

const { user } = useUserSession()
const resending = ref(false)
const resendError = ref<string | null>(null)
const resendSuccess = ref(false)

async function resend() {
  if (!user.value?.email) return
  resending.value = true
  resendError.value = null
  resendSuccess.value = false
  try {
    await $fetch('/api/auth/verify-email/request', {
      method: 'POST',
      body: { email: user.value.email }
    })
    resendSuccess.value = true
  } catch (err) {
    const e = err as { data?: { message?: string }, message?: string }
    resendError.value = e.data?.message ?? e.message ?? t('errors.generic')
  } finally {
    resending.value = false
  }
}
</script>

<template>
  <UContainer class="py-12">
    <UCard class="max-w-md mx-auto">
      <template
        v-if="status === 'ok'"
        #header
      >
        <h1 class="text-xl font-semibold flex items-center gap-2">
          <UIcon
            name="i-lucide-circle-check"
            class="text-primary text-2xl"
          />
          {{ t('auth.verifyEmail.titleOk') }}
        </h1>
      </template>
      <template
        v-else-if="status === 'invalid'"
        #header
      >
        <h1 class="text-xl font-semibold flex items-center gap-2">
          <UIcon
            name="i-lucide-alert-circle"
            class="text-error text-2xl"
          />
          {{ t('auth.verifyEmail.titleInvalid') }}
        </h1>
      </template>
      <template
        v-else
        #header
      >
        <h1 class="text-xl font-semibold flex items-center gap-2">
          <UIcon
            name="i-lucide-mail"
            class="text-primary text-2xl"
          />
          {{ t('auth.verifyEmail.titlePending') }}
        </h1>
      </template>

      <div
        v-if="status === 'ok'"
        class="space-y-4"
      >
        <p class="text-sm">
          {{ t('auth.verifyEmail.confirmed') }}
        </p>
        <UButton
          :to="continueTo"
          block
        >
          {{ t('auth.verifyEmail.goToDashboard') }}
        </UButton>
      </div>

      <div
        v-else-if="status === 'invalid'"
        class="space-y-4"
      >
        <p class="text-sm text-muted">
          {{ t('auth.verifyEmail.invalid') }}
        </p>
        <UButton
          v-if="user"
          block
          :loading="resending"
          @click="resend"
        >
          {{ t('auth.verifyEmail.resend') }}
        </UButton>
        <UAlert
          v-if="resendSuccess"
          color="success"
          variant="soft"
          icon="i-lucide-check"
          :title="t('auth.verifyEmail.resendSent')"
        />
        <UAlert
          v-if="resendError"
          color="error"
          variant="soft"
          icon="i-lucide-alert-circle"
          :title="resendError"
        />
      </div>

      <div
        v-else
        class="space-y-4"
      >
        <p class="text-sm text-muted">
          <template v-if="user?.email">
            {{ t('auth.verifyEmail.checkInbox', { email: user.email }) }}
          </template>
          <template v-else>
            {{ t('auth.verifyEmail.checkInbox', { email: '' }) }}
          </template>
        </p>
        <UButton
          v-if="user"
          block
          variant="subtle"
          color="neutral"
          :loading="resending"
          @click="resend"
        >
          {{ t('auth.verifyEmail.resend') }}
        </UButton>
        <UButton
          v-if="user"
          :to="continueTo"
          block
          variant="ghost"
          color="neutral"
        >
          {{ t('auth.verifyEmail.continue') }}
        </UButton>
        <UAlert
          v-if="resendSuccess"
          color="success"
          variant="soft"
          icon="i-lucide-check"
          :title="t('auth.verifyEmail.resendSent')"
        />
        <UAlert
          v-if="resendError"
          color="error"
          variant="soft"
          icon="i-lucide-alert-circle"
          :title="resendError"
        />
      </div>
    </UCard>
  </UContainer>
</template>

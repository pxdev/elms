<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: true })

useSeoMeta({ title: `${t('dashboard.title')} · ${t('app.title')}` })

const { user, clear } = useUserSession()

const { data: me, refresh } = await useFetch('/api/me')

const resending = ref(false)
const resent = ref(false)

async function resendVerification() {
  if (!user.value?.email) return
  resending.value = true
  resent.value = false
  try {
    await $fetch('/api/auth/verify-email/request', {
      method: 'POST',
      body: { email: user.value.email }
    })
    resent.value = true
  } finally {
    resending.value = false
  }
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <UContainer class="py-12 space-y-6">
    <UAlert
      v-if="me?.user && !me.user.emailVerified"
      color="warning"
      variant="subtle"
      icon="i-lucide-mail-warning"
      :title="t('dashboard.verifyBanner.title')"
      :description="t('dashboard.verifyBanner.description')"
      :actions="[{
        label: resent ? t('dashboard.verifyBanner.resent') : t('dashboard.verifyBanner.resend'),
        color: 'warning',
        variant: 'solid',
        loading: resending,
        disabled: resending || resent,
        onClick: resendVerification
      }]"
    />

    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">
          {{ t('dashboard.title') }}
        </h1>
        <p class="text-sm text-muted">
          {{ t('dashboard.signedInAs', { email: user?.email }) }}
        </p>
        <UBadge
          v-if="user?.role"
          :label="t(`roles.${user.role}`)"
          color="primary"
          variant="subtle"
          size="sm"
          class="mt-1"
        />
      </div>

      <UButton
        color="neutral"
        variant="subtle"
        icon="i-lucide-log-out"
        @click="logout"
      >
        {{ t('nav.signOut') }}
      </UButton>
    </div>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">
            {{ t('dashboard.profileTitle') }}
          </h2>
          <UButton
            size="xs"
            color="neutral"
            variant="ghost"
            icon="i-lucide-refresh-cw"
            @click="() => refresh()"
          >
            {{ t('dashboard.refresh') }}
          </UButton>
        </div>
      </template>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="field in [
            { key: 'name', value: me?.user?.name },
            { key: 'email', value: me?.user?.email },
            { key: 'role', value: me?.user?.role ? t(`roles.${me.user.role}`) : undefined },
            { key: 'timeZone', value: me?.user?.timeZone },
            { key: 'phone', value: me?.user?.phone },
            { key: 'country', value: me?.user?.country },
            { key: 'age', value: me?.user?.age },
            { key: 'isActive', value: me?.user?.isActive !== undefined ? (me?.user?.isActive ? t('common.yes') : t('common.no')) : undefined },
            { key: 'emailVerified', value: me?.user?.emailVerified !== undefined ? (me?.user?.emailVerified ? t('common.yes') : t('common.no')) : undefined },
            { key: 'createdAt', value: me?.user?.createdAt ? new Date(me.user.createdAt).toLocaleString() : undefined }
          ]"
          :key="field.key"
          class="space-y-1"
        >
          <p class="text-xs text-muted uppercase font-medium">
            {{ t(`fields.${field.key}`) }}
          </p>
          <p class="text-sm font-medium">
            {{ field.value ?? '-' }}
          </p>
        </div>
      </div>
    </UCard>
  </UContainer>
</template>

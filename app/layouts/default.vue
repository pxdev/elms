<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <div>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
          <UIcon name="i-lucide-zap" class="text-primary text-xl" />
          <span>{{ t('app.title') }}</span>
        </NuxtLink>
      </template>

      <template #right>
        <UButton
          size="xs"
          variant="ghost"
          :color="locale === 'en' ? 'primary' : 'neutral'"
          @click="setLocale('en')"
        >
          EN
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          :color="locale === 'ar' ? 'primary' : 'neutral'"
          @click="setLocale('ar')"
        >
          AR
        </UButton>

        <USeparator orientation="vertical" class="h-4 mx-1" />

        <template v-if="loggedIn">
          <UButton to="/dashboard" variant="ghost" color="neutral" class="hidden md:inline-flex">
            {{ t('nav.dashboard') }}
          </UButton>
          <UButton to="/courses" variant="ghost" color="neutral" class="hidden md:inline-flex">
            {{ t('nav.courses') }}
          </UButton>
          <UButton to="/enrollments" variant="ghost" color="neutral" class="hidden md:inline-flex">
            {{ t('nav.enrollments') }}
          </UButton>
          <UButton
            v-if="user?.role === 'ADMIN'"
            to="/admin"
            variant="ghost"
            color="neutral"
            class="hidden md:inline-flex"
          >
            {{ t('nav.admin') }}
          </UButton>
          <UDropdownMenu
            :items="[
              [{ label: user?.email ?? '', type: 'label' }],
              [{ label: t('nav.profile'), icon: 'i-lucide-user', to: '/profile' }],
              [{ label: t('nav.signOut'), icon: 'i-lucide-log-out', onSelect: logout }]
            ]"
          >
            <UButton
              icon="i-lucide-user"
              color="neutral"
              variant="ghost"
              :label="user?.name || user?.email"
              class="max-w-36"
              :ui="{ label: 'truncate' }"
            />
          </UDropdownMenu>
        </template>

        <template v-else>
          <UButton to="/courses" variant="ghost" color="neutral" class="hidden md:inline-flex">
            {{ t('nav.courses') }}
          </UButton>
          <UButton to="/login" variant="ghost" color="neutral" class="hidden md:inline-flex">
            {{ t('nav.signIn') }}
          </UButton>
          <UButton to="/register" color="primary" class="hidden md:inline-flex">
            {{ t('nav.signUp') }}
          </UButton>
        </template>
      </template>
      <template #body>
        <nav class="flex flex-col gap-2 p-4" :aria-label="t('nav.menu')">
          <UButton to="/courses" variant="ghost" color="neutral" block>{{ t('nav.courses') }}</UButton>
          <template v-if="loggedIn">
            <UButton to="/dashboard" variant="ghost" color="neutral" block>{{ t('nav.dashboard') }}</UButton>
            <UButton to="/enrollments" variant="ghost" color="neutral" block>{{ t('nav.enrollments') }}</UButton>
          </template>
          <template v-else>
            <UButton to="/login" variant="ghost" color="neutral" block>{{ t('nav.signIn') }}</UButton>
            <UButton to="/register" block>{{ t('nav.signUp') }}</UButton>
          </template>
        </nav>
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          {{ t('app.footer') }} &middot; &copy; {{ new Date().getFullYear() }}
        </p>
      </template>
    </UFooter>
  </div>
</template>

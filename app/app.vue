<script setup lang="ts">
const { t, locale, setLocale } = useI18n()

useHead(() => ({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.ico' }
  ],
  htmlAttrs: {
    lang: locale.value,
    dir: locale.value === 'ar' ? 'rtl' : 'ltr'
  }
}))

useSeoMeta({
  title: t('app.title'),
  description: t('app.description'),
  ogTitle: t('app.title'),
  ogDescription: t('app.description')
})

const { loggedIn, user, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}
</script>

<template>
  <UApp>
    <UHeader>
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 font-semibold"
        >
          <UIcon
            name="i-lucide-zap"
            class="text-primary text-xl"
          />
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

        <USeparator
          orientation="vertical"
          class="h-4 mx-1"
        />

        <template v-if="loggedIn">
          <UButton
            to="/dashboard"
            variant="ghost"
            color="neutral"
          >
            {{ t('nav.dashboard') }}
          </UButton>
          <UButton
            to="/courses"
            variant="ghost"
            color="neutral"
          >
            {{ t('nav.courses') }}
          </UButton>
          <UButton
            to="/enrollments"
            variant="ghost"
            color="neutral"
          >
            {{ t('nav.enrollments') }}
          </UButton>
          <UButton
            v-if="user?.role === 'ADMIN'"
            to="/admin"
            variant="ghost"
            color="neutral"
          >
            {{ t('nav.admin') }}
          </UButton>
          <UDropdownMenu
            :items="[
              [{ label: user?.email ?? '', type: 'label' }],
              [{ label: t('nav.signOut'), icon: 'i-lucide-log-out', onSelect: logout }]
            ]"
          >
            <UButton
              icon="i-lucide-user"
              color="neutral"
              variant="ghost"
              :label="user?.name || user?.email"
            />
          </UDropdownMenu>
        </template>

        <template v-else>
          <UButton
            to="/courses"
            variant="ghost"
            color="neutral"
          >
            {{ t('nav.courses') }}
          </UButton>
          <UButton
            to="/login"
            variant="ghost"
            color="neutral"
          >
            {{ t('nav.signIn') }}
          </UButton>
          <UButton
            to="/register"
            color="primary"
          >
            {{ t('nav.signUp') }}
          </UButton>
        </template>
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
  </UApp>
</template>

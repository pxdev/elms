<script setup lang="ts">
import * as uiLocales from '@nuxt/ui/locale'

// Mirrors APP/app/app.vue — keeps <html lang/dir> reactive to the active
// locale across every layout (landing, dashboard, admin, auth) so calling
// setLocale() actually flips the page direction without each layout needing
// its own useHead block.

const { locale } = useI18n()

const uiLocale = computed(
  () => (uiLocales as Record<string, { code: string; dir: 'rtl' | 'ltr' }>)[locale.value]
)

useHead({
  htmlAttrs: {
    lang: computed(() => uiLocale.value?.code ?? locale.value),
    dir: computed(() => uiLocale.value?.dir ?? 'ltr')
  }
})

// Force light mode site-wide. Color-mode toggle UI has been removed — this
// also resets returning users whose localStorage still holds a stale 'dark'
// preference from before the toggle was disabled.
const colorMode = useColorMode()
if (colorMode.preference !== 'light') colorMode.preference = 'light'
</script>

<template>
  <UApp :locale="uiLocale">
    <NuxtLoadingIndicator color="var(--color-primary)" :height="3" :throttle="200" />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

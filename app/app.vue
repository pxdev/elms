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
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

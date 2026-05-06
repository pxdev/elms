// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    'nuxt-auth-utils',
    '@nuxtjs/i18n'
  ],

  devtools: {
    enabled: false
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  compatibilityDate: '2026-05-04',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  i18n: {
    locales: [
      {code: 'en', name: 'English', dir: 'ltr', file: "en.json"},
      {code: 'ar', name: 'العربية', dir: 'rtl', file: "ar.json"}
    ],
     // `en` is only the static fallback. detectBrowserLanguage below routes
    // first-time visitors to `/ar/` or `/en/` based on their browser
    // Accept-Language, then a cookie remembers their explicit choice from
    // the toggle button.
    defaultLocale: 'en',
    // prefix_and_default — both /portal/foo (default locale, English) and
    // /en/portal/foo and /ar/portal/foo all resolve to a real route. This
    // keeps every existing <NuxtLink to="/portal/..."> working for English
    // visitors while still giving Arabic visitors explicit /ar/ URLs and
    // the user a way to deep-link either locale by hand.
    strategy: 'prefix_and_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root'
    }
  }

})

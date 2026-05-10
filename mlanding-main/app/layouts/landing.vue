<script setup lang="ts">
// Landing marketing layout — shared nav + footer for the home page and /portal/* marketing sub-pages.
// <html lang/dir> wiring lives in app.vue so every layout gets it.
const copy = useLandingCopy()
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white antialiased">
    <!-- Accessibility: keyboard skip link (hidden until focused) -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[60] focus:inline-flex focus:items-center focus:gap-2 focus:px-4 focus:h-10 focus:rounded-full focus:bg-primary focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
    >
      {{ copy.ui.skipToMain }}
    </a>
    <LandingNav />
    <main id="main-content" tabindex="-1" class="pt-16">
      <slot />
    </main>
    <LandingFooter />
    <LandingWhatsApp />
  </div>
</template>

<style>

</style>

<script setup lang="ts">
const localePath = useLocalePath()
const { currentLocale, otherLocale, toggleLocale } = useLandingLocale()
const chrome = useChromeCopy()
</script>

<template>
  <div class="min-h-dvh flex flex-col lg:flex-row">
    <!-- ═══ Left panel — branding (desktop only) ═══ -->
    <div
      class="hidden lg:flex lg:w-5/12 relative bg-primary flex-col justify-between p-12 xl:p-16 text-white"
    >
      <!-- Logo -->
      <NuxtLink :to="localePath('/')" class="flex items-center gap-3 group">
        <div class="size-9 rounded-lg bg-white text-primary flex items-center justify-center font-black text-lg group-hover:scale-105 transition-transform">
          M
        </div>
        <span class="font-bold text-lg tracking-tight">Momentfy</span>
      </NuxtLink>

      <!-- Value prop -->
      <div class="max-w-sm">
        <h2 class="text-3xl xl:text-4xl font-bold tracking-tight leading-tight">
          {{ chrome.auth.brandPanel.headline }}
        </h2>
        <p class="mt-4 text-sm text-white/70 leading-relaxed">
          {{ chrome.auth.brandPanel.tagline }}
        </p>
      </div>

      <!-- Footer -->
      <p class="text-sm text-white/40">
        &copy; Momentfy
      </p>
    </div>

    <!-- ═══ Right panel — form area ═══ -->
    <div class="flex-1 flex flex-col min-h-dvh bg-white dark:bg-neutral-950">
      <!-- Mobile header -->
      <header class="lg:hidden px-6 h-14 flex items-center border-b border-gray-100 dark:border-white/5">
        <NuxtLink :to="localePath('/')" class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg bg-primary text-white flex items-center justify-center font-black text-base">
            M
          </div>
          <span class="font-bold text-base tracking-tight">Momentfy</span>
        </NuxtLink>
      </header>

      <!-- Language toggle -->
      <div class="flex justify-end px-6 sm:px-10 pt-5 sm:pt-8">
        <ClientOnly>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            :aria-label="otherLocale?.name"
            @click="toggleLocale"
          >
            <UIcon name="i-lucide-globe" class="size-3.5" />
            <span>{{ otherLocale?.name }}</span>
          </button>
          <template #fallback>
            <span class="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-gray-400">
              <UIcon name="i-lucide-globe" class="size-3.5" />
              <span>{{ currentLocale?.name }}</span>
            </span>
          </template>
        </ClientOnly>
      </div>

      <!-- Form -->
      <main class="flex-1 grid place-items-center px-6 py-10 sm:px-10">
        <div class="w-full max-w-md">
          <slot />
        </div>
      </main>

      <!-- Mobile footer -->
      <footer class="lg:hidden py-4 text-center text-xs text-gray-400">
        &copy; Momentfy
      </footer>
    </div>
  </div>
</template>

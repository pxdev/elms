<script setup lang="ts">
const localePath = useLocalePath()
// Hero section orchestrator.
// Composes: background → headline block → product mock → four floating overlay cards.
const copy = useLandingCopy()
const demoUrl = useRuntimeConfig().public.demoUrl
</script>

<template>
  <section class="relative isolate overflow-hidden">
    <LandingHeroBackground />

    <div class="max-w-7xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 sm:pb-28">
      <!-- ─── Eyebrow chip — neutral ring, brand-blue version pill ─── -->
      <div class="flex justify-center mb-8">
        <NuxtLink
          :to="localePath('/portal/features')"
          class="group inline-flex items-center gap-2 ps-1 pe-3 py-1 rounded-full bg-white/80 dark:bg-white/[0.06] backdrop-blur ring-1 ring-black/10 dark:ring-white/10 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/[0.08] transition-colors"
        >
          <span class="inline-flex items-center justify-center h-6 px-2 rounded-full bg-secondary-500 text-white text-[10px] font-black tracking-wide">v1.0</span>
          <span>{{ copy.hero.badge }}</span>
          <UIcon name="i-lucide-arrow-right" class="size-3 opacity-60 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 transition-transform" />
        </NuxtLink>
      </div>

      <!-- ─── Headline — single decoration: gradient text fill on the highlight ─── -->
      <h1 class="text-center font-black tracking-tight text-5xl sm:text-7xl lg:text-[5.5rem] leading-[1.02] max-w-5xl mx-auto text-primary dark:text-white">
        {{ copy.hero.h1a }}
        <span class="bg-gradient-to-br from-secondary-500 to-secondary-700 dark:from-secondary-400 dark:to-secondary-600 bg-clip-text text-transparent">{{ copy.hero.highlight }}</span>
        <br class="hidden sm:block" />
        {{ copy.hero.h1b }}
      </h1>

      <p class="mt-8 text-center text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
        {{ copy.hero.sub }}
        <span class="font-semibold text-primary dark:text-white">{{ copy.hero.subStrong }}</span>
      </p>

      <!-- ─── CTAs — Primary (solid black) + Secondary (frosted, hairline ring) ─── -->
      <div class="mt-10 flex flex-wrap justify-center gap-3">
        <NuxtLink :to="localePath('/portal/pricing')" class="btn-primary">
          <UIcon name="i-lucide-shopping-bag" class="size-4" />
          <span>{{ copy.hero.primary }}</span>
          <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
        </NuxtLink>
        <a :href="demoUrl" target="_blank" rel="noopener" class="btn-secondary">
          <UIcon name="i-lucide-play-circle" class="size-4 text-secondary-500" />
          <span>{{ copy.hero.secondary }}</span>
          <UIcon name="i-lucide-arrow-up-right" class="size-3.5 opacity-60" />
        </a>
      </div>

      <!-- ─── Trust bar ─── -->
      <div class="mt-10 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-500">
        <span v-for="t in copy.hero.trust" :key="t" class="inline-flex items-center gap-1.5">
          <UIcon name="i-lucide-check-circle-2" class="size-3.5 text-emerald-500" />
          {{ t }}
        </span>
      </div>

      <!-- ═══════════ Hero stage — product mock with a single soft glow ═══════════ -->
      <div class="mt-24 relative mx-auto max-w-6xl lg:px-16">
        <!-- Single restrained stage glow -->
        <div aria-hidden="true" class="absolute inset-x-16 -bottom-12 h-24 bg-secondary-500 blur-3xl opacity-20 dark:opacity-30 rounded-[50%]" />

        <LandingHeroProduct src="/videos/general-1.mp4" aspect-ratio="3454 / 1802" />
      </div>
    </div>
  </section>
</template>

<script setup>
const copy = useLandingCopy()
</script>

<template>
  <section class="relative py-16 overflow-hidden bg-white dark:bg-black">
    <!-- Marquee: huge uppercase industry sweep — RTL-aware via Nuxt UI v4 -->
    <div
      class="relative border-y border-black/5 dark:border-white/10 py-6 mb-16"
      role="presentation"
    >
      <UMarquee
        :repeat="3"
        :overlay="false"
        :pause-on-hover="false"
        class="[--duration:40s] [--gap:--spacing(16)]"
      >
        <template
          v-for="(ind, i) in copy.industries.items"
          :key="ind.id"
        >
          <span class="text-3xl sm:text-5xl font-black uppercase tracking-tight text-gray-300/80 dark:text-white/10 whitespace-nowrap">{{ ind.label }}</span>
          <UIcon
            name="i-lucide-asterisk"
            class="size-5 sm:size-6 text-secondary-500/60 shrink-0"
            :class="i === 0 ? 'animate-spin [animation-duration:8s]' : ''"
          />
        </template>
      </UMarquee>
    </div>

    <!-- Stats — four hairline cells. `gap-px` on a tinted parent renders the
       dividers automatically for both the mobile 2×2 grid and the desktop 1×4 row. -->
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-black/10 dark:bg-white/10 border-y border-black/10 dark:border-white/10">
        <div
          v-for="(s, i) in copy.hero.statsStrip"
          :key="s.v"
          class="relative py-10 lg:py-16 px-5 sm:px-8 bg-white dark:bg-black"
        >
          <span class="text-[10px] tabular-nums text-gray-400 tracking-widest">
            {{ String(i + 1).padStart(2, '0') }}
          </span>
          <p
            class="mt-4 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-none text-primary dark:text-white"
            style="font-variant-numeric: tabular-nums"
          >
            {{ s.k }}
          </p>
          <p class="mt-5 text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 leading-snug max-w-[14rem]">
            {{ s.v }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

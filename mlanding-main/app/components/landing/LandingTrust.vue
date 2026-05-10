<script setup>
const localePath = useLocalePath()
const copy = useLandingCopy()
</script>

<template>
  <section
    id="trust"
    class="relative py-24 sm:py-32 overflow-hidden bg-gray-50 dark:bg-white/[0.02]"
  >
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10"
    />

    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="5"
        :label="copy.trust.eyebrow"
        :heading="copy.trust.heading"
        :sub="copy.trust.sub"
      />

      <NuxtLink
        :to="localePath('/portal/legal')"
        class="group inline-flex items-center gap-3 text-sm font-bold mb-16"
      >
        <span class="size-10 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 rtl:rotate-180"
          />
        </span>
        <span class="relative">
          {{ copy.ui.readLicense }}
          <span
            aria-hidden="true"
            class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors"
          />
        </span>
      </NuxtLink>

      <!-- 4 pillars in a hairline-separated grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-t border-black/10 dark:border-white/10 lg:divide-x lg:divide-black/10 lg:dark:divide-white/10 rtl:lg:divide-x-reverse">
        <div
          v-for="(p, i) in copy.trust.pillars"
          :key="p.title"
          class="group py-8 lg:py-10 lg:px-8 first:lg:ps-0 last:lg:pe-0 border-b md:border-b-0 border-black/10 dark:border-white/10 md:[&:nth-child(2)]:border-b lg:[&:nth-child(2)]:border-b-0 md:[&:nth-last-child(-n+2)]:border-b-0"
        >
          <div class="flex items-center gap-3 mb-5">
            <span class="text-xs tabular-nums text-gray-400">{{ String(i + 1).padStart(2, '0') }}</span>
            <span
              aria-hidden="true"
              class="h-px w-6 bg-black/20 dark:bg-white/20"
            />
            <UIcon
              :name="p.icon"
              class="size-5 text-secondary-500 transition-transform group-hover:scale-110 group-hover:-rotate-[6deg]"
            />
          </div>
          <h3 class="text-2xl sm:text-3xl font-black tracking-tight leading-tight mb-3">
            {{ p.title }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ p.body }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

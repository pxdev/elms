<script setup>
const localePath = useLocalePath()
defineProps({
  crumbLabel: { type: String, required: true },
  headline:   { type: String, required: true },
  sub:        { type: String, required: true }
})
</script>

<template>
  <section class="relative pt-12 pb-16 sm:pt-16 sm:pb-20 overflow-hidden">
    <div aria-hidden="true" class="absolute inset-0 -z-10 pointer-events-none">
      <div
        class="absolute inset-0 opacity-[0.5] dark:opacity-30 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style="background-image:radial-gradient(circle at 1px 1px,rgba(0,0,0,.06) 1px,transparent 0);background-size:22px 22px"
      />
      <slot name="background" />
    </div>

    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <nav aria-label="Breadcrumb" class="text-xs flex items-center gap-2 mb-8 text-gray-400">
        <NuxtLink :to="localePath('/')" class="hover:text-primary dark:hover:text-white transition-colors">Momentfy</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-3 rtl:rotate-180" />
        <span class="text-primary dark:text-white font-semibold">{{ crumbLabel }}</span>
      </nav>

      <h1 class="font-black tracking-tight leading-[1.05] text-3xl sm:text-4xl lg:text-5xl max-w-3xl">
        {{ headline }}
      </h1>

      <p class="mt-5 text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
        {{ sub }}
      </p>

      <slot />
    </div>
  </section>
</template>

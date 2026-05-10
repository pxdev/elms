<script setup lang="ts">
const props = withDefaults(defineProps<{
  to?: string
  hideTextBelow?: 'sm' | 'md' | 'lg'
}>(), {
  to: undefined,
  hideTextBelow: undefined
})
const localePath = useLocalePath()
// Default the link target to the locale-prefixed home so an AR visitor
// stays on /ar/ when they tap the brand mark. Callers can pass an explicit
// `to` to override.
const resolvedTo = computed(() => props.to ?? localePath('/'))
</script>

<template>
  <NuxtLink :to="resolvedTo" class="flex items-center gap-2 shrink-0 group" aria-label="Momentfy — Home">
    <div class="size-8 rounded-xl bg-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
      M
    </div>
    <span
      class="font-black text-lg tracking-tight text-primary dark:text-white"
      :class="{
        'hidden sm:inline': hideTextBelow === 'sm',
        'hidden md:inline': hideTextBelow === 'md',
        'hidden lg:inline': hideTextBelow === 'lg'
      }"
    >
      Momentfy
    </span>
  </NuxtLink>
</template>

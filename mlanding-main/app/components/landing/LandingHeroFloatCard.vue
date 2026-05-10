<script setup lang="ts">
// Reusable wrapper for the overlay cards that sit around the hero product mock.
// Handles: absolute positioning container + breakpoint gating + rotation CSS var + float animation delay.
// The positioning (e.g. -top-10 -start-8 w-72) is passed in via `class` and merges with the root.
// Children provide their own card chrome (bg, border, radius, padding).
const props = defineProps<{
  rotation?: number
  delay?: number
  hideBelow?: 'lg' | 'xl'
}>()

const rootStyle = computed(() => ({
  '--rotation': `${props.rotation ?? 0}deg`,
  animationDelay: props.delay !== undefined ? `${props.delay}s` : undefined
}))
</script>

<template>
  <div
    class="absolute z-10 animate-float"
    :class="hideBelow === 'xl' ? 'hidden xl:block' : 'hidden lg:block'"
    :style="rootStyle"
  >
    <slot />
  </div>
</template>

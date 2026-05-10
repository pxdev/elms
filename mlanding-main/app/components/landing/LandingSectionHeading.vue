<script setup lang="ts">
interface Props {
  number?: string | number | null
  label: string
  heading: string
  sub?: string | null
  count?: number | string | null
  maxWidth?: string
  as?: 'h1' | 'h2'
}

const props = withDefaults(defineProps<Props>(), {
  number: null,
  sub: null,
  count: null,
  maxWidth: 'max-w-4xl',
  as: 'h2'
})

const formattedNumber = computed(() =>
  props.number === null || props.number === undefined || props.number === ''
    ? null
    : String(props.number).padStart(2, '0')
)
const formattedCount = computed(() =>
  props.count === null || props.count === undefined
    ? null
    : String(props.count).padStart(2, '0')
)
</script>

<template>
  <div :class="['mb-16 sm:mb-20', maxWidth]">
    <div class="flex items-center gap-3 mb-6 sm:mb-8">
      <span aria-hidden="true" class="inline-block h-px w-8 bg-primary" />
      <p class="text-xs font-semibold uppercase tracking-[0.3em] text-gray-600 dark:text-gray-300">
        <template v-if="formattedNumber">{{ formattedNumber }} · </template>{{ label }}
      </p>
      <span
        v-if="formattedCount !== null"
        class="text-xs uppercase tracking-[0.3em] text-gray-400 tabular-nums"
      >
        / {{ formattedCount }}
      </span>
      <slot name="meta" />
    </div>

    <h1
      v-if="as === 'h1'"
      class="font-black tracking-tight leading-[0.95] text-4xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white"
    >
      {{ heading }}
    </h1>
    <h2
      v-else
      class="font-black tracking-tight leading-[0.95] text-4xl sm:text-5xl lg:text-6xl text-gray-900 dark:text-white"
    >
      {{ heading }}
    </h2>

    <p
      v-if="sub"
      class="mt-5 sm:mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl"
    >
      {{ sub }}
    </p>
  </div>
</template>

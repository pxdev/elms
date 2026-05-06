<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  createLabel?: string
  createTo?: string
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-semibold">{{ title }}</h1>
      <p v-if="description" class="text-sm text-muted-foreground mt-1">
        {{ description }}
      </p>
    </div>
    <UButton
      v-if="createLabel && createTo"
      :to="createTo"
      icon="i-lucide-plus"
      color="primary"
    >
      {{ createLabel }}
    </UButton>
  </div>
</template>

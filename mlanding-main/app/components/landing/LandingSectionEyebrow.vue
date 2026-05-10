<script setup>
// Tiny in-section label — the small "—— What it does" / "—— Key capabilities"
// eyebrow that labels a content block (no big H2 follows). Distinct from
// LandingSectionHeading which announces a whole section with a big heading.
//
// Usage:
//   <LandingSectionEyebrow label="Key capabilities" class="mb-4" />
//   <LandingSectionEyebrow class="mb-2"><strong>Special</strong> case</LandingSectionEyebrow>
//
// Single root <p> means margin/spacing utilities passed via class attribute
// merge cleanly with the built-in style.
defineProps({
  label: { type: String, default: null }
})
</script>

<template>
  <p class="text-xs uppercase tracking-[0.25em] text-gray-400">
    <span aria-hidden="true">—— </span><slot>{{ label }}</slot>
  </p>
</template>

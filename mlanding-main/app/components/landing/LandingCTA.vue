<script setup lang="ts">
const localePath = useLocalePath()
const props = defineProps<{
  eyebrow?: string
  title?: string
  subtitle?: string
}>()
const copy = useLandingCopy()
const eyebrowText = computed(() => props.eyebrow ?? copy.value.cta.eyebrow)
const titleText = computed(() => props.title ?? copy.value.cta.heading)
const subtitleText = computed(() => props.subtitle ?? copy.value.cta.sub)
</script>

<template>
  <section class="relative isolate overflow-hidden">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 pb-24">
      <div class="relative overflow-hidden rounded-[2.5rem] bg-primary p-6 sm:p-10 lg:p-16 text-white">
        <!-- Grain -->
        <div aria-hidden="true" class="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay"
          style="background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%222%22 /></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')" />
        <!-- Glow orbs -->
        <div aria-hidden="true" class="pointer-events-none absolute -top-24 -start-24 w-96 h-96 rounded-full bg-secondary-400 blur-3xl opacity-30 animate-blob" />
        <div aria-hidden="true" class="pointer-events-none absolute -bottom-32 -end-24 w-[30rem] h-[30rem] rounded-full bg-secondary-600 blur-3xl opacity-30 animate-blob" style="animation-delay:-3s" />

        <div class="relative max-w-3xl">
          <div v-if="eyebrowText" class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-secondary-200 mb-5">
            <span class="size-1 rounded-full bg-secondary-300" />
            {{ eyebrowText }}
          </div>
          <h2 class="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
            {{ titleText }}
          </h2>
          <p class="mt-5 text-lg text-white/70 max-w-xl leading-relaxed">
            {{ subtitleText }}
          </p>
          <div class="mt-8 flex flex-wrap items-center gap-3">
            <NuxtLink
              :to="localePath('/portal/pricing')"
              class="inline-flex items-center gap-2 px-6 h-12 rounded-full text-sm font-semibold bg-white text-primary hover:scale-[1.02] shadow-xl shadow-black/30 transition-all"
            >
              <UIcon name="i-lucide-shopping-cart" class="size-4" />
              {{ copy.cta.buy }}
            </NuxtLink>
            <NuxtLink
              :to="localePath('/portal/features')"
              class="inline-flex items-center gap-2 px-6 h-12 rounded-full text-sm font-semibold border border-white/20 hover:bg-white/10 transition-colors"
            >
              {{ copy.cta.explore }}
              <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
            </NuxtLink>
          </div>

          <div class="mt-10 flex flex-wrap items-center gap-6 text-sm text-white/60">
            <span class="inline-flex items-center gap-2">
              <UIcon name="i-lucide-check-circle-2" class="size-4 text-emerald-300" /> {{ copy.cta.lifetime }}
            </span>
            <span class="inline-flex items-center gap-2">
              <UIcon name="i-lucide-check-circle-2" class="size-4 text-emerald-300" /> {{ copy.cta.unlimited }}
            </span>
            <span class="inline-flex items-center gap-2">
              <UIcon name="i-lucide-check-circle-2" class="size-4 text-emerald-300" /> {{ copy.cta.updates }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

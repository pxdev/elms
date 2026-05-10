<script setup>
const localePath = useLocalePath()
const copy = useLandingCopy()
const faqOpen = ref(0)
</script>

<template>
  <section class="relative py-24 sm:py-32 overflow-hidden">
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10"
    />

    <div class="max-w-6xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="8"
        :label="copy.faq.eyebrow"
        :heading="copy.faq.heading"
        :sub="copy.ui.cantFindFaq"
      />

      <NuxtLink
        :to="localePath('/portal/faq')"
        class="group inline-flex items-center gap-3 text-sm font-bold mb-16"
      >
        <span class="size-10 rounded-full bg-primary dark:bg-white text-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
          <UIcon
            name="i-lucide-arrow-right"
            class="size-4 rtl:rotate-180"
          />
        </span>
        <span class="relative">
          {{ copy.faq.linkAll }}
          <span
            aria-hidden="true"
            class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors"
          />
        </span>
      </NuxtLink>

      <!-- Bare accordion — just horizontal rules -->
      <div class="border-t border-black/10 dark:border-white/10">
        <div
          v-for="(f, i) in copy.faq.items"
          :key="i"
          class="group border-b border-black/10 dark:border-white/10"
          :class="faqOpen === i ? 'bg-black/[0.02] dark:bg-white/[0.02]' : 'hover:bg-black/[0.015] dark:hover:bg-white/[0.01]'"
        >
          <button
            class="w-full flex items-center gap-3 sm:gap-6 py-6 sm:py-8 px-3 sm:px-6 text-start transition-colors"
            @click="faqOpen = faqOpen === i ? -1 : i"
          >
            <span class="hidden sm:inline-block w-6 shrink-0 text-xs tabular-nums text-gray-400">0{{ i + 1 }}</span>
            <span class="flex-1 min-w-0 text-base sm:text-xl lg:text-2xl font-bold tracking-tight leading-tight">{{ f.q }}</span>
            <span class="shrink-0 size-10 rounded-full flex items-center justify-center transition-all border border-black/10 dark:border-white/15"
              :class="faqOpen === i ? 'bg-primary text-white border-primary rotate-180' : 'group-hover:border-secondary-500/40'"
            >
              <UIcon
                :name="faqOpen === i ? 'i-lucide-minus' : 'i-lucide-plus'"
                class="size-4"
              />
            </span>
          </button>
          <Transition
            enter-active-class="transition-all duration-300 ease-out overflow-hidden"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-96"
            leave-active-class="transition-all duration-200 ease-in overflow-hidden"
            leave-from-class="opacity-100 max-h-96"
            leave-to-class="opacity-0 max-h-0"
          >
            <div
              v-if="faqOpen === i"
              class="pb-6 sm:pb-8 px-3 sm:px-6 sm:ps-[3.75rem]"
            >
              <p class="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                {{ f.a }}
              </p>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

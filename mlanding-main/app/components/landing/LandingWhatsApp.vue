<script setup lang="ts">
// Floating WhatsApp chat affordance — bottom-end (RTL-aware) on the landing
// surface. Renders nothing when NUXT_PUBLIC_WHATSAPP_NUMBER is empty so the
// component is a no-op in environments that haven't wired sales yet.
//
// Number is expected as digits only, international format, no leading +
// (e.g. 966500000000). The wa.me URL handles the + transparently.

const config = useRuntimeConfig()
const copy = useLandingCopy()

const number = (config.public.whatsappNumber as string) || ''
const enabled = computed(() => Boolean(number))

const href = computed(() => {
  if (!enabled.value) return '#'
  const text = encodeURIComponent(copy.value.ui.whatsappGreeting)
  return `https://wa.me/${number}?text=${text}`
})

// Tooltip toggles only on hover/focus — keep it lightweight to avoid
// stealing attention from the page.
const open = ref(false)
</script>

<template>
  <Teleport v-if="enabled" to="body">
    <div
      class="fixed bottom-5 end-5 z-40 flex items-center gap-3"
      dir="ltr"
    >
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-x-2 rtl:-translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-show="open"
          class="hidden sm:block max-w-[18rem] rounded-2xl px-4 py-2.5 bg-white dark:bg-neutral-900 ring-1 ring-black/10 dark:ring-white/10 shadow-lg text-sm text-gray-700 dark:text-gray-200"
        >
          <p class="font-semibold tracking-tight leading-snug">
            {{ copy.ui.whatsappLabel }}
          </p>
          <p class="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {{ copy.ui.talkToFounder }}
          </p>
        </div>
      </Transition>

      <a
        :href="href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="copy.ui.whatsappLabel"
        class="group relative flex items-center justify-center size-16 rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-900/20 hover:scale-105 hover:bg-[#20bd5a] transition-all focus-visible:ring-4 focus-visible:ring-emerald-500/30 focus-visible:outline-none"
        @mouseenter="open = true"
        @mouseleave="open = false"
        @focus="open = true"
        @blur="open = false"
      >
        <UIcon name="i-simple-icons-whatsapp" class="size-8" />
        <span aria-hidden="true" class="absolute inset-0 rounded-full ring-2 ring-[#25D366]/30 animate-ping pointer-events-none" />
      </a>
    </div>
  </Teleport>
</template>

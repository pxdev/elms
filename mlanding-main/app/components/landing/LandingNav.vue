<script setup lang="ts">
const route = useRoute()
const copy = useLandingCopy()
const { currentLocale, otherLocale, toggleLocale } = useLandingLocale()
const { loggedIn } = useUserSession()
const localePath = useLocalePath()

const mobileOpen = ref(false)
watch(() => route.fullPath, () => { mobileOpen.value = false })

// Lock body scroll while the drawer is open.
watchEffect(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = mobileOpen.value ? 'hidden' : ''
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

// rAF-throttled scroll listener — toggles the backdrop on the header past 12px.
const scrolled = ref(false)
let rafId = 0
const onScroll = () => {
  if (rafId) return
  rafId = requestAnimationFrame(() => {
    scrolled.value = window.scrollY > 12
    rafId = 0
  })
}
onMounted(() => {
  scrolled.value = window.scrollY > 12
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => {
  if (typeof window !== 'undefined') window.removeEventListener('scroll', onScroll)
  if (rafId) cancelAnimationFrame(rafId)
})

// Lean header — only the conversion-critical surfaces. Everything else
// (Add-ons, ROI, Manual, Docs, FAQ) is reachable from the footer columns and
// in-page CTAs.
const navItems = computed(() => [
  { label: copy.value.nav.features, to: localePath('/portal/features') },
  { label: copy.value.nav.showcase, to: localePath('/portal/showcase') },
  { label: copy.value.nav.pricing, to: localePath('/portal/pricing') }
])

function isActive(to: string) {
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <header
    class="fixed top-0 inset-x-0 z-40 transition-all duration-300"
    :class="scrolled
      ? 'bg-white/80 dark:bg-black/70 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.06)]'
      : 'bg-transparent'"
  >
    <div class="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center gap-4 lg:gap-8">
      <LandingNavBrand />

      <!-- Desktop Nav — pill rail centered between brand and actions -->
      <nav
        class="hidden lg:flex items-center gap-0.5 flex-1 justify-center"
        aria-label="Primary"
      >
        <NuxtLink
          v-for="item in navItems" :key="item.to"
          :to="item.to"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          class="group relative px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200"
          :class="isActive(item.to)
            ? 'text-primary dark:text-white'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
        >
          <!-- Soft pill background on active + hover (sits behind text) -->
          <span
            aria-hidden="true"
            class="absolute inset-0 rounded-full bg-black/[0.04] dark:bg-white/[0.06] transition-opacity duration-200"
            :class="isActive(item.to) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
          />
          <!-- Active accent dot (only on active item) -->
          <span class="relative inline-flex items-center gap-1.5">
            <span
              v-if="isActive(item.to)"
              aria-hidden="true"
              class="size-1.5 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-400 shadow-[0_0_0_3px] shadow-secondary-500/15"
            />
            {{ item.label }}
          </span>
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="flex items-center gap-1 sm:gap-1.5 ms-auto">
        <!-- Utility cluster: language toggle (EN ↔ AR) — compact icon pill -->
        <ClientOnly>
          <button
            type="button"
            class="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-400 ring-1 ring-transparent hover:ring-black/[0.06] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] dark:hover:ring-white/10 transition"
            :aria-label="copy.nav.langLabel"
            :title="otherLocale?.name"
            @click="toggleLocale"
          >
            <UIcon name="i-lucide-globe" class="size-4 opacity-70" />
            <span class="text-[13px] font-bold tracking-tight">{{ otherLocale?.name }}</span>
          </button>
          <template #fallback>
            <span class="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-semibold text-gray-600 dark:text-gray-400">
              <UIcon name="i-lucide-globe" class="size-4 opacity-70" />
              <span class="text-[13px] font-bold tracking-tight">{{ currentLocale?.name }}</span>
            </span>
          </template>
        </ClientOnly>

        <!-- Auth cluster — ghost button -->
        <ClientOnly>
          <NuxtLink
            :to="loggedIn ? localePath('/dashboard') : localePath('/auth/login')"
            class="hidden sm:inline-flex items-center h-10 px-4 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
          >
            {{ loggedIn ? copy.nav.dashboard : copy.nav.signIn }}
          </NuxtLink>
          <template #fallback>
            <NuxtLink
              :to="localePath('/auth/login')"
              class="hidden sm:inline-flex items-center h-10 px-4 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
            >
              {{ copy.nav.signIn }}
            </NuxtLink>
          </template>
        </ClientOnly>

        <!-- Primary CTA — gradient pill that picks up the brand secondary on hover -->
        <NuxtLink
          :to="localePath('/portal/pricing')"
          class="group relative inline-flex items-center gap-1.5 h-10 ps-4 pe-3 rounded-full text-sm font-bold text-white shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-0.5 transition-all overflow-hidden"
        >
          <span aria-hidden="true" class="absolute inset-0 bg-primary" />
          <span aria-hidden="true" class="absolute inset-0 bg-gradient-to-r from-primary via-secondary-700 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span class="relative">{{ copy.nav.getCode }}</span>
          <span class="relative inline-flex items-center justify-center size-5 rounded-full bg-white/15 group-hover:bg-white/25 transition-colors">
            <UIcon name="i-lucide-arrow-right" class="size-3 rtl:rotate-180" />
          </span>
        </NuxtLink>

        <button
          class="lg:hidden size-10 flex items-center justify-center rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
          aria-label="Open menu"
          aria-controls="landing-mobile-menu"
          :aria-expanded="mobileOpen"
          @click="mobileOpen = true"
        >
          <UIcon name="i-lucide-menu" class="size-5" />
        </button>
      </div>
    </div>

    <!-- Mobile drawer -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="mobileOpen"
          aria-hidden="true"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          @click="mobileOpen = false"
        />
      </Transition>
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-x-full rtl:-translate-x-full"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-to-class="translate-x-full rtl:-translate-x-full"
      >
        <aside
          v-if="mobileOpen"
          id="landing-mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Main menu"
          class="fixed inset-y-0 end-0 z-50 w-[min(20rem,calc(100vw-2.5rem))] max-w-sm bg-white dark:bg-black shadow-2xl lg:hidden flex flex-col"
        >
          <div class="h-16 px-5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
            <LandingNavBrand />
            <button
              class="size-10 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Close menu"
              @click="mobileOpen = false"
            >
              <UIcon name="i-lucide-x" class="size-5" />
            </button>
          </div>

          <nav class="flex-1 overflow-y-auto p-4 space-y-1.5" aria-label="Main">
            <NuxtLink
              v-for="item in navItems" :key="item.to" :to="item.to"
              :aria-current="isActive(item.to) ? 'page' : undefined"
              class="flex items-center gap-3 px-4 py-3 rounded-2xl text-base font-semibold transition-colors"
              :class="isActive(item.to)
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-gray-700 dark:text-gray-200 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'"
            >
              <span
                aria-hidden="true"
                class="size-1.5 rounded-full"
                :class="isActive(item.to) ? 'bg-white' : 'bg-gradient-to-br from-secondary-500 to-secondary-400'"
              />
              {{ item.label }}
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4 ms-auto rtl:rotate-180 opacity-50"
              />
            </NuxtLink>

            <!-- Preferences: language toggle (EN ↔ AR) -->
            <div class="mt-6 pt-4 border-t border-black/5 dark:border-white/10 space-y-2">
              <p class="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">{{ copy.nav.langLabel }}</p>
              <ClientOnly>
                <button
                  type="button"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition"
                  @click="toggleLocale"
                >
                  <UIcon name="i-lucide-globe" class="size-4 opacity-70" />
                  <span>{{ otherLocale?.name }}</span>
                  <UIcon name="i-lucide-arrow-right-left" class="size-3.5 ms-auto opacity-60" />
                </button>
              </ClientOnly>
            </div>
          </nav>

          <div class="p-4 border-t border-black/5 dark:border-white/10 space-y-2">
            <ClientOnly>
              <NuxtLink :to="loggedIn ? localePath('/dashboard') : localePath('/auth/login')" class="block text-center px-4 py-3 rounded-2xl text-sm font-semibold text-gray-800 dark:text-gray-100 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition">
                {{ loggedIn ? copy.nav.dashboard : copy.nav.signIn }}
              </NuxtLink>
              <template #fallback>
                <NuxtLink :to="localePath('/auth/login')" class="block text-center px-4 py-3 rounded-2xl text-sm font-semibold text-gray-800 dark:text-gray-100 bg-black/[0.04] dark:bg-white/[0.06]">{{ copy.nav.signIn }}</NuxtLink>
              </template>
            </ClientOnly>
            <NuxtLink :to="localePath('/portal/pricing')" class="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 transition">
              {{ copy.nav.getCode }}
              <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
            </NuxtLink>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </header>
</template>

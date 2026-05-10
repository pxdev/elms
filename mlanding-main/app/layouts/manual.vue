<script setup lang="ts">
const localePath = useLocalePath()
// User-manual layout — docs.daftra-style shell.
//
// Top: same landing nav as the rest of the marketing site.
// Middle: a left sidebar listing every module, plus the main article slot.
//   - Desktop: sidebar is sticky under the nav.
//   - Mobile: sidebar hides behind a button that opens a drawer.
// Bottom: landing footer.
//
// Pages render their own article content; the layout only owns the chrome.

const route = useRoute()
const manual = useManualCopy()

const sidebarOpen = ref(false)
watch(() => route.fullPath, () => { sidebarOpen.value = false })

watchEffect(() => {
  if (typeof document === 'undefined') return
  document.body.style.overflow = sidebarOpen.value ? 'hidden' : ''
})
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})

function moduleTo(id: string, status: 'ready' | 'soon') {
  return status === 'ready' ? localePath(`/portal/manual/${id}`) : undefined
}
function isActive(id: string) {
  const target = localePath(`/portal/manual/${id}`)
  return route.path === target || route.path.startsWith(target + '/')
}
const isHomeActive = computed(() => {
  const home = localePath('/portal/manual')
  return route.path === home || route.path === home + '/'
})
const addons = computed(() => manual.value.addons || [])
</script>

<template>
  <div class="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white antialiased">
    <a
      href="#manual-main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[60] focus:inline-flex focus:items-center focus:gap-2 focus:px-4 focus:h-10 focus:rounded-full focus:bg-primary focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
    >
      Skip to content
    </a>

    <LandingNav />

    <div class="pt-16">
      <div class="max-w-7xl mx-auto px-5 sm:px-8">
        <!-- Mobile sidebar toggle -->
        <div class="lg:hidden sticky top-16 z-20 -mx-5 sm:-mx-8 px-5 sm:px-8 py-3 bg-white/80 dark:bg-black/70 backdrop-blur border-b border-black/5 dark:border-white/10 flex items-center justify-between">
          <button
            class="inline-flex items-center gap-2 h-9 px-3 rounded-full text-sm font-medium bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition"
            :aria-expanded="sidebarOpen"
            aria-controls="manual-sidebar"
            @click="sidebarOpen = true"
          >
            <UIcon name="i-lucide-book-open" class="size-4" />
            {{ manual.nav.section }}
          </button>
          <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
            {{ manual.home.eyebrow }}
          </p>
        </div>

        <div class="grid grid-cols-12 gap-6 lg:gap-10">
          <!-- Desktop sidebar -->
          <aside class="hidden lg:block lg:col-span-3 xl:col-span-3 py-10">
            <div class="sticky top-24">
              <p class="text-xs uppercase tracking-[0.25em] text-gray-400 mb-4">{{ manual.home.eyebrow }}</p>
              <NuxtLink
                :to="localePath('/portal/manual')"
                class="block px-3 py-2 rounded-lg text-sm font-medium transition"
                :class="isHomeActive
                  ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'"
              >
                {{ manual.nav.home }}
              </NuxtLink>

              <p class="mt-6 mb-2 px-3 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">
                {{ manual.nav.modulesHeading }}
              </p>
              <ul class="space-y-0.5">
                <li v-for="m in manual.modules" :key="m.id">
                  <NuxtLink
                    v-if="m.status === 'ready'"
                    :to="moduleTo(m.id, m.status)"
                    class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition"
                    :class="isActive(m.id)
                      ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'"
                  >
                    <UIcon :name="m.icon" class="size-4 shrink-0" />
                    <span class="flex-1 truncate">{{ m.label }}</span>
                  </NuxtLink>
                  <span
                    v-else
                    class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  >
                    <UIcon :name="m.icon" class="size-4 shrink-0 opacity-60" />
                    <span class="flex-1 truncate">{{ m.label }}</span>
                    <span class="text-[10px] uppercase tracking-wider font-bold text-gray-400/80">{{ manual.statusLabels.soon }}</span>
                  </span>
                </li>
              </ul>

              <template v-if="addons.length">
                <p class="mt-6 mb-2 px-3 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">
                  {{ manual.nav.addonsHeading || 'Add-ons' }}
                </p>
                <ul class="space-y-0.5">
                  <li v-for="a in addons" :key="a.id">
                    <NuxtLink
                      v-if="a.status === 'ready'"
                      :to="moduleTo(a.id, a.status)"
                      class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition"
                      :class="isActive(a.id)
                        ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'"
                    >
                      <UIcon :name="a.icon" class="size-4 shrink-0" />
                      <span class="flex-1 truncate">{{ a.label }}</span>
                    </NuxtLink>
                    <span
                      v-else
                      class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    >
                      <UIcon :name="a.icon" class="size-4 shrink-0 opacity-60" />
                      <span class="flex-1 truncate">{{ a.label }}</span>
                      <span class="text-[10px] uppercase tracking-wider font-bold text-gray-400/80">{{ manual.statusLabels.soon }}</span>
                    </span>
                  </li>
                </ul>
              </template>
            </div>
          </aside>

          <!-- Main -->
          <main id="manual-main" tabindex="-1" class="col-span-12 lg:col-span-9 xl:col-span-9 py-8 lg:py-12">
            <slot />
          </main>
        </div>
      </div>
    </div>

    <LandingFooter />

    <!-- Mobile drawer -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <div
          v-if="sidebarOpen"
          aria-hidden="true"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          @click="sidebarOpen = false"
        />
      </Transition>
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="-translate-x-full rtl:translate-x-full"
        leave-active-class="transition-transform duration-200 ease-in"
        leave-to-class="-translate-x-full rtl:translate-x-full"
      >
        <aside
          v-if="sidebarOpen"
          id="manual-sidebar"
          role="dialog"
          aria-modal="true"
          aria-label="Manual navigation"
          class="fixed inset-y-0 start-0 z-50 w-80 bg-white dark:bg-black shadow-2xl lg:hidden flex flex-col"
        >
          <div class="h-16 px-5 flex items-center justify-between border-b border-black/5 dark:border-white/10">
            <p class="text-sm font-bold tracking-tight">{{ manual.nav.section }}</p>
            <button
              class="size-9 flex items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              aria-label="Close"
              @click="sidebarOpen = false"
            >
              <UIcon name="i-lucide-x" class="size-5" />
            </button>
          </div>
          <nav class="flex-1 overflow-y-auto p-4">
            <NuxtLink
              :to="localePath('/portal/manual')"
              class="block px-3 py-2.5 rounded-lg text-sm font-medium transition"
              :class="isHomeActive
                ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'"
            >
              {{ manual.nav.home }}
            </NuxtLink>
            <p class="mt-5 mb-2 px-3 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">
              {{ manual.nav.modulesHeading }}
            </p>
            <ul class="space-y-0.5">
              <li v-for="m in manual.modules" :key="m.id">
                <NuxtLink
                  v-if="m.status === 'ready'"
                  :to="moduleTo(m.id, m.status)"
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition"
                  :class="isActive(m.id)
                    ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'"
                >
                  <UIcon :name="m.icon" class="size-4 shrink-0" />
                  <span class="flex-1 truncate">{{ m.label }}</span>
                </NuxtLink>
                <span
                  v-else
                  class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 dark:text-gray-500"
                >
                  <UIcon :name="m.icon" class="size-4 shrink-0 opacity-60" />
                  <span class="flex-1 truncate">{{ m.label }}</span>
                  <span class="text-[10px] uppercase tracking-wider font-bold text-gray-400/80">{{ manual.statusLabels.soon }}</span>
                </span>
              </li>
            </ul>

            <template v-if="addons.length">
              <p class="mt-5 mb-2 px-3 text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400">
                {{ manual.nav.addonsHeading || 'Add-ons' }}
              </p>
              <ul class="space-y-0.5">
                <li v-for="a in addons" :key="a.id">
                  <NuxtLink
                    v-if="a.status === 'ready'"
                    :to="moduleTo(a.id, a.status)"
                    class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition"
                    :class="isActive(a.id)
                      ? 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white font-semibold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'"
                  >
                    <UIcon :name="a.icon" class="size-4 shrink-0" />
                    <span class="flex-1 truncate">{{ a.label }}</span>
                  </NuxtLink>
                  <span
                    v-else
                    class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-400 dark:text-gray-500"
                  >
                    <UIcon :name="a.icon" class="size-4 shrink-0 opacity-60" />
                    <span class="flex-1 truncate">{{ a.label }}</span>
                    <span class="text-[10px] uppercase tracking-wider font-bold text-gray-400/80">{{ manual.statusLabels.soon }}</span>
                  </span>
                </li>
              </ul>
            </template>
          </nav>
        </aside>
      </Transition>
    </Teleport>
  </div>
</template>

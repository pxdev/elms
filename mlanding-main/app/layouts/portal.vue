<script setup lang="ts">
// Unified chrome for all authenticated portal pages (/dashboard/** and
// /admin/**). Branches on `isAdmin` to show admin nav + submenu, or the
// simpler customer nav. Replaces the previous admin.vue + dashboard.vue
// split and the setPageLayout-via-middleware dance — every authenticated
// page just sets `layout: 'portal'` and this component does the rest.

const route = useRoute()
const { user, isAdmin, displayName, clear } = useSession()
const { currentLocale, otherLocale, toggleLocale } = useLandingLocale()
const localePath = useLocalePath()
const chrome = useChromeCopy()

const isSubMenuOpen = ref(true)
const mobileMenuOpen = ref(false)
watch(() => route.fullPath, () => { mobileMenuOpen.value = false })

defineShortcuts({
  c: {
    handler: () => { isSubMenuOpen.value = !isSubMenuOpen.value },
    usingInput: false
  }
})

interface NavItem { icon: string; to: string; label: string; badge?: number }

// Polled unread-tickets count. Branches on isAdmin so each role hits the
// endpoint it's actually allowed to call. Refreshes every 60s while the
// layout is mounted; the bell stays current without WebSockets.
const supportEndpoint = computed(() =>
  isAdmin.value ? '/api/portal/admin/support/unread-count' : '/api/portal/support/unread-count'
)
const { data: supportUnread, refresh: refreshSupportUnread } = await useFetch(
  supportEndpoint,
  { default: () => ({ count: 0 }), watch: [supportEndpoint] }
)
const supportUnreadCount = computed(() => supportUnread.value?.count ?? 0)

let supportPoll: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  supportPoll = setInterval(refreshSupportUnread, 60_000)
})
onBeforeUnmount(() => {
  if (supportPoll) clearInterval(supportPoll)
})
// Re-fetch on every navigation so the badge clears the moment the user
// opens the support inbox (where the per-ticket fetch flips the flag).
watch(() => route.fullPath, () => { refreshSupportUnread() })

// Every nav `to:` is run through localePath so the link stays in the
// visitor's current locale (e.g. /ar/admin/foo). Active-state checks then
// compare the prefixed route.path against the prefixed `to`.
const adminNavItems = computed<NavItem[]>(() => [
  { icon: 'i-lucide-layout-dashboard', to: localePath('/admin'), label: chrome.value.admin.nav.dashboard },
  { icon: 'i-lucide-shield', to: localePath('/admin/licenses'), label: chrome.value.admin.nav.licenses },
  { icon: 'i-lucide-users', to: localePath('/admin/users'), label: chrome.value.admin.nav.customers },
  { icon: 'i-lucide-shopping-cart', to: localePath('/admin/orders'), label: chrome.value.admin.nav.purchases },
  { icon: 'i-lucide-package', to: localePath('/admin/plans'), label: chrome.value.admin.nav.plans },
  { icon: 'i-lucide-list-checks', to: localePath('/admin/features'), label: chrome.value.admin.nav.features },
  { icon: 'i-lucide-ticket-percent', to: localePath('/admin/promo-codes'), label: chrome.value.admin.nav.promoCodes },
  { icon: 'i-simple-icons-github', to: localePath('/admin/invites'), label: chrome.value.admin.nav.githubInvites },
  { icon: 'i-lucide-life-buoy', to: localePath('/admin/support'), label: chrome.value.admin.nav.support, badge: supportUnreadCount.value },
  { icon: 'i-lucide-list', to: localePath('/admin/audit'), label: chrome.value.admin.nav.auditLog },
  { icon: 'i-lucide-settings', to: localePath('/admin/settings'), label: chrome.value.admin.nav.settings }
])

const customerNavItems = computed<NavItem[]>(() => [
  { icon: 'i-lucide-key', to: localePath('/dashboard'), label: chrome.value.dashboard.nav.licenses },
  { icon: 'i-lucide-life-buoy', to: localePath('/dashboard/support'), label: chrome.value.dashboard.nav.support, badge: supportUnreadCount.value },
  { icon: 'i-lucide-user', to: localePath('/dashboard/profile'), label: chrome.value.dashboard.nav.profile }
])

const mainNavItems = computed<NavItem[]>(() => isAdmin.value ? adminNavItems.value : customerNavItems.value)

// Submenu config keys are unprefixed because we look them up against
// `route.path`'s unprefixed segments (we strip the locale prefix before
// matching). The submenu items' `to:` values are localePath'd so clicks
// land on the right locale.
const adminSubMenuConfig = computed<Record<string, { title: string; items: { label: string; to: string }[] }>>(() => ({
  '/admin/licenses': {
    title: chrome.value.admin.submenu.licenses,
    items: [
      { label: chrome.value.admin.submenu.allLicenses, to: localePath('/admin/licenses') },
      { label: chrome.value.admin.submenu.issueNew, to: localePath('/admin/licenses/new') }
    ]
  },
  '/admin/orders': {
    title: chrome.value.admin.submenu.purchases,
    items: [
      { label: chrome.value.admin.submenu.allOrders, to: localePath('/admin/orders') }
    ]
  },
  '/admin/settings': {
    title: chrome.value.admin.submenu.settings,
    items: [
      { label: chrome.value.admin.submenu.general, to: localePath('/admin/settings') },
      { label: chrome.value.admin.submenu.integrations, to: localePath('/admin/settings/integrations') },
      { label: chrome.value.admin.backupPage.title, to: localePath('/admin/settings/backup') }
    ]
  }
}))

// Strip the locale prefix from route.path so `/ar/admin/licenses` and
// `/en/admin/licenses` both match the unprefixed submenu config keys.
const localePrefixRe = /^\/(ar|en)(?=\/|$)/
function unprefixed(path: string) {
  return path.replace(localePrefixRe, '') || '/'
}

const currentSubMenu = computed(() => {
  if (!isAdmin.value) return null
  const path = unprefixed(route.path)
  for (const [prefix, config] of Object.entries(adminSubMenuConfig.value)) {
    if (path === prefix || path.startsWith(prefix + '/')) return config
  }
  return null
})
const hasSubMenu = computed(() => currentSubMenu.value !== null)

function isActive(to: string) {
  // Both sides include the locale prefix (or both don't, for the default
  // locale), so direct comparison works without unwrapping.
  const dashboardish = to === localePath('/admin') || to === localePath('/dashboard')
  if (dashboardish) return route.path === to
  return route.path === to || route.path.startsWith(to + '/')
}

function isSubActive(to: string) {
  return route.path === to
}

const topbarTitle = computed(() => isAdmin.value ? chrome.value.admin.title : chrome.value.dashboard.title)

const userMenuItems = computed(() => {
  const groups: Array<Array<Record<string, unknown>>> = [
    [{ label: displayName.value || user.value?.email || chrome.value.common.account, icon: 'i-lucide-user', disabled: true }]
  ]
  const middle: Array<Record<string, unknown>> = []
  if (isAdmin.value) {
    middle.push({ label: chrome.value.admin.portalDashboard, icon: 'i-lucide-layout-dashboard', to: localePath('/dashboard') })
  }
  middle.push({ label: chrome.value.common.profile, icon: 'i-lucide-user', to: localePath('/dashboard/profile') })
  groups.push(middle)
  groups.push([{ label: chrome.value.common.signOut, icon: 'i-lucide-log-out', onSelect: onLogout }])
  return groups
})

async function onLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo(localePath('/auth/login'))
}
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-neutral-50 dark:bg-neutral-950 text-gray-900 dark:text-white">
    <!-- LEFT: Dark icon rail -->
    <aside class="w-16 hidden lg:flex flex-col bg-primary-900 flex-shrink-0 z-20">
      <div class="h-14 flex items-center justify-center border-b border-white/10 flex-shrink-0">
        <NuxtLink :to="localePath(isAdmin ? '/admin' : '/dashboard')" class="size-8 rounded-lg bg-primary flex items-center justify-center font-black text-white" aria-label="Momentfy">
          M
        </NuxtLink>
      </div>
      <nav class="flex-1 py-4 flex flex-col items-center gap-2 overflow-y-auto">
        <UPopover
          v-for="item in mainNavItems"
          :key="item.to"
          mode="hover"
          arrow
          :content="{ side: 'right', align: 'center' }"
        >
          <NuxtLink
            :to="item.to"
            :aria-current="isActive(item.to) ? 'page' : undefined"
            class="relative w-11 h-11 flex items-center justify-center rounded-lg transition-all duration-200 group"
            :class="[
              isActive(item.to)
                ? 'bg-secondary text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            ]"
          >
            <span
              v-if="isActive(item.to)"
              aria-hidden="true"
              class="absolute top-1/2 -translate-y-1/2 -left-2 w-1 h-5 bg-primary rounded-r-full"
            />
            <UIcon :name="item.icon" class="size-5" />
            <!-- Unread badge — shows count up to 99, then "99+". Sits on
                 the top-right of the icon tile so it works in both LTR
                 and RTL without flipping. -->
            <span
              v-if="item.badge && item.badge > 0"
              class="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black tabular-nums flex items-center justify-center ring-2 ring-neutral-900"
              aria-label="unread"
            >
              {{ item.badge > 99 ? '99+' : item.badge }}
            </span>
          </NuxtLink>
          <template #content>
            <div class="px-2 py-1 text-sm font-medium whitespace-nowrap">{{ item.label }}</div>
          </template>
        </UPopover>
      </nav>
      <div class="py-4 flex flex-col items-center gap-2 border-t border-white/10 flex-shrink-0">
        <UPopover mode="hover" arrow :content="{ side: 'right', align: 'center' }">
          <NuxtLink
            :to="localePath('/')"
            class="w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/10"
          >
            <UIcon name="i-lucide-arrow-left" class="size-5 rtl:rotate-180" />
          </NuxtLink>
          <template #content>
            <div class="px-2 py-1 text-sm font-medium whitespace-nowrap">{{ chrome.common.backToHome }}</div>
          </template>
        </UPopover>
      </div>
    </aside>

    <!-- MIDDLE: Submenu panel (admin only) -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="-ms-64 opacity-0"
      enter-to-class="ms-0 opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="ms-0 opacity-100"
      leave-to-class="-ms-64 opacity-0"
    >
      <aside
        v-if="hasSubMenu && isSubMenuOpen"
        class="w-64 hidden lg:flex flex-col bg-white dark:bg-neutral-900 border-e border-black/5 dark:border-white/10 flex-shrink-0"
      >
        <div class="h-14 px-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 flex-shrink-0">
          <span class="font-semibold">{{ currentSubMenu?.title }}</span>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            size="xs"
            class="text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="isSubMenuOpen = false"
          />
        </div>
        <nav class="flex-1 py-2 overflow-y-auto px-2">
          <NuxtLink
            v-for="(item, idx) in currentSubMenu?.items"
            :key="idx"
            :to="item.to"
            class="block px-3 py-2 rounded text-sm font-medium mb-1 transition-colors"
            :class="isSubActive(item.to)
              ? 'bg-primary text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </aside>
    </Transition>

    <!-- RIGHT: main column -->
    <div class="flex-1 flex flex-col min-w-0 bg-neutral-50 dark:bg-neutral-950">
      <header class="h-14 px-4 flex items-center justify-between bg-white dark:bg-neutral-900 border-b border-black/5 dark:border-white/10 flex-shrink-0">
        <div class="flex items-center gap-3">
          <button class="lg:hidden p-2 -ms-2" :aria-label="chrome.common.openMenu" @click="mobileMenuOpen = true">
            <UIcon name="i-lucide-menu" class="size-5" />
          </button>
          <UButton
            v-if="hasSubMenu && !isSubMenuOpen"
            icon="i-lucide-menu"
            variant="ghost"
            size="sm"
            class="hidden lg:flex text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            @click="isSubMenuOpen = true"
          />
          <span class="text-xl font-bold tracking-tight">{{ topbarTitle }}</span>
        </div>

        <div class="flex items-center gap-1">
          <ClientOnly>
            <button
              type="button"
              class="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold text-gray-500 hover:bg-black/5 dark:hover:bg-white/10 transition"
              :aria-label="chrome.common.language"
              :title="otherLocale?.name"
              @click="toggleLocale"
            >
              <UIcon name="i-lucide-globe" class="size-4" />
              <span class="text-sm font-bold">{{ otherLocale?.name }}</span>
            </button>
            <template #fallback>
              <span class="hidden sm:inline-flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold text-gray-500">
                <UIcon name="i-lucide-globe" class="size-4" />
                <span class="text-sm font-bold">{{ currentLocale?.name }}</span>
              </span>
            </template>
          </ClientOnly>
          <ClientOnly>
            <UDropdownMenu :items="userMenuItems" :ui="{ content: 'w-56' }">
              <button class="ms-1 flex items-center gap-2 ps-1 pe-2 py-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <div class="size-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                  {{ (displayName || user?.email || '?').charAt(0).toUpperCase() }}
                </div>
                <span class="hidden sm:block text-sm font-medium max-w-[160px] truncate">{{ displayName || user?.email }}</span>
              </button>
            </UDropdownMenu>
            <template #fallback>
              <div class="size-9 rounded-full bg-black/5 dark:bg-white/10" />
            </template>
          </ClientOnly>
        </div>
      </header>

      <main class="flex-1 overflow-auto">
        <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-6xl w-full mx-auto">
          <slot />
        </div>
      </main>
    </div>

    <!-- Mobile drawer -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="mobileMenuOpen" class="fixed inset-0 z-50 lg:hidden">
          <div class="absolute inset-0 bg-black/50" aria-hidden="true" @click="mobileMenuOpen = false" />
          <aside
            role="dialog"
            aria-modal="true"
            :aria-label="chrome.common.mainMenu"
            class="absolute inset-y-0 start-0 w-72 bg-white dark:bg-neutral-900 shadow-xl flex flex-col overflow-y-auto"
          >
            <div class="h-14 px-4 flex items-center justify-between border-b border-black/5 dark:border-white/10 flex-shrink-0">
              <span class="text-lg font-bold">{{ topbarTitle }}</span>
              <button class="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10" :aria-label="chrome.common.closeMenu" @click="mobileMenuOpen = false">
                <UIcon name="i-lucide-x" class="size-5" />
              </button>
            </div>
            <nav class="flex-1 py-3 px-3 overflow-y-auto" :aria-label="chrome.common.mainMenu">
              <NuxtLink
                v-for="item in mainNavItems" :key="item.to" :to="item.to"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors"
                :class="isActive(item.to) ? 'bg-primary text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/10'"
              >
                <UIcon :name="item.icon" class="size-5 shrink-0" />
                <span class="flex-1">{{ item.label }}</span>
                <span
                  v-if="item.badge && item.badge > 0"
                  class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black tabular-nums"
                >
                  {{ item.badge > 99 ? '99+' : item.badge }}
                </span>
              </NuxtLink>
              <template v-if="currentSubMenu">
                <div class="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                  <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ currentSubMenu.title }}</p>
                  <NuxtLink
                    v-for="(item, idx) in currentSubMenu.items" :key="idx" :to="item.to"
                    class="block px-3 py-2 rounded text-sm font-medium mb-0.5 transition-colors"
                    :class="isSubActive(item.to) ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'"
                  >
                    {{ item.label }}
                  </NuxtLink>
                </div>
              </template>
            </nav>
            <div class="p-3 border-t border-black/5 dark:border-white/10 space-y-1">
              <ClientOnly>
                <button
                  type="button"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                  @click="toggleLocale"
                >
                  <UIcon name="i-lucide-globe" class="size-4" />
                  <span>{{ otherLocale?.name }}</span>
                  <UIcon name="i-lucide-arrow-right-left" class="size-3.5 ms-auto opacity-60" />
                </button>
              </ClientOnly>
              <button
                class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10"
                @click="onLogout"
              >
                <UIcon name="i-lucide-log-out" class="size-4" />
                {{ chrome.common.signOut }}
              </button>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

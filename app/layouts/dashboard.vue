<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const { user, clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/login')
}

const navItems = computed(() => {
  const role = user.value?.role
  if (role === 'ADMIN') {
    return [
      { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: '/admin', exact: true },
      { label: t('nav.courses'), icon: 'i-lucide-book-open', to: '/admin/courses' },
      { label: t('nav.enrollments'), icon: 'i-lucide-users', to: '/admin/enrollments' },
      { label: t('fields.name'), icon: 'i-lucide-user-cog', to: '/admin/users' },
      { label: 'Promo Codes', icon: 'i-lucide-ticket-percent', to: '/admin/promo-codes' },
      { label: t('nav.blog'), icon: 'i-lucide-newspaper', to: '/admin/blog' },
      { label: t('teacher.availability'), icon: 'i-lucide-calendar-clock', to: '/teacher/availability' },
      { label: t('teacher.sessions'), icon: 'i-lucide-calendar-days', to: '/teacher/sessions' }
    ]
  }
  if (role === 'TEACHER') {
    return [
      { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: '/teacher', exact: true },
      { label: t('nav.courses'), icon: 'i-lucide-book-open', to: '/teacher/courses' },
      { label: t('nav.enrollments'), icon: 'i-lucide-users', to: '/teacher/enrollments' },
      { label: t('teacher.availability'), icon: 'i-lucide-calendar-clock', to: '/teacher/availability' },
      { label: t('teacher.sessions'), icon: 'i-lucide-calendar-days', to: '/teacher/sessions' }
    ]
  }
  return [
    { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: '/dashboard', exact: true },
    { label: t('nav.courses'), icon: 'i-lucide-book-open', to: '/courses' },
    { label: t('nav.enrollments'), icon: 'i-lucide-graduation-cap', to: '/enrollments' }
  ]
})

const isActive = (to: string, exact?: boolean) => {
  if (route.path === to) return true
  if (exact) return false
  return route.path.startsWith(to + '/')
}

const searchOpen = ref(false)

const searchGroups = computed(() => {
  const role = user.value?.role
  const items = navItems.value.map(item => ({
    label: item.label,
    icon: item.icon,
    to: item.to
  }))

  const groups: any[] = [
    { id: 'nav', label: t('nav.admin') || 'Navigation', items }
  ]

  if (role === 'ADMIN') {
    groups[0].items.push(
      { label: t('admin.courses.create'), icon: 'i-lucide-plus', to: '/admin/courses/new' },
      { label: t('blog.createPost'), icon: 'i-lucide-plus', to: '/admin/blog/posts/new' }
    )
  }

  return groups
})

const userDropdownItems = computed(() => [
  [{ label: user.value?.email ?? '', type: 'label' as const }],
  [{ label: t('nav.profile'), icon: 'i-lucide-user', to: '/profile' }],
  [{ label: t('nav.signOut'), icon: 'i-lucide-log-out', onSelect: logout }]
] as any)

// ── Page title from current route ──────────────────────────────────
const pageTitle = computed(() => {
  const path = route.path

  // Exact nav match
  const exact = navItems.value.find(i => i.to === path)
  if (exact) return exact.label

  // Prefix match for nested routes (longest first)
  const sorted = [...navItems.value].sort((a, b) => b.to.length - a.to.length)
  const prefix = sorted.find(i => path.startsWith(i.to + '/'))
  if (prefix) {
    if (path.endsWith('/new')) return `${t('common.add')} ${prefix.label}`
    if (path.includes('/edit')) return `${t('common.edit')} ${prefix.label}`
    return prefix.label
  }

  // Special routes not in nav
  if (path === '/profile') return t('nav.profile')
  if (path === '/dashboard') return t('nav.dashboard')
  if (path.startsWith('/courses/')) return t('nav.courses')

  return ''
})

// ── Sidebar state ──────────────────────────────────────────────────
const sidebarCollapsed = ref(false)

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const sidebarWidthClass = computed(() =>
  sidebarCollapsed.value ? 'w-[72px]' : 'w-64'
)
</script>

<template>
  <div class="flex min-h-screen bg-neutral-50">
    <!-- Sidebar -->
    <aside
      class="flex flex-col sticky top-0 h-screen shrink-0 bg-white border-r border-neutral-200 transition-all duration-300 ease-out"
      :class="sidebarWidthClass"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center gap-3 px-4 border-b border-neutral-100 shrink-0">
        <NuxtLink to="/" class="flex items-center justify-center w-8 h-8 rounded-lg bg-primary shrink-0">
          <UIcon name="i-lucide-zap" class="text-white text-base" />
        </NuxtLink>
        <span
          class="text-sm font-semibold text-neutral-900 whitespace-nowrap overflow-hidden transition-all duration-300"
          :class="sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'"
        >
          {{ t('app.title') }}
        </span>
        <button
          class="ml-auto w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0"
          :class="sidebarCollapsed ? 'hidden' : 'flex'"
          @click="toggleSidebar"
        >
          <UIcon name="i-lucide-panel-left-close" class="text-sm" />
        </button>
      </div>

      <!-- Collapsed logo row with expand button -->
      <div
        v-if="sidebarCollapsed"
        class="flex items-center justify-center py-2 border-b border-neutral-100 shrink-0"
      >
        <button
          class="w-8 h-8 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          @click="toggleSidebar"
        >
          <UIcon name="i-lucide-panel-left-open" class="text-sm" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
        <UTooltip
          v-for="item in navItems"
          :key="item.to"
          :text="item.label"
          :content="{ side: 'right' }"
          :disabled="!sidebarCollapsed"
        >
          <NuxtLink
            :to="item.to"
            class="flex items-center gap-3 px-3 h-10 rounded-lg transition-all duration-200 group"
            :class="[
              isActive(item.to, item.exact)
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
            ]"
          >
            <UIcon
              :name="item.icon"
              class="shrink-0 transition-colors"
              :class="isActive(item.to, item.exact) ? 'text-lg' : 'text-lg text-neutral-400 group-hover:text-neutral-700'"
            />
            <span
              class="text-sm whitespace-nowrap overflow-hidden transition-all duration-300"
              :class="sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </UTooltip>
      </nav>

      <!-- Bottom section -->
      <div class="shrink-0 border-t border-neutral-100 py-3 px-3 flex flex-col gap-1">
        <UTooltip
          :text="t('app.title')"
          :content="{ side: 'right' }"
          :disabled="!sidebarCollapsed"
        >
          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-3 h-10 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-all duration-200 group"
          >
            <UIcon
              name="i-lucide-home"
              class="shrink-0 text-lg text-neutral-400 group-hover:text-neutral-700 transition-colors"
            />
            <span
              class="text-sm whitespace-nowrap overflow-hidden transition-all duration-300"
              :class="sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'"
            >
              {{ t('app.title') }}
            </span>
          </NuxtLink>
        </UTooltip>

        <UTooltip
          :text="t('nav.signOut')"
          :content="{ side: 'right' }"
          :disabled="!sidebarCollapsed"
        >
          <button
            class="w-full flex items-center gap-3 px-3 h-10 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group cursor-pointer"
            @click="logout"
          >
            <UIcon
              name="i-lucide-log-out"
              class="shrink-0 text-lg text-neutral-400 group-hover:text-red-500 transition-colors"
            />
            <span
              class="text-sm whitespace-nowrap overflow-hidden transition-all duration-300"
              :class="sidebarCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'"
            >
              {{ t('nav.signOut') }}
            </span>
          </button>
        </UTooltip>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-auto">
      <header class="sticky top-0 z-50 h-14 border-b border-neutral-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-4 shrink-0 gap-4">
        <div class="flex items-center gap-3 flex-1">
          <h1
            v-if="pageTitle"
            class="text-sm font-semibold text-neutral-900 truncate hidden sm:block"
          >
            {{ pageTitle }}
          </h1>

          <UDashboardSearchButton
            class="w-full max-w-sm justify-start"
            @click="searchOpen = true"
          />
        </div>

        <div class="flex items-center gap-2">
          <UDropdownMenu :items="userDropdownItems">
            <UButton
              color="neutral"
              variant="ghost"
              class="gap-2"
            >
              <UAvatar
                :src="user?.avatarUrl || undefined"
                :alt="user?.name || user?.email || ''"
                size="xs"
              />
              <span class="text-sm hidden sm:inline">{{ user?.name || user?.email }}</span>
              <UIcon name="i-lucide-chevron-down" class="text-xs" />
            </UButton>
          </UDropdownMenu>
        </div>
      </header>

      <UDashboardSearch
        v-model:open="searchOpen"
        :groups="searchGroups"
        shortcut="meta_k"
      />

      <main class="flex-1 p-6">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

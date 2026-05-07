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
      { label: t('nav.blog'), icon: 'i-lucide-newspaper', to: '/admin/blog' }
    ]
  }
  if (role === 'TEACHER') {
    return [
      { label: t('nav.dashboard'), icon: 'i-lucide-layout-dashboard', to: '/teacher', exact: true },
      { label: t('nav.courses'), icon: 'i-lucide-book-open', to: '/teacher/courses' },
      { label: t('nav.enrollments'), icon: 'i-lucide-users', to: '/teacher/enrollments' }
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
</script>

<template>
  <div class="flex min-h-screen bg-background">
    <aside class="w-16 bg-neutral-950 flex flex-col sticky top-0 h-screen shrink-0">
      <div class="h-14 flex items-center justify-center border-b border-neutral-800">
        <NuxtLink to="/">
          <UIcon name="i-lucide-zap" class="text-primary text-xl" />
        </NuxtLink>
      </div>

      <nav class="flex-1 py-4 flex flex-col items-center gap-2">
        <UTooltip
          v-for="item in navItems"
          :key="item.to"
          :text="item.label"
          :content="{ side: 'right' }"
        >
          <NuxtLink
            :to="item.to"
            class="w-10 h-10 flex items-center justify-center rounded-lg transition-colors"
            :class="isActive(item.to, item.exact) ? 'bg-primary text-primary-foreground' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'"
          >
            <UIcon :name="item.icon" class="text-lg" />
          </NuxtLink>
        </UTooltip>
      </nav>

      <div class="py-4 flex flex-col items-center gap-2 border-t border-neutral-800">
        <UTooltip :text="t('app.title')" :content="{ side: 'right' }">
          <NuxtLink to="/" class="w-10 h-10 flex items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <UIcon name="i-lucide-home" class="text-lg" />
          </NuxtLink>
        </UTooltip>
      </div>
    </aside>

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 border-b bg-card flex items-center justify-between px-4 shrink-0 gap-4">
        <div class="flex items-center gap-3 flex-1">
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

      <main class="flex-1 p-6 overflow-auto">
        <NuxtPage />
      </main>
    </div>
  </div>
</template>

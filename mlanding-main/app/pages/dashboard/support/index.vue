<script setup>
definePageMeta({ layout: 'portal', middleware: 'auth', colorMode: 'light' })

const chrome = useChromeCopy()
const localePath = useLocalePath()
const t = computed(() => chrome.value.dashboard.supportPage)
useHead({ title: () => t.value.docTitle })

const { data: tickets, refresh } = await useFetch('/api/portal/support/tickets', {
  default: () => []
})

const STATUS_LABELS = computed(() => ({
  OPEN: t.value.statusOpen,
  AWAITING_USER: t.value.statusAwaitingUser,
  RESOLVED: t.value.statusResolved,
  CLOSED: t.value.statusClosed
}))
const STATUS_COLORS = {
  OPEN: 'primary',
  AWAITING_USER: 'warning',
  RESOLVED: 'success',
  CLOSED: 'neutral'
}

function fmt(d) {
  return d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <header class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">{{ t.title }}</h1>
        <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
      </div>
      <UButton
        icon="i-lucide-plus"
        :to="localePath('/dashboard/support/new')"
        color="primary"
      >
        {{ t.newButton }}
      </UButton>
    </header>

    <UCard class="!shadow-none">
      <div v-if="!tickets.length" class="text-center py-10 text-muted">
        <UIcon name="i-lucide-life-buoy" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.empty }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <NuxtLink
          v-for="ticket in tickets" :key="ticket.id"
          :to="localePath(`/dashboard/support/${ticket.id}`)"
          class="flex items-start gap-4 px-4 py-4 hover:bg-elevated transition"
        >
          <div class="size-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            :class="ticket.unread ? 'bg-primary/15 text-primary' : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-500'"
          >
            <UIcon name="i-lucide-message-square" class="size-5" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold truncate text-sm">{{ ticket.subject }}</span>
              <UBadge v-if="ticket.unread" color="primary" variant="solid" size="sm">●</UBadge>
              <UBadge :color="STATUS_COLORS[ticket.status]" variant="soft" size="sm">
                {{ STATUS_LABELS[ticket.status] }}
              </UBadge>
            </div>
            <div class="text-xs text-muted mt-1 flex items-center gap-2 flex-wrap">
              <span>{{ ticket.source === 'CONTACT' ? t.sourceContact : t.sourceCustomer }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ ticket.messageCount }} msgs</span>
              <span aria-hidden="true">·</span>
              <span>{{ fmt(ticket.updatedAt) }}</span>
            </div>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-muted rtl:rotate-180 mt-2.5" />
        </NuxtLink>
      </div>
    </UCard>
  </div>
</template>

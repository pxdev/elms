<script setup>
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' })

const chrome = useChromeCopy()
const localePath = useLocalePath()
const t = computed(() => chrome.value.admin.supportPage)
useHead({ title: () => t.value.docTitle })

// Reka UI's Select reserves the empty string for "no selection",
// so the "All" option needs a non-empty sentinel that we strip out
// before forwarding to the API.
const ALL = 'all'

const q = ref('')
const statusFilter = ref('open-queue') // open + awaiting user by default
const sourceFilter = ref(ALL)

const { data: tickets, refresh } = await useFetch('/api/portal/admin/support/tickets', {
  query: computed(() => {
    let status
    if (statusFilter.value === 'open-queue') status = 'OPEN,AWAITING_USER'
    else if (statusFilter.value !== ALL) status = statusFilter.value
    const source = sourceFilter.value === ALL ? undefined : sourceFilter.value
    return {
      q: q.value || undefined,
      status,
      source
    }
  }),
  default: () => []
})

const STATUS_LABELS = computed(() => ({
  OPEN: t.value.filterOpen,
  AWAITING_USER: t.value.filterAwaiting,
  RESOLVED: t.value.filterResolved,
  CLOSED: t.value.filterClosed
}))
const STATUS_COLORS = {
  OPEN: 'primary',
  AWAITING_USER: 'warning',
  RESOLVED: 'success',
  CLOSED: 'neutral'
}

const statusFilters = computed(() => [
  { label: t.value.filterAll, value: ALL },
  { label: `${t.value.filterOpen} + ${t.value.filterAwaiting}`, value: 'open-queue' },
  { label: t.value.filterOpen, value: 'OPEN' },
  { label: t.value.filterAwaiting, value: 'AWAITING_USER' },
  { label: t.value.filterResolved, value: 'RESOLVED' },
  { label: t.value.filterClosed, value: 'CLOSED' }
])
const sourceFilters = computed(() => [
  { label: t.value.filterAll, value: ALL },
  { label: t.value.filterContact, value: 'CONTACT' },
  { label: t.value.filterCustomer, value: 'CUSTOMER' }
])

function fmt(d) {
  return d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}
function name(t) {
  return t.name || (t.account
    ? [t.account.firstName, t.account.lastName].filter(Boolean).join(' ').trim() || t.email
    : t.email)
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <header>
      <h1 class="text-2xl font-bold">{{ t.title }}</h1>
      <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
    </header>

    <div class="flex flex-wrap gap-2 items-center">
      <UInput
        v-model="q"
        :placeholder="t.searchPlaceholder"
        icon="i-lucide-search"
        class="flex-1 min-w-[12rem]"
        @keyup.enter="refresh"
      />
      <USelect v-model="statusFilter" :items="statusFilters" value-key="value" placeholder="Status" />
      <USelect v-model="sourceFilter" :items="sourceFilters" value-key="value" placeholder="Source" />
    </div>

    <UCard class="!shadow-none">
      <div v-if="!tickets.length" class="text-center py-10 text-muted">
        <UIcon name="i-lucide-inbox" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.empty }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <NuxtLink
          v-for="ticket in tickets" :key="ticket.id"
          :to="localePath(`/admin/support/${ticket.id}`)"
          class="flex items-start gap-4 px-4 py-4 hover:bg-elevated transition"
        >
          <div class="size-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
            :class="ticket.unread ? 'bg-primary/15 text-primary' : 'bg-black/[0.04] dark:bg-white/[0.06] text-gray-500'"
          >
            <UIcon
              :name="ticket.source === 'CONTACT' ? 'i-lucide-mail' : 'i-lucide-life-buoy'"
              class="size-5"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-semibold truncate text-sm">{{ ticket.subject }}</span>
              <UBadge v-if="ticket.unread" color="primary" variant="solid" size="sm">{{ t.newBadge }}</UBadge>
              <UBadge :color="STATUS_COLORS[ticket.status]" variant="soft" size="sm">
                {{ STATUS_LABELS[ticket.status] }}
              </UBadge>
              <UBadge v-if="!ticket.account" color="neutral" variant="outline" size="sm">{{ t.anonymousLabel }}</UBadge>
            </div>
            <div class="text-xs text-muted mt-1 flex items-center gap-2 flex-wrap">
              <span class="font-medium">{{ name(ticket) }}</span>
              <span aria-hidden="true">·</span>
              <span>{{ ticket.email }}</span>
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

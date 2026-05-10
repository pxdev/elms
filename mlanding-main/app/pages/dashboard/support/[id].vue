<script setup>
definePageMeta({ layout: 'portal', middleware: 'auth', colorMode: 'light' })

const chrome = useChromeCopy()
const localePath = useLocalePath()
const route = useRoute()
const toast = useToast()
const t = computed(() => chrome.value.dashboard.supportPage)
useHead({ title: () => t.value.threadDocTitle })

const ticketId = computed(() => String(route.params.id))

const { data: ticket, refresh } = await useFetch(
  () => `/api/portal/support/tickets/${ticketId.value}`,
  { default: () => null }
)

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

const reply = ref('')
const sending = ref(false)
const closing = ref(false)

const isClosed = computed(
  () => ticket.value?.status === 'RESOLVED' || ticket.value?.status === 'CLOSED'
)

async function send() {
  if (reply.value.trim().length < 1 || isClosed.value) return
  sending.value = true
  try {
    await $fetch(`/api/portal/support/tickets/${ticketId.value}/messages`, {
      method: 'POST',
      body: { body: reply.value.trim() }
    })
    reply.value = ''
    await refresh()
  }
  catch (err) {
    toast.add({ title: err.statusMessage || 'Could not send', color: 'error' })
  }
  finally {
    sending.value = false
  }
}

async function markResolved() {
  closing.value = true
  try {
    await $fetch(`/api/portal/support/tickets/${ticketId.value}`, {
      method: 'PATCH',
      body: { status: 'RESOLVED' }
    })
    await refresh()
  }
  catch (err) {
    toast.add({ title: err.statusMessage || 'Could not update', color: 'error' })
  }
  finally {
    closing.value = false
  }
}

function fmt(d) {
  return d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''
}
</script>

<template>
  <div v-if="ticket" class="p-6 max-w-3xl mx-auto space-y-6">
    <NuxtLink
      :to="localePath('/dashboard/support')"
      class="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-gray-500 hover:text-primary transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-3.5 rtl:rotate-180" />
      {{ t.back }}
    </NuxtLink>

    <header class="flex items-start justify-between gap-3 flex-wrap">
      <div class="min-w-0">
        <h1 class="text-xl sm:text-2xl font-bold tracking-tight">{{ ticket.subject }}</h1>
        <div class="text-xs text-muted mt-1.5 flex items-center gap-2 flex-wrap">
          <UBadge :color="STATUS_COLORS[ticket.status]" variant="soft" size="sm">
            {{ STATUS_LABELS[ticket.status] }}
          </UBadge>
          <span aria-hidden="true">·</span>
          <span>{{ ticket.source === 'CONTACT' ? t.sourceContact : t.sourceCustomer }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ fmt(ticket.createdAt) }}</span>
        </div>
      </div>
      <UButton
        v-if="!isClosed"
        variant="outline"
        color="neutral"
        icon="i-lucide-check"
        :loading="closing"
        @click="markResolved"
      >
        {{ t.markResolved }}
      </UButton>
    </header>

    <!-- Thread -->
    <div class="space-y-3">
      <div
        v-for="m in ticket.messages" :key="m.id"
        class="rounded-2xl p-4 sm:p-5 ring-1"
        :class="m.isAdmin
          ? 'bg-primary/5 dark:bg-primary/10 ring-primary/15'
          : 'bg-white dark:bg-white/[0.02] ring-black/10 dark:ring-white/10'"
      >
        <div class="flex items-center gap-2 text-xs mb-2">
          <UIcon
            :name="m.isAdmin ? 'i-lucide-shield-check' : 'i-lucide-user'"
            class="size-3.5"
            :class="m.isAdmin ? 'text-primary' : 'text-gray-500'"
          />
          <span class="font-bold" :class="m.isAdmin ? 'text-primary' : ''">
            {{ m.isAdmin ? t.support : (m.senderName || t.you) }}
          </span>
          <span class="text-muted">·</span>
          <span class="text-muted">{{ fmt(m.createdAt) }}</span>
        </div>
        <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ m.body }}</p>
      </div>
    </div>

    <!-- Reply box -->
    <div v-if="!isClosed" class="space-y-2">
      <UTextarea
        v-model="reply"
        :placeholder="t.replyPlaceholder"
        :rows="4"
        class="w-full"
        maxlength="10000"
      />
      <div class="flex justify-end">
        <UButton
          color="primary"
          icon="i-lucide-send"
          :loading="sending"
          :disabled="reply.trim().length < 1"
          @click="send"
        >
          {{ t.reply }}
        </UButton>
      </div>
    </div>

    <!-- Closed-ticket hint -->
    <div
      v-else
      class="rounded-xl bg-black/[0.03] dark:bg-white/[0.04] ring-1 ring-black/10 dark:ring-white/10 p-4 text-sm text-muted"
    >
      {{ t.closedHint }}
    </div>
  </div>
</template>

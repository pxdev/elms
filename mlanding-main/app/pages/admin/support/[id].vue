<script setup>
import { fillTemplate } from '~/composables/useChromeCopy'
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' })

const chrome = useChromeCopy()
const localePath = useLocalePath()
const route = useRoute()
const toast = useToast()
const t = computed(() => chrome.value.admin.supportPage)
useHead({ title: () => t.value.threadDocTitle })

const ticketId = computed(() => String(route.params.id))

const { data: ticket, refresh } = await useFetch(
  () => `/api/portal/admin/support/tickets/${ticketId.value}`,
  { default: () => null }
)

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

const reply = ref('')
const sending = ref(false)
const updating = ref(false)

async function send() {
  if (reply.value.trim().length < 1) return
  sending.value = true
  try {
    await $fetch(`/api/portal/admin/support/tickets/${ticketId.value}/messages`, {
      method: 'POST',
      body: { body: reply.value.trim() }
    })
    reply.value = ''
    toast.add({ title: t.value.replySent, color: 'success' })
    await refresh()
  }
  catch (err) {
    toast.add({ title: err.statusMessage || 'Could not send', color: 'error' })
  }
  finally {
    sending.value = false
  }
}

async function setStatus(status) {
  updating.value = true
  try {
    await $fetch(`/api/portal/admin/support/tickets/${ticketId.value}`, {
      method: 'PATCH',
      body: { status }
    })
    toast.add({ title: t.value.statusUpdated, color: 'success' })
    await refresh()
  }
  catch (err) {
    toast.add({ title: err.statusMessage || 'Could not update', color: 'error' })
  }
  finally {
    updating.value = false
  }
}

function fmt(d) {
  return d ? new Date(d).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''
}
function customerDisplay(tk) {
  if (tk?.account) {
    return [tk.account.firstName, tk.account.lastName].filter(Boolean).join(' ').trim() || tk.account.email
  }
  return tk?.name || tk?.email || ''
}
</script>

<template>
  <div v-if="ticket" class="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <!-- LEFT: thread -->
    <div class="lg:col-span-8 space-y-6 min-w-0">
      <NuxtLink
        :to="localePath('/admin/support')"
        class="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-gray-500 hover:text-primary transition-colors"
      >
        <UIcon name="i-lucide-arrow-left" class="size-3.5 rtl:rotate-180" />
        {{ t.threadBack }}
      </NuxtLink>

      <header class="flex items-start justify-between gap-3 flex-wrap">
        <div class="min-w-0">
          <h1 class="text-xl sm:text-2xl font-bold tracking-tight">{{ ticket.subject }}</h1>
          <div class="text-xs text-muted mt-1.5 flex items-center gap-2 flex-wrap">
            <UBadge :color="STATUS_COLORS[ticket.status]" variant="soft" size="sm">
              {{ STATUS_LABELS[ticket.status] }}
            </UBadge>
            <span aria-hidden="true">·</span>
            <span>{{ ticket.source === 'CONTACT' ? chrome.dashboard.supportPage.sourceContact : chrome.dashboard.supportPage.sourceCustomer }}</span>
            <span aria-hidden="true">·</span>
            <span>{{ fmt(ticket.createdAt) }}</span>
          </div>
        </div>
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
              {{ m.isAdmin ? t.support : (m.senderName || customerDisplay(ticket)) }}
            </span>
            <span class="text-muted">·</span>
            <span class="text-muted">{{ fmt(m.createdAt) }}</span>
          </div>
          <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ m.body }}</p>
        </div>
      </div>

      <!-- Reply box -->
      <div class="space-y-2">
        <UTextarea
          v-model="reply"
          :placeholder="t.replyPlaceholder"
          :rows="5"
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
    </div>

    <!-- RIGHT: status sidebar + customer card -->
    <aside class="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
      <UCard class="!shadow-none">
        <template #header>
          <p class="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">Status</p>
        </template>
        <div class="space-y-2 -mt-1">
          <UButton
            block
            :variant="ticket.status === 'OPEN' ? 'solid' : 'outline'"
            color="primary"
            icon="i-lucide-circle-dot"
            :loading="updating"
            @click="setStatus('OPEN')"
          >
            {{ t.openAction }}
          </UButton>
          <UButton
            block
            :variant="ticket.status === 'AWAITING_USER' ? 'solid' : 'outline'"
            color="warning"
            icon="i-lucide-hourglass"
            :loading="updating"
            @click="setStatus('AWAITING_USER')"
          >
            {{ t.awaitingAction }}
          </UButton>
          <UButton
            block
            :variant="ticket.status === 'RESOLVED' ? 'solid' : 'outline'"
            color="success"
            icon="i-lucide-check"
            :loading="updating"
            @click="setStatus('RESOLVED')"
          >
            {{ t.resolveAction }}
          </UButton>
          <UButton
            block
            :variant="ticket.status === 'CLOSED' ? 'solid' : 'outline'"
            color="neutral"
            icon="i-lucide-x"
            :loading="updating"
            @click="setStatus('CLOSED')"
          >
            {{ t.closeAction }}
          </UButton>
        </div>
      </UCard>

      <UCard class="!shadow-none">
        <template #header>
          <p class="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">{{ t.customerLabel }}</p>
        </template>
        <div class="space-y-2 text-sm">
          <p class="font-semibold">{{ customerDisplay(ticket) }}</p>
          <p class="text-muted text-xs">{{ ticket.email }}</p>
          <div v-if="ticket.account" class="pt-3 border-t border-default mt-3 space-y-1.5 text-xs">
            <p class="text-muted">{{ fillTemplate(t.licensesLabel, { n: ticket.account._count.licenses }) }}</p>
            <p class="text-muted">{{ fillTemplate(t.ordersLabel, { n: ticket.account._count.orders }) }}</p>
            <NuxtLink
              :to="localePath(`/admin/users/${ticket.account.id}`)"
              class="inline-flex items-center gap-1 text-primary hover:underline mt-1.5"
            >
              {{ t.viewAccount }}
              <UIcon name="i-lucide-arrow-right" class="size-3 rtl:rotate-180" />
            </NuxtLink>
          </div>
          <div v-else class="pt-3 border-t border-default mt-3 text-xs text-muted">
            {{ chrome.admin.supportPage.anonymousLabel }}
          </div>
        </div>
      </UCard>

      <div class="text-xs text-muted px-1">
        <p>{{ t.createdLabel }}: {{ fmt(ticket.createdAt) }}</p>
        <p v-if="ticket.closedAt">Closed: {{ fmt(ticket.closedAt) }}</p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { fillTemplate } from '~/composables/useChromeCopy';
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const localePath = useLocalePath();
const t = computed(() => chrome.value.admin.orderDetailPage);
const route = useRoute();
const id = route.params.id;
const { data: order } = await useFetch(`/api/portal/admin/orders/${id}`);
useHead({
    title: () => order.value
        ? fillTemplate(t.value.docTitleLoaded, { number: order.value.lsOrderNumber || order.value.id.slice(-6) })
        : t.value.docTitleLoading
});
function fmt(d) { return new Date(d).toLocaleString(); }
function fmtMoney(cents, currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
const statusColor = {
    PAID: 'success', REFUNDED: 'error', PENDING: 'warning', FAILED: 'error',
    ACTIVE: 'success', REVOKED: 'error', EXPIRED: 'warning'
};
const rawPayloadPretty = computed(() => order.value?.rawPayload ? JSON.stringify(order.value.rawPayload, null, 2) : null);
const showRaw = ref(false);
</script>

<template>
  <div v-if="!order" class="p-6 max-w-4xl mx-auto text-sm text-muted">{{ t.loading }}</div>
  <div v-else class="p-6 max-w-4xl mx-auto space-y-6">
    <NuxtLink :to="localePath('/admin/orders')" class="text-sm text-muted hover:text-primary inline-flex items-center gap-1.5">
      <UIcon name="i-lucide-chevron-left" class="size-4 rtl:rotate-180" /> {{ t.backToPurchases }}
    </NuxtLink>

    <header class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold">
          {{ t.title }} <span class="font-mono text-lg text-muted">#{{ order.lsOrderNumber || order.id.slice(-6) }}</span>
        </h1>
        <div class="mt-2 flex items-center gap-2 flex-wrap">
          <UBadge :color="statusColor[order.status]" variant="soft">{{ order.status }}</UBadge>
          <span class="text-sm text-muted">{{ fmt(order.createdAt) }}</span>
        </div>
      </div>
      <div class="text-end">
        <div class="text-2xl font-bold tabular-nums">{{ fmtMoney(order.amountCents, order.currency) }}</div>
        <UButton
          v-if="order.lsReceiptUrl"
          :to="order.lsReceiptUrl"
          target="_blank"
          variant="soft"
          size="xs"
          icon="i-lucide-external-link"
          class="mt-1"
        >{{ t.viewLsReceipt }}</UButton>
      </div>
    </header>

    <UCard class="!shadow-none">
      <template #header>
        <h3 class="font-semibold">{{ t.secCustomer }}</h3>
      </template>
      <NuxtLink :to="localePath(`/admin/users/${order.account.id}`)" class="flex items-center gap-3 hover:bg-elevated -m-2 p-2 rounded-lg transition">
        <div class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
          {{ (order.account.firstName?.[0] || order.account.email[0] || '?').toUpperCase() }}
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium">{{ [order.account.firstName, order.account.lastName].filter(Boolean).join(' ') || order.account.email }}</p>
          <p class="text-sm text-muted">{{ order.account.email }}<span v-if="order.account.githubUsername"> · gh:{{ order.account.githubUsername }}</span></p>
        </div>
        <UIcon name="i-lucide-chevron-right" class="size-4 text-muted rtl:rotate-180" />
      </NuxtLink>
    </UCard>

    <UCard class="!shadow-none">
      <template #header>
        <h3 class="font-semibold">{{ t.secDetails }}</h3>
      </template>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt class="text-muted">{{ t.fieldPlan }}</dt>
          <dd class="font-medium">{{ order.plan?.name || '—' }}</dd>
        </div>
        <div>
          <dt class="text-muted">{{ t.fieldLsOrderId }}</dt>
          <dd class="font-mono text-xs">{{ order.lsOrderId || '—' }}</dd>
        </div>
        <div>
          <dt class="text-muted">{{ t.fieldLsCustomerId }}</dt>
          <dd class="font-mono text-xs">{{ order.lsCustomerId || '—' }}</dd>
        </div>
        <div v-if="order.refundedAt">
          <dt class="text-muted">{{ t.fieldRefunded }}</dt>
          <dd>{{ fmt(order.refundedAt) }}<span v-if="order.refundReason"> — {{ order.refundReason }}</span></dd>
        </div>
      </dl>
    </UCard>

    <UCard class="!shadow-none">
      <template #header>
        <h3 class="font-semibold">{{ t.secLicenses }}</h3>
      </template>
      <div v-if="!order.licenses.length" class="py-6 text-center text-sm text-muted">
        <UIcon name="i-lucide-shield" class="size-6 mx-auto opacity-40" />
        <p class="mt-2">{{ t.emptyLicenses }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <NuxtLink
          v-for="l in order.licenses" :key="l.id"
          :to="`${localePath('/admin/licenses')}?q=${l.keyPrefix}`"
          class="flex items-center gap-3 px-4 py-3 hover:bg-elevated transition"
        >
          <UIcon name="i-lucide-key" class="size-4 text-primary" />
          <span class="font-mono text-sm font-semibold flex-1">{{ l.keyPrefix }}…</span>
          <UBadge :color="statusColor[l.status]" variant="soft" size="sm">{{ l.status }}</UBadge>
          <span class="text-xs text-muted">{{ t.maxPrefix }} {{ l.maxActivations }}</span>
          <span class="text-xs text-muted">{{ fmt(l.issuedAt) }}</span>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-muted rtl:rotate-180" />
        </NuxtLink>
      </div>
    </UCard>

    <UCard v-if="rawPayloadPretty" class="!shadow-none">
      <template #header>
        <button class="w-full flex items-center justify-between" :aria-expanded="showRaw" @click="showRaw = !showRaw">
          <h3 class="font-semibold">{{ t.secRaw }}</h3>
          <UIcon :name="showRaw ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="size-4 text-muted" />
        </button>
      </template>
      <pre v-if="showRaw" class="text-xs overflow-x-auto font-mono bg-elevated p-3 rounded">{{ rawPayloadPretty }}</pre>
    </UCard>
  </div>
</template>

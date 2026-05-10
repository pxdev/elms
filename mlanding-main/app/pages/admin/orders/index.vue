<script setup>
import { fillTemplate } from '~/composables/useChromeCopy';
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const localePath = useLocalePath();
const t = computed(() => chrome.value.admin.ordersPage);
useHead({ title: () => chrome.value.admin.ordersPage.docTitle });
const route = useRoute();
const ALL_STATUSES = '__all__';
const q = ref(route.query.q || '');
const status = ref(route.query.status || ALL_STATUSES);
const { data: orders, refresh, status: fetchStatus } = await useFetch('/api/portal/admin/orders', {
    query: computed(() => ({
        q: q.value || undefined,
        status: status.value === ALL_STATUSES ? undefined : status.value
    })),
    default: () => []
});
function fmt(d) { return new Date(d).toLocaleString(); }
function fmtMoney(cents, currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
function name(o) {
    return [o.account.firstName, o.account.lastName].filter(Boolean).join(' ') || o.account.email;
}
function pluralLicense(n) {
    return fillTemplate(n === 1 ? t.value.licenseOne : t.value.licenseMany, { n });
}
const statusColor = {
    PAID: 'success', REFUNDED: 'error', PENDING: 'warning', FAILED: 'error'
};
const statusFilters = computed(() => [
    { label: t.value.filterAll, value: ALL_STATUSES },
    { label: t.value.filterPaid, value: 'PAID' },
    { label: t.value.filterRefunded, value: 'REFUNDED' },
    { label: t.value.filterPending, value: 'PENDING' },
    { label: t.value.filterFailed, value: 'FAILED' }
]);
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <header>
      <h1 class="text-2xl font-bold">{{ t.title }}</h1>
      <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
    </header>

    <div class="flex flex-wrap gap-2">
      <UInput v-model="q" :placeholder="t.searchPlaceholder" icon="i-lucide-search" class="flex-1 min-w-[240px]" @keyup.enter="refresh" />
      <USelectMenu v-model="status" :items="statusFilters" value-key="value" class="w-44" />
      <UButton icon="i-lucide-search" :loading="fetchStatus === 'pending'" @click="refresh">{{ t.search }}</UButton>
    </div>

    <UCard class="!shadow-none">
      <div v-if="!orders.length" class="text-center py-10 text-muted">
        <UIcon name="i-lucide-shopping-cart" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.empty }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <NuxtLink
          v-for="o in orders" :key="o.id"
          :to="localePath(`/admin/orders/${o.id}`)"
          class="flex items-center gap-4 px-4 py-3 hover:bg-elevated transition"
        >
          <UIcon name="i-lucide-receipt" class="size-5 text-muted shrink-0" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap text-sm">
              <span class="font-medium truncate">{{ name(o) }}</span>
              <UBadge :color="statusColor[o.status]" variant="soft" size="sm">{{ o.status }}</UBadge>
              <span v-if="o.plan" class="text-xs text-muted">{{ o.plan.name }}</span>
              <span v-if="o.licenseCount" class="text-xs text-muted">· {{ pluralLicense(o.licenseCount) }}</span>
            </div>
            <div class="text-xs text-muted mt-0.5">
              {{ o.account.email }}
              <span v-if="o.lsOrderNumber"> · #{{ o.lsOrderNumber }}</span>
              · {{ fmt(o.createdAt) }}
            </div>
          </div>
          <span class="text-sm font-bold tabular-nums shrink-0">{{ fmtMoney(o.amountCents, o.currency) }}</span>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-muted shrink-0 rtl:rotate-180" />
        </NuxtLink>
      </div>
    </UCard>
  </div>
</template>

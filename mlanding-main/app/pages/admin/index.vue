<script setup>
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const localePath = useLocalePath();
const t = computed(() => chrome.value.admin.indexPage);
useHead({ title: () => chrome.value.admin.indexPage.docTitle });
const { data: stats } = await useFetch('/api/portal/admin/stats');
function fmtMoney(cents, currency) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
}
function fmt(d) { return new Date(d).toLocaleString(); }
const primaryRevenue = computed(() => {
    const entries = Object.entries(stats.value?.revenueByCurrency || {});
    if (!entries.length)
        return null;
    entries.sort((a, b) => b[1] - a[1]);
    const [currency, cents] = entries[0];
    return { currency, label: fmtMoney(cents, currency), rest: entries.slice(1) };
});
const kpis = computed(() => {
    if (!stats.value)
        return [];
    const s = stats.value;
    return [
        { label: t.value.kpiActiveLicenses, value: s.licenses.active.toLocaleString(), icon: 'i-lucide-shield-check', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: t.value.kpiRevokedLicenses, value: s.licenses.revoked.toLocaleString(), icon: 'i-lucide-shield-off', color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: t.value.kpiLiveInstalls, value: s.activations.active.toLocaleString(), icon: 'i-lucide-server', color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
        { label: t.value.kpiCustomers, value: s.users.total.toLocaleString(), icon: 'i-lucide-users', color: 'text-violet-500', bg: 'bg-violet-500/10' },
        { label: t.value.kpiPaidOrders, value: s.orders.paid.toLocaleString(), icon: 'i-lucide-shopping-cart', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: t.value.kpiRefunded, value: s.orders.refunded.toLocaleString(), icon: 'i-lucide-undo-2', color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: t.value.kpiPendingInvites, value: s.pendingInvites.toLocaleString(), icon: 'i-lucide-mail-question', color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { label: t.value.kpiRevenue, value: primaryRevenue.value?.label || '—', icon: 'i-lucide-banknote', color: 'text-emerald-600', bg: 'bg-emerald-600/10' }
    ];
});
const statusColor = {
    PAID: 'success',
    REFUNDED: 'error',
    PENDING: 'warning',
    FAILED: 'error'
};
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">{{ t.title }}</h1>
      <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
    </header>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard v-for="kpi in kpis" :key="kpi.label" class="!shadow-none">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center size-10 rounded-xl shrink-0" :class="kpi.bg">
            <UIcon :name="kpi.icon" class="size-5" :class="kpi.color" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-xl font-bold tabular-nums truncate">{{ kpi.value }}</p>
            <p class="text-[11px] text-muted truncate">{{ kpi.label }}</p>
          </div>
        </div>
      </UCard>
    </div>

    <div v-if="primaryRevenue && primaryRevenue.rest.length" class="mt-4 text-xs text-muted flex flex-wrap gap-3">
      <span v-for="[currency, cents] in primaryRevenue.rest" :key="currency">
        + {{ fmtMoney(cents, currency) }}
      </span>
    </div>

    <section class="mt-8">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-lg font-semibold">{{ t.recentTitle }}</h2>
        <NuxtLink :to="localePath('/admin/orders')" class="text-sm text-primary hover:underline inline-flex items-center gap-1">
          {{ t.viewAll }} <UIcon name="i-lucide-arrow-right" class="size-3.5 rtl:rotate-180" />
        </NuxtLink>
      </div>
      <UCard class="!shadow-none">
        <div v-if="!stats?.recentOrders.length" class="py-8 text-center text-sm text-muted">
          <UIcon name="i-lucide-shopping-cart" class="size-8 mx-auto opacity-40" />
          <p class="mt-2">{{ t.noPurchases }}</p>
        </div>
        <div v-else class="divide-y divide-default -m-4">
          <NuxtLink
            v-for="o in stats.recentOrders" :key="o.id"
            :to="localePath(`/admin/orders/${o.id}`)"
            class="flex items-center gap-4 px-4 py-3 hover:bg-elevated transition"
          >
            <UIcon name="i-lucide-receipt" class="size-5 text-muted shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap text-sm">
                <span class="font-medium truncate">{{ o.customerName || o.customerEmail }}</span>
                <UBadge :color="statusColor[o.status] || 'neutral'" variant="soft" size="sm">{{ o.status }}</UBadge>
                <span v-if="o.planName" class="text-xs text-muted">{{ o.planName }}</span>
              </div>
              <div class="text-xs text-muted mt-0.5">
                <span v-if="o.lsOrderNumber">#{{ o.lsOrderNumber }} · </span>{{ fmt(o.createdAt) }}
              </div>
            </div>
            <span class="text-sm font-bold tabular-nums shrink-0">{{ fmtMoney(o.amountCents, o.currency) }}</span>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-muted shrink-0 rtl:rotate-180" />
          </NuxtLink>
        </div>
      </UCard>
    </section>
  </div>
</template>

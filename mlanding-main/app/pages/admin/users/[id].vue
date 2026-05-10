<script setup>
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const localePath = useLocalePath();
const t = computed(() => chrome.value.admin.userDetailPage);
useHead({ title: () => chrome.value.admin.userDetailPage.docTitle });
const route = useRoute();
const id = route.params.id;
const toast = useToast();
const { data: user, refresh } = await useFetch(`/api/portal/admin/users/${id}`);
const { data: plans } = await useFetch('/api/portal/admin/plans', { default: () => [] });
const issuing = ref(false);
const issuedKey = ref(null);
const showIssue = ref(false);
const newPlanId = ref('');
const newMaxActivations = ref(undefined);
const newNotes = ref('');
watch(plans, (p) => {
    if (p && p.length && !newPlanId.value)
        newPlanId.value = p[0].id;
}, { immediate: true });
async function issueLicense() {
    if (!user.value || !newPlanId.value)
        return;
    issuing.value = true;
    try {
        const res = await $fetch('/api/portal/admin/licenses', {
            method: 'POST',
            body: {
                accountId: user.value.id,
                planId: newPlanId.value,
                maxActivations: newMaxActivations.value,
                notes: newNotes.value || null
            }
        });
        issuedKey.value = res.key;
        showIssue.value = false;
        newNotes.value = '';
        newMaxActivations.value = undefined;
        await refresh();
    }
    catch (err) {
        toast.add({ title: t.value.toastIssueFailed, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        issuing.value = false;
    }
}
async function copyKey() {
    if (!issuedKey.value)
        return;
    await navigator.clipboard.writeText(issuedKey.value);
    toast.add({ title: t.value.toastKeyCopied, color: 'success' });
}
async function toggleActive() {
    if (!user.value)
        return;
    await $fetch(`/api/portal/admin/users/${user.value.id}`, {
        method: 'PATCH',
        body: { isActive: !user.value.isActive }
    });
    await refresh();
}
async function toggleAdmin() {
    if (!user.value)
        return;
    try {
        await $fetch(`/api/portal/admin/users/${user.value.id}`, {
            method: 'PATCH',
            body: { isAdmin: !user.value.isAdmin }
        });
        await refresh();
    }
    catch (err) {
        toast.add({ title: t.value.toastUpdateFailed, description: err.statusMessage || err.message, color: 'error' });
    }
}
function fmt(d) { return d ? new Date(d).toLocaleString() : '—'; }
function money(cents, ccy) {
    try {
        return new Intl.NumberFormat(undefined, { style: 'currency', currency: ccy }).format(cents / 100);
    }
    catch {
        return `${(cents / 100).toFixed(2)} ${ccy}`;
    }
}
const statusColor = {
    ACTIVE: 'success', REVOKED: 'error', EXPIRED: 'warning',
    PAID: 'success', REFUNDED: 'error', PARTIAL_REFUND: 'warning', PENDING: 'neutral'
};
</script>

<template>
  <div v-if="user" class="p-6 max-w-6xl mx-auto space-y-6">
    <div>
      <NuxtLink :to="localePath('/admin/users')" class="text-sm text-muted hover:text-primary inline-flex items-center gap-1.5">
        <UIcon name="i-lucide-chevron-left" class="size-4 rtl:rotate-180" /> {{ t.backToCustomers }}
      </NuxtLink>
      <h1 class="text-2xl font-bold mt-2">{{ ((user.firstName || '') + ' ' + (user.lastName || '')).trim() || user.email }}</h1>
      <p class="text-muted text-sm mt-1">{{ user.email }}</p>
    </div>

    <UAlert
      v-if="issuedKey"
      color="warning"
      variant="soft"
      icon="i-lucide-key-round"
      :title="t.keyTitle"
      :description="t.keyDesc"
    >
      <template #actions>
        <div class="flex flex-col sm:flex-row gap-2 mt-2">
          <code class="flex-1 px-3 py-2 rounded bg-elevated font-mono text-sm select-all">{{ issuedKey }}</code>
          <UButton icon="i-lucide-copy" size="sm" @click="copyKey">{{ t.copyBtn }}</UButton>
          <UButton variant="soft" size="sm" @click="issuedKey = null">{{ t.doneBtn }}</UButton>
        </div>
      </template>
    </UAlert>

    <UCard class="!shadow-none">
      <template #header>
        <h2 class="font-semibold">{{ t.secAccount }}</h2>
      </template>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt class="text-muted">{{ t.fieldGithub }}</dt>
          <dd>{{ user.githubUsername || '—' }}</dd>
        </div>
        <div>
          <dt class="text-muted">{{ t.fieldJoined }}</dt>
          <dd>{{ fmt(user.createdAt) }}</dd>
        </div>
        <div>
          <dt class="text-muted">{{ t.fieldLastLogin }}</dt>
          <dd>{{ fmt(user.lastLoginAt) }}</dd>
        </div>
        <div>
          <dt class="text-muted">{{ t.fieldStatus }}</dt>
          <dd>
            <UBadge :color="user.isActive ? 'success' : 'error'" variant="soft">{{ user.isActive ? t.statusActive : t.statusDisabled }}</UBadge>
            <UBadge v-if="user.isAdmin" color="primary" variant="soft" class="ms-1">{{ t.adminBadge }}</UBadge>
          </dd>
        </div>
      </dl>
      <template #footer>
        <div class="flex flex-wrap gap-2">
          <UButton variant="soft" :color="user.isActive ? 'error' : 'success'" size="sm" @click="toggleActive">
            {{ user.isActive ? t.actionDeactivate : t.actionReactivate }}
          </UButton>
          <UButton variant="soft" :color="user.isAdmin ? 'neutral' : 'primary'" size="sm" @click="toggleAdmin">
            {{ user.isAdmin ? t.actionRevokeAdmin : t.actionGrantAdmin }}
          </UButton>
        </div>
      </template>
    </UCard>

    <UCard class="!shadow-none">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">{{ t.secLicenses }}</h2>
          <UButton v-if="!showIssue" icon="i-lucide-plus" size="sm" @click="showIssue = true">{{ t.btnIssueLicense }}</UButton>
        </div>
      </template>

      <div v-if="showIssue" class="mb-4 p-4 rounded-xl bg-elevated space-y-3">
        <UFormField :label="t.fieldPlan">
          <USelectMenu v-model="newPlanId" :items="plans.map(p => ({ label: p.name, value: p.id }))" value-key="value" />
        </UFormField>
        <UFormField :label="t.fieldMaxActivations" :hint="t.hintMaxActivations">
          <UInput v-model.number="newMaxActivations" type="number" min="1" max="100" :placeholder="t.placeholderDefault" />
        </UFormField>
        <UFormField :label="t.fieldNotes">
          <UTextarea v-model="newNotes" :rows="2" :placeholder="t.placeholderNotes" />
        </UFormField>
        <div class="flex gap-2">
          <UButton :loading="issuing" :disabled="!newPlanId" @click="issueLicense">{{ t.issueBtn }}</UButton>
          <UButton variant="ghost" :disabled="issuing" @click="showIssue = false">{{ t.cancelBtn }}</UButton>
        </div>
      </div>

      <div v-if="!user.licenses.length" class="text-center py-8 text-muted text-sm">
        {{ t.emptyLicenses }}
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <NuxtLink
          v-for="l in user.licenses" :key="l.id" :to="`${localePath('/admin/licenses')}?q=${l.keyPrefix}`"
          class="flex items-center gap-4 px-4 py-3 hover:bg-elevated transition"
        >
          <UIcon name="i-lucide-key" class="size-5 text-primary" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-mono text-sm font-semibold">{{ l.keyPrefix }}…</span>
              <UBadge :color="statusColor[l.status]" variant="soft" size="sm">{{ l.status }}</UBadge>
              <span class="text-xs text-muted">{{ l.plan.name }}</span>
            </div>
            <div class="text-xs text-muted mt-0.5">
              {{ l.activeActivations }}/{{ l.maxActivations }} {{ t.installsSuffix }} · {{ t.issuedPrefix }} {{ fmt(l.issuedAt) }}
              <span v-if="l.notes"> · "{{ l.notes }}"</span>
            </div>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-muted rtl:rotate-180" />
        </NuxtLink>
      </div>
    </UCard>

    <UCard class="!shadow-none">
      <template #header>
        <h2 class="font-semibold">{{ t.secOrders }}</h2>
      </template>
      <div v-if="!user.orders.length" class="text-center py-8 text-muted text-sm">
        {{ t.emptyOrders }}
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <NuxtLink
          v-for="o in user.orders" :key="o.id"
          :to="localePath(`/admin/orders/${o.id}`)"
          class="flex items-center gap-4 px-4 py-3 hover:bg-elevated transition"
        >
          <UIcon name="i-lucide-receipt" class="size-5 text-primary" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap text-sm">
              <span class="font-medium">{{ money(o.amountCents, o.currency) }}</span>
              <UBadge :color="statusColor[o.status]" variant="soft" size="sm">{{ o.status }}</UBadge>
              <span v-if="o.plan" class="text-xs text-muted">{{ o.plan.name }}</span>
            </div>
            <div class="text-xs text-muted mt-0.5">
              <span v-if="o.lsOrderNumber">#{{ o.lsOrderNumber }} · </span>
              {{ fmt(o.createdAt) }}
            </div>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-muted rtl:rotate-180" />
        </NuxtLink>
      </div>
    </UCard>
  </div>

  <div v-else class="text-center py-12 text-muted">
    <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
  </div>
</template>

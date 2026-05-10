<script setup>
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const localePath = useLocalePath();
const t = computed(() => chrome.value.admin.licensesPage);
useHead({ title: () => chrome.value.admin.licensesPage.docTitle });
const route = useRoute();
const toast = useToast();
const ALL_STATUSES = '__all__';
const q = ref(route.query.q || '');
const status = ref(route.query.status || ALL_STATUSES);
const { data: licenses, refresh, status: fetchStatus } = await useFetch('/api/portal/admin/licenses', {
    query: computed(() => ({
        q: q.value || undefined,
        status: status.value === ALL_STATUSES ? undefined : status.value
    })),
    default: () => []
});
const editing = ref(null);
const editMax = ref(1);
const editNotes = ref('');
async function startEdit(l) {
    editing.value = l.id;
    editMax.value = l.maxActivations;
    editNotes.value = l.notes || '';
}
async function saveEdit(id) {
    try {
        await $fetch(`/api/portal/admin/licenses/${id}`, {
            method: 'PATCH',
            body: { maxActivations: editMax.value, notes: editNotes.value || null }
        });
        editing.value = null;
        await refresh();
    }
    catch (err) {
        toast.add({ title: t.value.toastUpdateFailed, description: err.statusMessage || err.message, color: 'error' });
    }
}
async function revoke(id) {
    if (!confirm(t.value.revokeConfirm))
        return;
    try {
        await $fetch(`/api/portal/admin/licenses/${id}`, {
            method: 'PATCH',
            body: { status: 'REVOKED', revokedReason: 'admin_action' }
        });
        await refresh();
    }
    catch (err) {
        toast.add({ title: t.value.toastRevokeFailed, description: err.statusMessage || err.message, color: 'error' });
    }
}
async function reinstate(id) {
    try {
        await $fetch(`/api/portal/admin/licenses/${id}`, {
            method: 'PATCH',
            body: { status: 'ACTIVE' }
        });
        await refresh();
    }
    catch (err) {
        toast.add({ title: t.value.toastReinstateFailed, description: err.statusMessage || err.message, color: 'error' });
    }
}
function fmt(d) { return new Date(d).toLocaleDateString(); }
const statusColor = {
    ACTIVE: 'success', REVOKED: 'error', EXPIRED: 'warning'
};
const statusFilters = computed(() => [
    { label: t.value.filterAll, value: ALL_STATUSES },
    { label: t.value.filterActive, value: 'ACTIVE' },
    { label: t.value.filterRevoked, value: 'REVOKED' },
    { label: t.value.filterExpired, value: 'EXPIRED' }
]);
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <header class="flex items-start justify-between flex-wrap gap-2">
      <div>
        <h1 class="text-2xl font-bold">{{ t.title }}</h1>
        <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
      </div>
      <UButton :to="localePath('/admin/licenses/new')" icon="i-lucide-plus" size="sm">{{ t.issueNew }}</UButton>
    </header>

    <div class="flex flex-wrap gap-2">
      <UInput v-model="q" :placeholder="t.searchPlaceholder" icon="i-lucide-search" class="flex-1 min-w-[200px]" @keyup.enter="refresh" />
      <USelectMenu v-model="status" :items="statusFilters" value-key="value" class="w-44" />
      <UButton icon="i-lucide-search" :loading="fetchStatus === 'pending'" @click="refresh">{{ t.search }}</UButton>
    </div>

    <UCard class="!shadow-none">
      <div v-if="!licenses.length" class="text-center py-10 text-muted">
        <UIcon name="i-lucide-search-x" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.empty }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <div v-for="l in licenses" :key="l.id" class="px-4 py-3">
          <div class="flex items-center gap-4">
            <UIcon name="i-lucide-key" class="size-5 text-primary" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono text-sm font-semibold">{{ l.keyPrefix }}…</span>
                <UBadge :color="statusColor[l.status]" variant="soft" size="sm">{{ l.status }}</UBadge>
                <span class="text-xs text-muted">{{ l.plan.name }}</span>
              </div>
              <div class="text-xs text-muted mt-0.5">
                <NuxtLink :to="localePath(`/admin/users/${l.account.id}`)" class="hover:text-primary">{{ l.account.email }}</NuxtLink>
                · {{ l.activeActivations }}/{{ l.maxActivations }} {{ t.installsSuffix }} · {{ fmt(l.issuedAt) }}
                <span v-if="l.notes"> · "{{ l.notes }}"</span>
              </div>
            </div>
            <div class="flex items-center gap-1">
              <UButton size="xs" variant="ghost" icon="i-lucide-pencil" :aria-label="chrome.common.edit" @click="startEdit(l)" />
              <UButton v-if="l.status === 'ACTIVE'" size="xs" variant="ghost" color="error" icon="i-lucide-ban" @click="revoke(l.id)" />
              <UButton v-else-if="l.status === 'REVOKED'" size="xs" variant="ghost" color="success" icon="i-lucide-check" @click="reinstate(l.id)" />
            </div>
          </div>

          <div v-if="editing === l.id" class="mt-3 p-3 rounded-lg bg-elevated grid grid-cols-1 sm:grid-cols-[1fr_2fr_auto] gap-2 items-end">
            <UFormField :label="t.fieldMaxActivations" size="sm">
              <UInput v-model.number="editMax" type="number" min="1" max="100" />
            </UFormField>
            <UFormField :label="t.fieldNotes" size="sm">
              <UInput v-model="editNotes" :placeholder="t.fieldNotesPlaceholder" />
            </UFormField>
            <div class="flex gap-2">
              <UButton size="sm" @click="saveEdit(l.id)">{{ chrome.common.save }}</UButton>
              <UButton size="sm" variant="ghost" @click="editing = null">{{ chrome.common.cancel }}</UButton>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

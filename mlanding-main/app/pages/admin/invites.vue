<script setup>
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const localePath = useLocalePath();
const t = computed(() => chrome.value.admin.invitesPage);
useHead({ title: () => chrome.value.admin.invitesPage.docTitle });
const toast = useToast();
const ALL_STATUSES = '__all__';
const statusFilter = ref(ALL_STATUSES);
const { data: invites, refresh, status } = await useFetch('/api/portal/admin/invites', {
    query: computed(() => ({ status: statusFilter.value === ALL_STATUSES ? undefined : statusFilter.value })),
    default: () => []
});
const retrying = ref(null);
async function retry(id) {
    retrying.value = id;
    try {
        const r = await $fetch(`/api/portal/admin/invites/${id}/retry`, { method: 'POST' });
        toast.add({
            title: r.status === 'SENT' || r.status === 'ACCEPTED' ? t.value.toastInviteSent : t.value.toastRetryCompleted,
            description: r.error,
            color: r.status === 'FAILED' ? 'error' : 'success'
        });
        await refresh();
    }
    catch (err) {
        toast.add({ title: t.value.toastRetryFailed, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        retrying.value = null;
    }
}
function fmt(d) { return d ? new Date(d).toLocaleString() : '—'; }
const statusColor = {
    ACCEPTED: 'success', SENT: 'success', FAILED: 'error', PENDING: 'neutral'
};
const statusFilters = computed(() => [
    { label: t.value.filterAll, value: ALL_STATUSES },
    { label: t.value.filterPending, value: 'PENDING' },
    { label: t.value.filterSent, value: 'SENT' },
    { label: t.value.filterAccepted, value: 'ACCEPTED' },
    { label: t.value.filterFailed, value: 'FAILED' }
]);
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <header>
      <h1 class="text-2xl font-bold">{{ t.title }}</h1>
      <p class="text-muted text-sm mt-1">{{ t.subtitle }}</p>
    </header>

    <div class="flex flex-wrap gap-2">
      <USelectMenu v-model="statusFilter" :items="statusFilters" value-key="value" class="w-44" />
      <UButton icon="i-lucide-refresh-cw" :loading="status === 'pending'" @click="refresh">{{ t.refresh }}</UButton>
    </div>

    <UCard class="!shadow-none">
      <div v-if="!invites.length" class="text-center py-10 text-muted">
        <UIcon name="i-simple-icons-github" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.empty }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <div v-for="i in invites" :key="i.id" class="px-4 py-3">
          <div class="flex items-center gap-4">
            <UIcon name="i-simple-icons-github" class="size-5" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap text-sm">
                <code class="font-semibold">{{ i.githubUsername }}</code>
                <UBadge :color="statusColor[i.status]" variant="soft" size="sm">{{ i.status }}</UBadge>
                <span v-if="i.attempts > 1" class="text-xs text-muted">{{ fillTemplate(t.attemptsLabel, { n: i.attempts }) }}</span>
              </div>
              <div class="text-xs text-muted mt-0.5">
                <NuxtLink :to="localePath(`/admin/users/${i.account.id}`)" class="hover:text-primary">{{ i.account.email }}</NuxtLink>
                · {{ t.sentPrefix }} {{ fmt(i.sentAt) }}
                <span v-if="i.acceptedAt"> · {{ t.acceptedPrefix }} {{ fmt(i.acceptedAt) }}</span>
              </div>
              <p v-if="i.lastError" class="text-xs text-error mt-1 font-mono truncate">{{ i.lastError }}</p>
            </div>
            <UButton
              v-if="i.status === 'FAILED' || i.status === 'PENDING'"
              size="xs" variant="soft" icon="i-lucide-refresh-cw"
              :loading="retrying === i.id"
              @click="retry(i.id)"
            >{{ t.retry }}</UButton>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const t = computed(() => chrome.value.admin.auditPage);
useHead({ title: () => chrome.value.admin.auditPage.docTitle });
const { data: logs, refresh, status } = await useFetch('/api/portal/admin/audit', {
    default: () => []
});
function fmt(d) { return new Date(d).toLocaleString(); }
function actorName(l) {
    if (!l.actor)
        return 'system';
    return `${l.actor.firstName || ''} ${l.actor.lastName || ''}`.trim() || l.actor.email;
}
const actionColor = {
    'license.issued.manual': 'success',
    'license.issued.via.webhook': 'success',
    'license.rotated': 'warning',
    'license.updated': 'primary',
    'activation.reset': 'warning',
    'account.updated': 'primary'
};
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <header class="flex items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold">{{ t.title }}</h1>
        <p class="text-muted text-sm mt-1">{{ t.subtitle }}</p>
      </div>
      <UButton size="sm" variant="ghost" icon="i-lucide-refresh-cw" :loading="status === 'pending'" @click="refresh">{{ t.refresh }}</UButton>
    </header>

    <UCard class="!shadow-none">
      <div v-if="!logs.length" class="text-center py-10 text-muted">
        <UIcon name="i-lucide-list" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.empty }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <div v-for="l in logs" :key="l.id" class="px-4 py-3">
          <div class="flex items-center gap-3 text-sm">
            <UBadge :color="actionColor[l.action] || 'neutral'" variant="soft">{{ l.action }}</UBadge>
            <span class="text-muted">{{ t.byActor }}</span>
            <span class="font-medium">{{ actorName(l) }}</span>
            <span class="ms-auto text-xs text-muted">{{ fmt(l.createdAt) }}</span>
          </div>
          <div v-if="l.targetType" class="text-xs text-muted mt-1">
            {{ t.targetLabel }} {{ l.targetType }} · <span class="font-mono">{{ l.targetId }}</span>
          </div>
          <pre v-if="l.metadata" class="mt-2 text-xs bg-elevated rounded p-2 overflow-x-auto"><code>{{ JSON.stringify(l.metadata, null, 2) }}</code></pre>
        </div>
      </div>
    </UCard>
  </div>
</template>

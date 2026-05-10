<script setup>
import { fillTemplate } from '~/composables/useChromeCopy';
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const t = computed(() => chrome.value.admin.licensesNewPage);
useHead({ title: () => chrome.value.admin.licensesNewPage.docTitle });
const toast = useToast();
const localePath = useLocalePath();
const { data: plans } = await useFetch('/api/portal/admin/plans', { default: () => [] });
const search = ref('');
const searchDebounced = ref('');
let searchTimer = null;
watch(search, (v) => {
    if (searchTimer)
        clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { searchDebounced.value = v; }, 200);
});
const { data: candidates, status: searchStatus, refresh: refreshCandidates } = await useFetch('/api/portal/admin/users', {
    query: computed(() => ({ q: searchDebounced.value || undefined, limit: 10 })),
    default: () => [],
    immediate: false
});
watch(searchDebounced, (v) => {
    if (v && v.trim().length >= 2)
        refreshCandidates();
});
const selectedCustomer = ref(null);
const planId = ref('');
const maxActivations = ref(undefined);
const expiresAt = ref('');
const notes = ref('');
watch(plans, (p) => {
    if (p.length && !planId.value)
        planId.value = p[0].id;
}, { immediate: true });
const selectedPlan = computed(() => plans.value?.find(p => p.id === planId.value) || null);
const issuing = ref(false);
const issuedKey = ref(null);
async function issue() {
    if (!selectedCustomer.value || !planId.value)
        return;
    issuing.value = true;
    try {
        const res = await $fetch('/api/portal/admin/licenses', {
            method: 'POST',
            body: {
                accountId: selectedCustomer.value.id,
                planId: planId.value,
                maxActivations: maxActivations.value,
                expiresAt: expiresAt.value ? new Date(expiresAt.value).toISOString() : null,
                notes: notes.value || null
            }
        });
        issuedKey.value = res.key;
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
function done() {
    const keyPrefix = issuedKey.value?.slice(0, 8) || '';
    issuedKey.value = null;
    navigateTo(keyPrefix ? `${localePath('/admin/licenses')}?q=${encodeURIComponent(keyPrefix)}` : localePath('/admin/licenses'));
}
function customerName(c) {
    return [c.firstName, c.lastName].filter(Boolean).join(' ') || c.email;
}
const maxActivationsHint = computed(() => selectedPlan.value
    ? fillTemplate(t.value.hintDefaultForPlan, { plan: selectedPlan.value.name, n: selectedPlan.value.defaultActivations })
    : t.value.hintUsePlanDefault);
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <div>
      <NuxtLink :to="localePath('/admin/licenses')" class="text-sm text-muted hover:text-primary inline-flex items-center gap-1.5">
        <UIcon name="i-lucide-chevron-left" class="size-4 rtl:rotate-180" /> {{ t.backToLicenses }}
      </NuxtLink>
      <h1 class="text-2xl font-bold mt-2">{{ t.title }}</h1>
      <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
    </div>

    <UCard v-if="issuedKey" class="!shadow-none border-warning/30 bg-warning/5">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-key-round" class="size-5 text-warning" />
          <h2 class="font-semibold">{{ t.successTitle }}</h2>
        </div>
      </template>
      <p class="text-sm mb-3">{{ t.successDesc }}</p>
      <div class="flex flex-col sm:flex-row gap-2">
        <code class="flex-1 px-3 py-2 rounded bg-elevated font-mono text-sm select-all break-all">{{ issuedKey }}</code>
        <UButton icon="i-lucide-copy" @click="copyKey">{{ t.copyBtn }}</UButton>
      </div>
      <template #footer>
        <UButton variant="soft" @click="done">{{ t.doneBtn }}</UButton>
      </template>
    </UCard>

    <template v-else>
      <UCard class="!shadow-none">
        <template #header>
          <h3 class="font-semibold">{{ t.secCustomer }}</h3>
        </template>

        <div v-if="selectedCustomer" class="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div class="size-10 rounded-full bg-primary/15 text-primary flex items-center justify-center font-semibold">
            {{ (selectedCustomer.firstName?.[0] || selectedCustomer.email[0] || '?').toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="font-medium">{{ customerName(selectedCustomer) }}</p>
            <p class="text-sm text-muted">{{ selectedCustomer.email }}</p>
          </div>
          <UButton size="xs" variant="ghost" icon="i-lucide-x" @click="selectedCustomer = null">{{ t.changeBtn }}</UButton>
        </div>

        <template v-else>
          <UInput v-model="search" :placeholder="t.searchPlaceholder" icon="i-lucide-search" size="lg" autofocus />
          <div v-if="(candidates?.length ?? 0) && search.length >= 2" class="mt-3 divide-y divide-default rounded-lg border border-accented overflow-hidden">
            <button
              v-for="c in candidates" :key="c.id"
              type="button"
              class="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-elevated transition text-start"
              @click="selectedCustomer = c"
            >
              <div class="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                {{ (c.firstName?.[0] || c.email[0] || '?').toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium truncate">{{ customerName(c) }}</p>
                <p class="text-xs text-muted truncate">{{ c.email }}</p>
              </div>
            </button>
          </div>
          <p v-else-if="search.length >= 2 && searchStatus !== 'pending'" class="mt-3 text-sm text-muted">{{ t.noMatches }}</p>
        </template>
      </UCard>

      <UCard v-if="selectedCustomer" class="!shadow-none">
        <template #header>
          <h3 class="font-semibold">{{ t.secDetails }}</h3>
        </template>
        <div class="space-y-4">
          <UFormField :label="t.fieldPlan">
            <USelectMenu v-model="planId" :items="plans.map(p => ({ label: p.name, value: p.id }))" value-key="value" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldMaxActivations" :hint="maxActivationsHint">
            <UInput v-model.number="maxActivations" type="number" min="1" max="100" :placeholder="selectedPlan?.defaultActivations?.toString() || ''" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldExpiresAt" :hint="t.hintExpiresAt">
            <UInput v-model="expiresAt" type="date" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldNotes">
            <UTextarea v-model="notes" :rows="2" :placeholder="t.placeholderNotes" class="w-full" />
          </UFormField>
        </div>
        <template #footer>
          <div class="flex gap-2">
            <UButton :loading="issuing" :disabled="!planId" icon="i-lucide-key-round" @click="issue">{{ t.issueBtn }}</UButton>
            <UButton variant="ghost" :to="localePath('/admin/licenses')">{{ t.cancelBtn }}</UButton>
          </div>
        </template>
      </UCard>
    </template>
  </div>
</template>

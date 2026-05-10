<script setup>
import { fillTemplate } from '~/composables/useChromeCopy';
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const t = computed(() => chrome.value.admin.promoCodesPage);
useHead({ title: () => chrome.value.admin.promoCodesPage.docTitle });
const toast = useToast();
const { data: codes, refresh } = await useFetch('/api/portal/admin/promo-codes', { default: () => [] });
const { data: plans } = await useFetch('/api/portal/admin/plans', { default: () => [] });
// Reka-ui rejects '' as a SelectItem value — use a sentinel for "any plan".
const ANY_PLAN = '__any__';
const planOptions = computed(() => [
    { label: t.value.anyPlan, value: ANY_PLAN },
    ...plans.value.map(p => ({ label: `${p.name} (${p.slug})`, value: p.id }))
]);
const showModal = ref(false);
const editing = ref(null);
const saving = ref(false);
const deleting = ref(null);
const form = reactive(emptyForm());
function emptyForm() {
    return { code: '', discountPercent: 10, planId: ANY_PLAN, maxUses: null, expiresDate: '', isActive: true, notes: '' };
}
function openCreate() {
    editing.value = null;
    Object.assign(form, emptyForm());
    showModal.value = true;
}
function openEdit(c) {
    editing.value = c;
    form.code = c.code;
    form.discountPercent = c.discountPercent;
    form.planId = c.planId ?? ANY_PLAN;
    form.maxUses = c.maxUses;
    form.expiresDate = c.expiresAt ? c.expiresAt.slice(0, 10) : '';
    form.isActive = c.isActive;
    form.notes = c.notes ?? '';
    showModal.value = true;
}
async function save() {
    saving.value = true;
    try {
        const body = {
            ...(editing.value ? {} : { code: form.code.trim().toUpperCase() }),
            discountPercent: Number(form.discountPercent),
            planId: form.planId === ANY_PLAN ? null : form.planId,
            maxUses: form.maxUses ? Number(form.maxUses) : null,
            expiresAt: form.expiresDate ? new Date(form.expiresDate + 'T23:59:59Z').toISOString() : null,
            isActive: form.isActive,
            notes: form.notes || null
        };
        if (editing.value) {
            await $fetch(`/api/portal/admin/promo-codes/${editing.value.id}`, { method: 'PATCH', body });
            toast.add({ title: t.value.toastUpdated, color: 'success' });
        }
        else {
            await $fetch('/api/portal/admin/promo-codes', { method: 'POST', body });
            toast.add({ title: t.value.toastCreated, color: 'success' });
        }
        showModal.value = false;
        await refresh();
    }
    catch (err) {
        toast.add({ title: chrome.value.common.save, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        saving.value = false;
    }
}
// Count of codes that don't have a Lemon Squeezy mirror yet. Until this
// reaches zero, customers entering those codes on the hosted checkout
// get "invalid code" — LS hasn't been told about them.
const unsyncedCount = computed(() => codes.value.filter(c => !c.lsDiscountId).length);
const syncing = ref(false);

async function syncAllToLs() {
    if (!unsyncedCount.value) return;
    syncing.value = true;
    try {
        const res = await $fetch('/api/portal/admin/promo-codes/sync', { method: 'POST' });
        await refresh();
        if (res.failed?.length) {
            toast.add({
                title: `Synced ${res.synced} · ${res.failed.length} failed`,
                description: res.failed.map(f => `${f.code}: ${f.error}`).join(' · ').slice(0, 200),
                color: 'warning',
                duration: 10000
            });
        } else {
            toast.add({
                title: `${res.synced} code${res.synced === 1 ? '' : 's'} synced to Lemon Squeezy`,
                color: 'success'
            });
        }
    } catch (err) {
        toast.add({
            title: 'Sync to Lemon Squeezy failed',
            description: err.statusMessage || err.message,
            color: 'error'
        });
    } finally {
        syncing.value = false;
    }
}

async function toggleActive(c) {
    try {
        await $fetch(`/api/portal/admin/promo-codes/${c.id}`, { method: 'PATCH', body: { isActive: !c.isActive } });
        await refresh();
    }
    catch (err) {
        toast.add({ title: chrome.value.common.update, description: err.statusMessage || err.message, color: 'error' });
    }
}
async function remove(c) {
    if (c.orderCount > 0) {
        toast.add({ title: t.value.toastInUseTitle, description: t.value.toastInUseDesc, color: 'warning' });
        return;
    }
    if (!confirm(fillTemplate(t.value.deleteConfirm, { code: c.code })))
        return;
    deleting.value = c.id;
    try {
        await $fetch(`/api/portal/admin/promo-codes/${c.id}`, { method: 'DELETE' });
        toast.add({ title: t.value.toastDeleted, color: 'success' });
        await refresh();
    }
    catch (err) {
        toast.add({ title: chrome.value.common.delete, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        deleting.value = null;
    }
}
function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString() : '—';
}
function isExpired(c) {
    return c.expiresAt ? new Date(c.expiresAt) < new Date() : false;
}
function pluralize(one, many, n) {
    return fillTemplate(n === 1 ? one : many, { n });
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">{{ t.title }}</h1>
        <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
      </div>
      <div class="flex items-center gap-2">
        <!-- Sync-to-LS button — only shown when at least one code is unsynced.
             New codes auto-sync on save; this exists for seeded/legacy rows. -->
        <UButton
          v-if="unsyncedCount > 0"
          icon="i-lucide-refresh-cw"
          color="secondary"
          variant="soft"
          size="lg"
          :loading="syncing"
          @click="syncAllToLs"
        >Sync {{ unsyncedCount }} to Lemon Squeezy</UButton>
        <UButton icon="i-lucide-plus" size="lg" @click="openCreate">{{ t.newButton }}</UButton>
      </div>
    </header>

    <!-- One-time unsynced banner. Dismisses itself once the count hits zero. -->
    <UAlert
      v-if="unsyncedCount > 0"
      color="warning"
      variant="soft"
      icon="i-lucide-alert-triangle"
      :title="`${unsyncedCount} promo code${unsyncedCount === 1 ? '' : 's'} haven't been pushed to Lemon Squeezy yet`"
      description="Customers entering these codes at checkout will see 'invalid code' until you sync. New codes you create here sync automatically — this notice is for rows created before the mirror feature existed."
    />

    <UCard class="!shadow-none">
      <div v-if="!codes.length" class="text-center py-10 text-muted">
        <UIcon name="i-lucide-ticket-percent" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.emptyState }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <div v-for="c in codes" :key="c.id" class="px-4 py-3 flex items-center gap-3">
          <UIcon name="i-lucide-ticket-percent" class="size-5 text-secondary" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <code class="font-mono font-bold">{{ c.code }}</code>
              <UBadge color="primary" variant="soft" size="sm">{{ c.discountPercent }}{{ t.discountSuffix }}</UBadge>
              <UBadge v-if="c.plan" variant="soft" size="sm">{{ c.plan.slug }}</UBadge>
              <UBadge v-else variant="soft" color="neutral" size="sm">{{ t.anyPlan }}</UBadge>
              <UBadge v-if="!c.isActive" color="error" variant="soft" size="sm">{{ chrome.common.inactive }}</UBadge>
              <UBadge v-else-if="isExpired(c)" color="warning" variant="soft" size="sm">{{ t.expiredBadge }}</UBadge>
              <!-- LS mirror status — only visible when unsynced (green is noise when everything works). -->
              <UBadge v-if="!c.lsDiscountId" color="warning" variant="subtle" size="sm" icon="i-lucide-cloud-off">Not in Lemon Squeezy</UBadge>
            </div>
            <div class="text-xs text-muted mt-0.5">
              <span>{{ t.rowUses }} <strong class="text-default">{{ c.currentUses }}{{ c.maxUses ? ` / ${c.maxUses}` : '' }}</strong></span>
              <span class="mx-2">·</span>
              <span>{{ t.rowExpires }} {{ fmtDate(c.expiresAt) }}</span>
              <span class="mx-2">·</span>
              <span>{{ pluralize(t.rowOrderOne, t.rowOrderMany, c.orderCount) }}</span>
            </div>
            <p v-if="c.notes" class="text-xs text-muted mt-0.5">{{ c.notes }}</p>
          </div>
          <USwitch :model-value="c.isActive" :aria-label="c.isActive ? chrome.common.inactive : chrome.common.active" @update:model-value="toggleActive(c)" />
          <UButton size="sm" variant="ghost" icon="i-lucide-pencil" :aria-label="chrome.common.edit" @click="openEdit(c)" />
          <UButton size="sm" variant="ghost" color="error" icon="i-lucide-trash-2" :aria-label="chrome.common.delete" :loading="deleting === c.id" @click="remove(c)" />
        </div>
      </div>
    </UCard>

    <UModal
      v-model:open="showModal"
      :title="editing ? t.modalEditTitle : t.modalCreateTitle"
      description=" "
      :ui="{ description: 'sr-only', content: 'max-w-2xl' }"
    >
      <template #body>
        <div class="space-y-14">
          <section>
            <h2 class="text-xl font-bold mb-1">{{ t.secCode }}</h2>
            <p class="text-sm text-muted mb-8">{{ t.secCodeDesc }}</p>

            <div class="space-y-5">
              <div class="grid grid-cols-2 gap-5">
                <UFormField :label="t.fieldCode" :hint="t.fieldCodeHint" required>
                  <UInput v-model="form.code" :disabled="!!editing" :placeholder="t.fieldCodePlaceholder" size="lg" class="w-full" />
                </UFormField>
                <UFormField :label="t.fieldDiscount" required>
                  <UInput v-model.number="form.discountPercent" type="number" min="1" max="100" size="lg" class="w-full" />
                </UFormField>
              </div>
              <UFormField :label="t.fieldRestrictPlan">
                <USelect v-model="form.planId" :items="planOptions" value-key="value" size="lg" class="w-full" />
              </UFormField>
            </div>
          </section>

          <USeparator />

          <section>
            <h2 class="text-xl font-bold mb-1">{{ t.secLimits }}</h2>
            <p class="text-sm text-muted mb-8">{{ t.secLimitsDesc }}</p>

            <div class="grid grid-cols-2 gap-5">
              <UFormField :label="t.fieldMaxUses" :hint="t.fieldMaxUsesHint">
                <UInput v-model.number="form.maxUses" type="number" min="1" size="lg" class="w-full" />
              </UFormField>
              <UFormField :label="t.fieldExpires">
                <UInput v-model="form.expiresDate" type="date" size="lg" class="w-full" />
              </UFormField>
            </div>
          </section>

          <USeparator />

          <section>
            <h2 class="text-xl font-bold mb-1">{{ t.secNotes }}</h2>
            <p class="text-sm text-muted mb-8">{{ t.secNotesDesc }}</p>

            <div class="space-y-5">
              <UFormField :label="t.fieldNotes" :hint="t.fieldNotesHint">
                <UTextarea v-model="form.notes" :rows="2" class="w-full" />
              </UFormField>
              <div class="flex items-center justify-between">
                <span class="text-sm">{{ chrome.common.active }}</span>
                <USwitch v-model="form.isActive" size="xl" color="secondary" />
              </div>
            </div>
          </section>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="outline" @click="showModal = false">{{ chrome.common.cancel }}</UButton>
          <UButton :loading="saving" @click="save">{{ editing ? chrome.common.update : chrome.common.create }}</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

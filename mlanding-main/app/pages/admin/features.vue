<script setup>
import { fillTemplate } from '~/composables/useChromeCopy';
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const t = computed(() => chrome.value.admin.featuresPage);
useHead({ title: () => chrome.value.admin.featuresPage.docTitle });
const toast = useToast();
const { data: features, refresh } = await useFetch('/api/portal/admin/features', { default: () => [] });
const showModal = ref(false);
const editing = ref(null);
const saving = ref(false);
const deleting = ref(null);
const form = reactive({ label: '', labelAr: '', notes: '', sortOrder: 0 });
function openCreate() {
    editing.value = null;
    Object.assign(form, { label: '', labelAr: '', notes: '', sortOrder: 0 });
    showModal.value = true;
}
function openEdit(f) {
    editing.value = f;
    form.label = f.label;
    form.labelAr = f.labelAr ?? '';
    form.notes = f.notes ?? '';
    form.sortOrder = f.sortOrder;
    showModal.value = true;
}
async function save() {
    saving.value = true;
    try {
        const body = {
            label: form.label,
            labelAr: form.labelAr || null,
            notes: form.notes || null,
            sortOrder: form.sortOrder
        };
        if (editing.value) {
            await $fetch(`/api/portal/admin/features/${editing.value.id}`, { method: 'PATCH', body });
            toast.add({ title: t.value.toastUpdated, color: 'success' });
        }
        else {
            await $fetch('/api/portal/admin/features', { method: 'POST', body });
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
async function remove(f) {
    const msg = f.planCount > 0
        ? fillTemplate(t.value.deleteConfirmAttached, { label: f.label, n: f.planCount })
        : fillTemplate(t.value.deleteConfirm, { label: f.label });
    if (!confirm(msg))
        return;
    deleting.value = f.id;
    try {
        await $fetch(`/api/portal/admin/features/${f.id}`, { method: 'DELETE' });
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
function pluralize(one, many, n) {
    return fillTemplate(n === 1 ? one : many, { n });
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">{{ t.title }}</h1>
        <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
      </div>
      <UButton icon="i-lucide-plus" size="lg" @click="openCreate">{{ t.newButton }}</UButton>
    </header>

    <UCard class="!shadow-none">
      <div v-if="!features.length" class="text-center py-10 text-muted">
        <UIcon name="i-lucide-list-checks" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.emptyState }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <div v-for="f in features" :key="f.id" class="px-4 py-3 flex items-center gap-3">
          <span class="text-xs text-muted tabular-nums w-8 text-end">{{ f.sortOrder }}</span>
          <div class="flex-1 min-w-0">
            <p class="font-medium">{{ f.label }}</p>
            <p v-if="f.labelAr" class="text-sm text-muted" dir="rtl">{{ f.labelAr }}</p>
            <p v-if="f.notes" class="text-xs text-muted mt-0.5">{{ f.notes }}</p>
          </div>
          <span class="text-xs text-muted shrink-0">{{ pluralize(t.rowPlanOne, t.rowPlanMany, f.planCount) }}</span>
          <UButton size="sm" variant="ghost" icon="i-lucide-pencil" :aria-label="chrome.common.edit" @click="openEdit(f)" />
          <UButton size="sm" variant="ghost" color="error" icon="i-lucide-trash-2" :aria-label="chrome.common.delete" :loading="deleting === f.id" @click="remove(f)" />
        </div>
      </div>
    </UCard>

    <UModal
      v-model:open="showModal"
      :title="editing ? t.modalEditTitle : t.modalCreateTitle"
      description=" "
      :ui="{ description: 'sr-only', content: 'max-w-lg' }"
    >
      <template #body>
        <div class="space-y-5">
          <UFormField :label="t.fieldLabelEn" required>
            <UInput v-model="form.label" :placeholder="t.fieldLabelEnPlaceholder" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldLabelAr">
            <UInput v-model="form.labelAr" dir="rtl" :placeholder="t.fieldLabelArPlaceholder" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldSortOrder" :hint="t.fieldSortOrderHint">
            <UInput v-model.number="form.sortOrder" type="number" min="0" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldNotes" :hint="t.fieldNotesHint">
            <UTextarea v-model="form.notes" :rows="2" class="w-full" />
          </UFormField>
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

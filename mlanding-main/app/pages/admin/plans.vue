<script setup>
import { fillTemplate } from '~/composables/useChromeCopy';
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const t = computed(() => chrome.value.admin.plansPage);
useHead({ title: () => chrome.value.admin.plansPage.docTitle });
const toast = useToast();
const { data: plans, refresh } = await useFetch('/api/portal/admin/plans', { default: () => [] });
const { data: features } = await useFetch('/api/portal/admin/features', { default: () => [] });
const showModal = ref(false);
const editing = ref(null);
const saving = ref(false);
const deleting = ref(null);
const form = reactive(emptyForm());
function emptyForm() {
    return {
        slug: '', name: '', nameAr: '', description: '', descriptionAr: '',
        priceUsd: 0, defaultActivations: 1, lsVariantId: '', sortOrder: 0, isActive: true,
        selectedFeatureIds: []
    };
}
function openCreate() {
    editing.value = null;
    Object.assign(form, emptyForm());
    showModal.value = true;
}
function openEdit(p) {
    editing.value = p;
    form.slug = p.slug;
    form.name = p.name;
    form.nameAr = p.nameAr ?? '';
    form.description = p.description ?? '';
    form.descriptionAr = p.descriptionAr ?? '';
    form.priceUsd = p.priceUsdCents / 100;
    form.defaultActivations = p.defaultActivations;
    form.lsVariantId = p.lsVariantId ?? '';
    form.sortOrder = p.sortOrder;
    form.isActive = p.isActive;
    form.selectedFeatureIds = p.features.map(f => f.id);
    showModal.value = true;
}
function toggleFeature(id) {
    const i = form.selectedFeatureIds.indexOf(id);
    if (i >= 0)
        form.selectedFeatureIds.splice(i, 1);
    else
        form.selectedFeatureIds.push(id);
}
async function save() {
    saving.value = true;
    try {
        const body = {
            ...(editing.value ? {} : { slug: form.slug }),
            name: form.name,
            nameAr: form.nameAr || null,
            description: form.description || null,
            descriptionAr: form.descriptionAr || null,
            priceUsdCents: Math.round(form.priceUsd * 100),
            defaultActivations: form.defaultActivations,
            lsVariantId: form.lsVariantId || null,
            sortOrder: form.sortOrder,
            isActive: form.isActive,
            features: form.selectedFeatureIds.map((id, i) => ({ featureId: id, sortOrder: i }))
        };
        if (editing.value) {
            await $fetch(`/api/portal/admin/plans/${editing.value.id}`, { method: 'PATCH', body });
            toast.add({ title: t.value.toastUpdated, color: 'success' });
        }
        else {
            await $fetch('/api/portal/admin/plans', { method: 'POST', body });
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
async function deletePlan(p) {
    if (p._count.licenses > 0 || p._count.orders > 0) {
        toast.add({ title: t.value.toastInUseTitle, description: t.value.toastInUseDesc, color: 'warning' });
        return;
    }
    if (!confirm(fillTemplate(t.value.deleteConfirm, { name: p.name })))
        return;
    deleting.value = p.id;
    try {
        await $fetch(`/api/portal/admin/plans/${p.id}`, { method: 'DELETE' });
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
function fmtPrice(cents) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
}
function pluralize(tpl, n) {
    return fillTemplate(n === 1 ? tpl.one : tpl.many, { n });
}
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">{{ t.title }}</h1>
        <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
      </div>
      <UButton icon="i-lucide-plus" size="lg" @click="openCreate">{{ t.newButton }}</UButton>
    </header>

    <UCard class="!shadow-none">
      <div v-if="!plans.length" class="text-center py-10 text-muted">
        <UIcon name="i-lucide-package" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.emptyState }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <div v-for="p in plans" :key="p.id" class="px-4 py-3">
          <div class="flex items-center gap-4">
            <UIcon name="i-lucide-package" class="size-5 text-primary" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold">{{ p.name }}</span>
                <span v-if="p.nameAr" class="text-sm text-muted">· {{ p.nameAr }}</span>
                <UBadge variant="soft" size="sm">{{ p.slug }}</UBadge>
                <UBadge v-if="!p.isActive" color="error" variant="soft" size="sm">{{ chrome.common.inactive }}</UBadge>
                <span class="text-sm font-bold tabular-nums ms-auto">{{ fmtPrice(p.priceUsdCents) }}</span>
              </div>
              <div class="text-xs text-muted mt-0.5">
                <span>{{ t.rowDefaultActivations }} <strong class="text-default">{{ p.defaultActivations }}</strong></span>
                <span class="mx-2">·</span>
                <span>{{ pluralize({ one: t.rowLicenseOne, many: t.rowLicenseMany }, p._count.licenses) }}</span>
                <span class="mx-2">·</span>
                <span>{{ pluralize({ one: t.rowOrderOne, many: t.rowOrderMany }, p._count.orders) }}</span>
                <span v-if="p.features.length"><span class="mx-2">·</span>{{ pluralize({ one: t.rowFeatureOne, many: t.rowFeatureMany }, p.features.length) }}</span>
                <span v-if="p.lsVariantId"><span class="mx-2">·</span>{{ t.rowLsVariant }} <code class="text-[10px]">{{ p.lsVariantId }}</code></span>
              </div>
              <p v-if="p.description" class="text-sm text-muted mt-1">{{ p.description }}</p>
              <ul v-if="p.features.length" class="mt-2 flex flex-wrap gap-1.5">
                <li v-for="f in p.features" :key="f.id" class="text-[11px] px-2 py-0.5 rounded-full bg-elevated">{{ f.label }}</li>
              </ul>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <UButton size="sm" variant="ghost" icon="i-lucide-pencil" :aria-label="chrome.common.edit" @click="openEdit(p)" />
              <UButton size="sm" variant="ghost" color="error" icon="i-lucide-trash-2" :aria-label="chrome.common.delete" :loading="deleting === p.id" @click="deletePlan(p)" />
            </div>
          </div>
        </div>
      </div>
    </UCard>

    <UModal
      v-model:open="showModal"
      :title="editing ? t.modalEditTitle : t.modalCreateTitle"
      description=" "
      :ui="{ description: 'sr-only', content: 'max-w-3xl' }"
    >
      <template #body>
        <div class="space-y-14">
          <section>
            <h2 class="text-xl font-bold mb-1">{{ t.secProfile }}</h2>
            <p class="text-sm text-muted mb-8">{{ t.secProfileDesc }}</p>

            <div class="space-y-5">
              <div class="grid grid-cols-2 gap-5">
                <UFormField :label="t.fieldSlug" :hint="t.fieldSlugHint" required>
                  <UInput v-model="form.slug" :disabled="!!editing" :placeholder="t.fieldSlugPlaceholder" size="lg" class="w-full" />
                </UFormField>
                <UFormField :label="t.fieldSortOrder">
                  <UInput v-model.number="form.sortOrder" type="number" min="0" size="lg" class="w-full" />
                </UFormField>
              </div>
              <div class="grid grid-cols-2 gap-5">
                <UFormField :label="t.fieldNameEn" required>
                  <UInput v-model="form.name" size="lg" class="w-full" />
                </UFormField>
                <UFormField :label="t.fieldNameAr">
                  <UInput v-model="form.nameAr" dir="rtl" size="lg" class="w-full" />
                </UFormField>
              </div>
              <div class="grid grid-cols-2 gap-5">
                <UFormField :label="t.fieldDescEn">
                  <UTextarea v-model="form.description" :rows="2" class="w-full" />
                </UFormField>
                <UFormField :label="t.fieldDescAr">
                  <UTextarea v-model="form.descriptionAr" :rows="2" dir="rtl" class="w-full" />
                </UFormField>
              </div>
            </div>
          </section>

          <USeparator />

          <section>
            <h2 class="text-xl font-bold mb-1">{{ t.secPricing }}</h2>
            <p class="text-sm text-muted mb-8">{{ t.secPricingDesc }}</p>

            <div class="space-y-5">
              <div class="grid grid-cols-2 gap-5">
                <UFormField :label="t.fieldPrice" required>
                  <UInput v-model.number="form.priceUsd" type="number" min="0" step="1" size="lg" class="w-full" />
                </UFormField>
                <UFormField :label="t.fieldDefaultActivations" required>
                  <UInput v-model.number="form.defaultActivations" type="number" min="1" max="100" size="lg" class="w-full" />
                </UFormField>
              </div>
              <UFormField :label="t.fieldLsVariant">
                <UInput v-model="form.lsVariantId" :placeholder="t.fieldLsVariantPlaceholder" size="lg" class="w-full" />
              </UFormField>
            </div>
          </section>

          <USeparator />

          <section>
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-xl font-bold">{{ t.secFeatures }}</h2>
              <span class="text-xs text-muted">{{ fillTemplate(t.secFeaturesSelected, { n: form.selectedFeatureIds.length }) }}</span>
            </div>
            <p class="text-sm text-muted mb-8">{{ t.secFeaturesDesc }}</p>

            <div v-if="!features.length" class="text-sm text-muted italic">{{ t.noFeaturesDefined }}</div>
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-72 overflow-y-auto rounded-lg border border-accented p-2">
              <label v-for="f in features" :key="f.id" class="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-elevated cursor-pointer">
                <UCheckbox :model-value="form.selectedFeatureIds.includes(f.id)" @update:model-value="toggleFeature(f.id)" />
                <div class="flex-1 min-w-0 text-sm">
                  <p class="truncate">{{ f.label }}</p>
                  <p v-if="f.labelAr" class="text-xs text-muted truncate" dir="rtl">{{ f.labelAr }}</p>
                </div>
              </label>
            </div>
          </section>

          <USeparator />

          <section>
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-bold">{{ chrome.common.active }}</h2>
                <p class="text-sm text-muted mt-1">{{ t.secActiveDesc }}</p>
              </div>
              <USwitch v-model="form.isActive" size="xl" color="secondary" />
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

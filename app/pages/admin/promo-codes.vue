<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `Promo Codes · ${t('nav.admin')} · ${t('app.title')}` })

const { data, refresh } = await useFetch('/api/admin/promo-codes', { default: () => ({ codes: [] }) })
const { data: coursesData } = await useFetch('/api/admin/courses')

const toast = useToast()
const showModal = ref(false)
const editing = ref<any>(null)
const saving = ref(false)
const deleting = ref<number | null>(null)
const syncing = ref(false)

const ANY_COURSE = '__any__'

const courseOptions = computed(() => [
  { label: 'Any course', value: ANY_COURSE },
  ...(coursesData.value?.courses?.map((c: any) => ({ label: c.name, value: String(c.id) })) ?? [])
])

const form = reactive({
  code: '',
  discountPercent: 10,
  courseId: ANY_COURSE,
  maxUses: null as number | null,
  expiresDate: '',
  isActive: true,
  description: ''
})

function resetForm() {
  form.code = ''
  form.discountPercent = 10
  form.courseId = ANY_COURSE
  form.maxUses = null
  form.expiresDate = ''
  form.isActive = true
  form.description = ''
}

function openCreate() {
  editing.value = null
  resetForm()
  showModal.value = true
}

function openEdit(c: any) {
  editing.value = c
  form.code = c.code
  form.discountPercent = c.discountPercent
  form.courseId = c.courseId ? String(c.courseId) : ANY_COURSE
  form.maxUses = c.maxUses
  form.expiresDate = c.expiresAt ? c.expiresAt.slice(0, 10) : ''
  form.isActive = c.isActive
  form.description = c.description ?? ''
  showModal.value = true
}

const save = useThrottleFn(async () => {
  saving.value = true
  try {
    const body = {
      ...(editing.value ? {} : { code: form.code.trim().toUpperCase() }),
      discountPercent: Number(form.discountPercent),
      courseId: form.courseId === ANY_COURSE ? null : Number(form.courseId),
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresDate ? new Date(form.expiresDate + 'T23:59:59Z').toISOString() : null,
      isActive: form.isActive,
      description: form.description || null
    }
    if (editing.value) {
      await $fetch(`/api/admin/promo-codes/${editing.value.id}`, { method: 'PATCH', body })
      toast.add({ title: 'Promo code updated', color: 'success' })
    } else {
      await $fetch('/api/admin/promo-codes', { method: 'POST', body })
      toast.add({ title: 'Promo code created', color: 'success' })
    }
    showModal.value = false
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Save failed', description: err.statusMessage || err.message, color: 'error' })
  } finally {
    saving.value = false
  }
}, 1000)

async function toggleActive(c: any) {
  try {
    await $fetch(`/api/admin/promo-codes/${c.id}`, { method: 'PATCH', body: { isActive: !c.isActive } })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Update failed', description: err.statusMessage || err.message, color: 'error' })
  }
}

async function remove(c: any) {
  if (c.orderCount > 0) {
    toast.add({ title: 'In use', description: 'Cannot delete a promo code that has been used.', color: 'warning' })
    return
  }
  if (!confirm(`Delete promo code "${c.code}"?`)) return
  deleting.value = c.id
  try {
    await $fetch(`/api/admin/promo-codes/${c.id}`, { method: 'DELETE' })
    toast.add({ title: 'Promo code deleted', color: 'success' })
    await refresh()
  } catch (err: any) {
    toast.add({ title: 'Delete failed', description: err.statusMessage || err.message, color: 'error' })
  } finally {
    deleting.value = null
  }
}

const unsyncedCount = computed(() => data.value?.codes?.filter((c: any) => !c.lsDiscountId).length ?? 0)

async function syncAllToLs() {
  if (!unsyncedCount.value) return
  syncing.value = true
  try {
    const res = await $fetch('/api/admin/promo-codes/sync', { method: 'POST' })
    await refresh()
    if (res.failed?.length) {
      toast.add({
        title: `Synced ${res.synced} · ${res.failed.length} failed`,
        description: res.failed.map((f: any) => `${f.code}: ${f.error}`).join(' · ').slice(0, 200),
        color: 'warning',
        duration: 10000
      })
    } else {
      toast.add({ title: `${res.synced} code${res.synced === 1 ? '' : 's'} synced to Lemon Squeezy`, color: 'success' })
    }
  } catch (err: any) {
    toast.add({ title: 'Sync failed', description: err.statusMessage || err.message, color: 'error' })
  } finally {
    syncing.value = false
  }
}

function fmtDate(d: string | null) {
  return d ? new Date(d).toLocaleDateString() : '—'
}

function isExpired(c: any) {
  return c.expiresAt ? new Date(c.expiresAt) < new Date() : false
}
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <div class="flex items-start justify-between gap-3">
        <p class="text-sm text-muted-foreground">Manage discount codes synced with Lemon Squeezy</p>
        <div class="flex items-center gap-2">
          <UButton
            v-if="unsyncedCount > 0"
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="soft"
            :loading="syncing"
            @click="syncAllToLs"
          >
            Sync {{ unsyncedCount }} to LS
          </UButton>
          <UButton icon="i-lucide-plus" @click="openCreate">
            New Promo Code
          </UButton>
        </div>
      </div>

      <UAlert
        v-if="unsyncedCount > 0"
        color="warning"
        variant="soft"
        icon="i-lucide-alert-triangle"
        :title="`${unsyncedCount} promo code${unsyncedCount === 1 ? '' : 's'} haven't been pushed to Lemon Squeezy yet`"
        description="Customers entering these codes at checkout will see 'invalid code' until you sync. New codes sync automatically."
        class="mb-4"
      />

      <UCard>
        <div v-if="!data?.codes?.length" class="text-center py-10 text-muted-foreground">
          <UIcon name="i-lucide-ticket-percent" class="size-8 mx-auto opacity-40" />
          <p class="mt-3 text-sm">No promo codes yet</p>
        </div>
        <div v-else class="divide-y">
          <div v-for="c in data.codes" :key="c.id" class="py-3 flex items-center gap-3">
            <UIcon name="i-lucide-ticket-percent" class="size-5 text-primary shrink-0" />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <code class="font-mono font-bold">{{ c.code }}</code>
                <UBadge color="primary" variant="soft" size="sm">{{ c.discountPercent }}% off</UBadge>
                <UBadge v-if="c.course" variant="soft" size="sm">{{ c.course.name }}</UBadge>
                <UBadge v-else variant="soft" color="neutral" size="sm">Any course</UBadge>
                <UBadge v-if="!c.isActive" color="error" variant="soft" size="sm">Inactive</UBadge>
                <UBadge v-else-if="isExpired(c)" color="warning" variant="soft" size="sm">Expired</UBadge>
                <UBadge v-if="!c.lsDiscountId" color="warning" variant="subtle" size="sm" icon="i-lucide-cloud-off">Not in LS</UBadge>
              </div>
              <div class="text-xs text-muted-foreground mt-0.5">
                <span>Uses <strong class="text-foreground">{{ c.usedCount }}{{ c.maxUses ? ` / ${c.maxUses}` : '' }}</strong></span>
                <span class="mx-2">·</span>
                <span>Expires {{ fmtDate(c.expiresAt) }}</span>
                <span class="mx-2">·</span>
                <span>{{ c.orderCount }} enrollment{{ c.orderCount === 1 ? '' : 's' }}</span>
              </div>
              <p v-if="c.description" class="text-xs text-muted-foreground mt-0.5">{{ c.description }}</p>
            </div>
            <USwitch :model-value="c.isActive" @update:model-value="toggleActive(c)" />
            <UButton size="sm" variant="ghost" icon="i-lucide-pencil" @click="openEdit(c)" />
            <UButton size="sm" variant="ghost" color="error" icon="i-lucide-trash-2" :loading="deleting === c.id" @click="remove(c)" />
          </div>
        </div>
      </UCard>
    </div>

    <UModal v-model:open="showModal" :title="editing ? 'Edit Promo Code' : 'New Promo Code'">
      <template #body>
        <div class="space-y-4">
          <UFormField label="Code" help="Uppercase, digits, dashes" required>
            <UInput v-model="form.code" :disabled="!!editing" placeholder="WELCOME10" class="w-full" size="xl" />
          </UFormField>
          <UFormField label="Discount %" required>
            <UInput v-model.number="form.discountPercent" type="number" min="1" max="100" class="w-full" size="xl" />
          </UFormField>
          <UFormField label="Restrict to course">
            <USelect v-model="form.courseId" :items="courseOptions" value-key="value" class="w-full" size="xl" />
          </UFormField>
          <UFormField label="Max uses" help="Leave empty for unlimited">
            <UInput v-model.number="form.maxUses" type="number" min="1" class="w-full" size="xl" />
          </UFormField>
          <UFormField label="Expires">
            <UInput v-model="form.expiresDate" type="date" class="w-full" size="xl" />
          </UFormField>
          <UFormField label="Description">
            <UTextarea v-model="form.description" :rows="2" class="w-full" size="xl" />
          </UFormField>
          <div class="flex items-center justify-between">
            <span class="text-sm">Active</span>
            <USwitch v-model="form.isActive" />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2 w-full">
          <UButton color="neutral" variant="outline" @click="showModal = false">Cancel</UButton>
          <UButton :loading="saving" @click="save" size="xl">{{ editing ? 'Update' : 'Create' }}</UButton>
        </div>
      </template>
    </UModal>
  </UContainer>
</template>

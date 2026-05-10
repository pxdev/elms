<script setup>
import { fillTemplate } from '~/composables/useChromeCopy'

definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' })

const chrome = useChromeCopy()
const t = computed(() => chrome.value.admin.backupPage)
useHead({ title: () => chrome.value.admin.backupPage.docTitle })

const toast = useToast()

// ── Export ──
const exporting = ref(false)
async function downloadBackup() {
  exporting.value = true
  try {
    // Use plain fetch so the browser respects the Content-Disposition header.
    const res = await fetch('/api/portal/admin/backup/export', { credentials: 'same-origin' })
    if (!res.ok) throw new Error(res.statusText || `HTTP ${res.status}`)
    const blob = await res.blob()
    // Filename comes from Content-Disposition; fall back to a sensible default.
    const cd = res.headers.get('content-disposition') || ''
    const match = cd.match(/filename="?([^"]+)"?/)
    const filename = match ? match[1] : `momentfy-portal-${Date.now()}.json`
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  } catch (err) {
    toast.add({ title: t.value.toastExportFailed, description: err.message, color: 'error' })
  } finally {
    exporting.value = false
  }
}

// ── Import ──
const fileInput = ref(null)
const selectedFile = ref(null)
const parsedPayload = ref(null)
const previewError = ref('')
const mode = ref('merge')
const replaceConfirm = ref('')
const importing = ref(false)

function onFilePicked(e) {
  parsedPayload.value = null
  previewError.value = ''
  const file = e.target.files?.[0] || null
  selectedFile.value = file
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const text = String(reader.result || '')
      const json = JSON.parse(text)
      if (!json || typeof json !== 'object' || !json.data || typeof json.schemaVersion !== 'number') {
        throw new Error('Not a valid Momentfy backup file')
      }
      parsedPayload.value = json
    } catch (err) {
      previewError.value = err.message
    }
  }
  reader.onerror = () => { previewError.value = 'Could not read file' }
  reader.readAsText(file)
}

const previewSummary = computed(() => {
  if (!parsedPayload.value?.counts) return ''
  const counts = parsedPayload.value.counts
  const entities = Object.keys(counts).length
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  return fillTemplate(t.value.importPreviewSummary, { n: entities, total })
})

const canImport = computed(() => {
  if (!parsedPayload.value) return false
  if (mode.value === 'replace' && replaceConfirm.value !== 'REPLACE') return false
  return true
})

async function runImport() {
  if (!parsedPayload.value) {
    toast.add({ title: t.value.noFile, color: 'warning' })
    return
  }
  importing.value = true
  try {
    const body = {
      mode: mode.value,
      payload: parsedPayload.value,
      ...(mode.value === 'replace' ? { confirm: 'REPLACE' } : {})
    }
    const r = await $fetch('/api/portal/admin/backup/import', { method: 'POST', body })
    toast.add({
      title: t.value.toastImported,
      description: `${Object.values(r.counts.created).reduce((a, b) => a + b, 0)} created · ${Object.values(r.counts.updated).reduce((a, b) => a + b, 0)} updated`,
      color: 'success',
      duration: 8000
    })
    // Clear after success.
    selectedFile.value = null
    parsedPayload.value = null
    replaceConfirm.value = ''
    if (fileInput.value) fileInput.value.value = ''
  } catch (err) {
    toast.add({ title: t.value.toastImportFailed, description: err.statusMessage || err.message, color: 'error', duration: 10000 })
  } finally {
    importing.value = false
  }
}

const modeOptions = computed(() => [
  { label: t.value.modeMerge, value: 'merge' },
  { label: t.value.modeReplace, value: 'replace' }
])
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <header>
      <h1 class="text-2xl font-bold">{{ t.title }}</h1>
      <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
    </header>

    <!-- Export -->
    <UCard class="!shadow-none">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-download" class="size-5 text-primary" />
          <h2 class="font-semibold">{{ t.exportSection }}</h2>
        </div>
      </template>
      <p class="text-sm text-muted">{{ t.exportDesc }}</p>
      <template #footer>
        <UButton :loading="exporting" icon="i-lucide-download" @click="downloadBackup">
          {{ exporting ? t.exportingHint : t.exportButton }}
        </UButton>
      </template>
    </UCard>

    <!-- Import -->
    <UCard class="!shadow-none">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-upload" class="size-5 text-primary" />
          <h2 class="font-semibold">{{ t.importSection }}</h2>
        </div>
      </template>

      <div class="space-y-5">
        <p class="text-sm text-muted">{{ t.importDesc }}</p>

        <UFormField :label="t.importFile">
          <input
            ref="fileInput"
            type="file"
            accept="application/json,.json"
            class="block w-full text-sm text-default file:me-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:bg-elevated file:text-sm file:font-medium hover:file:bg-elevated/80 cursor-pointer"
            @change="onFilePicked"
          >
        </UFormField>

        <p v-if="previewError" class="text-sm text-error">{{ previewError }}</p>

        <div v-if="parsedPayload" class="rounded-lg border border-accented p-3 text-sm space-y-2">
          <p class="font-medium">{{ t.importPreview }}</p>
          <p class="text-muted">{{ previewSummary }}</p>
          <ul class="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted tabular-nums">
            <li v-for="(count, name) in parsedPayload.counts" :key="name">
              <span class="text-default font-mono">{{ count }}</span> {{ name }}
            </li>
          </ul>
        </div>

        <UFormField :label="t.importMode">
          <USelect v-model="mode" :items="modeOptions" value-key="value" size="lg" class="w-full" />
        </UFormField>

        <UAlert
          v-if="mode === 'replace'"
          color="error"
          variant="soft"
          icon="i-lucide-alert-triangle"
          :title="t.warningTitle"
          :description="t.warningBody"
        />

        <UFormField v-if="mode === 'replace'" :label="t.replaceConfirmHint">
          <UInput v-model="replaceConfirm" :placeholder="t.replaceConfirmPlaceholder" size="lg" class="w-full" />
        </UFormField>
      </div>

      <template #footer>
        <UButton
          :loading="importing"
          :disabled="!canImport"
          :color="mode === 'replace' ? 'error' : 'primary'"
          icon="i-lucide-upload"
          @click="runImport"
        >
          {{ importing ? t.importingHint : t.importButton }}
        </UButton>
      </template>
    </UCard>
  </div>
</template>

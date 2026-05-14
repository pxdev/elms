<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const { t } = useI18n()

const uploading = ref(false)
const error = ref<string | null>(null)
const selectedFile = ref<File | null>(null)

async function uploadFile(file: File) {
  error.value = null
  uploading.value = true

  const formData = new FormData()
  formData.append('file', file)

  try {
    const result = await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    emit('update:modelValue', result.url)
    selectedFile.value = null
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    error.value = e.data?.message ?? e.message ?? 'Upload failed'
    selectedFile.value = null
  } finally {
    uploading.value = false
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  if (!file) {
    emit('update:modelValue', '')
    return
  }
  uploadFile(file)
}

function removeImage() {
  selectedFile.value = null
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="modelValue" class="relative w-fit">
      <img
        :src="modelValue"
        alt="Preview"
        class="w-48 h-32 object-cover rounded-lg border border-accented"
      >
      <UButton
        size="xs"
        color="error"
        variant="solid"
        icon="i-lucide-x"
        class="absolute -top-2 -right-2"
        @click="removeImage"
      />
    </div>

    <UFileUpload
      v-else
      v-model="selectedFile"
      accept="image/*"
      :label="t('fields.imageUrl')"
      :description="t('imageUpload.acceptedFormats')"
      :file-delete="true"
      :preview="true"
      @change="onFileChange"
    />

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-alert-circle"
      :title="error"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const uploading = ref(false)
const error = ref<string | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

async function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

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
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    error.value = e.data?.message ?? e.message ?? 'Upload failed'
  } finally {
    uploading.value = false
    input.value = ''
  }
}

function removeImage() {
  emit('update:modelValue', '')
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="modelValue" class="relative w-fit">
      <img :src="modelValue" alt="Preview" class="w-48 h-32 object-cover rounded-lg border border-accented" />
      <UButton
        size="xs"
        color="error"
        variant="solid"
        icon="i-lucide-x"
        class="absolute -top-2 -right-2"
        @click="removeImage"
      />
    </div>

    <div class="flex items-center gap-3">
      <UButton
        color="primary"
        variant="soft"
        icon="i-lucide-image-plus"
        :loading="uploading"
        :disabled="uploading"
        @click="fileInput?.click()"
      >
        {{ modelValue ? 'Change Image' : 'Upload Image' }}
      </UButton>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onFileChange"
      />
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-alert-circle"
      :title="error"
    />
  </div>
</template>

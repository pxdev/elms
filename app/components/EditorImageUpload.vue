<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const uploading = ref(false)
const inputRef = ref<HTMLInputElement>()

async function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch('/api/upload', { method: 'POST', body: formData })
    const url = (res as any).url
    if (url) {
      const pos = props.getPos()
      props.editor
        .chain()
        .focus()
        .deleteRange({ from: pos, to: pos + props.node.nodeSize })
        .setImage({ src: url })
        .run()
    }
  } catch {
    // upload failed silently
  } finally {
    uploading.value = false
    if (inputRef.value) inputRef.value.value = ''
  }
}
</script>

<template>
  <NodeViewWrapper class="my-4">
    <div
      class="border-2 border-dashed border-muted rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer"
      @click="inputRef?.click()"
    >
      <UIcon name="i-lucide-image-plus" class="size-8" />
      <span class="text-sm font-medium">
        {{ uploading ? 'Uploading...' : 'Click to upload an image' }}
      </span>
      <span v-if="!uploading" class="text-xs">or drag and drop</span>
    </div>
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileChange"
    />
  </NodeViewWrapper>
</template>

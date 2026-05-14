<script setup lang="ts">
interface Tag {
  id?: number
  name: string
}

interface TagSuggestion {
  id: number
  name: string
}

const props = defineProps<{
  modelValue: Tag[]
  suggestions: TagSuggestion[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Tag[]]
}>()

const inputValue = ref('')
const showSuggestions = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const selectedNames = computed(() =>
  new Set(props.modelValue.map((t) => t.name.toLowerCase()))
)

const filteredSuggestions = computed(() => {
  const query = inputValue.value.trim().toLowerCase()
  if (!query) return []
  return props.suggestions.filter(
    (s) =>
      s.name.toLowerCase().includes(query) &&
      !selectedNames.value.has(s.name.toLowerCase())
  )
})

onClickOutside(containerRef, () => {
  showSuggestions.value = false
})

function addTag(name: string) {
  const trimmed = name.trim()
  if (!trimmed) return
  if (selectedNames.value.has(trimmed.toLowerCase())) return

  const existing = props.suggestions.find(
    (s) => s.name.toLowerCase() === trimmed.toLowerCase()
  )

  emit('update:modelValue', [
    ...props.modelValue,
    existing ? { id: existing.id, name: existing.name } : { name: trimmed }
  ])

  inputValue.value = ''
  showSuggestions.value = false
}

function removeTag(tag: Tag) {
  emit(
    'update:modelValue',
    props.modelValue.filter(
      (t) =>
        !(t.name.toLowerCase() === tag.name.toLowerCase() &&
          (t.id === tag.id || (!t.id && !tag.id)))
    )
  )
}

function onInput() {
  showSuggestions.value = true
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    const first = filteredSuggestions.value[0]
    if (first && inputValue.value.trim().toLowerCase() === first.name.toLowerCase()) {
      addTag(first.name)
    } else {
      addTag(inputValue.value)
    }
  } else if (event.key === 'Backspace' && !inputValue.value && props.modelValue.length) {
    emit('update:modelValue', props.modelValue.slice(0, -1))
  } else if (event.key === 'Escape') {
    showSuggestions.value = false
  }
}

function onFocus() {
  if (inputValue.value.trim()) {
    showSuggestions.value = true
  }
}
</script>

<template>
  <div ref="containerRef" class="space-y-2">
    <div v-if="modelValue.length" class="flex flex-wrap gap-2">
      <UBadge
        v-for="tag in modelValue"
        :key="tag.id ?? tag.name"
        color="primary"
        variant="soft"
        size="md"
        class="gap-1 pr-1"
      >
        {{ tag.name }}
        <UButton
          size="xs"
          color="neutral"
          variant="ghost"
          icon="i-lucide-x"
          class="p-0.5 h-5 w-5"
          @click="removeTag(tag)"
        />
      </UBadge>
    </div>

    <div class="relative">
      <UInput
        ref="inputRef"
        v-model="inputValue"
        size="xl"
        class="w-full"
        :placeholder="placeholder ?? 'Type and press Enter to add tags'"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
      />

      <div
        v-if="showSuggestions && filteredSuggestions.length"
        class="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-default rounded-lg shadow-lg max-h-48 overflow-auto"
      >
        <div
          v-for="suggestion in filteredSuggestions"
          :key="suggestion.id"
          class="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
          @mousedown.prevent="addTag(suggestion.name)"
        >
          {{ suggestion.name }}
        </div>
      </div>
    </div>
  </div>
</template>

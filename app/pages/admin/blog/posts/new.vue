<script setup lang="ts">
import { createBlogPostSchema } from '~~/shared/schemas'

const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('blog.createPost')} · ${t('app.title')}` })

const state = reactive({
  title: '',
  description: '',
  content: '',
  excerpt: '',
  imageUrl: '',
  published: false,
  categoryId: undefined as number | undefined,
  tagIds: [] as number[]
})

const { data: categoriesData } = await useFetch('/api/admin/blog/categories')
const { data: tagsData } = await useFetch('/api/admin/blog/tags')

const categoryItems = computed(() =>
  (categoriesData.value?.categories ?? []).map((c) => ({
    label: c.name,
    value: c.id
  }))
)

const tagItems = computed(() =>
  (tagsData.value?.tags ?? []).map((t) => ({
    label: t.name,
    value: t.id
  }))
)

const loading = ref(false)
const errorMessage = ref<string | null>(null)

const validate = useZodForm(createBlogPostSchema)
const formatZodErrors = useZodErrorFormatter()

async function onSubmit() {
  errorMessage.value = null
  loading.value = true
  try {
    await $fetch('/api/admin/blog/posts', {
      method: 'POST',
      body: {
        title: state.title,
        description: state.description || undefined,
        content: state.content || undefined,
        excerpt: state.excerpt || undefined,
        imageUrl: state.imageUrl || undefined,
        published: state.published,
        categoryId: state.categoryId,
        tagIds: state.tagIds.length ? state.tagIds : undefined
      }
    })
    await navigateTo('/admin/blog/posts')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      errorMessage.value = formatZodErrors(e.data.issues)
    } else {
      errorMessage.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-8">
    <UCard class="border-accented">
      <template #header>
        <h1 class="text-xl font-semibold">
          {{ t('blog.createPost') }}
        </h1>
      </template>

      <UForm
        :state="state"
        :validate="validate"
        class="space-y-6"
        @submit="onSubmit"
      >
        <UFormField
          :label="t('fields.title')"
          name="title"
          required
        >
          <UInput
            v-model="state.title"
            size="xl"
            class="w-full"
            :placeholder="t('fields.title')"
          />
        </UFormField>

        <UFormField
          :label="t('fields.category')"
          name="categoryId"
        >
          <USelect
            v-model="state.categoryId"
            :items="categoryItems"
            size="xl"
            class="w-full"
            :placeholder="t('fields.category')"
          />
        </UFormField>

        <UFormField
          :label="t('fields.tags')"
          name="tagIds"
        >
          <USelect
            v-model="state.tagIds"
            :items="tagItems"
            multiple
            size="xl"
            class="w-full"
            :placeholder="t('fields.tags')"
          />
        </UFormField>

        <UFormField
          :label="t('fields.imageUrl')"
          name="imageUrl"
        >
          <AppImageUpload v-model="state.imageUrl" />
        </UFormField>

        <UFormField
          :label="t('fields.published')"
          name="published"
        >
          <USwitch v-model="state.published" />
        </UFormField>

        <UFormField
          :label="t('fields.excerpt')"
          name="excerpt"
        >
          <UTextarea
            v-model="state.excerpt"
            size="xl"
            class="w-full"
            :placeholder="t('fields.excerpt')"
            :rows="3"
          />
        </UFormField>

        <UFormField
          :label="t('fields.description')"
          name="description"
        >
          <UEditor
            v-slot="{ editor }"
            v-model="state.description"
            :placeholder="t('fields.description')"
            class="w-full"
          >
            <UEditorToolbar
              :editor="editor"
              :items="[
                [
                  { kind: 'heading', level: 1, icon: 'i-lucide-heading-1' },
                  { kind: 'heading', level: 2, icon: 'i-lucide-heading-2' },
                  { kind: 'heading', level: 3, icon: 'i-lucide-heading-3' }
                ],
                [
                  { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
                  { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' },
                  { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough' },
                  { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline' }
                ],
                [
                  { kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left' },
                  { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center' },
                  { kind: 'textAlign', align: 'right', icon: 'i-lucide-align-right' }
                ],
                [
                  { kind: 'link', icon: 'i-lucide-link' },
                  { kind: 'blockquote', icon: 'i-lucide-quote' }
                ],
                [
                  { kind: 'orderedList', icon: 'i-lucide-list-ordered' },
                  { kind: 'bulletList', icon: 'i-lucide-list' }
                ],
                [
                  { kind: 'codeBlock', icon: 'i-lucide-code-2' },
                  { kind: 'horizontalRule', icon: 'i-lucide-minus' }
                ],
                [
                  { kind: 'undo', icon: 'i-lucide-undo-2' },
                  { kind: 'redo', icon: 'i-lucide-redo-2' },
                  { kind: 'clearFormatting', icon: 'i-lucide-eraser' }
                ]
              ]"
            />
          </UEditor>
        </UFormField>

        <UFormField
          :label="t('fields.content')"
          name="content"
        >
          <UEditor
            v-slot="{ editor }"
            v-model="state.content"
            :placeholder="t('fields.content')"
            class="w-full"
          >
            <UEditorToolbar
              :editor="editor"
              :items="[
                [
                  { kind: 'heading', level: 1, icon: 'i-lucide-heading-1' },
                  { kind: 'heading', level: 2, icon: 'i-lucide-heading-2' },
                  { kind: 'heading', level: 3, icon: 'i-lucide-heading-3' }
                ],
                [
                  { kind: 'mark', mark: 'bold', icon: 'i-lucide-bold' },
                  { kind: 'mark', mark: 'italic', icon: 'i-lucide-italic' },
                  { kind: 'mark', mark: 'strike', icon: 'i-lucide-strikethrough' },
                  { kind: 'mark', mark: 'underline', icon: 'i-lucide-underline' }
                ],
                [
                  { kind: 'textAlign', align: 'left', icon: 'i-lucide-align-left' },
                  { kind: 'textAlign', align: 'center', icon: 'i-lucide-align-center' },
                  { kind: 'textAlign', align: 'right', icon: 'i-lucide-align-right' }
                ],
                [
                  { kind: 'link', icon: 'i-lucide-link' },
                  { kind: 'blockquote', icon: 'i-lucide-quote' }
                ],
                [
                  { kind: 'orderedList', icon: 'i-lucide-list-ordered' },
                  { kind: 'bulletList', icon: 'i-lucide-list' }
                ],
                [
                  { kind: 'codeBlock', icon: 'i-lucide-code-2' },
                  { kind: 'horizontalRule', icon: 'i-lucide-minus' }
                ],
                [
                  { kind: 'undo', icon: 'i-lucide-undo-2' },
                  { kind: 'redo', icon: 'i-lucide-redo-2' },
                  { kind: 'clearFormatting', icon: 'i-lucide-eraser' }
                ]
              ]"
            />
          </UEditor>
        </UFormField>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          icon="i-lucide-alert-circle"
          :title="errorMessage"
        />

        <div class="flex gap-2">
          <UButton
            type="submit"
            color="primary"
            size="xl"
            :loading="loading"
            :disabled="loading"
          >
            {{ t('common.save') }}
          </UButton>
          <UButton
            to="/admin/blog/posts"
            variant="ghost"
            color="neutral"
            size="xl"
          >
            {{ t('common.cancel') }}
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>

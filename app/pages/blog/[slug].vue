<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const slug = route.params.slug as string

const { data, error } = await useFetch(`/api/blog/posts/${slug}`)

const post = computed(() => data.value?.post)

if (error.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found' })
}

useSeoMeta({
  title: computed(() => post.value ? `${post.value.title} · ${t('blog.title')} · ${t('app.title')}` : t('blog.title')),
  description: computed(() => post.value?.excerpt ?? '')
})

function formatDate(date: string | Date | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <UContainer class="py-12 max-w-4xl">
    <div v-if="post" class="space-y-8">
      <UButton
        to="/blog"
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
        size="sm"
      >
        {{ t('blog.backToBlog') }}
      </UButton>

      <div class="space-y-4">
        <div class="flex items-center gap-2 flex-wrap">
          <UBadge
            v-if="post.category"
            color="primary"
            variant="subtle"
            size="sm"
          >
            {{ post.category.name }}
          </UBadge>
          <UBadge
            v-for="pt in post.tags"
            :key="pt.tag.id"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ pt.tag.name }}
          </UBadge>
        </div>

        <h1 class="text-3xl md:text-4xl font-bold leading-tight">
          {{ post.title }}
        </h1>

        <div class="flex items-center gap-3 text-muted-foreground">
          <UAvatar
            :src="post.author?.avatarUrl || undefined"
            :alt="post.author?.name || ''"
            size="sm"
          />
          <span class="font-medium">{{ post.author?.name || post.author?.email }}</span>
          <span v-if="post.publishedAt">·</span>
          <span v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</span>
        </div>
      </div>

      <div
        v-if="post.imageUrl"
        class="rounded-lg overflow-hidden"
      >
        <img
          :src="post.imageUrl"
          :alt="post.title"
          class="w-full h-auto object-cover max-h-[400px]"
        >
      </div>

      <div
        v-if="post.description"
        class="prose dark:prose-invert max-w-none text-lg text-muted-foreground"
        v-html="post.description"
      />

      <USeparator />

      <div
        v-if="post.content"
        class="prose dark:prose-invert max-w-none"
        v-html="post.content"
      />
    </div>
  </UContainer>
</template>

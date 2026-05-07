<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()

const categorySlug = computed(() => route.query.category as string | undefined)
const tagSlug = computed(() => route.query.tag as string | undefined)

const { data: postsData } = await useFetch('/api/blog/posts', {
  query: computed(() => ({
    category: categorySlug.value,
    tag: tagSlug.value
  }))
})
const { data: categoriesData } = await useFetch('/api/blog/categories')
const { data: tagsData } = await useFetch('/api/blog/tags')

const posts = computed(() => postsData.value?.posts ?? [])
const categories = computed(() => categoriesData.value?.categories ?? [])
const tags = computed(() => tagsData.value?.tags ?? [])

useSeoMeta({ title: `${t('blog.title')} · ${t('app.title')}` })

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
  <UContainer class="py-12 space-y-8">
    <div class="space-y-4">
      <h1 class="text-3xl font-bold">
        {{ t('blog.title') }}
      </h1>
      <p class="text-muted-foreground">
        {{ t('blog.description') }}
      </p>
    </div>

    <div class="flex flex-wrap gap-2">
      <UButton
        :to="{ path: '/blog' }"
        :variant="!categorySlug && !tagSlug ? 'solid' : 'soft'"
        size="sm"
      >
        {{ t('common.all') }}
      </UButton>
      <UButton
        v-for="cat in categories"
        :key="cat.id"
        :to="{ path: '/blog', query: { category: cat.slug } }"
        :variant="categorySlug === cat.slug ? 'solid' : 'soft'"
        size="sm"
      >
        {{ cat.name }}
      </UButton>
    </div>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-for="tag in tags"
        :key="tag.id"
        :to="{ path: '/blog', query: { tag: tag.slug } }"
        :variant="tagSlug === tag.slug ? 'solid' : 'outline'"
        size="xs"
        color="neutral"
      >
        {{ tag.name }}
      </UButton>
    </div>

    <div
      v-if="posts.length"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <UCard
        v-for="post in posts"
        :key="post.id"
        class="flex flex-col overflow-hidden"
      >
        <div
          v-if="post.imageUrl"
          class="aspect-video -mx-4 -mt-4 mb-4 overflow-hidden"
        >
          <img
            :src="post.imageUrl"
            :alt="post.title"
            class="w-full h-full object-cover"
          >
        </div>

        <div class="space-y-3 flex-1">
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

          <h2 class="font-semibold text-lg leading-tight">
            {{ post.title }}
          </h2>

          <div
            v-if="post.excerpt"
            class="text-sm text-muted-foreground line-clamp-3"
            v-html="post.excerpt"
          />

          <div class="flex items-center gap-2 text-sm text-muted-foreground pt-2">
            <UAvatar
              :src="post.author?.avatarUrl || undefined"
              :alt="post.author?.name || ''"
              size="xs"
            />
            <span>{{ post.author?.name || post.author?.email }}</span>
            <span v-if="post.publishedAt">·</span>
            <span v-if="post.publishedAt">{{ formatDate(post.publishedAt) }}</span>
          </div>
        </div>

        <template #footer>
          <UButton
            :to="`/blog/${post.slug}`"
            block
            color="primary"
          >
            {{ t('blog.readMore') }}
          </UButton>
        </template>
      </UCard>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      icon="i-lucide-newspaper"
      :title="t('blog.noPosts')"
    />
  </UContainer>
</template>

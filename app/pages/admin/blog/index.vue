<script setup lang="ts">
const { t } = useI18n()

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('blog.title')} · ${t('nav.admin')} · ${t('app.title')}` })

const { data: postsData } = await useFetch('/api/admin/blog/posts')
const { data: categoriesData } = await useFetch('/api/admin/blog/categories')
const { data: tagsData } = await useFetch('/api/admin/blog/tags')

const posts = computed(() => postsData.value?.posts ?? [])
const categories = computed(() => categoriesData.value?.categories ?? [])
const tags = computed(() => tagsData.value?.tags ?? [])

const publishedCount = computed(() => posts.value.filter(p => p.published).length)
const draftCount = computed(() => posts.value.filter(p => !p.published).length)
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <UButton
          to="/admin/blog/posts/new"
          color="primary"
          icon="i-lucide-plus"
        >
          {{ t('blog.createPost') }}
        </UButton>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <UCard>
          <div class="text-3xl font-bold">{{ posts.length }}</div>
          <div class="text-sm text-muted-foreground">{{ t('fields.posts') }}</div>
        </UCard>
        <UCard>
          <div class="text-3xl font-bold text-success">{{ publishedCount }}</div>
          <div class="text-sm text-muted-foreground">{{ t('blog.published') }}</div>
        </UCard>
        <UCard>
          <div class="text-3xl font-bold">{{ categories.length }}</div>
          <div class="text-sm text-muted-foreground">{{ t('fields.categories') }}</div>
        </UCard>
        <UCard>
          <div class="text-3xl font-bold">{{ tags.length }}</div>
          <div class="text-sm text-muted-foreground">{{ t('fields.tags') }}</div>
        </UCard>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UButton
          to="/admin/blog/posts"
          variant="soft"
          color="primary"
          class="h-auto py-4 justify-start"
          icon="i-lucide-newspaper"
        >
          <div class="text-left">
            <div class="font-semibold">{{ t('blog.posts') }}</div>
            <div class="text-xs text-muted-foreground">{{ t('blog.managePosts') }}</div>
          </div>
        </UButton>

        <UButton
          to="/admin/blog/categories"
          variant="soft"
          color="primary"
          class="h-auto py-4 justify-start"
          icon="i-lucide-folder-open"
        >
          <div class="text-left">
            <div class="font-semibold">{{ t('blog.categories') }}</div>
            <div class="text-xs text-muted-foreground">{{ t('blog.manageCategories') }}</div>
          </div>
        </UButton>

        <UButton
          to="/admin/blog/tags"
          variant="soft"
          color="primary"
          class="h-auto py-4 justify-start"
          icon="i-lucide-tag"
        >
          <div class="text-left">
            <div class="font-semibold">{{ t('blog.tags') }}</div>
            <div class="text-xs text-muted-foreground">{{ t('blog.manageTags') }}</div>
          </div>
        </UButton>
      </div>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">{{ t('blog.recentPosts') }}</h2>
        </template>

        <div v-if="posts.length" class="divide-y">
          <div
            v-for="post in posts.slice(0, 5)"
            :key="post.id"
            class="py-3 flex items-center justify-between"
          >
            <div class="min-w-0">
              <NuxtLink :to="`/admin/blog/posts/${post.id}/edit`" class="font-medium hover:underline truncate block">
                {{ post.title }}
              </NuxtLink>
              <div class="text-sm text-muted-foreground">
                {{ post.author?.name || post.author?.email }} ·
                <UBadge
                  :label="post.published ? t('blog.published') : t('blog.draft')"
                  :color="post.published ? 'success' : 'neutral'"
                  variant="subtle"
                  size="sm"
                  class="ml-1"
                />
              </div>
            </div>
            <UButton
              :to="`/admin/blog/posts/${post.id}/edit`"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-pencil"
            />
          </div>
        </div>

        <div v-else class="text-center py-8 text-muted-foreground">
          {{ t('blog.noPosts') }}
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

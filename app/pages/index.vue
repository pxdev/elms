<script setup lang="ts">
const { t } = useI18n()

const { data: coursesData } = await useFetch('/api/courses')
const { data: postsData } = await useFetch('/api/blog/posts')

const courses = computed(() => (coursesData.value?.courses ?? []).slice(0, 3))
const posts = computed(() => (postsData.value?.posts ?? []).slice(0, 3))

useSeoMeta({ title: t('app.title') })

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
  <div class="space-y-16 pb-16">
    <!-- Hero -->
    <section class="relative bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5">
      <UContainer class="py-20 md:py-28">
        <div class="max-w-2xl space-y-6">
          <h1 class="text-4xl md:text-5xl font-bold leading-tight">
            {{ t('portal.heroTitle') }}
          </h1>
          <p class="text-lg text-muted-foreground">
            {{ t('portal.heroDescription') }}
          </p>
          <div class="flex flex-wrap gap-3">
            <UButton
              to="/courses"
              color="primary"
              size="xl"
            >
              {{ t('portal.browseCourses') }}
            </UButton>
            <UButton
              to="/blog"
              variant="outline"
              color="neutral"
              size="xl"
            >
              {{ t('portal.readBlog') }}
            </UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Courses -->
    <section v-if="courses.length">
      <UContainer class="space-y-8">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h2 class="text-2xl font-bold">
              {{ t('portal.featuredCourses') }}
            </h2>
            <p class="text-muted-foreground">
              {{ t('portal.coursesSubtitle') }}
            </p>
          </div>
          <UButton
            to="/courses"
            variant="ghost"
            color="primary"
            icon="i-lucide-arrow-right"
            trailing
          >
            {{ t('portal.viewAllCourses') }}
          </UButton>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UCard
            v-for="course in courses"
            :key="course.id"
            class="flex flex-col overflow-hidden"
          >
            <div
              v-if="course.imageUrl"
              class="aspect-video -mx-4 -mt-4 mb-4 overflow-hidden"
            >
              <img
                :src="course.imageUrl"
                :alt="course.name"
                class="w-full h-full object-cover"
              >
            </div>

            <div class="space-y-3 flex-1">
              <h3 class="font-semibold text-lg">
                {{ course.name }}
              </h3>
              <p
                v-if="course.description"
                class="text-sm text-muted-foreground line-clamp-2"
              >
                {{ course.description }}
              </p>

              <div
                v-if="course.teacher"
                class="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <UAvatar
                  :src="course.teacher.avatarUrl || undefined"
                  :alt="course.teacher.name || ''"
                  size="xs"
                />
                <span>{{ course.teacher.name ?? course.teacher.email }}</span>
              </div>

              <div class="flex flex-wrap gap-2">
                <UBadge
                  color="primary"
                  variant="subtle"
                  size="sm"
                >
                  {{ course.totalSessions }} {{ t('fields.sessions') }}
                </UBadge>
                <UBadge
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  ${{ course.price }}
                </UBadge>
              </div>
            </div>

            <template #footer>
              <UButton
                :to="`/courses/${course.id}`"
                block
                color="primary"
              >
                {{ t('courses.viewDetails') }}
              </UButton>
            </template>
          </UCard>
        </div>
      </UContainer>
    </section>

    <!-- Blog -->
    <section v-if="posts.length">
      <UContainer class="space-y-8">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h2 class="text-2xl font-bold">
              {{ t('portal.recentPosts') }}
            </h2>
            <p class="text-muted-foreground">
              {{ t('portal.postsSubtitle') }}
            </p>
          </div>
          <UButton
            to="/blog"
            variant="ghost"
            color="primary"
            icon="i-lucide-arrow-right"
            trailing
          >
            {{ t('portal.viewAllPosts') }}
          </UButton>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  v-for="pt in post.tags.slice(0, 2)"
                  :key="pt.tag.id"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  {{ pt.tag.name }}
                </UBadge>
              </div>

              <h3 class="font-semibold text-lg leading-tight">
                {{ post.title }}
              </h3>

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
                variant="soft"
              >
                {{ t('blog.readMore') }}
              </UButton>
            </template>
          </UCard>
        </div>
      </UContainer>
    </section>
  </div>
</template>

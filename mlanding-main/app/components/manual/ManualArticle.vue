<script setup lang="ts">
import type { ModuleArticle } from '~/composables/useManualCopy'

const props = defineProps<{
  moduleId: string
  article: ModuleArticle
}>()

const manual = useManualCopy()
const localePath = useLocalePath()

// Scroll-spy: highlight the chapter whose heading is currently in view.
const activeSection = ref<string>(props.article.chapters[0]?.id || '')
let observer: IntersectionObserver | null = null

function attachObserver() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      if (visible?.target.id) activeSection.value = visible.target.id
    },
    { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
  )
  props.article.chapters.forEach((c) => {
    const el = document.getElementById(c.id)
    if (el) observer!.observe(el)
  })
}

onMounted(attachObserver)
// Re-attach if the module (i.e. the rendered chapters) changes.
watch(() => props.moduleId, () => { nextTick(attachObserver) })
onBeforeUnmount(() => { observer?.disconnect() })

// Prev/next: skip "soon" modules in the ready list.
const readyEntries = computed(() => [
  ...manual.value.modules,
  ...(manual.value.addons || [])
].filter(m => m.status === 'ready'))
const currentIdx = computed(() => readyEntries.value.findIndex(m => m.id === props.moduleId))
const prevModule = computed(() => readyEntries.value[currentIdx.value - 1])
const nextModule = computed(() => readyEntries.value[currentIdx.value + 1])

const iconName = computed(() => props.article.icon || 'i-lucide-book-open')
// One brand gradient across every article — the icon distinguishes the topic,
// not the hue. The per-article `gradient` field in manual.json is intentionally
// ignored to keep the manual unified with the rest of the marketing site.
const gradientClass = 'from-secondary-500 to-secondary-700'
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <nav class="mb-6 text-sm" aria-label="Breadcrumb">
      <NuxtLink
        :to="localePath('/portal/manual')"
        class="inline-flex items-center gap-1.5 text-gray-500 hover:text-primary dark:hover:text-white transition"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4 rtl:rotate-180" />
        {{ manual.nav.backToHome }}
      </NuxtLink>
    </nav>

    <!-- Header -->
    <header class="pb-8 mb-8 border-b border-black/10 dark:border-white/10">
      <p class="text-xs uppercase tracking-[0.25em] text-gray-400">{{ article.eyebrow }}</p>
      <div class="mt-3 flex items-start gap-4">
        <div
          class="shrink-0 size-12 sm:size-14 rounded-2xl text-white flex items-center justify-center shadow-lg bg-gradient-to-br"
          :class="[gradientClass, 'shadow-black/10']"
        >
          <UIcon :name="iconName" class="size-6 sm:size-7" />
        </div>
        <div class="flex-1 min-w-0">
          <h1 class="text-3xl sm:text-5xl font-black tracking-tight">{{ article.title }}</h1>
          <p class="mt-3 max-w-2xl text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {{ article.tagline }}
          </p>
        </div>
      </div>

      <dl class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 max-w-3xl">
        <div class="flex items-baseline gap-3 py-2 border-t border-black/10 dark:border-white/10 sm:border-t-0 sm:pt-0">
          <dt class="text-[11px] uppercase tracking-[0.2em] text-gray-400 w-20 shrink-0">Route</dt>
          <dd class="font-mono text-sm text-gray-700 dark:text-gray-200">{{ article.route }}</dd>
        </div>
        <div class="flex items-baseline gap-3 py-2 border-t border-black/10 dark:border-white/10 sm:border-t-0 sm:pt-0">
          <dt class="text-[11px] uppercase tracking-[0.2em] text-gray-400 w-20 shrink-0">Roles</dt>
          <dd class="text-sm text-gray-700 dark:text-gray-200">{{ article.roles }}</dd>
        </div>
      </dl>
    </header>

    <div class="grid grid-cols-12 gap-8">
      <article class="col-span-12 xl:col-span-9 space-y-16">
        <section
          v-for="ch in article.chapters"
          :id="ch.id"
          :key="ch.id"
          class="scroll-mt-24"
        >
          <div class="flex items-baseline gap-4 mb-4">
            <span class="text-xs tabular-nums text-gray-400 mt-1">{{ ch.num }}</span>
            <h2 class="text-2xl sm:text-3xl font-black tracking-tight">{{ ch.title }}</h2>
          </div>

          <div class="space-y-5 max-w-3xl">
            <template v-for="(block, i) in ch.blocks" :key="i">
              <p
                v-if="block.type === 'para'"
                class="text-base text-gray-700 dark:text-gray-300 leading-relaxed"
              >{{ block.text }}</p>

              <h3
                v-else-if="block.type === 'h3'"
                class="pt-2 text-lg font-bold tracking-tight"
              >{{ block.text }}</h3>

              <ol v-else-if="block.type === 'steps'" class="space-y-3">
                <li
                  v-for="(step, si) in block.items" :key="si"
                  class="flex items-start gap-3"
                >
                  <span class="shrink-0 size-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center tabular-nums mt-0.5">
                    {{ si + 1 }}
                  </span>
                  <span class="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{{ step }}</span>
                </li>
              </ol>

              <ul v-else-if="block.type === 'bullets'" class="space-y-2.5">
                <li
                  v-for="(item, bi) in block.items" :key="bi"
                  class="flex items-start gap-3"
                >
                  <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-1 text-emerald-500" />
                  <span class="text-base text-gray-700 dark:text-gray-300 leading-relaxed">{{ item }}</span>
                </li>
              </ul>

              <div
                v-else-if="block.type === 'tip'"
                class="rounded-xl border border-black/10 dark:border-white/10 bg-sky-50 dark:bg-sky-500/10 p-4 flex items-start gap-3"
              >
                <UIcon name="i-lucide-lightbulb" class="size-5 shrink-0 text-sky-600 dark:text-sky-400 mt-0.5" />
                <div>
                  <p class="text-sm font-bold text-sky-900 dark:text-sky-100">{{ block.title }}</p>
                  <p class="mt-1 text-sm text-sky-900/80 dark:text-sky-100/80 leading-relaxed">{{ block.body }}</p>
                </div>
              </div>

              <div
                v-else-if="block.type === 'warn'"
                class="rounded-xl border border-black/10 dark:border-white/10 bg-amber-50 dark:bg-amber-500/10 p-4 flex items-start gap-3"
              >
                <UIcon name="i-lucide-alert-triangle" class="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <p class="text-sm font-bold text-amber-900 dark:text-amber-100">{{ block.title }}</p>
                  <p class="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80 leading-relaxed">{{ block.body }}</p>
                </div>
              </div>

              <dl
                v-else-if="block.type === 'kv'"
                class="rounded-xl border border-black/10 dark:border-white/10 divide-y divide-black/10 dark:divide-white/10 overflow-hidden"
              >
                <div
                  v-for="row in block.items" :key="row.k"
                  class="grid grid-cols-[10rem_1fr] sm:grid-cols-[12rem_1fr] gap-4 px-4 py-3 items-baseline"
                >
                  <dt class="text-xs uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 font-semibold">{{ row.k }}</dt>
                  <dd class="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{{ row.v }}</dd>
                </div>
              </dl>
            </template>
          </div>
        </section>

        <nav class="pt-8 mt-8 border-t border-black/10 dark:border-white/10 grid grid-cols-2 gap-4">
          <div>
            <NuxtLink
              v-if="prevModule"
              :to="localePath(`/portal/manual/${prevModule.id}`)"
              class="group flex items-center gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 hover:border-primary/40 transition"
            >
              <UIcon name="i-lucide-arrow-left" class="size-4 text-gray-400 group-hover:text-primary transition rtl:rotate-180" />
              <div>
                <p class="text-[11px] uppercase tracking-wider text-gray-400">{{ manual.nav.prev }}</p>
                <p class="mt-0.5 text-sm font-bold">{{ prevModule.label }}</p>
              </div>
            </NuxtLink>
          </div>
          <div class="text-end">
            <NuxtLink
              v-if="nextModule"
              :to="localePath(`/portal/manual/${nextModule.id}`)"
              class="group inline-flex items-center gap-3 p-4 rounded-xl border border-black/10 dark:border-white/10 hover:border-primary/40 transition"
            >
              <div class="text-end">
                <p class="text-[11px] uppercase tracking-wider text-gray-400">{{ manual.nav.next }}</p>
                <p class="mt-0.5 text-sm font-bold">{{ nextModule.label }}</p>
              </div>
              <UIcon name="i-lucide-arrow-right" class="size-4 text-gray-400 group-hover:text-primary transition rtl:rotate-180" />
            </NuxtLink>
          </div>
        </nav>
      </article>

      <aside class="hidden xl:block xl:col-span-3">
        <div class="sticky top-24">
          <p class="text-[11px] uppercase tracking-[0.2em] font-bold text-gray-400 mb-3">
            {{ manual.nav.onThisPage }}
          </p>
          <ul class="space-y-1 border-s border-black/10 dark:border-white/10">
            <li v-for="item in article.toc" :key="item.id">
              <a
                :href="`#${item.id}`"
                class="block -ms-px ps-4 py-1.5 border-s-2 text-sm transition"
                :class="activeSection === item.id
                  ? 'border-primary text-primary dark:text-white font-semibold'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white'"
              >
                {{ item.label }}
              </a>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  </div>
</template>

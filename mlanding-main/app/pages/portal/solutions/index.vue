<script setup>
const localePath = useLocalePath()
definePageMeta({ layout: 'landing' })

const copy = useLandingCopy()
const { locale } = useI18n()

const sp = computed(() => copy.value.solutionsPage)
const details = computed(() => copy.value.solutionDetails)

// Two groups: industries (fields of work) and business shapes (how you run it).
const industryOrder = ['salon', 'dental', 'medical', 'barber', 'fitness', 'pet', 'therapy', 'photo', 'nails', 'events', 'wellness', 'driving', 'education', 'professional', 'auto', 'optical', 'carwash', 'coworking']
const businessOrder = ['multi-tenant', 'mobile', 'memberships']

const industries = computed(() =>
  industryOrder.map(id => ({ id, ...details.value[id] })).filter(s => s.title)
)
const businessShapes = computed(() =>
  businessOrder.map(id => ({ id, ...details.value[id] })).filter(s => s.title)
)

useHead(() => ({
  title: locale.value === 'ar' ? 'الحلول — Momentfy' : 'Solutions — Momentfy',
  meta: [{
    name: 'description',
    content: sp.value.sub
  }]
}))
</script>

<template>
  <!-- ═══ Hero ═══ -->
  <section class="relative py-20 sm:py-28 overflow-hidden">
    <div aria-hidden="true" class="absolute inset-0 -z-10">
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(50rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-secondary-500 blur-[150px] opacity-[0.12] rounded-full" />
    </div>

    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="grid grid-cols-12 gap-6">
        <div class="col-span-12 sm:col-span-4 lg:col-span-3">
          <LandingSectionEyebrow :label="sp.eyebrow" />
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-500 max-w-[18rem]">{{ sp.sub }}</p>

          <!-- Chapter index -->
          <div class="mt-6 space-y-4 text-xs">
            <div>
              <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2">{{ sp.industriesLabel }}</p>
              <div class="space-y-1.5">
                <a v-for="s in industries" :key="s.id" :href="`#${s.id}`"
                  class="group flex items-center gap-2 text-gray-500 hover:text-primary dark:hover:text-white transition-colors"
                >
                  <span class="size-1.5 rounded-full" :class="s.dot" />
                  <span class="uppercase tracking-[0.2em]">{{ s.title }}</span>
                </a>
              </div>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400 mb-2">{{ sp.businessShapesLabel }}</p>
              <div class="space-y-1.5">
                <a v-for="s in businessShapes" :key="s.id" :href="`#${s.id}`"
                  class="group flex items-center gap-2 text-gray-500 hover:text-primary dark:hover:text-white transition-colors"
                >
                  <span class="size-1.5 rounded-full" :class="s.dot" />
                  <span class="uppercase tracking-[0.2em]">{{ s.title }}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div class="col-span-12 sm:col-span-8 lg:col-span-9">
          <h1 class="font-black tracking-tight leading-[0.9] text-4xl sm:text-6xl lg:text-7xl xl:text-8xl break-words">
            <span class="block">{{ sp.h1a }}</span>
            <span class="block italic text-black/20 dark:text-white/20">{{ sp.h1b }}</span>
          </h1>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ Industries group ═══ -->
  <section class="py-12 sm:py-16">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="mb-10 pb-6 border-b border-black/10 dark:border-white/10">
        <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400">—— {{ sp.industriesLabel }}</p>
        <h2 class="mt-3 font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl">{{ sp.industriesLabel }}.</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
        <NuxtLink v-for="(s, si) in industries" :key="s.id" :id="s.id" :to="localePath(`/portal/solutions/${s.id}`)"
          class="group flex flex-col"
        >
          <div class="flex items-center gap-4 mb-4">
            <span class="text-xs tabular-nums text-gray-400 w-6 shrink-0">{{ String(si + 1).padStart(2, '0') }}</span>
            <div class="shrink-0 size-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110 group-hover:-rotate-[6deg]" :class="s.accent">
              <UIcon :name="s.icon" class="size-5" />
            </div>
          </div>
          <h3 class="text-xl sm:text-2xl font-black tracking-tight">
            <span class="relative inline-block">
              {{ s.title }}
              <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-[1.5px] origin-start scale-x-0 group-hover:scale-x-100 transition-transform duration-300" :class="s.dot" />
            </span>
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ s.tagline }}</p>
          <span class="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-primary dark:group-hover:text-white transition-colors">
            {{ copy.ui.exploreVerb }}
            <UIcon name="i-lucide-arrow-right" class="size-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>

  <!-- ═══ Business shapes group ═══ -->
  <section class="py-12 sm:py-16 mt-10 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="mb-10 pb-6 border-b border-black/10 dark:border-white/10">
        <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400">—— {{ sp.businessShapesLabel }}</p>
        <h2 class="mt-3 font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl">{{ sp.businessShapesLabel }}.</h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16">
        <NuxtLink v-for="(s, si) in businessShapes" :key="s.id" :id="s.id" :to="localePath(`/portal/solutions/${s.id}`)"
          class="group flex flex-col"
        >
          <div class="flex items-center gap-4 mb-4">
            <span class="text-xs tabular-nums text-gray-400 w-6 shrink-0">{{ String(si + 1).padStart(2, '0') }}</span>
            <div class="shrink-0 size-12 rounded-xl bg-gradient-to-br text-white flex items-center justify-center shadow-md transition-transform group-hover:scale-110 group-hover:-rotate-[6deg]" :class="s.accent">
              <UIcon :name="s.icon" class="size-5" />
            </div>
          </div>
          <h3 class="text-xl sm:text-2xl font-black tracking-tight">
            <span class="relative inline-block">
              {{ s.title }}
              <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-[1.5px] origin-start scale-x-0 group-hover:scale-x-100 transition-transform duration-300" :class="s.dot" />
            </span>
          </h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ s.tagline }}</p>
          <span class="mt-4 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-hover:text-primary dark:group-hover:text-white transition-colors">
            {{ copy.ui.exploreVerb }}
            <UIcon name="i-lucide-arrow-right" class="size-3.5 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>

  <LandingCTA />
</template>

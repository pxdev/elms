<script setup lang="ts">
const localePath = useLocalePath()
// Unified Platform section — tabbed between core modules and add-ons.
// Core tab: auto-rotating explorer with mocks (preserved from previous design).
// Add-ons tab: category-grouped directory with a sticky chapter rail.
const copy = useLandingCopy()

type ModuleVisual = { icon: string; color: string; check: string }
// Single brand accent per module — icons carry the differentiation.
const BRAND_VISUAL = { color: 'from-secondary-500 to-secondary-700', check: 'text-secondary-500' }
const visuals: Record<string, ModuleVisual> = {
  calendar:   { icon: 'i-lucide-calendar-days', ...BRAND_VISUAL },
  sales:      { icon: 'i-lucide-store',         ...BRAND_VISUAL },
  clients:    { icon: 'i-lucide-users-round',   ...BRAND_VISUAL },
  catalogue:  { icon: 'i-lucide-layers',        ...BRAND_VISUAL },
  inventory:  { icon: 'i-lucide-package',       ...BRAND_VISUAL },
  team:       { icon: 'i-lucide-user-check',    ...BRAND_VISUAL },
  accounting: { icon: 'i-lucide-book-open',     ...BRAND_VISUAL },
  reports:    { icon: 'i-lucide-bar-chart-3',   ...BRAND_VISUAL },
  portal:     { icon: 'i-lucide-smartphone',    ...BRAND_VISUAL }
}

type AddonKey = 'zatca' | 'eta' | 'ai' | 'gcal' | 'insurance' | 'dental' | 'imaging' | 'labs' | 'rx' | 'records' | 'resources' | 'attendance' | 'loyalty' | 'events' | 'followup'
type AddonCat = 'Compliance' | 'Clinical' | 'Intelligence' | 'Operations' | 'Growth'

const addonMeta: Record<AddonKey, { icon: string; cat: AddonCat }> = {
  zatca:      { icon: 'i-lucide-shield-check',    cat: 'Compliance' },
  eta:        { icon: 'i-lucide-file-check',      cat: 'Compliance' },
  ai:         { icon: 'i-lucide-sparkles',        cat: 'Intelligence' },
  gcal:       { icon: 'i-lucide-calendar-check',  cat: 'Intelligence' },
  insurance:  { icon: 'i-lucide-heart-pulse',     cat: 'Clinical' },
  dental:     { icon: 'i-hugeicons-dental-tooth', cat: 'Clinical' },
  imaging:    { icon: 'i-lucide-scan',            cat: 'Clinical' },
  labs:       { icon: 'i-lucide-flask-conical',   cat: 'Clinical' },
  rx:         { icon: 'i-lucide-pill',            cat: 'Clinical' },
  records:    { icon: 'i-lucide-folder-heart',    cat: 'Clinical' },
  resources:  { icon: 'i-lucide-armchair',        cat: 'Operations' },
  attendance: { icon: 'i-lucide-log-in',          cat: 'Operations' },
  loyalty:    { icon: 'i-lucide-award',           cat: 'Growth' },
  events:     { icon: 'i-lucide-calendar-heart',  cat: 'Growth' },
  followup:   { icon: 'i-lucide-list-checks',     cat: 'Growth' }
}

// Compliance is the only category with a distinct hue (emerald = regulatory
// approval, semantic). All other categories adopt the brand blue. Category
// titles distinguish themselves typographically, not chromatically.
const CAT_BRAND   = { accent: 'text-secondary-600 dark:text-secondary-400', iconBg: 'bg-secondary-500/10', iconText: 'text-secondary-600 dark:text-secondary-400', dot: 'bg-secondary-500' }
const CAT_SUCCESS = { accent: 'text-emerald-600 dark:text-emerald-400',     iconBg: 'bg-emerald-500/10',   iconText: 'text-emerald-600 dark:text-emerald-400',     dot: 'bg-emerald-500' }
const catPalette: Record<AddonCat, typeof CAT_BRAND> = {
  Compliance:   CAT_SUCCESS,
  Clinical:     CAT_BRAND,
  Intelligence: CAT_BRAND,
  Operations:   CAT_BRAND,
  Growth:       CAT_BRAND
}

const CAT_ORDER: AddonCat[] = ['Compliance', 'Clinical', 'Intelligence', 'Operations', 'Growth']

const modules = computed(() => copy.value.modules.items)
const activeIndex = ref(0)
const active = computed(() => modules.value[activeIndex.value])
const activeVisual = computed(() => active.value ? visuals[active.value.id] : undefined)

// Pull the first four section headings from the matching feature for the highlight list.
const activeHighlights = computed(() => {
  if (!active.value) return []
  const feature = copy.value.featuresPage.items.find(f => f.id === active.value.id)
  return feature?.sections.slice(0, 4).map(s => s.heading) ?? []
})

// Tabs — 'core' shows the auto-rotating explorer, 'addons' shows the directory
const activeTab = ref<'core' | 'addons'>('core')
const activeCat = ref<string>('all')

const addonCategories = computed(() => {
  return CAT_ORDER.map(cat => ({
    name: cat,
    items: copy.value.addons.items.filter((a: { key: string }) => addonMeta[a.key as AddonKey]?.cat === cat)
  })).filter(c => c.items.length > 0)
})

// Items consumed by LandingChapterNav (filter mode) for the addons tab —
// "All" + one entry per non-empty category, each with count and accent dot.
const addonChipItems = computed(() => [
  {
    id: 'all',
    label: copy.value.featuresPage?.filterAll || 'All',
    count: copy.value.addons.items.length,
    dot: 'bg-gray-400 dark:bg-gray-500'
  },
  ...addonCategories.value.map(cat => ({
    id: cat.name,
    label: copy.value.ui.addonCategoryLabels[cat.name] || cat.name,
    count: cat.items.length,
    dot: catPalette[cat.name].dot
  }))
])

const visibleAddons = computed(() => {
  if (activeCat.value === 'all') {
    return addonCategories.value
  }
  return addonCategories.value.filter(c => c.name === activeCat.value)
})

// Auto-rotate (rAF-driven so the progress bar stays visually in sync).
const DURATION = 6000
const paused = ref(false)
const progress = ref(0)
let rafId: number | null = null
let startedAt: number | null = null

function tick(now: number) {
  if (startedAt === null) startedAt = now
  const elapsed = now - startedAt
  // Pause auto-advance when the addons tab is showing — the explorer is hidden.
  if (!paused.value && activeTab.value === 'core') {
    const p = Math.min(elapsed / DURATION, 1)
    progress.value = p
    if (p >= 1) {
      activeIndex.value = (activeIndex.value + 1) % modules.value.length
      startedAt = now
      progress.value = 0
    }
  } else {
    startedAt = now - progress.value * DURATION
  }
  rafId = requestAnimationFrame(tick)
}

function selectModule(i: number) {
  activeIndex.value = i
  startedAt = null
  progress.value = 0
}

function setTab(t: 'core' | 'addons') {
  activeTab.value = t
  if (t === 'core') {
    startedAt = null
    progress.value = 0
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') rafId = requestAnimationFrame(tick)
})
onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
})

function padIndex(i: number) {
  return String(i + 1).padStart(2, '0')
}
const totalIndex = computed(() => String(modules.value.length).padStart(2, '0'))
</script>

<template>
  <section id="modules" class="relative py-24 sm:py-32 overflow-hidden">
    <!-- Top hairline (same language as other sections) -->
    <div aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10" />

    <div class="relative max-w-7xl mx-auto px-5 sm:px-8">

      <LandingSectionHeading
        number="2"
        :label="`${copy.modules.eyebrow} · ${copy.addons.eyebrow}`"
        :heading="copy.modules.heading"
        :sub="copy.modules.sub"
      />

      <!-- ═══ Tab switcher · Core / Add-ons ═══ -->
      <div class="flex flex-wrap items-center gap-3 sm:gap-4 mb-12 lg:mb-16">
        <div
          class="inline-flex items-center gap-1 p-1 rounded-full bg-black/[0.04] dark:bg-white/[0.05] ring-1 ring-black/5 dark:ring-white/10"
          role="tablist"
          aria-label="Platform features"
        >
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'core'"
            class="inline-flex items-center gap-2 px-4 sm:px-5 h-10 rounded-full text-sm font-bold transition-all"
            :class="activeTab === 'core'
              ? 'bg-primary text-white shadow-md shadow-primary/20 dark:bg-white dark:text-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            @click="setTab('core')"
          >
            {{ copy.modules.eyebrow }}
            <span
              class="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-[10px] font-black tabular-nums"
              :class="activeTab === 'core'
                ? 'bg-white/20 text-white dark:bg-primary/15 dark:text-primary'
                : 'bg-black/10 text-gray-700 dark:bg-white/10 dark:text-gray-300'"
            >
              {{ modules.length }}
            </span>
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'addons'"
            class="inline-flex items-center gap-2 px-4 sm:px-5 h-10 rounded-full text-sm font-bold transition-all"
            :class="activeTab === 'addons'
              ? 'bg-primary text-white shadow-md shadow-primary/20 dark:bg-white dark:text-primary'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'"
            @click="setTab('addons')"
          >
            {{ copy.addons.eyebrow }}
            <span
              class="inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded-full text-[10px] font-black tabular-nums"
              :class="activeTab === 'addons'
                ? 'bg-white/20 text-white dark:bg-primary/15 dark:text-primary'
                : 'bg-black/10 text-gray-700 dark:bg-white/10 dark:text-gray-300'"
            >
              {{ copy.addons.items.length }}
            </span>
          </button>
        </div>

        <span aria-hidden="true" class="hidden sm:inline-block h-8 w-px bg-black/10 dark:bg-white/10 mx-1" />

        <NuxtLink
          :to="localePath(activeTab === 'core' ? '/portal/features' : '/portal/addons')"
          class="group inline-flex items-center gap-3 text-sm font-bold"
        >
          <span class="size-10 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
          </span>
          <span class="relative">
            {{ activeTab === 'core' ? copy.modules.linkAll : copy.addons.linkAll }}
            <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors" />
          </span>
        </NuxtLink>
      </div>

      <!-- ═══ Tab panel — CORE MODULES ═══ -->
      <div
        v-show="activeTab === 'core'"
        role="tabpanel"
        :aria-hidden="activeTab !== 'core'"
        class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
        @focusin="paused = true"
        @focusout="paused = false"
      >

        <!-- Left rail: hairline-separated tab list -->
        <nav class="lg:col-span-5 border-t border-black/10 dark:border-white/10">
          <!-- Mobile: horizontal scrollable pill list -->
          <ul
            class="lg:hidden flex gap-2 py-4 overflow-x-auto scrollbar-none snap-x"
            role="tablist"
            aria-label="Modules"
          >
            <li v-for="(m, i) in modules" :key="m.id" class="shrink-0 snap-start">
              <button
                role="tab"
                :aria-selected="activeIndex === i"
                class="inline-flex items-center gap-2 px-4 h-10 rounded-full text-sm font-semibold transition-colors"
                :class="activeIndex === i
                  ? 'bg-primary text-white dark:bg-white dark:text-primary'
                  : 'bg-black/5 dark:bg-white/10 text-gray-700 dark:text-gray-300'"
                @click="selectModule(i)"
              >
                <span aria-hidden="true" class="size-1.5 rounded-full bg-gradient-to-br" :class="visuals[m.id]?.color" />
                {{ m.label }}
              </button>
            </li>
          </ul>

          <!-- Desktop: big hairline list -->
          <ul class="hidden lg:block" role="tablist" aria-label="Modules">
            <li v-for="(m, i) in modules" :key="m.id"
              class="relative border-b border-black/10 dark:border-white/10"
            >
              <button
                role="tab"
                :aria-selected="activeIndex === i"
                class="group relative w-full grid grid-cols-12 gap-4 items-center py-4 text-start transition-colors"
                :class="activeIndex === i
                  ? 'bg-black/[0.02] dark:bg-white/[0.02]'
                  : 'hover:bg-black/[0.015] dark:hover:bg-white/[0.015]'"
                @click="selectModule(i)"
              >
                <!-- Index -->
                <span class="col-span-1 ps-1 text-xs tabular-nums text-gray-400">{{ padIndex(i) }}</span>

                <!-- Colored dot (indicator) -->
                <span class="col-span-1 flex">
                  <span
                    aria-hidden="true"
                    class="size-2.5 rounded-full transition-all"
                    :class="activeIndex === i
                      ? `bg-gradient-to-br shadow-sm ${visuals[m.id]?.color}`
                      : 'bg-black/15 dark:bg-white/20 group-hover:bg-black/30'"
                  />
                </span>

                <!-- Label — big editorial text that lights up when active -->
                <span class="col-span-9 min-w-0">
                  <p
                    class="text-lg xl:text-xl font-black tracking-tight truncate transition-colors"
                    :class="activeIndex === i
                      ? 'text-primary dark:text-white'
                      : 'text-black/30 dark:text-white/25 group-hover:text-black/60 dark:group-hover:text-white/50'"
                  >
                    {{ m.label }}
                  </p>
                </span>

                <!-- Trailing arrow -->
                <span class="col-span-1 flex justify-end pe-1">
                  <UIcon
                    name="i-lucide-arrow-right"
                    class="size-4 rtl:rotate-180 transition-all"
                    :class="activeIndex === i
                      ? 'text-secondary-500 translate-x-0.5 rtl:-translate-x-0.5'
                      : 'text-gray-300 dark:text-gray-700'"
                  />
                </span>

                <!-- Progress bar along the bottom of the active tab -->
                <span
                  v-if="activeIndex === i"
                  aria-hidden="true"
                  class="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden"
                >
                  <span
                    class="block h-full bg-gradient-to-r transition-[width] duration-[80ms] ease-linear"
                    :class="visuals[m.id]?.color"
                    :style="{ width: `${progress * 100}%` }"
                  />
                </span>
              </button>
            </li>
          </ul>

          <!-- Status line: paused / auto-advance -->
          <div class="hidden lg:flex items-center gap-2 mt-6 text-[11px] uppercase tracking-[0.2em] text-gray-400">
            <UIcon :name="paused ? 'i-lucide-pause' : 'i-lucide-play'" class="size-3" />
            <span>{{ paused ? copy.ui.explorerPaused : `${copy.ui.explorerAutoPrefix}${Math.ceil((1 - progress) * DURATION / 1000)}s` }}</span>
          </div>
        </nav>

        <!-- Right stage: active module preview (no outer card frame) -->
        <div class="lg:col-span-7 relative" role="tabpanel" :aria-labelledby="`module-${active?.id}`">
          <!-- Backdrop tint (soft, matches active module color) -->
          <div aria-hidden="true"
            class="pointer-events-none absolute -inset-x-8 -inset-y-6 bg-gradient-to-br opacity-[0.07] blur-3xl transition-all duration-700"
            :class="activeVisual?.color"
          />
          <div aria-hidden="true"
            class="pointer-events-none absolute -top-10 -end-10 size-64 rounded-full bg-gradient-to-br opacity-25 blur-3xl transition-all duration-700"
            :class="activeVisual?.color"
          />

          <div class="relative">
            <!-- Header: index pair + included chip -->
            <div class="flex items-center justify-between mb-5">
              <span class="text-xs uppercase tracking-[0.25em] text-gray-400 tabular-nums">
                {{ padIndex(activeIndex) }} / {{ totalIndex }}
              </span>
              <span class="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-emerald-600 dark:text-emerald-400">
                <UIcon name="i-lucide-check-circle-2" class="size-3" />
                {{ copy.ui.includedInEveryPlan }}
              </span>
            </div>

            <!-- Title + blurb (transitions on module switch) -->
            <Transition
              enter-active-class="transition duration-500 ease-out"
              enter-from-class="opacity-0 translate-y-2"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
              mode="out-in"
            >
              <div :key="active?.id">
                <!-- Accent stripe — tied to module color -->
                <div aria-hidden="true" class="h-0.5 w-20 bg-gradient-to-r rounded-full mb-6" :class="activeVisual?.color" />

                <h3 :id="`module-${active?.id}`" class="font-black tracking-tight leading-[0.95] text-4xl sm:text-5xl lg:text-6xl">
                  {{ active?.label }}
                </h3>
                <p class="mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl">
                  {{ active?.blurb }}
                </p>
              </div>
            </Transition>

            <!-- Live mock — light-weight frame (no border), soft bg + hairline top -->
            <div class="mt-8 relative rounded-2xl bg-gray-50 dark:bg-white/[0.025] overflow-hidden">
              <div :key="active?.id" class="p-5 sm:p-6 transition-opacity duration-300">
                <LandingModuleMock :id="active?.id || 'calendar'" :color="activeVisual?.color" />
              </div>
            </div>

            <!-- Highlights — hairline above, 2-col checklist -->
            <ul class="mt-10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 border-t border-black/10 dark:border-white/10">
              <li v-for="h in activeHighlights" :key="h" class="flex items-start gap-2.5 text-sm">
                <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-0.5" :class="activeVisual?.check || 'text-secondary-500'" />
                <span class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ h }}</span>
              </li>
            </ul>

            <!-- Footer: CTA + stepper -->
            <div class="mt-10 flex items-center justify-between gap-4 flex-wrap">
              <NuxtLink
                :to="localePath(`/portal/modules/${active?.id}`)"
                class="group inline-flex items-center gap-3 text-sm font-bold"
              >
                <span class="size-10 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
                  <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
                </span>
                <span class="relative">
                  {{ copy.ui.exploreVerb }} {{ active?.label }}
                  <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors" />
                </span>
              </NuxtLink>

              <!-- Stepper dots -->
              <div class="flex items-center gap-1.5">
                <button
                  v-for="(_, i) in modules" :key="i"
                  type="button"
                  class="h-1.5 rounded-full transition-all"
                  :class="activeIndex === i
                    ? `w-8 bg-gradient-to-r ${visuals[modules[i].id]?.color}`
                    : 'w-1.5 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'"
                  :aria-label="`Go to module ${i + 1}`"
                  @click="selectModule(i)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Tab panel — ADD-ONS ═══ -->
      <div
        v-show="activeTab === 'addons'"
        role="tabpanel"
        :aria-hidden="activeTab !== 'addons'"
      >
        <!-- Category quick-nav — shared component, popover-driven so chips never clip -->
        <div class="-mx-5 sm:-mx-8 mb-12 sm:mb-16">
          <LandingChapterNav
            :items="addonChipItems"
            as-filter
            v-model:active="activeCat"
          />
        </div>

        <!-- Directory chapters — compact -->
        <div class="space-y-12 sm:space-y-16">
          <div
            v-for="(cat, ci) in visibleAddons"
            :id="`addons-${cat.name.toLowerCase()}`"
            :key="cat.name"
          >
            <!-- Chapter header: hairline + medium-weight category title -->
            <div class="flex items-end justify-between pb-4 mb-8 border-b border-black/10 dark:border-white/10">
              <div class="flex items-baseline gap-3 sm:gap-5 min-w-0">
                <span class="shrink-0 text-xs tabular-nums text-gray-400">{{ String(ci + 1).padStart(2, '0') }}</span>
                <div class="flex items-baseline gap-3 min-w-0">
                  <span
                    aria-hidden="true"
                    class="size-2 rounded-full shrink-0"
                    :class="catPalette[cat.name].dot"
                  />
                  <h3
                    class="text-2xl sm:text-3xl font-black tracking-tight uppercase truncate"
                    :class="catPalette[cat.name].accent"
                  >
                    {{ copy.ui.addonCategoryLabels[cat.name] }}
                  </h3>
                </div>
              </div>
              <span class="shrink-0 text-[10px] uppercase tracking-[0.25em] text-gray-400">
                {{ String(cat.items.length).padStart(2, '0') }} / {{ copy.ui.addonsLabel }}
              </span>
            </div>

            <!-- Addon grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
              <NuxtLink
                v-for="a in cat.items"
                :key="a.key"
                :to="localePath(`/portal/addons/${a.key}`)"
                class="group relative flex items-start gap-4"
              >
                <div
                  class="shrink-0 size-12 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                  :class="catPalette[cat.name].iconBg"
                >
                  <UIcon
                    :name="addonMeta[a.key as AddonKey]?.icon"
                    class="size-5"
                    :class="catPalette[cat.name].iconText"
                  />
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-sm sm:text-base font-bold leading-tight">
                    <span class="relative inline-block align-baseline">
                      {{ a.label }}
                      <span
                        aria-hidden="true"
                        class="absolute -bottom-0.5 inset-x-0 h-[1.5px] origin-start scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                        :class="catPalette[cat.name].dot"
                      />
                    </span>
                  </h4>
                  <p class="mt-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ a.desc }}</p>
                </div>
                <UIcon
                  aria-hidden="true"
                  name="i-lucide-arrow-up-right"
                  class="hidden sm:block shrink-0 mt-1.5 size-4 text-gray-300 dark:text-gray-700 group-hover:text-primary dark:group-hover:text-white transition-colors"
                />
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Closing tagline -->
        <p class="mt-16 flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-[0.25em]">
          <span class="size-1.5 rounded-full bg-emerald-500" />
          {{ copy.ui.allFifteenShip }}
        </p>
      </div>
    </div>
  </section>
</template>

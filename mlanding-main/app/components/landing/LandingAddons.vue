<script setup>
const localePath = useLocalePath()
const copy = useLandingCopy()

const addonMeta = {
  zatca: { icon: 'i-lucide-shield-check', cat: 'Compliance' },
  eta: { icon: 'i-lucide-file-check', cat: 'Compliance' },
  ai: { icon: 'i-lucide-sparkles', cat: 'Intelligence' },
  gcal: { icon: 'i-lucide-calendar-check', cat: 'Intelligence' },
  insurance: { icon: 'i-lucide-heart-pulse', cat: 'Clinical' },
  dental: { icon: 'i-hugeicons-dental-tooth', cat: 'Clinical' },
  imaging: { icon: 'i-lucide-scan', cat: 'Clinical' },
  labs: { icon: 'i-lucide-flask-conical', cat: 'Clinical' },
  rx: { icon: 'i-lucide-pill', cat: 'Clinical' },
  records: { icon: 'i-lucide-folder-heart', cat: 'Clinical' },
  resources: { icon: 'i-lucide-armchair', cat: 'Operations' },
  attendance: { icon: 'i-lucide-log-in', cat: 'Operations' },
  loyalty: { icon: 'i-lucide-award', cat: 'Growth' },
  events: { icon: 'i-lucide-calendar-heart', cat: 'Growth' },
  followup: { icon: 'i-lucide-list-checks', cat: 'Growth' }
}

// Per-category accent palette for the directory chapters.
const catPalette = {
  Compliance: { accent: 'text-emerald-600 dark:text-emerald-400', iconBg: 'bg-emerald-500/8', iconText: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Clinical: { accent: 'text-sky-600 dark:text-sky-400', iconBg: 'bg-sky-500/8', iconText: 'text-sky-600 dark:text-sky-400', dot: 'bg-sky-500' },
  Intelligence: { accent: 'text-violet-600 dark:text-violet-400', iconBg: 'bg-violet-500/8', iconText: 'text-violet-600 dark:text-violet-400', dot: 'bg-violet-500' },
  Operations: { accent: 'text-amber-600 dark:text-amber-400', iconBg: 'bg-amber-500/8', iconText: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  Growth: { accent: 'text-rose-600 dark:text-rose-400', iconBg: 'bg-rose-500/8', iconText: 'text-rose-600 dark:text-rose-400', dot: 'bg-rose-500' }
}

// Group the add-ons by category in display order.
const addonCategories = computed(() => {
  const order = ['Compliance', 'Clinical', 'Intelligence', 'Operations', 'Growth']
  return order.map(cat => ({
    name: cat,
    items: copy.value.addons.items.filter(a => addonMeta[a.key]?.cat === cat)
  })).filter(c => c.items.length > 0)
})
</script>

<template>
  <section
    id="addons"
    class="relative py-24 sm:py-32 overflow-hidden"
  >
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10"
    />
    <!-- Soft color bands behind the section, tied to the 5 category hues -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-50 dark:opacity-30"
    >
      <div class="absolute top-[10%] start-[-10rem] w-80 h-80 rounded-full bg-emerald-300 blur-[120px] opacity-30" />
      <div class="absolute top-[40%] end-[-10rem] w-80 h-80 rounded-full bg-sky-300 blur-[120px] opacity-30" />
      <div class="absolute bottom-[10%] start-1/3 w-80 h-80 rounded-full bg-rose-300 blur-[120px] opacity-20" />
    </div>

    <div class="relative max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="4"
        :label="copy.addons.eyebrow"
        :heading="copy.addons.heading"
        :sub="copy.addons.sub"
      />

      <!-- CTA + category jump-nav -->
      <div class="flex flex-wrap items-center gap-x-6 gap-y-3 mb-16 sm:mb-20">
        <NuxtLink
          :to="localePath('/portal/addons')"
          class="group inline-flex items-center gap-3 text-sm font-bold"
        >
          <span class="size-10 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <UIcon
              name="i-lucide-arrow-right"
              class="size-4 rtl:rotate-180"
            />
          </span>
          <span class="relative">
            {{ copy.addons.linkAll }}
            <span
              aria-hidden="true"
              class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors"
            />
          </span>
        </NuxtLink>
        <span
          aria-hidden="true"
          class="h-8 w-px bg-black/10 dark:bg-white/10 mx-2"
        />
        <span class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ copy.ui.chaptersLabel }}</span>
        <a
          v-for="(cat, ci) in addonCategories"
          :key="cat.name"
          :href="`#addons-${cat.name.toLowerCase()}`"
          class="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-primary dark:hover:text-white transition-colors"
        >
          <span
            class="size-1.5 rounded-full"
            :class="catPalette[cat.name].dot"
          />
          {{ String(ci + 1).padStart(2, '0') }} · {{ copy.ui.addonCategoryLabels[cat.name] }}
          <span class="text-gray-400 normal-case tracking-normal">({{ cat.items.length }})</span>
        </a>
      </div>

      <!-- Directory chapters -->
      <div class="space-y-16 sm:space-y-24">
        <div
          v-for="(cat, ci) in addonCategories"
          :id="`addons-${cat.name.toLowerCase()}`"
          :key="cat.name"
        >
          <!-- Chapter header: big category name, count, hairline rule -->
          <div class="flex items-end justify-between pb-5 mb-10 border-b border-black/10 dark:border-white/10">
            <div class="flex items-baseline gap-4 sm:gap-6 min-w-0">
              <span class="shrink-0 text-sm tabular-nums text-gray-400">{{ String(ci + 1).padStart(2, '0') }}</span>
              <div class="flex items-baseline gap-3 min-w-0">
                <span
                  aria-hidden="true"
                  class="size-2.5 rounded-full shrink-0"
                  :class="catPalette[cat.name].dot"
                />
                <h3
                  class="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight uppercase truncate"
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

          <!-- Addon grid inside chapter -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-10">
            <NuxtLink
              v-for="a in cat.items"
              :key="a.key"
              :to="localePath(`/portal/addons/${a.key}`)"
              class="group relative flex items-start gap-4"
            >
              <!-- Tinted icon square — no border, just a soft bg panel -->
              <div
                class="shrink-0 size-12 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                :class="catPalette[cat.name].iconBg"
              >
                <UIcon
                  :name="addonMeta[a.key]?.icon"
                  class="size-5"
                  :class="catPalette[cat.name].iconText"
                />
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-base sm:text-lg font-bold leading-tight">
                  <span class="relative inline-block align-baseline">
                    {{ a.label }}
                    <span
                      aria-hidden="true"
                      class="absolute -bottom-0.5 inset-x-0 h-[1.5px] origin-start scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                      :class="catPalette[cat.name].dot"
                    />
                  </span>
                </h4>
                <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ a.desc }}</p>
              </div>
              <!-- Arrow on hover — hints at navigation -->
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
      <p class="mt-20 flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-[0.25em]">
        <span class="size-1.5 rounded-full bg-emerald-500" />
        {{ copy.ui.allFifteenShip }}
      </p>
    </div>
  </section>
</template>

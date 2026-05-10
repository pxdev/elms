<script setup>
const localePath = useLocalePath()
const copy = useLandingCopy()

const whyIcons = ['i-lucide-package-2', 'i-lucide-server', 'i-lucide-languages', 'i-lucide-shield-check', 'i-lucide-brain-circuit', 'i-lucide-smartphone']

// Stable English filenames keyed by index. Deriving them from the localized
// title doesn't work for Arabic — the regex strips every non-ASCII character,
// so all six items would collapse to ".md". Filenames are decorative chrome
// and should always render as readable English regardless of UI locale.
const FILE_NAMES = [
  'source-you-own.md',
  'self-hosted.md',
  'bilingual-rtl.md',
  'compliance.md',
  'ai-assistant.md',
  'installs-like-native.md'
]
const fileNames = computed(() =>
  copy.value.why.items.map((_item, i) => FILE_NAMES[i] || `feature-${i + 1}.md`)
)

const activeIndex = ref(0)
const paused = ref(false)
const userTookOver = ref(false)

const DURATION = 5500
let timer = null

function tick() {
  if (!paused.value && !userTookOver.value) {
    activeIndex.value = (activeIndex.value + 1) % copy.value.why.items.length
  }
}

function selectFeature(i) {
  userTookOver.value = true
  activeIndex.value = i
}

onMounted(() => {
  timer = setInterval(tick, DURATION)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})

// Scroll reveal
const editorRef = ref(null)
const revealed = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        revealed.value = true
        observer.disconnect()
      }
    },
    { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
  )
  if (editorRef.value) observer.observe(editorRef.value)
})
</script>

<template>
  <section
    id="why"
    class="relative py-24 sm:py-32 overflow-hidden bg-gray-50 dark:bg-white/[0.02]"
  >
    <!-- Giant decorative numeral -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -top-16 -end-12 text-[28rem] leading-[0.8] font-black text-black/[0.025] dark:text-white/[0.03] select-none hidden lg:block tabular-nums"
    >
      01
    </div>

    <div class="max-w-6xl mx-auto px-5 sm:px-8 relative">
      <LandingSectionHeading
        number="1"
        :label="copy.why.eyebrow"
        :heading="`${copy.why.h2a} ${copy.why.h2b}`"
        :sub="copy.why.body"
      />

      <!-- ═══ Code Editor Window ═══ -->
      <div
        ref="editorRef"
        class="editor-window rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#111] shadow-2xl shadow-black/10 transition-all duration-700"
        :class="revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'"
        @mouseenter="paused = true"
        @mouseleave="paused = false"
      >
        <!-- Window chrome -->
        <div class="h-10 px-4 flex items-center gap-2 bg-gray-100 dark:bg-[#1a1a1a] border-b border-black/5 dark:border-white/5">
          <div class="flex gap-1.5 shrink-0">
            <span aria-hidden="true" class="size-2.5 rounded-full bg-red-400/80" />
            <span aria-hidden="true" class="size-2.5 rounded-full bg-amber-400/80" />
            <span aria-hidden="true" class="size-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div class="mx-auto flex items-center gap-2 text-[11px] text-gray-500 font-medium" dir="ltr">
            <UIcon name="i-lucide-file-text" class="size-3" />
            <span>why-momentfy.md</span>
          </div>
        </div>

        <!-- Split view -->
        <div class="grid grid-cols-1 lg:grid-cols-12 min-h-[360px] sm:min-h-[400px]">
          <!-- Sidebar — file explorer -->
          <div class="lg:col-span-4 bg-gray-50/80 dark:bg-[#0d0d0d] border-e border-black/5 dark:border-white/5 p-2 sm:p-3">
            <div class="flex items-center justify-between mb-2 px-2 sm:px-3 py-1">
              <span class="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Explorer</span>
              <span class="text-[10px] tabular-nums text-gray-300" dir="ltr">{{ String(activeIndex + 1).padStart(2, '0') }} / 06</span>
            </div>

            <div class="space-y-0.5">
              <button
                v-for="(item, i) in copy.why.items"
                :key="item.title"
                class="w-full flex items-center gap-2.5 px-2 sm:px-3 py-2 rounded-lg text-sm transition-all duration-300 text-start"
                :class="activeIndex === i
                  ? 'bg-secondary-500/10 text-secondary-600 font-semibold'
                  : 'text-gray-500 hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'"
                @click="selectFeature(i)"
              >
                <UIcon :name="whyIcons[i] || 'i-lucide-star'" class="size-4 shrink-0" />
                <span class="truncate font-mono text-xs" dir="ltr">{{ fileNames[i] }}</span>
              </button>
            </div>

            <!-- Stepper dots -->
            <div class="mt-4 px-3 flex items-center gap-1.5">
              <button
                v-for="(_, i) in copy.why.items"
                :key="i"
                type="button"
                class="h-1 rounded-full transition-all duration-300"
                :class="activeIndex === i ? 'w-6 bg-secondary-500' : 'w-1.5 bg-black/15 dark:bg-white/15 hover:bg-black/30 dark:hover:bg-white/30'"
                :aria-label="`Go to feature ${i + 1}`"
                @click="selectFeature(i)"
              />
            </div>
          </div>

          <!-- Editor pane -->
          <div class="lg:col-span-8 p-5 sm:p-8 relative overflow-hidden">
            <!-- Line numbers gutter -->
            <div
              aria-hidden="true"
              class="absolute start-0 top-0 bottom-0 w-10 sm:w-12 border-e border-black/5 dark:border-white/5 text-end pe-2 sm:pe-3 pt-5 sm:pt-6 text-[11px] sm:text-xs text-gray-300 dark:text-gray-600 font-mono space-y-4 select-none leading-relaxed"
            >
              <div v-for="n in 6" :key="n">{{ n }}</div>
            </div>

            <!-- Content -->
            <div class="ps-12 sm:ps-14">
              <Transition
                mode="out-in"
                enter-active-class="transition duration-400 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100"
                leave-to-class="opacity-0"
              >
                <div :key="activeIndex">
                  <!-- Heading line -->
                  <div class="flex items-baseline gap-2 mb-1">
                    <span class="text-secondary-500 font-mono text-sm sm:text-base">#</span>
                    <h3 class="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                      {{ copy.why.items[activeIndex].title }}
                    </h3>
                  </div>

                  <!-- Comment line -->
                  <div class="text-gray-400 dark:text-gray-500 font-mono text-xs mb-6" dir="ltr">
                    // Feature {{ String(activeIndex + 1).padStart(2, '0') }} of 06
                  </div>

                  <!-- Description -->
                  <p class="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                    {{ copy.why.items[activeIndex].body }}
                  </p>

                  <!-- Decorative code snippet — forced LTR so the inline spans
                       don't reverse order under RTL ("; "..." = feature const") -->
                  <div class="mt-6 p-3 sm:p-4 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-black/5 dark:border-white/5 font-mono text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 space-y-1" dir="ltr">
                    <div>
                      <span class="text-purple-600 dark:text-purple-400">const</span>
                      <span class="text-blue-600 dark:text-blue-400"> feature</span>
                      <span> = </span>
                      <span class="text-green-600 dark:text-green-400" dir="auto">"{{ copy.why.items[activeIndex].title }}"</span>
                      <span>;</span>
                    </div>
                    <div>
                      <span class="text-purple-600 dark:text-purple-400">export</span>
                      <span class="text-purple-600 dark:text-purple-400"> default</span>
                      <span> feature;</span>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-14">
        <NuxtLink
          :to="localePath('/portal/features')"
          class="group inline-flex items-center gap-3 text-base font-bold"
        >
          <span class="size-12 rounded-full bg-primary dark:bg-white text-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
            <UIcon
              name="i-lucide-arrow-right"
              class="size-5 rtl:rotate-180 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
            />
          </span>
          <span class="relative">
            {{ copy.ui.allFeatureAreas }}
            <span
              aria-hidden="true"
              class="absolute -bottom-0.5 inset-x-0 h-px bg-current origin-start scale-x-100 group-hover:bg-secondary-500 transition-colors"
            />
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.editor-window {
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>

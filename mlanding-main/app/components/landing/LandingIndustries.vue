<script setup lang="ts">
const copy = useLandingCopy()
const localePath = useLocalePath()

// Per-vertical photo + icon + accent. Photos live in /public/images.
type Accent = 'rose' | 'sky' | 'red' | 'stone' | 'emerald' | 'amber' | 'violet' | 'cyan' | 'indigo' | 'slate' | 'orange' | 'blue' | 'fuchsia' | 'yellow'
const visual: Record<string, { image: string; icon: string; accent: Accent }> = {
  salon:        { image: '/images/salon_spa.png',       icon: 'i-lucide-scissors',        accent: 'rose' },
  dental:       { image: '/images/dental.png',          icon: 'i-hugeicons-dental-tooth', accent: 'sky' },
  medical:      { image: '/images/medical_clinics.png', icon: 'i-lucide-heart-pulse',     accent: 'red' },
  barber:       { image: '/images/barber.png',          icon: 'i-lucide-user',            accent: 'stone' },
  fitness:      { image: '/images/training.png',        icon: 'i-lucide-dumbbell',        accent: 'emerald' },
  pet:          { image: '/images/pet.png',             icon: 'i-lucide-paw-print',       accent: 'amber' },
  therapy:      { image: '/images/therapy.png',         icon: 'i-lucide-brain',           accent: 'violet' },
  photo:        { image: '/images/photo.png',           icon: 'i-lucide-camera',          accent: 'cyan' },
  education:    { image: '/images/education.png',       icon: 'i-lucide-graduation-cap',  accent: 'indigo' },
  professional: { image: '/images/prof.png',            icon: 'i-lucide-briefcase',       accent: 'slate' },
  auto:         { image: '/images/auto.png',            icon: 'i-lucide-car',             accent: 'orange' },
  optical:      { image: '/images/optical.png',         icon: 'i-lucide-glasses',         accent: 'emerald' },
  carwash:      { image: '/images/wash.png',            icon: 'i-lucide-droplets',        accent: 'blue' },
  wellness:     { image: '/images/wellness.png',        icon: 'i-lucide-flower-2',        accent: 'fuchsia' },
  coworking:    { image: '/images/coworking.png',       icon: 'i-lucide-building-2',      accent: 'yellow' }
}
const accentClass: Record<Accent, { bar: string; pill: string; text: string; ring: string }> = {
  rose:    { bar: 'bg-rose-500',    pill: 'bg-rose-500/10 text-rose-700 ring-rose-500/20',       text: 'text-rose-600',    ring: 'ring-rose-500/30' },
  sky:     { bar: 'bg-sky-500',     pill: 'bg-sky-500/10 text-sky-700 ring-sky-500/20',          text: 'text-sky-600',     ring: 'ring-sky-500/30' },
  red:     { bar: 'bg-red-500',     pill: 'bg-red-500/10 text-red-700 ring-red-500/20',          text: 'text-red-600',     ring: 'ring-red-500/30' },
  stone:   { bar: 'bg-stone-500',   pill: 'bg-stone-500/10 text-stone-700 ring-stone-500/20',    text: 'text-stone-700',   ring: 'ring-stone-500/30' },
  emerald: { bar: 'bg-emerald-500', pill: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20', text: 'text-emerald-600', ring: 'ring-emerald-500/30' },
  amber:   { bar: 'bg-amber-500',   pill: 'bg-amber-500/10 text-amber-700 ring-amber-500/20',    text: 'text-amber-600',   ring: 'ring-amber-500/30' },
  violet:  { bar: 'bg-violet-500',  pill: 'bg-violet-500/10 text-violet-700 ring-violet-500/20', text: 'text-violet-600',  ring: 'ring-violet-500/30' },
  cyan:    { bar: 'bg-cyan-500',    pill: 'bg-cyan-500/10 text-cyan-700 ring-cyan-500/20',       text: 'text-cyan-600',    ring: 'ring-cyan-500/30' },
  indigo:  { bar: 'bg-indigo-500',  pill: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20', text: 'text-indigo-600',  ring: 'ring-indigo-500/30' },
  slate:   { bar: 'bg-slate-500',   pill: 'bg-slate-500/10 text-slate-700 ring-slate-500/20',    text: 'text-slate-700',   ring: 'ring-slate-500/30' },
  orange:  { bar: 'bg-orange-500',  pill: 'bg-orange-500/10 text-orange-700 ring-orange-500/20', text: 'text-orange-600',  ring: 'ring-orange-500/30' },
  blue:    { bar: 'bg-blue-500',    pill: 'bg-blue-500/10 text-blue-700 ring-blue-500/20',       text: 'text-blue-600',    ring: 'ring-blue-500/30' },
  fuchsia: { bar: 'bg-fuchsia-500', pill: 'bg-fuchsia-500/10 text-fuchsia-700 ring-fuchsia-500/20', text: 'text-fuchsia-600', ring: 'ring-fuchsia-500/30' },
  yellow:  { bar: 'bg-yellow-500',  pill: 'bg-yellow-500/10 text-yellow-700 ring-yellow-500/20', text: 'text-yellow-600',  ring: 'ring-yellow-500/30' }
}

// Combine industries.items (label, tagline, id) with solutionDetails
// (capabilities, stats, longer copy) when available. The result is one
// stable list of slide-ready objects.
const slides = computed(() => copy.value.industries.items.map((it: { id: string; label: string; tagline?: string }) => {
  const detail = (copy.value.solutionDetails as Record<string, { tagline?: string; long?: string; capabilities?: string[]; stats?: { k: string; v: string }[] }>)[it.id]
  const v = visual[it.id] ?? visual.salon
  return {
    id: it.id,
    label: it.label,
    tagline: detail?.tagline || it.tagline || '',
    long: detail?.long || '',
    capabilities: (detail?.capabilities || []).slice(0, 4),
    stats: (detail?.stats || []).slice(0, 3),
    image: v.image,
    icon: v.icon,
    accent: v.accent
  }
}))

const activeIndex = ref(0)
const active = computed(() => slides.value[activeIndex.value])

const sectionEl = ref<HTMLElement | null>(null)
const paused = ref(false)
const visible = ref(false)

// Once the user manually clicks prev/next/dot we kill autoplay for the rest
// of the session. Treat their first interaction as "I'll drive."
const userTookOver = ref(false)

const AUTOPLAY_MS = 5500
let timer: ReturnType<typeof setInterval> | null = null
let observer: IntersectionObserver | null = null

function stopAutoplay() {
  userTookOver.value = true
  if (timer) { clearInterval(timer); timer = null }
}

function next(userInitiated = false) {
  if (userInitiated) stopAutoplay()
  activeIndex.value = (activeIndex.value + 1) % slides.value.length
}
function prev(userInitiated = false) {
  if (userInitiated) stopAutoplay()
  activeIndex.value = (activeIndex.value - 1 + slides.value.length) % slides.value.length
}
function goTo(i: number, userInitiated = false) {
  if (userInitiated) stopAutoplay()
  activeIndex.value = i
}

function tick() {
  if (paused.value || !visible.value || userTookOver.value) return
  next()
}

onMounted(() => {
  if (sectionEl.value && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver(
      entries => { visible.value = entries.some(e => e.isIntersecting) },
      { threshold: 0.2 }
    )
    observer.observe(sectionEl.value)
  } else {
    visible.value = true
  }
  timer = setInterval(tick, AUTOPLAY_MS)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (observer) observer.disconnect()
})

// Routing — preserve deep-link target per vertical.
const solutionIds = computed(() => new Set(Object.keys(copy.value.solutionDetails)))
const showcaseIds = computed(() => new Set(copy.value.showcasePage.verticals.map((x: { id: string }) => x.id)))
function industryTarget(id: string) {
  if (solutionIds.value.has(id)) return localePath(`/portal/solutions/${id}`)
  if (showcaseIds.value.has(id)) return `${localePath('/portal/showcase')}#${id}`
  return localePath('/portal/solutions')
}

function onImgError(e: Event) {
  const t = e.target as HTMLImageElement
  if (t) t.style.display = 'none'
}
</script>

<template>
  <section ref="sectionEl" class="relative py-24 sm:py-32 overflow-hidden bg-gray-50 dark:bg-white/[0.02]">
    <div aria-hidden="true" class="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10" />

    <!-- Heading row stays centred; the slider below goes full-bleed. -->
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="3"
        :label="copy.industries.eyebrow"
        :heading="copy.industries.heading"
        :sub="copy.industries.sub"
        :count="copy.industries.items.length"
      />
    </div>

    <!-- Full-width slider -->
    <div
      class="relative mt-12 sm:mt-16"
      role="region"
      :aria-label="copy.industries.eyebrow"
      @mouseenter="paused = true"
      @mouseleave="paused = false"
      @focusin="paused = true"
      @focusout="paused = false"
    >
      <!-- Counter chip — overlays the photo so it stays visible whenever
           the slider is on screen, regardless of breakpoint. -->
      <span
        class="absolute top-4 sm:top-5 lg:top-6 start-4 sm:start-5 lg:start-8 z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/35 backdrop-blur-md text-white text-[11px] font-bold tabular-nums tracking-[0.2em] ring-1 ring-white/15 shadow-lg shadow-black/20"
        aria-live="polite"
      >
        {{ String(activeIndex + 1).padStart(2, '0') }}
        <span class="text-white/50">/</span>
        {{ String(slides.length).padStart(2, '0') }}
      </span>

      <!-- Overlay arrows — vertically centered on the slider edges. Sit on
           top of the slide via z-10 + persist through the slide transition
           because they live outside the <Transition>. -->
      <!-- Arrow vertical anchor matches the image's fixed pixel height —
           half of 420px on default, half of 480px on sm, slider center on lg. -->
      <button
        type="button"
        class="absolute top-[210px] sm:top-[240px] lg:top-1/2 -translate-y-1/2 start-3 sm:start-5 lg:start-6 z-10 size-12 sm:size-12 rounded-full bg-white text-gray-900 shadow-xl shadow-black/15 ring-1 ring-black/10 hover:scale-105 hover:bg-white transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
        :aria-label="copy.ui.prev"
        @click="prev(true)"
      >
        <UIcon name="i-lucide-arrow-left" class="size-4 sm:size-5 rtl:rotate-180" />
      </button>
      <button
        type="button"
        class="absolute top-[210px] sm:top-[240px] lg:top-1/2 -translate-y-1/2 end-3 sm:end-5 lg:end-6 z-10 size-12 sm:size-12 rounded-full bg-white text-gray-900 shadow-xl shadow-black/15 ring-1 ring-black/10 hover:scale-105 hover:bg-white transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
        :aria-label="copy.ui.next"
        @click="next(true)"
      >
        <UIcon name="i-lucide-arrow-right" class="size-4 sm:size-5 rtl:rotate-180" />
      </button>

      <Transition name="slide" mode="out-in">
        <article
          :key="active.id"
          aria-live="polite"
          class="grid grid-cols-1 lg:grid-cols-2 lg:h-[680px]"
        >
          <!-- Image column — fixed pixel height across all breakpoints so
               every photo lands in the exact same frame. On lg+ the article
               sets a 680px row, the image releases via lg:h-auto and fills it. -->
          <div class="relative overflow-hidden bg-gray-100 h-[420px] sm:h-[480px] lg:h-auto order-1 lg:order-1">
            <!-- Color fallback (only visible if image 404s) -->
            <div aria-hidden="true" class="absolute inset-0" :class="accentClass[active.accent].bar" />
            <UIcon
              :name="active.icon"
              aria-hidden="true"
              class="absolute inset-0 m-auto size-20 text-white/40"
            />
            <img
              :src="active.image"
              :alt="active.label"
              loading="eager"
              decoding="async"
              class="relative w-full h-full object-cover"
              @error="onImgError"
            >
            <!-- Top accent stripe -->
            <div aria-hidden="true" class="absolute top-0 inset-x-0 h-1" :class="accentClass[active.accent].bar" />
          </div>

          <!-- Details column -->
          <div class="relative flex flex-col justify-center bg-white px-6 sm:px-10 lg:px-16 xl:px-24 py-12 lg:py-20 order-2 lg:order-2">
            <div class="max-w-xl">
              <!-- Index counter -->
              <p class="text-[11px] uppercase tracking-[0.25em] font-bold text-gray-400 tabular-nums">
                {{ String(activeIndex + 1).padStart(2, '0') }}
                <span class="mx-2 text-gray-300">·</span>
                {{ String(slides.length).padStart(2, '0') }}
              </p>

              <!-- Vertical pill -->
              <span
                class="mt-5 inline-flex items-center gap-2 px-3 py-1 rounded-full ring-1 text-[11px] uppercase tracking-[0.18em] font-bold"
                :class="accentClass[active.accent].pill"
              >
                <UIcon :name="active.icon" class="size-3.5" />
                {{ copy.industries.eyebrow }}
              </span>

              <!-- Label -->
              <h3 class="mt-6 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.05] text-primary">
                {{ active.label }}
              </h3>

              <!-- Tagline -->
              <p
                v-if="active.tagline"
                class="mt-5 text-lg sm:text-xl text-gray-500 leading-relaxed"
              >
                {{ active.tagline }}
              </p>

              <!-- Capabilities -->
              <ul v-if="active.capabilities.length" class="mt-8 space-y-2.5">
                <li
                  v-for="cap in active.capabilities"
                  :key="cap"
                  class="flex items-start gap-3 text-sm sm:text-base text-gray-700 leading-snug"
                >
                  <UIcon
                    name="i-lucide-check"
                    class="size-5 shrink-0 mt-0.5"
                    :class="accentClass[active.accent].text"
                  />
                  <span>{{ cap }}</span>
                </li>
              </ul>

              <!-- Stats strip -->
              <dl
                v-if="active.stats.length"
                class="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-black/10"
              >
                <div v-for="s in active.stats" :key="s.k">
                  <dt class="text-[10px] uppercase tracking-[0.18em] font-bold text-gray-400">{{ s.k }}</dt>
                  <dd class="mt-1 text-2xl sm:text-3xl font-black tabular-nums" :class="accentClass[active.accent].text">{{ s.v }}</dd>
                </div>
              </dl>

              <!-- CTA -->
              <div class="mt-10">
                <NuxtLink
                  :to="industryTarget(active.id)"
                  class="inline-flex items-center gap-2 px-5 h-12 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all"
                >
                  {{ copy.ui.exploreVerb }} {{ active.label }}
                  <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
                </NuxtLink>
              </div>
            </div>
          </div>
        </article>
      </Transition>
    </div>

    <!-- Section CTA -->
    <div class="max-w-7xl mx-auto px-5 sm:px-8 mt-10 sm:mt-12">
      <NuxtLink
        :to="localePath(copy.industries.ctaHref)"
        class="inline-flex items-center gap-3 text-sm sm:text-base font-bold tracking-tight text-primary hover:text-secondary-600 transition-colors group"
      >
        <span class="border-b-2 border-secondary-500/40 group-hover:border-secondary-500 pb-0.5 transition-colors">
          {{ copy.industries.ctaLabel }}
        </span>
        <UIcon
          name="i-lucide-arrow-right"
          class="size-4 rtl:rotate-180 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
        />
      </NuxtLink>
    </div>
  </section>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 450ms ease-out, transform 450ms ease-out;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>

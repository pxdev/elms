<script setup lang="ts">
// Hero stage — rotating carousel of tenant-facing booking storefronts.
// Shows prospective buyers what *their customers* will see: a branded
// booking page with services, time slots and a book-now CTA.
// Auto-rotates every 5s, pauses on hover, and offers pagination dots.
const { locale } = useI18n()
const copy = useLandingCopy()

type Tenant = {
  slug: string
  name: string
  initial: string
  location: string
  rating: string
  ratingCount: string
  services: { name: string; minutes: number; price: number; icon: string }[]
  days: string[]
  times: string[]
  selectedDay: number
  selectedTime: number
  accent: 'rose' | 'sky' | 'amber' | 'emerald'
}

const tenantsEn: Tenant[] = [
  {
    slug: 'glow', name: 'Glow Beauty Lounge', initial: 'G',
    location: 'Riyadh · Olaya', rating: '4.9', ratingCount: '240',
    services: [
      { name: 'Color & Cut', minutes: 90, price: 380, icon: 'i-lucide-scissors' },
      { name: 'Gel Manicure', minutes: 45, price: 120, icon: 'i-lucide-sparkles' },
      { name: 'Keratin Treatment', minutes: 120, price: 650, icon: 'i-lucide-flame' }
    ],
    days: ['Today', 'Tue 22', 'Wed 23', 'Thu 24'],
    times: ['10:00', '11:30', '14:00', '16:30'],
    selectedDay: 0, selectedTime: 2, accent: 'rose'
  },
  {
    slug: 'pearl', name: 'Pearl Dental', initial: 'P',
    location: 'Jeddah · Al Rawdah', rating: '4.8', ratingCount: '182',
    services: [
      { name: 'Cleaning & Polish', minutes: 30, price: 220, icon: 'i-lucide-stethoscope' },
      { name: 'Whitening Session', minutes: 60, price: 900, icon: 'i-lucide-sparkle' },
      { name: 'Ortho Consultation', minutes: 20, price: 0, icon: 'i-lucide-message-circle' }
    ],
    days: ['Today', 'Tue 22', 'Wed 23', 'Thu 24'],
    times: ['09:00', '10:30', '13:00', '15:30'],
    selectedDay: 1, selectedTime: 2, accent: 'sky'
  },
  {
    slug: 'ironside', name: 'Ironside Barber Co.', initial: 'I',
    location: 'Khobar · Corniche', rating: '4.9', ratingCount: '515',
    services: [
      { name: 'Classic Cut', minutes: 30, price: 90, icon: 'i-lucide-scissors' },
      { name: 'Beard Lineup', minutes: 20, price: 60, icon: 'i-lucide-wind' },
      { name: 'Full Grooming', minutes: 60, price: 180, icon: 'i-lucide-crown' }
    ],
    days: ['Today', 'Tue 22', 'Wed 23', 'Thu 24'],
    times: ['12:00', '13:00', '14:00', '15:00'],
    selectedDay: 0, selectedTime: 0, accent: 'amber'
  },
  {
    slug: 'sama', name: 'Dr. Sama Clinic', initial: 'S',
    location: 'Riyadh · Al Nakheel', rating: '5.0', ratingCount: '96',
    services: [
      { name: 'Wellness Check-up', minutes: 45, price: 350, icon: 'i-lucide-heart-pulse' },
      { name: 'IV Drip Therapy', minutes: 30, price: 500, icon: 'i-lucide-droplets' },
      { name: 'Follow-up Visit', minutes: 15, price: 150, icon: 'i-lucide-clipboard-check' }
    ],
    days: ['Today', 'Tue 22', 'Wed 23', 'Thu 24'],
    times: ['09:30', '11:00', '14:00', '16:00'],
    selectedDay: 2, selectedTime: 1, accent: 'emerald'
  }
]

const tenantsAr: Tenant[] = [
  {
    slug: 'glow', name: 'صالون قلو للتجميل', initial: 'ق',
    location: 'الرياض · العليا', rating: '٤٫٩', ratingCount: '٢٤٠',
    services: [
      { name: 'صبغة وقص', minutes: 90, price: 380, icon: 'i-lucide-scissors' },
      { name: 'مناكير جل', minutes: 45, price: 120, icon: 'i-lucide-sparkles' },
      { name: 'علاج كيراتين', minutes: 120, price: 650, icon: 'i-lucide-flame' }
    ],
    days: ['اليوم', 'ثل ٢٢', 'أر ٢٣', 'خم ٢٤'],
    times: ['١٠:٠٠', '١١:٣٠', '١٤:٠٠', '١٦:٣٠'],
    selectedDay: 0, selectedTime: 2, accent: 'rose'
  },
  {
    slug: 'pearl', name: 'مركز بيرل لطب الأسنان', initial: 'ب',
    location: 'جدة · الروضة', rating: '٤٫٨', ratingCount: '١٨٢',
    services: [
      { name: 'تنظيف وتلميع', minutes: 30, price: 220, icon: 'i-lucide-stethoscope' },
      { name: 'جلسة تبييض', minutes: 60, price: 900, icon: 'i-lucide-sparkle' },
      { name: 'استشارة تقويم', minutes: 20, price: 0, icon: 'i-lucide-message-circle' }
    ],
    days: ['اليوم', 'ثل ٢٢', 'أر ٢٣', 'خم ٢٤'],
    times: ['٠٩:٠٠', '١٠:٣٠', '١٣:٠٠', '١٥:٣٠'],
    selectedDay: 1, selectedTime: 2, accent: 'sky'
  },
  {
    slug: 'ironside', name: 'أيرونسايد للحلاقة', initial: 'أ',
    location: 'الخبر · الكورنيش', rating: '٤٫٩', ratingCount: '٥١٥',
    services: [
      { name: 'قصة كلاسيكية', minutes: 30, price: 90, icon: 'i-lucide-scissors' },
      { name: 'تحديد ذقن', minutes: 20, price: 60, icon: 'i-lucide-wind' },
      { name: 'تنسيق كامل', minutes: 60, price: 180, icon: 'i-lucide-crown' }
    ],
    days: ['اليوم', 'ثل ٢٢', 'أر ٢٣', 'خم ٢٤'],
    times: ['١٢:٠٠', '١٣:٠٠', '١٤:٠٠', '١٥:٠٠'],
    selectedDay: 0, selectedTime: 0, accent: 'amber'
  },
  {
    slug: 'sama', name: 'عيادة الدكتورة سما', initial: 'س',
    location: 'الرياض · النخيل', rating: '٥٫٠', ratingCount: '٩٦',
    services: [
      { name: 'فحص صحي شامل', minutes: 45, price: 350, icon: 'i-lucide-heart-pulse' },
      { name: 'جلسة تغذية وريدية', minutes: 30, price: 500, icon: 'i-lucide-droplets' },
      { name: 'زيارة متابعة', minutes: 15, price: 150, icon: 'i-lucide-clipboard-check' }
    ],
    days: ['اليوم', 'ثل ٢٢', 'أر ٢٣', 'خم ٢٤'],
    times: ['٠٩:٣٠', '١١:٠٠', '١٤:٠٠', '١٦:٠٠'],
    selectedDay: 2, selectedTime: 1, accent: 'emerald'
  }
]

const tenants = computed(() => (locale.value === 'ar' ? tenantsAr : tenantsEn))

const labels = computed(() => locale.value === 'ar'
  ? {
      services: 'الخدمات', pickATime: 'اختر الوقت', openNow: 'مفتوح الآن',
      bookNow: 'احجز الآن', free: 'مجانًا', min: 'د', currency: 'ر.س',
      subdomainTag: 'النطاق الخاص بك', liveIn5: 'جاهز خلال ٥ دقائق',
      zatcaTag: 'فوترة ZATCA', zatcaMsg: 'إيصال موقّع → بوابة العميل',
      zatcaAuto: 'كل فاتورة · تلقائيًا'
    }
  : {
      services: 'Services', pickATime: 'Pick a time', openNow: 'Open now',
      bookNow: 'Book now', free: 'Free', min: 'min', currency: 'SAR',
      subdomainTag: 'Your subdomain', liveIn5: 'Live in 5 minutes',
      zatcaTag: 'ZATCA Phase 2', zatcaMsg: 'Signed receipt → client portal',
      zatcaAuto: 'Every invoice · automatic'
    }
)

// Tailwind JIT sees these strings statically — do not build class names dynamically.
const accent = {
  rose: {
    cover: 'from-rose-400 via-pink-500 to-fuchsia-600',
    chip: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    pill: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    cta: 'bg-gradient-to-br from-rose-500 to-pink-600 shadow-rose-500/30',
    slot: 'bg-rose-500 text-white shadow-rose-500/40'
  },
  sky: {
    cover: 'from-sky-400 via-cyan-500 to-teal-600',
    chip: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
    pill: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    cta: 'bg-gradient-to-br from-sky-500 to-cyan-600 shadow-sky-500/30',
    slot: 'bg-sky-500 text-white shadow-sky-500/40'
  },
  amber: {
    cover: 'from-zinc-900 via-stone-900 to-amber-900',
    chip: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    pill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    cta: 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/30',
    slot: 'bg-amber-500 text-white shadow-amber-500/40'
  },
  emerald: {
    cover: 'from-emerald-400 via-teal-500 to-green-600',
    chip: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    pill: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    cta: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30',
    slot: 'bg-emerald-500 text-white shadow-emerald-500/40'
  }
} as const

const active = ref(0)
const paused = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  timer = setInterval(() => {
    if (!paused.value) active.value = (active.value + 1) % tenants.value.length
  }, 5000)
})

onBeforeUnmount(() => { if (timer) clearInterval(timer) })

function goTo(i: number) {
  active.value = i
}

const activeTenant = computed(() => tenants.value[active.value]!)
</script>

<template>
  <div
    class="relative"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
  >
    <!-- Stage glow below -->
    <div aria-hidden="true" class="absolute inset-x-12 -bottom-10 h-24 bg-secondary-500 blur-3xl opacity-30 dark:opacity-40 rounded-[50%]" />
    <!-- Gradient frame around the browser -->
    <div aria-hidden="true" class="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-secondary-400/40 via-secondary-500/20 to-sky-400/30 dark:from-secondary-400/50 dark:via-secondary-500/25 dark:to-sky-500/30 blur-xl opacity-80" />

    <!-- Browser frame -->
    <div class="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 bg-white dark:bg-[#0a0a0a] shadow-2xl shadow-secondary-500/10 dark:shadow-black/50 ring-1 ring-black/5 dark:ring-white/10">
      <!-- Browser chrome -->
      <div class="h-10 bg-gradient-to-b from-gray-50 to-white dark:from-white/[0.06] dark:to-white/[0.03] border-b border-black/5 dark:border-white/10 flex items-center px-4 gap-3">
        <div class="flex gap-1.5 shrink-0">
          <div class="size-2.5 rounded-full bg-red-400/80" />
          <div class="size-2.5 rounded-full bg-amber-400/80" />
          <div class="size-2.5 rounded-full bg-emerald-400/80" />
        </div>
        <div class="mx-auto flex items-center gap-1.5 px-3 h-6 rounded-full bg-black/5 dark:bg-white/5 text-[11px] text-gray-500 dark:text-gray-400 font-mono tabular-nums tracking-tight transition-all">
          <UIcon name="i-lucide-lock" class="size-3 text-emerald-500" />
          <span dir="ltr">{{ activeTenant.slug }}.momentfy.com/book</span>
        </div>
        <div class="hidden sm:inline-flex items-center gap-1.5 shrink-0 text-[10px] uppercase tracking-[0.2em] text-rose-500 font-bold">
          <span class="size-1.5 rounded-full bg-rose-500 animate-pulse" />
          {{ copy.ui.liveDemo }}
        </div>
      </div>

      <!-- Storefront canvas: grid-stack so all slides share one cell and the
           container sizes to the tallest slide without layout shift. -->
      <div class="relative grid bg-gradient-to-b from-gray-50 to-white dark:from-white/[0.02] dark:to-transparent [&>*]:col-start-1 [&>*]:row-start-1">
        <div
          v-for="(t, i) in tenants"
          :key="t.slug"
          class="transition-opacity duration-700 ease-out flex flex-col"
          :class="i === active ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'"
          :aria-hidden="i !== active"
        >
          <!-- Cover -->
          <div :class="['relative h-20 sm:h-24 bg-gradient-to-br', accent[t.accent].cover]">
            <div
              aria-hidden="true"
              class="absolute inset-0 opacity-30 mix-blend-overlay"
              style="background-image: radial-gradient(circle at 20% 30%, #fff, transparent 40%), radial-gradient(circle at 80% 70%, #fff, transparent 35%)"
            />
            <!-- AR/EN bilingual indicator -->
            <div class="absolute top-3 end-3 inline-flex items-center gap-0.5 px-1 py-0.5 rounded-full bg-black/30 backdrop-blur text-white text-[9px] font-bold border border-white/20">
              <span class="px-1 rounded-full" :class="locale === 'en' ? 'bg-white/30' : 'opacity-60'">EN</span>
              <span class="px-1 rounded-full" :class="locale === 'ar' ? 'bg-white/30' : 'opacity-60'">AR</span>
            </div>
          </div>

          <!-- Body -->
          <div class="px-4 sm:px-6 pb-10 -mt-8 flex flex-col gap-3">
            <!-- Header: logo + name + meta + open-now -->
            <div class="flex items-end gap-3">
              <div :class="['size-16 sm:size-16 rounded-2xl text-white shrink-0 ring-4 ring-white dark:ring-[#0a0a0a] shadow-xl flex items-center justify-center text-xl sm:text-2xl font-black bg-gradient-to-br', accent[t.accent].cover]">
                {{ t.initial }}
              </div>
              <div class="flex-1 min-w-0 pb-0.5">
                <h3 class="text-sm sm:text-base font-black text-primary dark:text-white truncate">{{ t.name }}</h3>
                <div class="mt-0.5 flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400">
                  <span class="inline-flex items-center gap-1">
                    <UIcon name="i-lucide-map-pin" class="size-3" />{{ t.location }}
                  </span>
                  <span class="inline-flex items-center gap-0.5 font-bold text-amber-500">
                    <UIcon name="i-lucide-star" class="size-3 fill-current" />{{ t.rating }}
                    <span class="font-normal text-gray-400 ms-0.5">({{ t.ratingCount }})</span>
                  </span>
                </div>
              </div>
              <span :class="['hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap pb-1', accent[t.accent].chip]">
                <span class="size-1.5 rounded-full bg-current animate-pulse" />{{ labels.openNow }}
              </span>
            </div>

            <!-- Services -->
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1.5">{{ labels.services }}</p>
              <div class="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-white/[0.02] divide-y divide-black/5 dark:divide-white/5">
                <div v-for="s in t.services" :key="s.name" class="flex items-center gap-3 px-3 py-2">
                  <div :class="['size-8 rounded-lg shrink-0 flex items-center justify-center', accent[t.accent].pill]">
                    <UIcon :name="s.icon" class="size-3.5" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] sm:text-xs font-bold text-primary dark:text-white truncate">{{ s.name }}</p>
                    <p class="text-[10px] text-gray-500">{{ s.minutes }} {{ labels.min }}</p>
                  </div>
                  <p class="text-[11px] sm:text-xs font-black text-primary dark:text-white tabular-nums shrink-0">
                    <span v-if="s.price === 0" class="text-emerald-500">{{ labels.free }}</span>
                    <template v-else>{{ labels.currency }} <span>{{ s.price }}</span></template>
                  </p>
                </div>
              </div>
            </div>

            <!-- Day + time picker -->
            <div>
              <p class="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1.5">{{ labels.pickATime }}</p>
              <div class="flex gap-1.5">
                <div
                  v-for="(d, di) in t.days"
                  :key="d"
                  :class="['flex-1 rounded-lg text-center py-1.5 text-[10px] font-bold border tabular-nums',
                    di === t.selectedDay
                      ? 'bg-primary text-white border-primary dark:bg-white dark:text-primary dark:border-white'
                      : 'bg-white dark:bg-white/[0.02] text-gray-600 dark:text-gray-400 border-black/5 dark:border-white/10']"
                >{{ d }}</div>
              </div>
              <div class="mt-1.5 grid grid-cols-4 gap-1.5">
                <div
                  v-for="(tm, ti) in t.times"
                  :key="tm"
                  :class="['rounded-lg text-center py-1.5 text-[10px] font-bold tabular-nums transition-colors',
                    ti === t.selectedTime
                      ? ['shadow-lg', accent[t.accent].slot].join(' ')
                      : 'bg-white dark:bg-white/[0.02] text-gray-600 dark:text-gray-400 border border-black/5 dark:border-white/10']"
                >{{ tm }}</div>
              </div>
            </div>

            <!-- CTA -->
            <div :class="['group relative h-10 sm:h-12 rounded-xl text-white text-xs sm:text-sm font-black tracking-tight shadow-xl flex items-center justify-center gap-2', accent[t.accent].cta]">
              <UIcon name="i-lucide-calendar-check" class="size-4" />
              <span>{{ labels.bookNow }} · {{ labels.currency }} {{ t.services[0]!.price }}</span>
              <UIcon name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
            </div>
          </div>
        </div>

        <!-- Pagination dots -->
        <div class="absolute bottom-3 inset-x-0 z-[2] flex justify-center gap-1.5">
          <button
            v-for="(t, i) in tenants"
            :key="t.slug"
            type="button"
            :class="['h-1.5 rounded-full transition-all cursor-pointer',
              i === active ? 'w-6 bg-primary dark:bg-white' : 'w-1.5 bg-primary/20 dark:bg-white/20 hover:bg-primary/40 dark:hover:bg-white/40']"
            :aria-label="`Show ${t.name}`"
            @click="goTo(i)"
          />
        </div>
      </div>
    </div>

    <!-- Floating accent: subdomain hint (top-start) -->
    <LandingHeroFloatCard class="-top-6 -start-10 w-56" :rotation="-4">
      <div class="rounded-2xl bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 p-3">
        <div class="flex items-center gap-2">
          <div class="size-8 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 flex items-center justify-center text-white shadow-lg shadow-secondary-500/40">
            <UIcon name="i-lucide-globe" class="size-4" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-black">{{ labels.subdomainTag }}</p>
            <p class="text-[9px] text-gray-500 dark:text-gray-400 truncate font-mono" dir="ltr">{{ activeTenant.slug }}.momentfy.com</p>
          </div>
        </div>
        <div class="mt-2 flex items-center gap-1.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
          <UIcon name="i-lucide-zap" class="size-3" />
          {{ labels.liveIn5 }}
        </div>
      </div>
    </LandingHeroFloatCard>

    <!-- Floating accent: ZATCA receipt flow (bottom-end) -->
    <LandingHeroFloatCard class="-bottom-5 -end-8 w-60" :rotation="3" :delay="-2">
      <div class="rounded-2xl bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/40 p-3">
        <div class="flex items-center gap-2 mb-2">
          <div class="size-8 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
            <UIcon name="i-lucide-shield-check" class="size-4" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-black">{{ labels.zatcaTag }}</p>
            <p class="text-[9px] text-gray-500 dark:text-gray-400">{{ labels.zatcaMsg }}</p>
          </div>
        </div>
        <div class="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
          <span class="size-1 rounded-full bg-emerald-500 animate-pulse" />
          {{ labels.zatcaAuto }}
        </div>
      </div>
    </LandingHeroFloatCard>
  </div>
</template>

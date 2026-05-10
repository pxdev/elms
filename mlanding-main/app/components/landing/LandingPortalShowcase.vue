<script setup>
const copy = useLandingCopy()

const tenantBrands = [
  {
    slug: 'lina-spa', name: 'Lina\'s Spa', industry: 'Salon', logo: 'L',
    grad: 'from-pink-400 to-rose-600',
    accent: 'bg-rose-500',
    apptIcon: 'i-lucide-scissors', apptTitle: 'Color & Cut', apptMeta: 'Tue · 14:00',
    heroLabel: 'Loyalty balance', heroValue: '1,240', heroUnit: 'pts', heroProgress: 62,
    actions: [
      { icon: 'i-lucide-calendar-plus', label: 'Book' },
      { icon: 'i-lucide-receipt', label: 'Invoice' },
      { icon: 'i-lucide-star', label: 'Review' }
    ],
    pill: { icon: 'i-lucide-sparkles', text: 'Ask the AI…' }
  },
  {
    slug: 'smile-dental', name: 'Smile Dental', industry: 'Clinic', logo: 'S',
    grad: 'from-sky-400 to-blue-600',
    accent: 'bg-sky-500',
    apptIcon: 'i-hugeicons-dental-tooth', apptTitle: 'Root canal', apptMeta: 'Thu · 10:30',
    heroLabel: 'Treatment plan', heroValue: '3', heroUnit: 'visits', heroProgress: 33,
    actions: [
      { icon: 'i-lucide-calendar-plus', label: 'Book' },
      { icon: 'i-lucide-folder-heart', label: 'Records' },
      { icon: 'i-lucide-pill', label: 'Rx' }
    ],
    pill: { icon: 'i-lucide-shield-check', text: 'Invoice signed · ZATCA' }
  },
  {
    slug: 'flex-fitness', name: 'Flex Fitness', industry: 'Studio', logo: 'F',
    grad: 'from-lime-400 to-emerald-600',
    accent: 'bg-emerald-500',
    apptIcon: 'i-lucide-zap', apptTitle: 'HIIT Blast', apptMeta: 'Today · 18:30',
    heroLabel: 'Check-ins', heroValue: '18', heroUnit: 'month', heroProgress: 72,
    actions: [
      { icon: 'i-lucide-calendar-plus', label: 'Classes' },
      { icon: 'i-lucide-log-in', label: 'Check-in' },
      { icon: 'i-lucide-users-round', label: 'Roster' }
    ],
    pill: { icon: 'i-lucide-wifi-off', text: 'Works offline' }
  }
]
</script>

<template>
  <section class="relative py-24 sm:py-32 overflow-hidden">
    <div
      aria-hidden="true"
      class="absolute inset-x-0 top-0 h-px bg-black/10 dark:bg-white/10"
    />
    <!-- Three color washes matching the three tenant brands -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 opacity-40"
    >
      <div class="absolute top-[10%] start-[-8rem] w-96 h-96 rounded-full bg-rose-300 blur-[140px]" />
      <div class="absolute top-[20%] start-1/2 w-96 h-96 rounded-full bg-sky-300 blur-[140px]" />
      <div class="absolute top-[10%] end-[-8rem] w-96 h-96 rounded-full bg-emerald-300 blur-[140px]" />
    </div>

    <div class="relative max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="4"
        :label="copy.ui.threeTenantsLabel"
        :heading="copy.ui.oneSourceThreeBrands"
        :sub="copy.ui.threeBrandsTagline"
      />

      <!-- Browser mocks — stacked on mobile, 3-col grid on tablet+ -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-8">
        <figure
          v-for="(t, i) in tenantBrands"
          :key="t.slug"
          class="group"
        >
          <!-- Browser window -->
          <div class="relative">
            <!-- Brand color wash behind window -->
            <div
              aria-hidden="true"
              class="absolute -inset-4 bg-gradient-to-br opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-35"
              :class="t.grad"
            />

            <div class="relative rounded-2xl overflow-hidden bg-white ring-1 ring-black/10 shadow-2xl shadow-black/15 transition-transform duration-500 group-hover:-translate-y-1.5">
              <!-- Browser chrome (Safari-style) -->
              <div class="h-10 px-3 flex items-center gap-2 bg-gray-50 border-b border-black/5">
                <div class="flex gap-1.5 shrink-0">
                  <span aria-hidden="true" class="size-2.5 rounded-full bg-red-400/80" />
                  <span aria-hidden="true" class="size-2.5 rounded-full bg-amber-400/80" />
                  <span aria-hidden="true" class="size-2.5 rounded-full bg-emerald-400/80" />
                </div>
                <div class="mx-auto flex items-center gap-1.5 px-2.5 h-5 rounded-full bg-black/5 text-[10px] text-gray-500 font-medium">
                  <UIcon name="i-lucide-lock" class="size-2.5 text-emerald-500" />
                  <span class="truncate max-w-[180px]">{{ t.slug }}.momentfy.com</span>
                </div>
                <UIcon name="i-lucide-more-horizontal" class="size-3.5 text-gray-400 shrink-0" />
              </div>

              <!-- Viewport -->
              <div class="aspect-[16/10] relative">
                <!-- Soft brand wash inside viewport -->
                <div
                  aria-hidden="true"
                  class="absolute inset-0 bg-gradient-to-br opacity-[0.08]"
                  :class="t.grad"
                />

                <!-- App layout: left rail + main -->
                <div class="relative h-full flex">
                  <!-- Left rail -->
                  <div class="w-10 sm:w-12 shrink-0 border-e border-black/5 flex flex-col items-center py-3 gap-3">
                    <div
                      class="size-6 rounded-md bg-gradient-to-br flex items-center justify-center text-white font-black text-[9px]"
                      :class="t.grad"
                    >
                      {{ t.logo }}
                    </div>
                    <div class="w-full flex flex-col items-center gap-1.5 mt-1">
                      <span
                        v-for="n in 4"
                        :key="n"
                        aria-hidden="true"
                        class="size-1.5 rounded-full bg-black/15"
                      />
                    </div>
                  </div>

                  <!-- Main column -->
                  <div class="flex-1 min-w-0 p-3 sm:p-4 flex flex-col gap-2.5">
                    <!-- Top bar -->
                    <div class="flex items-center gap-2">
                      <div class="min-w-0 flex-1">
                        <p class="text-[8px] text-gray-400 uppercase tracking-wider">
                          {{ copy.portal.welcomeBack }}
                        </p>
                        <p class="text-[11px] sm:text-xs font-bold truncate">
                          {{ t.name }}
                        </p>
                      </div>
                      <div class="flex items-center gap-1.5 shrink-0">
                        <UIcon name="i-lucide-search" class="size-3 text-gray-400" />
                        <UIcon name="i-lucide-bell" class="size-3 text-gray-400" />
                        <span
                          class="size-4 rounded-full bg-gradient-to-br text-white text-[7px] font-black flex items-center justify-center"
                          :class="t.grad"
                        >{{ t.logo }}</span>
                      </div>
                    </div>

                    <!-- Two-column body -->
                    <div class="flex-1 grid grid-cols-5 gap-2 min-h-0">
                      <!-- Hero metric card (3 cols) -->
                      <div
                        class="col-span-3 rounded-lg p-2.5 text-white bg-gradient-to-br flex flex-col justify-between"
                        :class="t.grad"
                      >
                        <p class="text-[8px] opacity-80 uppercase tracking-wider">
                          {{ t.heroLabel }}
                        </p>
                        <div>
                          <p class="text-lg sm:text-xl font-black leading-none">
                            {{ t.heroValue }}
                            <span class="text-[9px] font-medium opacity-80">{{ t.heroUnit }}</span>
                          </p>
                          <div class="mt-1.5 h-0.5 rounded-full bg-white/25 overflow-hidden">
                            <div
                              class="h-full bg-white/90 rounded-full"
                              :style="{ width: `${t.heroProgress}%` }"
                            />
                          </div>
                        </div>
                      </div>

                      <!-- Next appointment (2 cols) -->
                      <div class="col-span-2 rounded-lg bg-gray-50 p-2 flex flex-col gap-1">
                        <p class="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                          {{ copy.portal.nextAppt }}
                        </p>
                        <div class="flex items-center gap-1.5 mt-auto">
                          <UIcon
                            :name="t.apptIcon"
                            class="size-3 shrink-0"
                            :class="t.accent.replace('bg-', 'text-')"
                          />
                          <div class="min-w-0 flex-1">
                            <p class="text-[10px] font-bold truncate">
                              {{ t.apptTitle }}
                            </p>
                            <p class="text-[8px] text-gray-500 truncate">
                              {{ t.apptMeta }}
                            </p>
                          </div>
                          <span
                            aria-hidden="true"
                            class="size-1.5 rounded-full animate-pulse shrink-0"
                            :class="t.accent"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Quick actions row -->
                    <div class="grid grid-cols-3 gap-1.5">
                      <div
                        v-for="q in t.actions"
                        :key="q.label"
                        class="h-8 rounded-md bg-gray-50 flex items-center justify-center gap-1 px-1.5"
                      >
                        <UIcon
                          :name="q.icon"
                          class="size-3 shrink-0"
                          :class="t.accent.replace('bg-', 'text-')"
                        />
                        <p class="text-[9px] font-semibold truncate">
                          {{ q.label }}
                        </p>
                      </div>
                    </div>

                    <!-- Bottom pill -->
                    <div class="rounded-full bg-primary text-white flex items-center gap-1.5 px-2 py-1.5">
                      <div
                        class="size-3.5 rounded-full bg-gradient-to-br flex items-center justify-center shrink-0"
                        :class="t.grad"
                      >
                        <UIcon
                          :name="t.pill.icon"
                          class="size-2 text-white"
                        />
                      </div>
                      <p class="text-[9px] font-medium flex-1 truncate">
                        {{ t.pill.text }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Caption below the window -->
          <figcaption class="mt-6">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs tabular-nums text-gray-400">0{{ i + 1 }} / 03</span>
              <span
                aria-hidden="true"
                class="h-px flex-1 bg-black/10"
              />
              <span class="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">
                <span
                  aria-hidden="true"
                  class="size-1.5 rounded-full"
                  :class="t.accent"
                />
                {{ t.industry }}
              </span>
            </div>
            <h3 class="text-lg sm:text-xl font-black tracking-tight">
              {{ t.name }}
            </h3>
            <p class="mt-0.5 text-xs text-gray-500 font-mono">
              {{ t.slug }}.momentfy.com
            </p>
          </figcaption>
        </figure>
      </div>

    </div>
  </section>
</template>

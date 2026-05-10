<script setup lang="ts">
// Hero stage — video preview wrapped in an iPad-style bezel.
const copy = useLandingCopy()

const props = withDefaults(defineProps<{
  src?: string
  poster?: string
  duration?: string
  aspectRatio?: string
}>(), {
  src: '',
  poster: '',
  duration: '2:34',
  aspectRatio: '16 / 9'
})

// If no poster is provided, start the video immediately instead of showing the play affordance.
const isPlaying = ref(!props.poster && !!props.src)
const isMuted = ref(true)
const videoRef = ref<HTMLVideoElement | null>(null)

async function play() {
  if (!props.src) return
  isPlaying.value = true
  await nextTick()
  try { await videoRef.value?.play() } catch { /* autoplay may fail — user can click native control */ }
}

function toggleMute() {
  if (!videoRef.value) return
  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}
</script>

<template>
  <!-- iPad-style bezel -->
  <div class="relative rounded-[1.25rem] sm:rounded-[1.5rem] p-2.5 sm:p-3.5 bg-gradient-to-br from-gray-800 via-black to-gray-900 dark:from-gray-700 dark:via-gray-900 dark:to-black shadow-2xl shadow-black/40 dark:shadow-black/60 ring-1 ring-white/10">

    <!-- Front camera dot -->
    <span aria-hidden="true" class="absolute top-1/2 -translate-y-1/2 start-1.5 sm:start-2 size-1.5 sm:size-2 rounded-full bg-gray-700 ring-1 ring-white/10" />

    <!-- ═══ Video stage (iPad screen) ═══ -->
    <div class="relative rounded-[0.75rem] sm:rounded-[1rem] bg-primary overflow-hidden" :style="{ aspectRatio: props.aspectRatio }">
      <!-- Dark poster: layered ambient light (no dashboard mock) -->
      <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-br from-primary via-primary-500 to-primary" />
      <div aria-hidden="true" class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_80%)]" />
      <div aria-hidden="true" class="absolute -top-20 start-1/4 w-[28rem] h-[28rem] rounded-full bg-secondary-500 blur-[140px] opacity-50" />
      <div aria-hidden="true" class="absolute -bottom-24 end-1/4 w-[28rem] h-[28rem] rounded-full bg-sky-500 blur-[140px] opacity-30" />
      <div aria-hidden="true" class="absolute inset-0 opacity-[0.06] mix-blend-overlay" style="background-image:url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22><filter id=%22n%22><feTurbulence baseFrequency=%220.8%22 /></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/></svg>')" />
      <div aria-hidden="true" class="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_40%,black_75%)]"
        style="background-image: linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px); background-size: 60px 60px;"
      />

      <!-- Optional poster image -->
      <img v-if="poster && !isPlaying" :src="poster" alt="" class="absolute inset-0 w-full h-full object-cover opacity-80" />

      <!-- Video element (appears once playing) -->
      <video
        v-if="src && isPlaying"
        ref="videoRef"
        :src="src"
        :muted="isMuted"
        autoplay
        playsinline
        loop
        class="absolute inset-0 w-full h-full object-cover"
      />

      <!-- Play affordance (hidden while playing) -->
      <div v-if="!isPlaying" class="relative h-full flex flex-col items-center justify-center gap-6 px-6 text-center">
        <button
          type="button"
          class="group relative size-20 sm:size-24 rounded-full flex items-center justify-center cursor-pointer"
          :aria-label="src ? 'Play demo video' : 'Demo coming soon'"
          @click="play"
        >
          <!-- Pulsing halo rings -->
          <span aria-hidden="true" class="absolute inset-0 rounded-full bg-white/10 animate-ping [animation-duration:2s]" />
          <span aria-hidden="true" class="absolute inset-[-8px] rounded-full border border-white/15" />
          <span aria-hidden="true" class="absolute inset-[-16px] rounded-full border border-white/10" />

          <!-- Main play pill -->
          <span class="relative size-16 sm:size-20 rounded-full bg-white text-primary flex items-center justify-center shadow-2xl shadow-black/40 transition-transform group-hover:scale-110">
            <UIcon name="i-lucide-play" class="size-6 sm:size-8 translate-x-0.5" />
          </span>
        </button>

        <div>
          <p class="text-white font-black text-lg sm:text-xl tracking-tight">{{ copy.ui.watchTourLead }}{{ duration }}{{ copy.ui.watchTourSuffix }}</p>
          <p class="mt-1.5 text-sm text-white/60 max-w-xs mx-auto">{{ copy.ui.tourChapters }}</p>
        </div>
      </div>

      <!-- Playing-state overlay: mute toggle -->
      <button
        v-if="isPlaying"
        type="button"
        class="absolute bottom-4 end-4 size-10 rounded-full bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        :aria-label="isMuted ? 'Unmute' : 'Mute'"
        @click="toggleMute"
      >
        <UIcon :name="isMuted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'" class="size-4" />
      </button>
    </div>
  </div>
</template>

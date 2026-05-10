<script setup lang="ts">
// Reusable autoplay-muted-loop video surface used on module/add-on detail pages.
// Accepts either a direct video file URL (.mp4/.webm) or a YouTube URL
// (youtube.com/watch?v=… · youtu.be/… · youtube.com/embed/…). Falls back to a
// "coming soon" state when no URL is provided.
const props = withDefaults(defineProps<{
  videoUrl?: string
  posterUrl?: string
  accent?: string
  label?: string
  comingSoonLabel?: string
}>(), {
  videoUrl: '',
  posterUrl: '',
  accent: 'from-secondary-500 to-sky-500',
  label: 'Product video',
  comingSoonLabel: ''
})

const copy = useLandingCopy()

// ── URL classification
function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]!
  }
  return null
}

const youtubeId = computed(() => extractYouTubeId(props.videoUrl))
const isYouTube = computed(() => !!youtubeId.value)
const hasVideo = computed(() => !!props.videoUrl)

// YouTube embed — autoplay muted loop, no info chrome, no related videos.
// `playlist=<id>` is required for loop to work when embedding a single video.
const youtubeEmbedUrl = computed(() => {
  if (!youtubeId.value) return ''
  const id = youtubeId.value
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    loop: '1',
    playlist: id,
    modestbranding: '1',
    rel: '0',
    playsinline: '1',
    iv_load_policy: '3'
  })
  return `https://www.youtube.com/embed/${id}?${params.toString()}`
})

// ── Native <video> controls (only used for .mp4/.webm URLs)
const videoEl = ref<HTMLVideoElement | null>(null)
const isMuted = ref(true)
const isPlaying = ref(true)

function toggleMute() {
  if (!videoEl.value) return
  isMuted.value = !isMuted.value
  videoEl.value.muted = isMuted.value
}

async function togglePlay() {
  if (!videoEl.value) return
  if (videoEl.value.paused) {
    try { await videoEl.value.play() } catch { /* autoplay policy may block it */ }
    isPlaying.value = !videoEl.value.paused
  } else {
    videoEl.value.pause()
    isPlaying.value = false
  }
}

function onPlay()  { isPlaying.value = true  }
function onPause() { isPlaying.value = false }
</script>

<template>
  <div class="relative rounded-2xl overflow-hidden group bg-gray-50 dark:bg-white/[0.025]">
    <!-- ═══ YouTube iframe (autoplay muted loop via embed params) ═══ -->
    <div v-if="isYouTube" class="relative">
      <iframe
        :src="youtubeEmbedUrl"
        :title="label"
        class="block w-full aspect-video bg-primary"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
      />
      <!-- YouTube iframe handles its own controls; we just stamp an unobtrusive provider chip -->
      <div
        aria-hidden="true"
        class="absolute top-4 start-4 inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-semibold opacity-0 group-hover:opacity-70 transition-opacity pointer-events-none"
      >
        <UIcon name="i-simple-icons-youtube" class="size-3 text-red-500" />
        <span>YouTube</span>
      </div>
    </div>

    <!-- ═══ Native <video> surface ═══ -->
    <div v-else-if="hasVideo" class="relative">
      <video
        ref="videoEl"
        :src="videoUrl"
        :poster="posterUrl || undefined"
        autoplay
        muted
        loop
        playsinline
        preload="metadata"
        class="block w-full aspect-video object-cover bg-primary cursor-pointer"
        :aria-label="label"
        @click="toggleMute"
        @play="onPlay"
        @pause="onPause"
      />

      <!-- Controls overlay — bottom-end corner, visible on hover + touch -->
      <div class="absolute bottom-4 end-4 flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
        <button
          type="button"
          class="size-10 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          :aria-label="isPlaying ? copy.ui.pauseVideo : copy.ui.playVideo"
          @click="togglePlay"
        >
          <UIcon :name="isPlaying ? 'i-lucide-pause' : 'i-lucide-play'" class="size-4" />
        </button>
        <button
          type="button"
          class="size-10 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          :aria-label="isMuted ? copy.ui.unmuteVideo : copy.ui.muteVideo"
          @click="toggleMute"
        >
          <UIcon :name="isMuted ? 'i-lucide-volume-x' : 'i-lucide-volume-2'" class="size-4" />
        </button>
      </div>

      <!-- Muted indicator pill -->
      <div
        v-if="isMuted"
        aria-hidden="true"
        class="absolute top-4 start-4 inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white text-[10px] uppercase tracking-[0.2em] font-semibold opacity-70 group-hover:opacity-100 transition-opacity"
      >
        <UIcon name="i-lucide-volume-x" class="size-3" />
        <span>{{ copy.ui.mutedIndicator || 'muted' }}</span>
      </div>
    </div>

    <!-- ═══ Coming-soon placeholder (no video yet) ═══ -->
    <div v-else class="relative aspect-video flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      <!-- Soft color wash matching the module accent -->
      <div aria-hidden="true" class="absolute inset-0 bg-gradient-to-br opacity-[0.08]" :class="accent" />
      <div aria-hidden="true" class="absolute -top-24 -end-24 size-64 rounded-full bg-gradient-to-br blur-3xl opacity-20" :class="accent" />

      <div class="relative">
        <!-- Play icon in a soft tinted halo -->
        <div class="relative mx-auto mb-6 size-20 rounded-full bg-gradient-to-br text-white flex items-center justify-center shadow-lg" :class="accent">
          <span aria-hidden="true" class="absolute inset-0 rounded-full bg-white/5 animate-ping [animation-duration:3s]" />
          <UIcon name="i-lucide-video" class="relative size-8" />
        </div>

        <p class="text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400 mb-3">{{ copy.ui.videoComingSoonEyebrow }}</p>
        <p class="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 max-w-md leading-relaxed">
          {{ comingSoonLabel || copy.ui.videoComingSoon }}
        </p>
      </div>
    </div>
  </div>
</template>

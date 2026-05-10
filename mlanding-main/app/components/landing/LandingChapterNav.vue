<script setup>
// Sticky section/filter nav. Old design was a horizontally-scrolling row of
// chips (overflow-x-auto, scrollbar-none) — chips beyond the viewport edge
// were unreachable on small screens and easy to miss on desktop.
//
// New design: compact summary bar (active state on the start, popover trigger
// on the end) → tap opens a 2-column grid containing every chip, fully
// visible at any viewport width. Works for both filter mode (`asFilter` true,
// emits `update:active`) and anchor mode (`<a href="#section">`).

const props = defineProps({
  items:    { type: Array,  required: true },
  active:   { type: String, default: null },
  asFilter: { type: Boolean, default: false }
})
const emit = defineEmits(['update:active'])

const copy = useLandingCopy()

const open = ref(false)
const activeItem = computed(() =>
  props.items.find(i => i.id === props.active) ?? props.items[0] ?? null
)

function selectFilter(id) {
  emit('update:active', id)
  open.value = false
}
</script>

<template>
  <section class="sticky top-16 z-20 bg-white/90 dark:bg-black/80 backdrop-blur-xl border-y border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8 py-2.5 sm:py-3 flex items-center gap-3">
      <!-- ─── Compact summary (start) ─── -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <UIcon
          :name="asFilter ? 'i-lucide-list-filter' : 'i-lucide-list'"
          class="size-4 text-gray-400 shrink-0"
        />
        <p class="hidden sm:inline text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-bold text-gray-500 shrink-0">
          {{ asFilter ? copy.ui.navFilterLabel : copy.ui.navSectionsLabel }}
        </p>
        <span aria-hidden="true" class="hidden sm:inline-block w-px h-4 bg-black/15 dark:bg-white/15 shrink-0" />

        <!-- Filter mode: surface the currently-active group + count -->
        <span v-if="asFilter && activeItem" class="inline-flex items-center gap-2 min-w-0">
          <span v-if="activeItem.dot" :class="['size-1.5 rounded-full shrink-0', activeItem.dot]" />
          <span class="text-sm font-bold truncate">{{ activeItem.label }}</span>
          <span
            v-if="activeItem.count != null"
            class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-bold tabular-nums shrink-0"
          >{{ activeItem.count }}</span>
        </span>

        <!-- Anchor mode: just the count -->
        <span v-else class="text-sm text-gray-500 truncate">
          <span class="font-bold tabular-nums text-gray-700 dark:text-gray-300">{{ items.length }}</span>
          <span class="ms-1.5">{{ copy.ui.navSectionsLabel.toLowerCase() }}</span>
        </span>
      </div>

      <!-- ─── Popover trigger (end) ─── -->
      <UPopover v-model:open="open" :content="{ side: 'bottom', align: 'end', sideOffset: 8 }">
        <button
          type="button"
          class="inline-flex items-center gap-2 h-10 sm:h-10 ps-3 pe-3 sm:pe-4 rounded-full bg-black/[0.04] dark:bg-white/[0.06] ring-1 ring-black/10 dark:ring-white/10 text-xs sm:text-sm font-semibold hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-colors shrink-0"
        >
          <UIcon name="i-lucide-grid-2x2" class="size-4" />
          <span class="hidden sm:inline">{{ asFilter ? copy.ui.navBrowseGroups : copy.ui.navBrowseSections }}</span>
          <span
            class="inline-flex sm:hidden items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] text-[10px] font-black tabular-nums"
          >{{ items.length }}</span>
          <UIcon
            name="i-lucide-chevron-down"
            class="size-3.5 transition-transform duration-200"
            :class="open && 'rotate-180'"
          />
        </button>

        <template #content>
          <div class="p-3 w-[min(calc(100vw-2rem),28rem)]">
            <div class="px-1.5 pt-0.5 pb-2.5 flex items-center justify-between gap-2">
              <span class="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                {{ asFilter ? copy.ui.navAllGroups : copy.ui.navAllSections }}
              </span>
              <span class="text-[10px] tabular-nums text-gray-400 font-bold">{{ items.length }}</span>
            </div>

            <!-- Filter mode: buttons -->
            <div v-if="asFilter" class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto">
              <button
                v-for="c in items"
                :key="c.id"
                type="button"
                class="group flex items-center justify-between gap-2 px-3 h-10 rounded-xl text-sm font-semibold text-start transition-colors"
                :class="active === c.id
                  ? 'bg-primary text-white dark:bg-white dark:text-primary'
                  : 'hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300'"
                @click="selectFilter(c.id)"
              >
                <span class="inline-flex items-center gap-2 min-w-0">
                  <span v-if="c.dot" :class="['size-1.5 rounded-full shrink-0', c.dot]" />
                  <span class="truncate">{{ c.label }}</span>
                </span>
                <span
                  v-if="c.count != null"
                  class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[10px] font-bold tabular-nums shrink-0"
                  :class="active === c.id
                    ? 'bg-white/20 dark:bg-primary/15'
                    : 'bg-black/5 dark:bg-white/10'"
                >{{ c.count }}</span>
              </button>
            </div>

            <!-- Anchor mode: links -->
            <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto">
              <a
                v-for="c in items"
                :key="c.id"
                :href="`#${c.id}`"
                class="group flex items-center justify-between gap-2 px-3 h-10 rounded-xl text-sm font-semibold text-start transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300"
                @click="open = false"
              >
                <span class="inline-flex items-center gap-2 min-w-0">
                  <span v-if="c.dot" :class="['size-1.5 rounded-full shrink-0', c.dot]" />
                  <span class="truncate">{{ c.label }}</span>
                </span>
                <span
                  v-if="c.count != null"
                  class="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full bg-black/5 dark:bg-white/10 text-[10px] font-bold tabular-nums shrink-0"
                >{{ c.count }}</span>
              </a>
            </div>
          </div>
        </template>
      </UPopover>
    </div>
  </section>
</template>

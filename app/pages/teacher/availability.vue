<script setup lang="ts">
import { format, addDays, addMonths, isAfter, isSameDay, parseISO } from 'date-fns'

const { t } = useI18n()

definePageMeta({ authorize: ['TEACHER', 'ADMIN'] })

useSeoMeta({ title: `${t('teacher.availability')} · ${t('app.title')}` })

// ── Week navigation ────────────────────────────────────────────────
const today = new Date()
today.setHours(0, 0, 0, 0)

function getMonday(d: Date): Date {
  const date = new Date(d)
  date.setHours(0, 0, 0, 0)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(date.setDate(diff))
}

const weekStart = ref(getMonday(today))
const maxWeekStart = addMonths(today, 3)

const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const d = addDays(weekStart.value, i)
    return {
      date: d,
      dateStr: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE'),
      dayNum: format(d, 'd MMM')
    }
  })
)

const weekLabel = computed(() => {
  const end = addDays(weekStart.value, 6)
  return `${format(weekStart.value, 'd MMM')} – ${format(end, 'd MMM yyyy')}`
})

const canGoNext = computed(() => {
  const next = addDays(weekStart.value, 7)
  return !isAfter(next, maxWeekStart)
})

function prevWeek() {
  weekStart.value = addDays(weekStart.value, -7)
}

function nextWeek() {
  const next = addDays(weekStart.value, 7)
  if (!isAfter(next, maxWeekStart)) {
    weekStart.value = next
  }
}

function goToToday() {
  weekStart.value = getMonday(today)
}

// ── Time slots (hourly increments) ─────────────────────────────────
const timeSlots = Array.from({ length: 24 }, (_, i) => i * 60)

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:00 ${ampm}`
}

function formatTimeLabel(m: number): string {
  const h = Math.floor(m / 60)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:00 ${ampm}`
}

// ── Data fetching ──────────────────────────────────────────────────
const weekFrom = computed(() => format(weekStart.value, 'yyyy-MM-dd'))
const weekTo = computed(() => format(addDays(weekStart.value, 6), 'yyyy-MM-dd'))

const { data: weekData, refresh: refreshWeek } = await useFetch('/api/teacher/availability', {
  query: computed(() => ({ from: weekFrom.value, to: weekTo.value }))
})

const { data: allData, refresh: refreshAll } = await useFetch('/api/teacher/availability')

// ── Selected slots ─────────────────────────────────────────────────
const selected = ref<Set<string>>(new Set())

function slotKey(dateStr: string, minutes: number): string {
  return `${dateStr}-${minutes.toString().padStart(4, '0')}`
}

function isSlotSelected(dateStr: string, minutes: number): boolean {
  return selected.value.has(slotKey(dateStr, minutes))
}

function loadFromAvailability(entries: any[]) {
  const set = new Set<string>()
  for (const entry of entries) {
    for (let m = entry.startTime; m < entry.endTime; m += 60) {
      set.add(slotKey(entry.date, m))
    }
  }
  selected.value = set
}

watch(() => weekData.value?.availability, (entries) => {
  loadFromAvailability(entries || [])
}, { immediate: true })

// ── Drag / shift-click selection ───────────────────────────────────
const isDragging = ref(false)
const dragMode = ref<'add' | 'remove'>('add')
const draggedCells = ref<Set<string>>(new Set())
const lastAnchor = ref<{ dateStr: string; minutes: number; mode: 'add' | 'remove' } | null>(null)

function setSlot(dateStr: string, minutes: number, mode: 'add' | 'remove') {
  const k = slotKey(dateStr, minutes)
  const next = new Set(selected.value)
  if (mode === 'add') next.add(k)
  else next.delete(k)
  selected.value = next
}

function selectRange(
  fromDate: string,
  fromMinutes: number,
  toDate: string,
  toMinutes: number,
  mode: 'add' | 'remove'
) {
  const fromDayIdx = weekDays.value.findIndex(d => d.dateStr === fromDate)
  const toDayIdx = weekDays.value.findIndex(d => d.dateStr === toDate)
  if (fromDayIdx === -1 || toDayIdx === -1) return

  const dayStart = Math.min(fromDayIdx, toDayIdx)
  const dayEnd = Math.max(fromDayIdx, toDayIdx)
  const timeStart = Math.min(fromMinutes, toMinutes)
  const timeEnd = Math.max(fromMinutes, toMinutes)

  for (let d = dayStart; d <= dayEnd; d++) {
    const dateStr = weekDays.value[d]!.dateStr
    for (let t = timeStart; t <= timeEnd; t += 60) {
      setSlot(dateStr, t, mode)
    }
  }
}

function onCellMouseDown(dateStr: string, minutes: number, event?: MouseEvent) {
  const k = slotKey(dateStr, minutes)

  // Shift+click range selection
  if (event?.shiftKey && lastAnchor.value) {
    const anchor = lastAnchor.value
    selectRange(anchor.dateStr, anchor.minutes, dateStr, minutes, anchor.mode)
    return
  }

  // Normal click / drag start
  isDragging.value = true
  draggedCells.value = new Set()
  const currentlySelected = selected.value.has(k)
  dragMode.value = currentlySelected ? 'remove' : 'add'
  draggedCells.value.add(k)
  setSlot(dateStr, minutes, dragMode.value)

  // Remember anchor for next shift+click
  lastAnchor.value = { dateStr, minutes, mode: dragMode.value }
}

function onCellMouseEnter(dateStr: string, minutes: number) {
  if (!isDragging.value) return
  const k = slotKey(dateStr, minutes)
  if (draggedCells.value.has(k)) return
  draggedCells.value.add(k)
  setSlot(dateStr, minutes, dragMode.value)
}

function onGlobalMouseUp() {
  isDragging.value = false
  draggedCells.value = new Set()
}

function onGlobalTouchEnd() {
  isDragging.value = false
  draggedCells.value = new Set()
}

function onTouchMove(e: TouchEvent) {
  if (!isDragging.value) return
  e.preventDefault()
  const touch = e.touches[0]
  if (!touch) return
  const el = document.elementFromPoint(touch.clientX, touch.clientY)
  if (!el) return
  const cell = el.closest('[data-slot]') as HTMLElement | null
  if (!cell) return
  const ds = cell.getAttribute('data-date')
  const mins = cell.getAttribute('data-minutes')
  if (ds && mins) {
    const m = parseInt(mins, 10)
    const k = slotKey(ds, m)
    if (!draggedCells.value.has(k)) {
      draggedCells.value.add(k)
      setSlot(ds, m, dragMode.value)
    }
  }
}

onMounted(() => {
  window.addEventListener('mouseup', onGlobalMouseUp)
  window.addEventListener('touchend', onGlobalTouchEnd)
  window.addEventListener('touchcancel', onGlobalTouchEnd)
})

onUnmounted(() => {
  window.removeEventListener('mouseup', onGlobalMouseUp)
  window.removeEventListener('touchend', onGlobalTouchEnd)
  window.removeEventListener('touchcancel', onGlobalTouchEnd)
})

// ── Save ───────────────────────────────────────────────────────────
function buildRanges(): { date: string; startTime: number; endTime: number }[] {
  const byDate = new Map<string, number[]>()
  for (const k of selected.value) {
    const lastDash = k.lastIndexOf('-')
    const dateStr = k.slice(0, lastDash)
    const minutes = parseInt(k.slice(lastDash + 1), 10)
    const arr = byDate.get(dateStr) || []
    arr.push(minutes)
    byDate.set(dateStr, arr)
  }

  const ranges: { date: string; startTime: number; endTime: number }[] = []
  for (const [dateStr, minutesArr] of byDate) {
    const sorted = [...minutesArr].sort((a, b) => a - b)
    if (sorted.length === 0) continue
    let start: number = sorted[0]!
    let end = start + 60
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end) {
        end += 60
      } else {
        ranges.push({ date: dateStr, startTime: start, endTime: end })
        start = sorted[i]!
        end = start + 60
      }
    }
    ranges.push({ date: dateStr, startTime: start, endTime: end })
  }
  return ranges
}

const saving = ref(false)

async function save() {
  saving.value = true
  try {
    const slots = buildRanges()
    await $fetch('/api/teacher/availability', {
      method: 'POST',
      body: { slots }
    })
    await Promise.all([refreshWeek(), refreshAll()])
  } catch (err: any) {
    alert(err.message || 'Failed to save')
  } finally {
    saving.value = false
  }
}

function clearWeek() {
  for (const day of weekDays.value) {
    const next = new Set(selected.value)
    for (const time of timeSlots) {
      next.delete(slotKey(day.dateStr, time))
    }
    selected.value = next
  }
}

const selectedCount = computed(() => {
  let count = 0
  for (const day of weekDays.value) {
    for (const time of timeSlots) {
      if (isSlotSelected(day.dateStr, time)) count++
    }
  }
  return count
})

const selectedHours = computed(() => selectedCount.value.toFixed(0))

// ── Future entries list ────────────────────────────────────────────
const futureEntries = computed(() => {
  const entries = allData.value?.availability || []
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  return entries.filter((e: any) => e.date >= todayStr)
})

async function deleteEntry(id: number) {
  if (!confirm(t('common.delete') + '?')) return
  await $fetch(`/api/teacher/availability/${id}`, { method: 'DELETE' })
  await Promise.all([refreshWeek(), refreshAll()])
}

function formatListDate(dateStr: string): string {
  return format(parseISO(dateStr + 'T00:00:00'), 'EEEE, d MMMM')
}

// ── Cell styling ───────────────────────────────────────────────────
function cellClasses(dateStr: string, time: number): string {
  const sel = isSlotSelected(dateStr, time)
  const parts = [
    'cursor-pointer transition-colors duration-75',
    'border-t border-t-neutral-200'
  ]
  if (sel) {
    parts.push('bg-primary hover:bg-primary/90')
  } else {
    parts.push('bg-white hover:bg-primary/[0.06]')
  }
  return parts.join(' ')
}
</script>

<template>
  <div class="flex flex-col h-full gap-5">

    <!-- Toolbar -->
    <div class="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <!-- Legend -->
      <div class="flex items-center gap-5 text-sm">
        <div class="flex items-center gap-2">
          <div class="w-3.5 h-3.5 rounded-sm bg-primary shadow-sm" />
          <span class="text-muted-foreground">{{ t('teacher.available') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3.5 h-3.5 rounded-sm border border-accented bg-white" />
          <span class="text-muted-foreground">{{ t('teacher.notAvailable') }}</span>
        </div>
        <span class="hidden sm:inline text-muted-foreground text-xs ml-1">· {{ t('teacher.dragHint') }} · {{ t('teacher.shiftHint') }}</span>
      </div>

      <!-- Week nav -->
      <div class="flex items-center gap-1.5">
        <UButton size="sm" variant="ghost" icon="i-lucide-chevron-left" @click="prevWeek" />
        <span class="font-semibold text-sm min-w-[170px] text-center tabular-nums">{{ weekLabel }}</span>
        <UButton size="sm" variant="ghost" icon="i-lucide-chevron-right" :disabled="!canGoNext" @click="nextWeek" />
        <UButton size="sm" variant="soft" color="neutral" class="ml-2" @click="goToToday">
          {{ t('common.today') }}
        </UButton>
      </div>
    </div>

    <!-- Calendar grid -->
    <UCard class="flex-1 min-h-0 border border-accented overflow-hidden flex flex-col">
      <div
        class="flex-1 min-h-0"
        style="user-select: none; -webkit-user-select: none;"
        @touchmove="onTouchMove"
      >
        <div
          class="grid h-full"
          style="grid-template-columns: 64px repeat(7, 1fr); grid-template-rows: auto repeat(24, minmax(28px, 1fr));"
        >
          <!-- Corner -->
          <div class="sticky top-0 left-0 bg-white z-30 border-b border-r border-accented" />

          <!-- Day headers -->
          <div
            v-for="day in weekDays"
            :key="day.dateStr"
            class="sticky top-0 bg-white z-20 border-b border-r border-accented py-2.5 px-1 text-center"
            :class="isSameDay(day.date, today) ? 'bg-primary/5' : ''"
          >
            <div class="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {{ day.label }}
            </div>
            <div
              class="font-bold text-sm mt-0.5"
              :class="isSameDay(day.date, today) ? 'text-primary' : 'text-neutral-900'"
            >
              {{ day.dayNum }}
            </div>
          </div>

          <!-- Time rows -->
          <template v-for="time in timeSlots" :key="time">
            <div
              class="text-[11px] text-right pr-2.5 text-muted-foreground border-r border-accented flex items-center justify-end font-medium"
            >
              <span class="whitespace-nowrap">{{ formatTimeLabel(time) }}</span>
            </div>
            <div
              v-for="day in weekDays"
              :key="day.dateStr + '-' + time"
              :class="cellClasses(day.dateStr, time)"
              class="border-r border-accented"
              data-slot
              :data-date="day.dateStr"
              :data-minutes="time"
              @mousedown.prevent="onCellMouseDown(day.dateStr, time, $event)"
              @mouseenter="onCellMouseEnter(day.dateStr, time)"
              @touchstart.prevent="onCellMouseDown(day.dateStr, time)"
            />
          </template>
        </div>
      </div>
    </UCard>

    <!-- Actions -->
    <div class="shrink-0 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UButton
          size="sm"
          variant="ghost"
          color="neutral"
          icon="i-lucide-trash-2"
          @click="clearWeek"
        >
          {{ t('teacher.clearWeek') }}
        </UButton>
        <span v-if="selectedCount > 0" class="text-sm text-muted-foreground">
          {{ selectedHours }} {{ t('teacher.hoursSelected') }}
        </span>
      </div>
      <UButton
        color="primary"
        size="lg"
        :loading="saving"
        icon="i-lucide-check"
        @click="save"
      >
        {{ t('common.save') }}
      </UButton>
    </div>

    <!-- Upcoming availability list -->
    <div class="shrink-0 space-y-3 pt-2 max-h-[220px] overflow-auto">
      <h3 class="font-semibold text-base">{{ t('teacher.upcomingAvailability') }}</h3>

      <div
        v-if="futureEntries.length === 0"
        class="text-muted-foreground text-sm py-6 border border-accented rounded-lg text-center bg-neutral-50/30"
      >
        {{ t('teacher.noAvailability') }}
      </div>

      <div v-else class="space-y-2">
        <div
          v-for="entry in futureEntries"
          :key="entry.id"
          class="flex items-center justify-between border border-accented rounded-lg px-4 py-3 bg-white transition-colors hover:bg-neutral-50/40"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0"
            >
              <UIcon name="i-lucide-calendar" class="text-primary text-sm" />
            </div>
            <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <span class="font-medium text-sm">{{ formatListDate(entry.date) }}</span>
              <span class="text-muted-foreground text-xs sm:text-sm">
                {{ formatMinutes(entry.startTime) }} – {{ formatMinutes(entry.endTime) }}
              </span>
            </div>
          </div>
          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            @click="deleteEntry(entry.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

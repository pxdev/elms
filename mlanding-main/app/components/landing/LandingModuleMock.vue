<script setup lang="ts">
defineProps<{ id: string; color?: string }>()
</script>

<template>
  <!-- ════ Calendar — Day view: matches the APP toolbar (Today · date · view tabs ·
       team filter · + Add), 12-hour gutter, 4 staff lanes with avatar+name centred,
       diagonal-hatch empty grid, red horizontal "now" line. ════ -->
  <div v-if="id === 'calendar'" class="w-full text-[9px]">
    <!-- Top toolbar: Today | < date > | view tabs | filters | + Add -->
    <div class="flex items-center gap-1.5 mb-3">
      <span class="px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10 text-[7px] font-bold text-gray-700 dark:text-gray-300">Today</span>
      <span class="size-3.5 rounded border border-black/10 dark:border-white/10 flex items-center justify-center text-[8px] text-gray-500">‹</span>
      <span class="text-[9px] font-black tabular-nums text-gray-900 dark:text-white">Fri, 01/05/26</span>
      <span class="size-3.5 rounded border border-black/10 dark:border-white/10 flex items-center justify-center text-[8px] text-gray-500">›</span>
      <div class="mx-auto flex gap-0.5 bg-black/5 dark:bg-white/10 rounded-full p-0.5 font-bold text-[7px]">
        <span class="px-1.5 py-0.5 rounded-full bg-white dark:bg-black text-gray-900 dark:text-white shadow-sm">Day</span>
        <span class="px-1.5 py-0.5 text-gray-500">3 Day</span>
        <span class="px-1.5 py-0.5 text-gray-500">Week</span>
        <span class="px-1.5 py-0.5 text-gray-500">Month</span>
        <span class="px-1.5 py-0.5 text-gray-500">Agenda</span>
      </div>
      <span class="px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[7px] font-bold text-gray-700 dark:text-gray-300 inline-flex items-center gap-1">
        <UIcon name="i-lucide-users" class="size-2" />Team
      </span>
      <span class="px-1.5 py-0.5 rounded bg-primary text-white text-[7px] font-bold inline-flex items-center gap-0.5">
        <UIcon name="i-lucide-plus" class="size-2" />Add
      </span>
    </div>

    <!-- Calendar grid: time gutter + 4 staff lanes (matches APP) -->
    <div class="flex gap-1.5 relative">
      <!-- Time gutter (12-hour with am/pm like the APP) -->
      <div class="w-7 pt-7 flex flex-col text-[7px] text-gray-400 tabular-nums leading-none">
        <span v-for="h in ['9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM']" :key="h" class="h-[22px]">{{ h }}</span>
      </div>

      <!-- Staff lanes -->
      <div class="flex-1 grid grid-cols-4 gap-1 relative">
        <!-- Diagonal hatching baseline — drawn behind the lanes via SVG, mirrors the APP's empty grid -->
        <div aria-hidden="true" class="absolute inset-x-0 top-7 bottom-0 pointer-events-none rounded opacity-[0.5]" style="background-image: repeating-linear-gradient(45deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 8px);" />

        <!-- Lane: Sarah Johnson -->
        <div class="relative">
          <div class="flex flex-col items-center mb-1 pb-1 border-b border-black/10 dark:border-white/10">
            <div class="size-4 rounded-full bg-secondary-100 dark:bg-secondary-900/40 text-secondary-700 dark:text-secondary-300 ring-1 ring-secondary-300 text-[6px] font-black flex items-center justify-center">SJ</div>
            <span class="mt-0.5 text-[7px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">Sarah</span>
          </div>
          <div class="relative space-y-0.5">
            <div class="h-[43px] rounded bg-gradient-to-br from-secondary-400 to-rose-500 text-white px-1 py-0.5 flex flex-col justify-between leading-tight shadow-sm shadow-rose-500/25">
              <p class="font-black text-[8px] truncate">Color & Cut</p>
              <p class="text-[7px] opacity-90 truncate">Lina H.</p>
            </div>
            <div class="h-[21px] rounded bg-gray-200 dark:bg-white/5 text-gray-500 px-1 flex items-center text-[7px] font-semibold">
              <UIcon name="i-lucide-coffee" class="size-2.5 me-1" />Break
            </div>
            <div class="h-[43px] rounded bg-gradient-to-br from-secondary-400 to-secondary-500 text-white px-1 py-0.5 flex flex-col justify-between leading-tight shadow-sm">
              <p class="font-black text-[8px] truncate">Facial</p>
              <p class="text-[7px] opacity-90 truncate">Noura S.</p>
            </div>
          </div>
        </div>

        <!-- Lane: Ahmed Hassan -->
        <div class="relative">
          <div class="flex flex-col items-center mb-1 pb-1 border-b border-black/10 dark:border-white/10">
            <div class="size-4 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-300 text-[6px] font-black flex items-center justify-center">AH</div>
            <span class="mt-0.5 text-[7px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">Ahmed</span>
          </div>
          <div class="relative space-y-0.5">
            <div class="h-[21px] rounded bg-gradient-to-br from-secondary-400 to-secondary-500 text-white px-1 flex items-center text-[7px] font-bold">
              <span class="truncate">Consult</span>
            </div>
            <div class="h-[32px] rounded bg-gradient-to-br from-emerald-400 to-secondary-500 text-white px-1 py-0.5 flex flex-col justify-center leading-tight">
              <p class="font-black text-[7px] truncate">Deep Tissue</p>
              <p class="text-[6px] opacity-90 truncate">60 min</p>
            </div>
            <div class="h-[32px] rounded border border-secondary-500/50 bg-secondary-500/5 text-secondary-700 dark:text-secondary-300 px-1 py-0.5 flex flex-col justify-center leading-tight">
              <p class="font-black text-[7px] truncate">Trim</p>
              <p class="text-[6px] opacity-80 truncate">Omar R.</p>
            </div>
          </div>
        </div>

        <!-- Lane: Lina Rashid -->
        <div class="relative">
          <div class="flex flex-col items-center mb-1 pb-1 border-b border-black/10 dark:border-white/10">
            <div class="size-4 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 ring-1 ring-violet-300 text-[6px] font-black flex items-center justify-center">LR</div>
            <span class="mt-0.5 text-[7px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">Lina</span>
          </div>
          <div class="relative space-y-0.5">
            <div class="h-[32px] rounded bg-gradient-to-br from-amber-400 to-orange-500 text-white px-1 py-0.5 flex flex-col justify-center leading-tight">
              <p class="font-black text-[7px] truncate">Waxing</p>
              <p class="text-[6px] opacity-90 truncate">Rania K.</p>
            </div>
            <div class="h-[21px] rounded border border-dashed border-gray-300 dark:border-white/20 text-gray-400 flex items-center justify-center text-[7px] font-semibold">
              + Add
            </div>
            <div class="h-[43px] rounded bg-gradient-to-br from-pink-400 to-rose-500 text-white px-1 py-0.5 flex flex-col justify-between leading-tight">
              <p class="font-black text-[7px] truncate">Lash Set</p>
              <p class="text-[6px] opacity-90 truncate">Mona F.</p>
            </div>
          </div>
        </div>

        <!-- Lane: Ahmed Amin -->
        <div class="relative">
          <div class="flex flex-col items-center mb-1 pb-1 border-b border-black/10 dark:border-white/10">
            <div class="size-4 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-300 text-[6px] font-black flex items-center justify-center">AA</div>
            <span class="mt-0.5 text-[7px] font-semibold text-gray-700 dark:text-gray-300 truncate max-w-full">Ahmed</span>
          </div>
          <div class="relative space-y-0.5">
            <div class="h-[43px] rounded bg-gradient-to-br from-sky-400 to-secondary-500 text-white px-1 py-0.5 flex flex-col justify-between leading-tight">
              <p class="font-black text-[7px] truncate">Massage 90</p>
              <p class="text-[6px] opacity-90 truncate">Karim M.</p>
            </div>
            <div class="h-[21px] rounded border border-dashed border-gray-300 dark:border-white/20 text-gray-400 flex items-center justify-center text-[7px] font-semibold">
              + Add
            </div>
            <div class="h-[32px] rounded bg-gradient-to-br from-emerald-400 to-teal-500 text-white px-1 py-0.5 flex flex-col justify-center leading-tight">
              <p class="font-black text-[7px] truncate">Manicure</p>
              <p class="text-[6px] opacity-90 truncate">Sara K.</p>
            </div>
          </div>
        </div>

        <!-- Red horizontal "now" line spanning every lane (real APP) -->
        <div aria-hidden="true" class="absolute start-0 end-0 top-[88px] flex items-center gap-0 pointer-events-none">
          <span class="absolute -start-7 -translate-y-1/2 px-1 py-px rounded-sm bg-rose-500 text-white text-[6px] font-black tabular-nums">2:00 PM</span>
          <span class="size-1.5 rounded-full bg-rose-500" />
          <span class="flex-1 h-px bg-rose-500" />
        </div>
      </div>
    </div>

    <!-- Footer: today's quick stats (mirror dashboard appointment KPI tone) -->
    <div class="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex items-center gap-3 text-[8px] font-semibold">
      <span class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
        <span aria-hidden="true" class="size-1.5 rounded-full bg-amber-500" />
        Waitlist 2
      </span>
      <span class="inline-flex items-center gap-1 text-secondary-600 dark:text-secondary-400">
        <span aria-hidden="true" class="size-1.5 rounded-full bg-secondary-500" />
        Unconfirmed 1
      </span>
      <span class="ms-auto inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <UIcon name="i-lucide-check-circle-2" class="size-2.5" />
        On time 100%
      </span>
    </div>
  </div>

  <!-- ════ Sales / POS — Daily Summary screen: KPI strip across the top, then a
       Transaction summary table (Services / Products / Memberships) plus a Cash
       movement summary by payment type — exactly as the APP renders. SAR shown
       with the new Saudi Riyal glyph (U+20C1) the way receipts print. ════ -->
  <div v-else-if="id === 'sales'" class="w-full text-[9px]">
    <!-- Header: title + Today chip + + New Sale -->
    <div class="flex items-center justify-between mb-2">
      <div>
        <p class="text-[10px] font-black text-gray-900 dark:text-white tracking-tight leading-none">Daily Summary</p>
        <p class="text-[7px] text-gray-400 mt-0.5">Today's revenue, transactions & cash movement</p>
      </div>
      <div class="flex items-center gap-1">
        <span class="px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10 text-[7px] font-bold text-gray-700 dark:text-gray-300 inline-flex items-center gap-0.5">
          <UIcon name="i-lucide-calendar" class="size-2" />Today
        </span>
        <span class="px-1.5 py-0.5 rounded bg-primary text-white text-[7px] font-bold inline-flex items-center gap-0.5">
          <UIcon name="i-lucide-plus" class="size-2" />New Sale
        </span>
      </div>
    </div>

    <!-- KPI strip — same five tiles as the APP's Daily Summary -->
    <div class="grid grid-cols-5 gap-1 mb-2">
      <div class="p-1 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">Total Sales</p>
        <p class="text-[11px] font-black tabular-nums leading-tight">12</p>
      </div>
      <div class="p-1 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">Refunded</p>
        <p class="text-[11px] font-black tabular-nums leading-tight text-rose-600">1</p>
      </div>
      <div class="p-1 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">Gross</p>
        <p class="text-[11px] font-black tabular-nums leading-tight">﷼4,820</p>
      </div>
      <div class="p-1 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">Net Sales</p>
        <p class="text-[11px] font-black tabular-nums leading-tight">﷼4,580</p>
      </div>
      <div class="p-1 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">Collected</p>
        <p class="text-[11px] font-black tabular-nums leading-tight">﷼3,650</p>
      </div>
    </div>

    <!-- Two-up: Transaction summary + Cash movement summary -->
    <div class="grid grid-cols-2 gap-1.5">
      <!-- Transaction summary -->
      <div class="rounded-md border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] overflow-hidden">
        <p class="px-2 py-1 text-[8px] font-bold border-b border-black/5 dark:border-white/10">Transaction summary</p>
        <div class="px-2 py-1 grid grid-cols-[1fr_auto_auto] items-center gap-x-2 gap-y-0.5 text-[7px]">
          <span class="text-gray-400">Item type</span>
          <span class="text-gray-400 tabular-nums">Qty</span>
          <span class="text-gray-400 tabular-nums">Total</span>
          <span class="font-semibold">Services</span>
          <span class="tabular-nums">8</span>
          <span class="tabular-nums">﷼3,200</span>
          <span class="font-semibold">Products</span>
          <span class="tabular-nums">3</span>
          <span class="tabular-nums">﷼1,120</span>
          <span class="font-semibold">Memberships</span>
          <span class="tabular-nums">1</span>
          <span class="tabular-nums">﷼500</span>
          <span class="font-bold border-t border-black/5 dark:border-white/10 pt-0.5">Gross total</span>
          <span class="tabular-nums font-bold border-t border-black/5 dark:border-white/10 pt-0.5">12</span>
          <span class="tabular-nums font-bold border-t border-black/5 dark:border-white/10 pt-0.5">﷼4,820</span>
        </div>
      </div>

      <!-- Cash movement summary -->
      <div class="rounded-md border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] overflow-hidden">
        <p class="px-2 py-1 text-[8px] font-bold border-b border-black/5 dark:border-white/10">Cash movement</p>
        <div class="px-2 py-1 space-y-1 text-[7px]">
          <div class="flex items-center justify-between">
            <span class="px-1 py-px rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold">Cash</span>
            <span class="tabular-nums">﷼1,640</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="px-1 py-px rounded bg-secondary-500/15 text-secondary-700 dark:text-secondary-300 font-bold">Card</span>
            <span class="tabular-nums">﷼1,170</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="px-1 py-px rounded bg-black/[0.04] dark:bg-white/[0.06] font-bold">Bank Transfer</span>
            <span class="tabular-nums">﷼540</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="px-1 py-px rounded bg-black/[0.04] dark:bg-white/[0.06] font-bold">Other</span>
            <span class="tabular-nums">﷼300</span>
          </div>
          <div class="flex items-center justify-between border-t border-black/5 dark:border-white/10 pt-0.5 font-bold">
            <span>Collected total</span>
            <span class="tabular-nums">﷼3,650</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer: ZATCA cleared chip mirroring receipt status -->
    <div class="mt-2 pt-1.5 border-t border-black/5 dark:border-white/10 flex items-center gap-3 text-[7px] font-semibold">
      <span class="inline-flex items-center gap-1 text-gray-500"><UIcon name="i-lucide-banknote" class="size-2.5" />Cash 45%</span>
      <span class="inline-flex items-center gap-1 text-gray-500"><UIcon name="i-lucide-credit-card" class="size-2.5" />Card 32%</span>
      <span class="ms-auto inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <UIcon name="i-lucide-check-circle-2" class="size-2.5" />ZATCA cleared
      </span>
    </div>
  </div>

  <!-- ════ Clients / CRM — top bar + segment chips + client rows + footer stats ════ -->
  <!-- ════ Clients — list view: search + Date + Filters bar, then a client table
       with the APP's columns (Client name + email · Phone · Appointments · Created),
       monogram avatars, "+ Add Client" CTA. Tabs across top match the sub-nav. ════ -->
  <div v-else-if="id === 'clients'" class="w-full text-[9px]">
    <!-- Header: title + import/export + + Add Client -->
    <div class="flex items-center justify-between mb-2">
      <div>
        <p class="text-[10px] font-black text-gray-900 dark:text-white tracking-tight leading-none">Clients</p>
        <p class="text-[7px] text-gray-400 mt-0.5">Manage your client database</p>
      </div>
      <div class="flex items-center gap-1">
        <span class="size-4 rounded border border-black/10 dark:border-white/10 flex items-center justify-center"><UIcon name="i-lucide-upload" class="size-2 text-gray-500" /></span>
        <span class="size-4 rounded border border-black/10 dark:border-white/10 flex items-center justify-center"><UIcon name="i-lucide-download" class="size-2 text-gray-500" /></span>
        <span class="px-1.5 py-0.5 rounded bg-primary text-white text-[7px] font-bold inline-flex items-center gap-0.5">
          <UIcon name="i-lucide-plus" class="size-2" />Add Client
        </span>
      </div>
    </div>

    <!-- Sub-nav tabs (mirror left sub-nav: Clients list / Segments / Campaigns / Reviews) -->
    <div class="flex items-center gap-1 mb-2 text-[7px] font-semibold border-b border-black/5 dark:border-white/10">
      <span class="px-1.5 py-1 border-b-2 border-primary text-gray-900 dark:text-white">Clients list</span>
      <span class="px-1.5 py-1 text-gray-400">Segments</span>
      <span class="px-1.5 py-1 text-gray-400">Campaigns</span>
      <span class="px-1.5 py-1 text-gray-400">Reviews</span>
    </div>

    <!-- Search + Date + Filters + sort -->
    <div class="flex items-center gap-1 p-1 rounded bg-black/[0.03] dark:bg-white/[0.04] mb-1.5">
      <div class="flex-1 inline-flex items-center gap-1 px-1.5 h-4 rounded bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10 text-[7px] text-gray-400">
        <UIcon name="i-lucide-search" class="size-2.5" />Search clients…
      </div>
      <span class="px-1 h-4 rounded border border-black/10 dark:border-white/10 inline-flex items-center gap-0.5 text-[7px] text-gray-600 dark:text-gray-300"><UIcon name="i-lucide-calendar" class="size-2" />Date</span>
      <span class="px-1 h-4 rounded border border-black/10 dark:border-white/10 inline-flex items-center gap-0.5 text-[7px] text-gray-600 dark:text-gray-300"><UIcon name="i-lucide-filter" class="size-2" />Filters</span>
      <span class="px-1 h-4 rounded border border-black/10 dark:border-white/10 inline-flex items-center gap-0.5 text-[7px] text-gray-600 dark:text-gray-300">Newest</span>
    </div>

    <!-- Table header -->
    <div class="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-2 py-1 text-[6px] uppercase tracking-wider text-gray-400 font-bold">
      <span>Client name</span><span>Phone</span><span>Appts</span><span>Created</span>
    </div>

    <!-- Client rows — match the APP table -->
    <div class="space-y-px">
      <div
        v-for="c in [
          { n: 'Ali Bakr',         init: 'A', email: 'ali@demo.local',     phone: '+966 50 000 7777', appts: '6', date: '06/04/26', tone: 'violet' },
          { n: 'Fatima Ibrahim',   init: 'F', email: 'fatima@demo.local',  phone: '+966 50 000 2222', appts: '5', date: '06/04/26', tone: 'rose' },
          { n: 'Haya Sultan',      init: 'H', email: 'haya@demo.local',    phone: '+966 50 000 8888', appts: '3', date: '06/04/26', tone: 'sky' },
          { n: 'Khalid Mansoor',   init: 'K', email: 'khalid@demo.local',  phone: '+966 50 000 5555', appts: '3', date: '06/04/26', tone: 'amber' },
          { n: 'Mohammed Al-Saud', init: 'M', email: 'm@demo.local',       phone: '+966 50 000 1111', appts: '3', date: '06/04/26', tone: 'emerald' }
        ]" :key="c.init"
        class="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center px-2 py-1 rounded bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10"
      >
        <div class="flex items-center gap-1.5 min-w-0">
          <div class="size-4 rounded-full flex items-center justify-center text-[7px] font-black ring-1"
               :class="{
                 'bg-violet-100 text-violet-700 ring-violet-300':   c.tone === 'violet',
                 'bg-rose-100 text-rose-700 ring-rose-300':         c.tone === 'rose',
                 'bg-sky-100 text-sky-700 ring-sky-300':            c.tone === 'sky',
                 'bg-amber-100 text-amber-700 ring-amber-300':      c.tone === 'amber',
                 'bg-emerald-100 text-emerald-700 ring-emerald-300':c.tone === 'emerald'
               }">{{ c.init }}</div>
          <div class="min-w-0">
            <p class="text-[8px] font-bold truncate">{{ c.n }}</p>
            <p class="text-[6px] text-gray-400 truncate">{{ c.email }}</p>
          </div>
        </div>
        <span class="text-[7px] text-gray-600 dark:text-gray-300 tabular-nums whitespace-nowrap">{{ c.phone }}</span>
        <span class="text-[8px] tabular-nums text-center min-w-[1rem]">{{ c.appts }}</span>
        <span class="text-[7px] text-gray-500 tabular-nums whitespace-nowrap">{{ c.date }}</span>
      </div>
    </div>
  </div>

  <!-- ════ Marketing & Campaigns — composer preview + channel send + delivery stats ════ -->
  <div v-else-if="id === 'marketing'" class="w-full text-[9px] space-y-2.5">
    <!-- Header strip: campaign meta + status -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none">Spring Promo</p>
        <p class="text-[10px] text-gray-500 mt-0.5">Audience · Top spenders · 1,284</p>
      </div>
      <span class="inline-flex items-center gap-1 ps-1.5 pe-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[9px] font-bold uppercase tracking-wider ring-1 ring-amber-500/30">
        <span class="size-1 rounded-full bg-amber-500 animate-pulse" />
        Scheduled
      </span>
    </div>

    <!-- Channel mix -->
    <div class="grid grid-cols-4 gap-1.5">
      <div class="p-1.5 rounded-md bg-emerald-500/10 ring-1 ring-emerald-500/20 flex flex-col items-center gap-0.5">
        <UIcon name="i-lucide-message-square" class="size-3 text-emerald-600 dark:text-emerald-400" />
        <span class="text-[9px] font-bold">SMS</span>
      </div>
      <div class="p-1.5 rounded-md bg-secondary-500/10 ring-1 ring-secondary-500/20 flex flex-col items-center gap-0.5">
        <UIcon name="i-lucide-mail" class="size-3 text-secondary-600 dark:text-secondary-400" />
        <span class="text-[9px] font-bold">Email</span>
      </div>
      <div class="p-1.5 rounded-md bg-green-500/10 ring-1 ring-green-500/20 flex flex-col items-center gap-0.5">
        <UIcon name="i-simple-icons-whatsapp" class="size-3 text-green-600 dark:text-green-400" />
        <span class="text-[9px] font-bold">WA</span>
      </div>
      <div class="p-1.5 rounded-md bg-secondary-500/10 ring-1 ring-secondary-500/20 flex flex-col items-center gap-0.5">
        <UIcon name="i-lucide-bell" class="size-3 text-secondary-600 dark:text-secondary-400" />
        <span class="text-[9px] font-bold">Push</span>
      </div>
    </div>

    <!-- Composer preview row -->
    <div class="rounded-lg ring-1 ring-black/10 dark:ring-white/10 bg-gray-50 dark:bg-white/[0.025] p-2.5">
      <div class="flex items-center gap-1.5 mb-1">
        <UIcon name="i-lucide-edit-3" class="size-3 text-gray-400" />
        <span class="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Template · EN</span>
        <span class="ms-auto text-[9px] text-gray-400 tabular-nums">2 vars</span>
      </div>
      <p class="text-[10px] leading-snug text-gray-700 dark:text-gray-200">
        Hi <span class="px-1 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-300 font-bold">{name}</span>, enjoy 20% off your next visit before <span class="px-1 py-0.5 rounded bg-orange-500/15 text-orange-700 dark:text-orange-300 font-bold">{date}</span>.
      </p>
    </div>

    <!-- Delivery stats -->
    <div class="grid grid-cols-3 gap-1.5">
      <div class="p-1.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04]">
        <p class="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Sent</p>
        <p class="text-[11px] font-black tabular-nums text-gray-900 dark:text-white">1,284</p>
      </div>
      <div class="p-1.5 rounded-md bg-emerald-500/[0.08]">
        <p class="text-[9px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold">Delivered</p>
        <p class="text-[11px] font-black tabular-nums text-emerald-700 dark:text-emerald-300">98%</p>
      </div>
      <div class="p-1.5 rounded-md bg-orange-500/[0.08]">
        <p class="text-[9px] text-orange-700 dark:text-orange-400 uppercase tracking-wider font-bold">Rebook</p>
        <p class="text-[11px] font-black tabular-nums text-orange-700 dark:text-orange-300">+34%</p>
      </div>
    </div>
  </div>

  <!-- ════ Catalogue — category tabs + service rows with icons + footer ════ -->
  <!-- ════ Catalogue — Service menu screen: Add category / Add Service CTAs, KPI
       tile row (Total Services / Showing / Categories / Avg. Price), category
       chip filter, rows with SERVICE NAME · DURATION · BOOKINGS · TEAM · PRICE
       — copies the APP's column shape and Saudi Riyal symbol on prices. ════ -->
  <div v-else-if="id === 'catalogue'" class="w-full text-[9px]">
    <!-- Header: title + Add category + Add Service -->
    <div class="flex items-center justify-between mb-2">
      <div>
        <p class="text-[10px] font-black text-gray-900 dark:text-white tracking-tight leading-none">Service menu</p>
        <p class="text-[7px] text-gray-400 mt-0.5">View and manage the services your business offers</p>
      </div>
      <div class="flex items-center gap-1">
        <span class="px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10 text-[7px] font-bold inline-flex items-center gap-0.5">
          <UIcon name="i-lucide-folder-plus" class="size-2" />Add category
        </span>
        <span class="px-1.5 py-0.5 rounded bg-primary text-white text-[7px] font-bold inline-flex items-center gap-0.5">
          <UIcon name="i-lucide-plus" class="size-2" />Add Service
        </span>
      </div>
    </div>

    <!-- KPI tile row (matches the APP's hero strip on /catalogue/services) -->
    <div class="grid grid-cols-4 gap-1 mb-2">
      <div class="p-1 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] flex items-center gap-1.5">
        <UIcon name="i-lucide-layers" class="size-3 text-gray-400" />
        <div>
          <p class="text-[10px] font-black tabular-nums leading-none">10</p>
          <p class="text-[6px] text-gray-400 font-bold">Total Services</p>
        </div>
      </div>
      <div class="p-1 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] flex items-center gap-1.5">
        <UIcon name="i-lucide-funnel" class="size-3 text-emerald-500" />
        <div>
          <p class="text-[10px] font-black tabular-nums leading-none">10</p>
          <p class="text-[6px] text-gray-400 font-bold">Showing</p>
        </div>
      </div>
      <div class="p-1 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] flex items-center gap-1.5">
        <UIcon name="i-lucide-grid-3x3" class="size-3 text-violet-500" />
        <div>
          <p class="text-[10px] font-black tabular-nums leading-none">4</p>
          <p class="text-[6px] text-gray-400 font-bold">Categories</p>
        </div>
      </div>
      <div class="p-1 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] flex items-center gap-1.5">
        <UIcon name="i-lucide-link" class="size-3 text-amber-500" />
        <div>
          <p class="text-[10px] font-black tabular-nums leading-none">﷼174</p>
          <p class="text-[6px] text-gray-400 font-bold">Avg. Price</p>
        </div>
      </div>
    </div>

    <!-- Category chip filter — first chip dark like APP -->
    <div class="flex flex-wrap gap-1 mb-2">
      <span class="text-[7px] px-1.5 py-0.5 rounded-full bg-primary text-white font-bold">All categories <span class="opacity-80 ms-0.5">10</span></span>
      <span class="text-[7px] px-1.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 font-semibold">Consultation <span class="text-gray-400 ms-0.5">2</span></span>
      <span class="text-[7px] px-1.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 font-semibold">Standard Services <span class="text-gray-400 ms-0.5">3</span></span>
      <span class="text-[7px] px-1.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 font-semibold">Premium Services <span class="text-gray-400 ms-0.5">3</span></span>
      <span class="text-[7px] px-1.5 py-0.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 font-semibold">Follow-up <span class="text-gray-400 ms-0.5">2</span></span>
    </div>

    <!-- Table header -->
    <div class="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 px-2 py-1 text-[6px] uppercase tracking-wider text-gray-400 font-bold">
      <span>Service name</span><span>Duration</span><span>Bookings</span><span>Team</span><span>Price</span>
    </div>

    <!-- Service rows — match APP layout (icon · name · cat-badge · location pill, then duration/bookings/team/price) -->
    <div class="space-y-px">
      <div v-for="s in [
        { n: 'Extended Session',     cat: 'Premium Services',  d: '1h 30m', booked: 8, p: '300', icon: 'i-lucide-bed-double',     g: 'bg-amber-100 text-amber-700' },
        { n: 'Follow-up Visit',      cat: 'Follow-up & Review',d: '20m',    booked: 4, p: '60',  icon: 'i-lucide-map-pin',        g: 'bg-emerald-100 text-emerald-700' },
        { n: 'Initial Consultation', cat: 'Consultation',      d: '30m',    booked: 4, p: '100', icon: 'i-lucide-map-pin',        g: 'bg-secondary-100 text-secondary-700' },
        { n: 'Standard Session',     cat: 'Standard Services', d: '45m',    booked: 2, p: '150', icon: 'i-lucide-map-pin',        g: 'bg-violet-100 text-violet-700' },
        { n: 'Comprehensive Pack',   cat: 'Premium Services',  d: '2h',     booked: 1, p: '450', icon: 'i-lucide-map-pin',        g: 'bg-rose-100 text-rose-700' }
      ]" :key="s.n"
        class="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center px-2 py-1 rounded bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10"
      >
        <div class="flex items-center gap-1.5 min-w-0">
          <div class="size-5 shrink-0 rounded flex items-center justify-center" :class="s.g">
            <UIcon :name="s.icon" class="size-3" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1">
              <p class="text-[8px] font-bold truncate">{{ s.n }}</p>
              <span class="text-[6px] px-1 py-px rounded bg-black/[0.04] dark:bg-white/[0.06] text-gray-600 dark:text-gray-400 font-bold whitespace-nowrap">{{ s.cat }}</span>
            </div>
            <p class="text-[6px] text-gray-400">All branches</p>
          </div>
        </div>
        <span class="text-[7px] tabular-nums text-gray-700 dark:text-gray-300">{{ s.d }}</span>
        <span class="text-[8px] tabular-nums text-center min-w-[1rem]">{{ s.booked }}</span>
        <div class="flex -space-x-1">
          <div class="size-3.5 rounded-full bg-emerald-100 ring-1 ring-white dark:ring-[#0c0c0c] flex items-center justify-center text-[6px] font-black text-emerald-700">A</div>
          <div class="size-3.5 rounded-full bg-violet-100 ring-1 ring-white dark:ring-[#0c0c0c] flex items-center justify-center text-[6px] font-black text-violet-700">L</div>
          <div class="size-3.5 rounded-full bg-secondary-100 ring-1 ring-white dark:ring-[#0c0c0c] flex items-center justify-center text-[6px] font-black text-secondary-700">+1</div>
        </div>
        <p class="text-[9px] font-black tabular-nums whitespace-nowrap">﷼{{ s.p }}</p>
      </div>
    </div>
  </div>

  <!-- ════ Inventory — top KPI cards + stock rows with bars + footer ════ -->
  <!-- ════ Inventory — Stock screen: 3 KPI tiles (Total Products / Low Stock /
       Total Stock Value with ﷼ symbol), search + barcode + filter bar, then
       PRODUCT · ALERT · IN STOCK rows with SKU pill — exactly the APP shape. ════ -->
  <div v-else-if="id === 'inventory'" class="w-full text-[9px]">
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <div>
        <p class="text-[10px] font-black text-gray-900 dark:text-white tracking-tight leading-none">Inventory</p>
        <p class="text-[7px] text-gray-400 mt-0.5">Manage stock levels, orders & suppliers</p>
      </div>
      <span class="size-4 rounded border border-black/10 dark:border-white/10 flex items-center justify-center"><UIcon name="i-lucide-download" class="size-2 text-gray-500" /></span>
    </div>

    <!-- Three KPI tiles (matches APP /inventory/stock) -->
    <div class="grid grid-cols-3 gap-1 mb-2">
      <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] flex items-center gap-1.5">
        <UIcon name="i-lucide-package" class="size-3.5 text-gray-400" />
        <div>
          <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold leading-none">Total Products</p>
          <p class="text-[12px] font-black tabular-nums leading-tight">7</p>
        </div>
      </div>
      <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] flex items-center gap-1.5">
        <UIcon name="i-lucide-alert-triangle" class="size-3.5 text-amber-500" />
        <div>
          <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold leading-none">Low Stock Items</p>
          <p class="text-[12px] font-black tabular-nums leading-tight">2</p>
        </div>
      </div>
      <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] flex items-center gap-1.5">
        <UIcon name="i-lucide-dollar-sign" class="size-3.5 text-emerald-500" />
        <div>
          <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold leading-none">Total Stock Value</p>
          <p class="text-[12px] font-black tabular-nums leading-tight">﷼4,583</p>
        </div>
      </div>
    </div>

    <!-- Search + barcode + filters -->
    <div class="flex items-center gap-1 p-1 rounded bg-black/[0.03] dark:bg-white/[0.04] mb-1.5">
      <div class="flex-1 inline-flex items-center gap-1 px-1.5 h-4 rounded bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10 text-[7px] text-gray-400">
        <UIcon name="i-lucide-search" class="size-2.5" />Search products
      </div>
      <span class="px-1 h-4 rounded border border-black/10 dark:border-white/10 inline-flex items-center"><UIcon name="i-lucide-scan-barcode" class="size-2.5 text-gray-500" /></span>
      <span class="px-1 h-4 rounded border border-black/10 dark:border-white/10 inline-flex items-center gap-0.5 text-[7px] text-gray-600"><UIcon name="i-lucide-filter" class="size-2" />Filters</span>
    </div>

    <!-- Table header -->
    <div class="grid grid-cols-[1fr_auto_auto] gap-2 px-2 py-1 text-[6px] uppercase tracking-wider text-gray-400 font-bold">
      <span>Product</span><span>Alert</span><span>In stock</span>
    </div>

    <!-- Product rows -->
    <div class="space-y-px">
      <div
        v-for="p in [
          { n: 'Cleansing Solution', sku: 'CS-001', cat: 'Care Products', alert: 5, qty: 32 },
          { n: 'Daily Care Kit',     sku: 'DCK-001',cat: 'Care Products', alert: 5, qty: 25 },
          { n: 'Protective Cream',   sku: 'PC-001', cat: 'Care Products', alert: 5, qty: 40 },
          { n: 'Recovery Formula',   sku: 'RF-001', cat: 'Supplements',   alert: 5, qty: 15 },
          { n: 'Support Band',       sku: 'SB-001', cat: 'Accessories',   alert: 5, qty: 49 }
        ]" :key="p.sku"
        class="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-2 py-1 rounded bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-1">
            <p class="text-[8px] font-bold truncate">{{ p.n }}</p>
            <span class="text-[6px] px-1 py-px rounded border border-black/10 dark:border-white/15 text-gray-600 dark:text-gray-400 font-bold tabular-nums">{{ p.sku }}</span>
          </div>
          <p class="text-[6px] text-gray-400">{{ p.cat }} · 06/04/26</p>
        </div>
        <span class="text-[7px] tabular-nums text-gray-500 text-center min-w-[1rem]">{{ p.alert }}</span>
        <span class="text-[9px] tabular-nums font-black text-center min-w-[1.5rem]" :class="{
          'text-amber-600': p.qty <= p.alert + 10,
          'text-gray-900 dark:text-white': p.qty > p.alert + 10
        }">{{ p.qty }}</span>
      </div>
    </div>
  </div>

  <!-- ════ Events & Ticketing — event card + capacity bar + ticket tiers + check-in QR ════ -->
  <div v-else-if="id === 'events'" class="w-full text-[9px] space-y-2.5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none">Yoga Flow · Sat 7am</p>
        <p class="text-[10px] text-gray-500 mt-0.5">Studio A · 60 min</p>
      </div>
      <span class="inline-flex items-center gap-1 ps-1.5 pe-2 py-0.5 rounded-full bg-secondary-500/10 text-secondary-700 dark:text-secondary-300 text-[9px] font-bold uppercase tracking-wider ring-1 ring-secondary-500/30">
        <UIcon name="i-lucide-ticket" class="size-2.5" />
        Live
      </span>
    </div>

    <!-- Capacity bar -->
    <div class="rounded-lg ring-1 ring-black/10 dark:ring-white/10 p-2.5">
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-[10px] font-bold uppercase tracking-wider text-gray-500">Capacity</span>
        <span class="text-[11px] font-black tabular-nums">10 / 12</span>
      </div>
      <div class="h-1.5 bg-black/[0.06] dark:bg-white/10 rounded-full overflow-hidden">
        <div class="h-full bg-gradient-to-r from-secondary-500 to-secondary-500 rounded-full" style="width:83%" />
      </div>
      <div class="mt-1.5 flex items-center justify-between text-[9px] text-gray-500">
        <span>Sold-out in 6 min</span>
        <span class="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <UIcon name="i-lucide-users" class="size-2.5" />
          3 waitlist
        </span>
      </div>
    </div>

    <!-- Ticket tiers -->
    <div class="space-y-1.5">
      <div class="flex items-center gap-2 p-1.5 rounded-md bg-emerald-500/[0.06] ring-1 ring-emerald-500/20">
        <span class="size-1.5 rounded-full bg-emerald-500" />
        <span class="text-[10px] font-bold flex-1">Drop-in</span>
        <span class="text-[10px] tabular-nums text-gray-500">8 sold</span>
        <span class="text-[10px] font-black tabular-nums">SAR 80</span>
      </div>
      <div class="flex items-center gap-2 p-1.5 rounded-md bg-secondary-500/[0.06] ring-1 ring-secondary-500/20">
        <span class="size-1.5 rounded-full bg-secondary-500" />
        <span class="text-[10px] font-bold flex-1">Member</span>
        <span class="text-[10px] tabular-nums text-gray-500">2 sold</span>
        <span class="text-[10px] font-black tabular-nums">Free</span>
      </div>
    </div>

    <!-- Check-in row -->
    <div class="flex items-center gap-2 pt-1.5 border-t border-black/10 dark:border-white/10">
      <div class="size-8 rounded-md bg-black/5 dark:bg-white/10 flex items-center justify-center">
        <UIcon name="i-lucide-qr-code" class="size-3.5 text-gray-600 dark:text-gray-300" />
      </div>
      <div class="flex-1">
        <p class="text-[10px] font-bold leading-tight">Per-ticket QR</p>
        <p class="text-[9px] text-gray-500 leading-tight">Door check-in via kiosk or staff phone</p>
      </div>
      <span class="text-[9px] font-black tabular-nums text-emerald-600 dark:text-emerald-400">7 in</span>
    </div>
  </div>

  <!-- ════ Team & HR — top bar + pending invite + member rows + attendance footer ════ -->
  <!-- ════ Team — Members screen: + Invite Member, search bar, MEMBER · EMAIL ·
       JOINED columns. Each row mirrors the APP: avatar + name + role badge
       (Owner/Admin/Staff) + title + branch chip below, status dot top-right. ════ -->
  <div v-else-if="id === 'team'" class="w-full text-[9px]">
    <!-- Header: title + import + Invite Member -->
    <div class="flex items-center justify-between mb-2">
      <div>
        <p class="text-[10px] font-black text-gray-900 dark:text-white tracking-tight leading-none">Team Members</p>
        <p class="text-[7px] text-gray-400 mt-0.5">Manage your team, schedules, and commissions</p>
      </div>
      <div class="flex items-center gap-1">
        <span class="size-4 rounded border border-black/10 dark:border-white/10 flex items-center justify-center"><UIcon name="i-lucide-download" class="size-2 text-gray-500" /></span>
        <span class="px-1.5 py-0.5 rounded bg-primary text-white text-[7px] font-bold inline-flex items-center gap-0.5">
          <UIcon name="i-lucide-plus" class="size-2" />Invite Member
        </span>
      </div>
    </div>

    <!-- Sub-nav (Members / Schedule / Attendance / Blocked Times / Leave / Timesheet / Pay Runs) -->
    <div class="flex items-center gap-1 mb-2 text-[7px] font-semibold border-b border-black/5 dark:border-white/10 overflow-hidden">
      <span class="px-1.5 py-1 border-b-2 border-primary text-gray-900 dark:text-white">Members</span>
      <span class="px-1.5 py-1 text-gray-400">Schedule</span>
      <span class="px-1.5 py-1 text-gray-400">Attendance</span>
      <span class="px-1.5 py-1 text-gray-400">Leave</span>
      <span class="px-1.5 py-1 text-gray-400">Timesheet</span>
      <span class="px-1.5 py-1 text-gray-400">Pay Runs</span>
    </div>

    <!-- Search + Date + Filters -->
    <div class="flex items-center gap-1 p-1 rounded bg-black/[0.03] dark:bg-white/[0.04] mb-1.5">
      <div class="flex-1 inline-flex items-center gap-1 px-1.5 h-4 rounded bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10 text-[7px] text-gray-400">
        <UIcon name="i-lucide-search" class="size-2.5" />Search members…
      </div>
      <span class="px-1 h-4 rounded border border-black/10 dark:border-white/10 inline-flex items-center gap-0.5 text-[7px] text-gray-600"><UIcon name="i-lucide-calendar" class="size-2" />Date</span>
      <span class="px-1 h-4 rounded border border-black/10 dark:border-white/10 inline-flex items-center gap-0.5 text-[7px] text-gray-600"><UIcon name="i-lucide-filter" class="size-2" />Filters</span>
    </div>

    <!-- Header row -->
    <div class="grid grid-cols-[1fr_auto_auto] gap-2 px-2 py-1 text-[6px] uppercase tracking-wider text-gray-400 font-bold">
      <span>Member</span><span>Email</span><span>Joined</span>
    </div>

    <!-- Members -->
    <div class="space-y-px">
      <div
        v-for="m in [
          { n: 'Sarah Johnson',  init: 'SJ', role: 'Staff', roleTone: 'gray',     title: 'Senior Specialist',   email: 'staff1@demo.local', branch: 'Riyadh · Second Branch', date: '06/04/26', status: 'emerald' },
          { n: 'Ahmed Hassan',   init: 'AH', role: 'Admin', roleTone: 'sky',      title: 'Specialist',           email: 'staff2@demo.local', branch: 'Riyadh',                 date: '06/04/26', status: 'emerald' },
          { n: 'Lina Rashid',    init: 'LR', role: 'Admin', roleTone: 'sky',      title: 'Operations Manager',   email: 'staff3@demo.local', branch: 'Riyadh',                 date: '06/04/26', status: 'gray' },
          { n: 'Ahmed Amin',     init: 'AA', role: 'Owner', roleTone: 'gray',     title: '',                     email: 'support@momentfy.com',branch: 'Riyadh · Second Branch', date: '06/04/26', status: 'amber' }
        ]" :key="m.init"
        class="grid grid-cols-[1fr_auto_auto] gap-2 items-center px-2 py-1 rounded bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10"
      >
        <div class="flex items-center gap-1.5 min-w-0">
          <div class="relative shrink-0">
            <div class="size-5 rounded-full bg-gradient-to-br from-violet-100 to-secondary-100 ring-1 ring-violet-300 flex items-center justify-center text-[7px] font-black text-violet-700">{{ m.init }}</div>
            <span aria-hidden="true" class="absolute -top-px -end-px size-1.5 rounded-full ring-1 ring-white dark:ring-[#0c0c0c]" :class="{
              'bg-emerald-500': m.status === 'emerald',
              'bg-amber-500': m.status === 'amber',
              'bg-gray-300': m.status === 'gray'
            }" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1">
              <p class="text-[8px] font-bold truncate">{{ m.n }}</p>
              <span class="text-[6px] px-1 py-px rounded font-bold whitespace-nowrap" :class="{
                'bg-black/[0.05] text-gray-700 dark:bg-white/[0.06] dark:text-gray-300': m.roleTone === 'gray',
                'bg-secondary-500/15 text-secondary-700 dark:text-secondary-300':         m.roleTone === 'sky'
              }">{{ m.role }}</span>
            </div>
            <p class="text-[6px] text-gray-500 dark:text-gray-400 truncate">{{ m.title }}</p>
            <span class="mt-0.5 inline-flex items-center gap-0.5 text-[6px] px-1 py-px rounded border border-black/5 dark:border-white/15 text-gray-500">
              <UIcon name="i-lucide-map-pin" class="size-2" />{{ m.branch }}
            </span>
          </div>
        </div>
        <span class="text-[7px] text-gray-500 truncate">{{ m.email }}</span>
        <span class="text-[7px] text-gray-500 tabular-nums whitespace-nowrap">{{ m.date }}</span>
      </div>
    </div>

    <p class="mt-1 text-[6px] text-gray-400">Viewing 1–4 of 4 results</p>
  </div>

  <!-- ════ Accounting — top bar + journal entries with source badges + balance footer ════ -->
    <!-- ════ Accounting — Overview screen: Total Assets / Liabilities / Equity /
       Net Income MTD KPI strip, Ledger health check (Trial balanced + A=L+E),
       A/R Aging and A/P Aging cards with bucket grid (Current / 1-30 / 31-60 /
       61-90 / 90+) — exactly mirrors /dashboard/accounting. ════ -->
  <div v-else-if="id === 'accounting'" class="w-full text-[9px]">
    <!-- Header -->
    <div class="mb-2">
      <p class="text-[10px] font-black text-gray-900 dark:text-white tracking-tight leading-none">Accounting</p>
      <p class="text-[7px] text-gray-400 mt-0.5">Ledger, statements, receivables and payables</p>
    </div>

    <!-- Top KPI strip -->
    <div class="grid grid-cols-4 gap-1 mb-2">
      <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">Total Assets</p>
        <p class="text-[11px] font-black tabular-nums leading-tight">﷼16,529</p>
        <p class="text-[6px] text-gray-400 mt-0.5">as of 2026-05-01</p>
      </div>
      <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">Total Liabilities</p>
        <p class="text-[11px] font-black tabular-nums leading-tight">﷼2,243</p>
      </div>
      <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">Total Equity</p>
        <p class="text-[11px] font-black tabular-nums leading-tight">﷼14,286</p>
      </div>
      <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">Net Income MTD</p>
        <p class="text-[11px] font-black tabular-nums leading-tight text-rose-600">-﷼10.75</p>
      </div>
    </div>

    <!-- Ledger health card -->
    <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] mb-2">
      <div class="flex items-center gap-1 mb-1">
        <UIcon name="i-lucide-stethoscope" class="size-3 text-gray-500" />
        <p class="text-[8px] font-bold">Ledger health</p>
      </div>
      <div class="grid grid-cols-2 gap-1">
        <div class="flex items-center justify-between px-1.5 py-1 rounded bg-black/[0.03] dark:bg-white/[0.04]">
          <span class="text-[7px]">Trial balance balanced</span>
          <span class="text-[6px] px-1 py-px rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5">
            <UIcon name="i-lucide-check" class="size-2" />OK
          </span>
        </div>
        <div class="flex items-center justify-between px-1.5 py-1 rounded bg-black/[0.03] dark:bg-white/[0.04]">
          <span class="text-[7px]">A = L + E</span>
          <span class="text-[6px] px-1 py-px rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5">
            <UIcon name="i-lucide-check" class="size-2" />OK
          </span>
        </div>
      </div>
    </div>

    <!-- A/R + A/P aging buckets (matches APP cards) -->
    <div class="grid grid-cols-2 gap-1.5">
      <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <div class="flex items-center justify-between mb-1">
          <div>
            <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">A/R aging</p>
            <p class="text-[10px] font-black tabular-nums leading-none">﷼1,075</p>
          </div>
          <UIcon name="i-lucide-users" class="size-3 text-gray-400" />
        </div>
        <div class="grid grid-cols-5 gap-px text-[6px]">
          <div><p class="text-gray-400">Current</p><p class="tabular-nums">﷼0</p></div>
          <div><p class="text-gray-400">1-30</p><p class="tabular-nums">﷼1,075</p></div>
          <div><p class="text-gray-400">31-60</p><p class="tabular-nums">﷼0</p></div>
          <div><p class="text-gray-400">61-90</p><p class="tabular-nums">﷼0</p></div>
          <div><p class="text-amber-600">90+</p><p class="tabular-nums text-amber-600">﷼0</p></div>
        </div>
      </div>
      <div class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c]">
        <div class="flex items-center justify-between mb-1">
          <div>
            <p class="text-[6px] uppercase tracking-wider text-gray-400 font-bold">A/P aging</p>
            <p class="text-[10px] font-black tabular-nums leading-none">﷼14</p>
          </div>
          <UIcon name="i-lucide-truck" class="size-3 text-gray-400" />
        </div>
        <div class="grid grid-cols-5 gap-px text-[6px]">
          <div><p class="text-gray-400">Current</p><p class="tabular-nums">﷼0</p></div>
          <div><p class="text-gray-400">1-30</p><p class="tabular-nums">﷼14</p></div>
          <div><p class="text-gray-400">31-60</p><p class="tabular-nums">﷼0</p></div>
          <div><p class="text-gray-400">61-90</p><p class="tabular-nums">﷼0</p></div>
          <div><p class="text-amber-600">90+</p><p class="tabular-nums text-amber-600">﷼0</p></div>
        </div>
      </div>
    </div>
  </div>

  <!-- ════ Reports — top bar + KPI grid + revenue bar chart + expense list ════ -->
  <!-- ════ Reports — All Reports gallery: tile grid with iconed report cards
       (Performance, Staff, Clients, Balance Sheet, Trial Balance, Finance,
       Inventory, VAT Report, Profit & Loss, Cash Flow, A/R Aging, A/P Aging),
       grouped by section. Mirrors /dashboard/reports/all in the APP. ════ -->
  <div v-else-if="id === 'reports'" class="w-full text-[9px]">
    <!-- Header -->
    <div class="mb-2">
      <p class="text-[10px] font-black text-gray-900 dark:text-white tracking-tight leading-none">All Reports</p>
      <p class="text-[7px] text-gray-400 mt-0.5">Sales, appointments, and key business metrics</p>
    </div>

    <!-- Report tile grid (3-up) — 9 tiles like the APP -->
    <div class="grid grid-cols-3 gap-1.5">
      <div v-for="r in [
        { n: 'Performance',     d: 'Sales, appointments, key metrics',     icon: 'i-lucide-trending-up',    tone: 'emerald' },
        { n: 'Staff',           d: 'Team performance, commissions',         icon: 'i-lucide-users',           tone: 'sky' },
        { n: 'Clients',         d: 'Acquisition, retention, engagement',    icon: 'i-lucide-smile',           tone: 'violet' },
        { n: 'Balance Sheet',   d: 'Revenue, taxes, payment analysis',      icon: 'i-lucide-wallet',          tone: 'amber' },
        { n: 'Trial Balance',   d: 'Ending balance — DR must equal CR',     icon: 'i-lucide-scale',           tone: 'rose' },
        { n: 'Finance Overview',d: 'Revenue, expenses, cash, balances',     icon: 'i-lucide-landmark',        tone: 'sky' },
        { n: 'Inventory',       d: 'Stock levels, sales, supplier perf.',   icon: 'i-lucide-package',         tone: 'amber' },
        { n: 'VAT Report',      d: 'Tax by rate and category — file ready', icon: 'i-lucide-receipt',         tone: 'rose' },
        { n: 'Profit & Loss',   d: 'Revenue minus costs, refunds, dis.',    icon: 'i-lucide-bar-chart-3',     tone: 'sky' }
      ]" :key="r.n"
        class="p-1.5 rounded border border-black/5 dark:border-white/10 bg-white dark:bg-[#0c0c0c] hover:bg-black/[0.02] transition-colors"
      >
        <div class="size-5 rounded flex items-center justify-center mb-1" :class="{
          'bg-emerald-100 text-emerald-700': r.tone === 'emerald',
          'bg-sky-100 text-sky-700':         r.tone === 'sky',
          'bg-violet-100 text-violet-700':   r.tone === 'violet',
          'bg-amber-100 text-amber-700':     r.tone === 'amber',
          'bg-rose-100 text-rose-700':       r.tone === 'rose'
        }">
          <UIcon :name="r.icon" class="size-3" />
        </div>
        <p class="text-[7px] font-bold leading-tight text-gray-900 dark:text-white">{{ r.n }}</p>
        <p class="text-[6px] text-gray-400 leading-tight mt-0.5 line-clamp-2">{{ r.d }}</p>
      </div>
    </div>

    <!-- Footer chip: AI summary on demand + export options -->
    <div class="mt-2 pt-1.5 border-t border-black/5 dark:border-white/10 flex items-center gap-3 text-[7px] font-semibold">
      <span class="inline-flex items-center gap-1 text-secondary-600 dark:text-secondary-400">
        <UIcon name="i-lucide-sparkles" class="size-2.5" />AI summary
      </span>
      <span class="inline-flex items-center gap-1 text-gray-600 dark:text-gray-300">
        <UIcon name="i-lucide-calendar" class="size-2.5" />Custom range · prior-period diff
      </span>
      <span class="ms-auto inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <UIcon name="i-lucide-download" class="size-2.5" />Excel · CSV · PDF
      </span>
    </div>
  </div>

  <!-- ════ Client Portal — phone frame with welcome, loyalty, quick actions, next appt, recents ════ -->
  <div v-else-if="id === 'portal'" class="w-full flex justify-center">
    <div class="w-40 rounded-[1.5rem] p-1.5 bg-primary shadow-2xl">
      <div class="w-full rounded-[1.2rem] bg-white dark:bg-[#0c0c0c] overflow-hidden">
        <!-- Status bar -->
        <div class="flex items-center justify-between px-2.5 pt-1 pb-0.5 text-[6px] font-black text-gray-900 dark:text-white">
          <span class="tabular-nums">14:32</span>
          <div class="flex items-center gap-0.5">
            <span class="tracking-wider">5G</span>
            <UIcon name="i-lucide-battery-full" class="size-2" />
          </div>
        </div>

        <!-- Content -->
        <div class="px-2 pb-2 text-[7px]">
          <!-- Brand header -->
          <div class="flex items-center gap-1.5 mb-2">
            <div class="size-5 rounded-lg bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center">
              <span class="text-white text-[7px] font-black">LS</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[8px] font-black truncate leading-none">Lina's Spa</p>
              <p class="text-[6px] text-gray-400">Welcome, Noura</p>
            </div>
            <div class="relative">
              <UIcon name="i-lucide-bell" class="size-3 text-gray-400" />
              <span aria-hidden="true" class="absolute -top-0.5 -end-0.5 size-1.5 rounded-full bg-rose-500 ring-1 ring-white dark:ring-[#0c0c0c]" />
            </div>
          </div>

          <!-- Loyalty wallet card -->
          <div class="rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-700 text-white p-2 mb-2 relative overflow-hidden">
            <div aria-hidden="true" class="absolute -top-4 -end-4 size-12 rounded-full bg-white/20 blur-lg" />
            <div class="relative">
              <div class="flex items-center justify-between">
                <p class="text-[6px] opacity-80 uppercase tracking-wider font-bold">Loyalty</p>
                <UIcon name="i-lucide-award" class="size-2.5 opacity-80" />
              </div>
              <p class="text-base font-black leading-none mt-1">1,240<span class="text-[6px] opacity-70 ms-0.5 font-normal">pts</span></p>
              <div class="mt-1.5 h-0.5 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full w-[62%] bg-white/80 rounded-full" />
              </div>
              <p class="text-[6px] opacity-80 mt-1">260 pts to Gold</p>
            </div>
          </div>

          <!-- Quick actions grid -->
          <div class="grid grid-cols-4 gap-1 mb-2">
            <div class="aspect-square rounded-md bg-primary/10 text-primary dark:bg-white/10 dark:text-white flex flex-col items-center justify-center">
              <UIcon name="i-lucide-calendar-plus" class="size-2.5" />
              <span class="text-[5px] mt-0.5 font-bold">Book</span>
            </div>
            <div class="aspect-square rounded-md bg-secondary-500/15 text-secondary-600 flex flex-col items-center justify-center">
              <UIcon name="i-lucide-receipt" class="size-2.5" />
              <span class="text-[5px] mt-0.5 font-bold">Invoices</span>
            </div>
            <div class="aspect-square rounded-md bg-secondary-500/15 text-secondary-600 flex flex-col items-center justify-center">
              <UIcon name="i-lucide-pill" class="size-2.5" />
              <span class="text-[5px] mt-0.5 font-bold">Rx</span>
            </div>
            <div class="aspect-square rounded-md bg-emerald-500/15 text-emerald-600 flex flex-col items-center justify-center">
              <UIcon name="i-lucide-message-square" class="size-2.5" />
              <span class="text-[5px] mt-0.5 font-bold">Chat</span>
            </div>
          </div>

          <!-- Upcoming appointment -->
          <p class="text-[6px] uppercase tracking-wider text-gray-400 font-black mb-1">Upcoming</p>
          <div class="p-1.5 rounded-md border border-black/5 dark:border-white/10 mb-1">
            <div class="flex items-center gap-1">
              <div class="size-4 rounded-md bg-gradient-to-br from-secondary-400 to-rose-500 flex items-center justify-center">
                <UIcon name="i-lucide-scissors" class="size-2 text-white" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[7px] font-bold truncate">Color & Cut</p>
                <p class="text-[6px] text-gray-400">Tue · 14:00 · Lina H.</p>
              </div>
              <span class="text-[5px] px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-black">OK</span>
            </div>
          </div>

          <!-- Recent visit -->
          <div class="p-1.5 rounded-md bg-gray-50 dark:bg-white/5">
            <div class="flex items-center gap-1">
              <UIcon name="i-lucide-check-circle-2" class="size-2.5 text-emerald-500" />
              <div class="flex-1 min-w-0">
                <p class="text-[7px] font-bold truncate">Facial Glow · 15 Apr</p>
              </div>
              <div class="flex gap-0.5">
                <UIcon v-for="n in 5" :key="n" name="i-lucide-star" class="size-1.5 text-amber-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ════ Multi-tenant ════ -->
  <div v-else-if="id === 'multi-tenant'" class="w-full space-y-1.5">
    <div
      v-for="t in [
        { n: 'Lina Spa Co.', s: 'lina-spa', plan: 'Business', c: 'from-secondary-400 to-rose-500', stats: '3 loc · 12 staff' },
        { n: 'Smile Dental', s: 'smile-dental', plan: 'Business', c: 'from-secondary-400 to-secondary-500', stats: '2 loc · 8 staff' },
        { n: 'Flex Fitness', s: 'flex-fitness', plan: 'Starter', c: 'from-secondary-400 to-emerald-500', stats: '1 loc · 5 staff' },
        { n: 'Pawsitive Vet', s: 'pawsitive', plan: 'Business', c: 'from-amber-400 to-orange-500', stats: '1 loc · 4 staff' }
      ]" :key="t.s"
      class="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10"
    >
      <div class="size-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-[9px] font-black" :class="t.c">{{ t.n.charAt(0) }}</div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] font-bold truncate">{{ t.n }}</p>
        <p class="text-[8px] text-gray-400">{{ t.s }}.momentfy.com</p>
      </div>
      <div class="text-end">
        <span class="text-[8px] px-1.5 py-0.5 rounded bg-secondary-500/15 text-secondary-600 font-semibold">{{ t.plan }}</span>
        <p class="text-[8px] text-gray-400 mt-0.5">{{ t.stats }}</p>
      </div>
    </div>
  </div>

  <!-- ════ Bilingual / RTL ════ -->
  <div v-else-if="id === 'i18n'" class="w-full grid grid-cols-2 gap-3">
    <div class="rounded-lg border border-black/10 dark:border-white/10 p-3" dir="ltr">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] text-gray-400">EN · LTR</span>
        <span class="text-[9px] px-1.5 py-0.5 rounded bg-secondary-500/15 text-secondary-600 font-semibold">English</span>
      </div>
      <p class="text-[11px] font-bold">Welcome back, Lina</p>
      <p class="text-[9px] text-gray-500 mt-1">Today · Apr 18</p>
      <p class="text-lg font-black mt-2">SAR 1,284.50</p>
      <div class="mt-2 h-1 rounded-full bg-secondary-500/20"><div class="h-full w-3/4 rounded-full bg-secondary-500" /></div>
    </div>
    <div class="rounded-lg border border-black/10 dark:border-white/10 p-3" dir="rtl">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[10px] text-gray-400">AR · RTL</span>
        <span class="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 font-semibold">العربية</span>
      </div>
      <p class="text-[11px] font-bold">أهلاً بعودتك، لينا</p>
      <p class="text-[9px] text-gray-500 mt-1">اليوم · ١٨ أبريل</p>
      <p class="text-lg font-black mt-2">١٢٨٤٫٥٠ ر.س</p>
      <div class="mt-2 h-1 rounded-full bg-secondary-500/20"><div class="h-full w-3/4 rounded-full bg-secondary-500" /></div>
    </div>
  </div>

  <!-- ════ Self-hosted ════ -->
  <div v-else-if="id === 'self-hosted'" class="w-full">
    <div class="rounded-lg overflow-hidden bg-[#0c0c0c] border border-white/10 text-[10px] text-gray-300">
      <div class="h-6 bg-white/5 border-b border-white/10 flex items-center gap-1.5 px-2">
        <div class="size-1.5 rounded-full bg-red-400" />
        <div class="size-1.5 rounded-full bg-secondary-400" />
        <div class="size-1.5 rounded-full bg-emerald-400" />
        <span class="ms-auto text-[9px] text-gray-500">~/momentfy</span>
      </div>
      <div class="p-3 space-y-1 leading-snug">
        <p><span class="text-emerald-400">➜</span> docker compose up -d</p>
        <p class="text-gray-500">[+] Running 2/2</p>
        <p><span class="text-emerald-400">✔</span> Container momentfy-db-1 &nbsp;Started</p>
        <p><span class="text-emerald-400">✔</span> Container momentfy-app-1 Started</p>
        <p class="mt-1 text-secondary-400">http://localhost:3000</p>
      </div>
    </div>
  </div>

  <!-- ════ ZATCA ════ -->
  <div v-else-if="id === 'zatca'" class="w-full rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
    <div class="px-3 py-2 bg-emerald-500/10 border-b border-emerald-500/20 flex items-center gap-1.5">
      <UIcon name="i-lucide-shield-check" class="size-3.5 text-emerald-600" />
      <span class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">ZATCA — Cleared</span>
      <span class="ms-auto text-[9px] text-gray-500">UUID-a8f2…</span>
    </div>
    <div class="p-3 flex gap-3">
      <div class="flex-1 space-y-1 text-[10px]">
        <p class="font-bold">Invoice INV-00128</p>
        <p class="text-gray-500">Seller: 300012345600003</p>
        <p class="text-gray-500">VAT: <span class="">65.00</span></p>
        <p class="text-gray-500">Total: <span class="font-bold">500.00</span></p>
        <div class="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 text-[9px] font-bold">
          <UIcon name="i-lucide-check" class="size-2.5" /> Signed · Stamped
        </div>
      </div>
      <!-- QR mock -->
      <div class="size-16 rounded grid grid-cols-6 grid-rows-6 gap-px bg-gray-900 p-1 shrink-0">
        <div v-for="n in 36" :key="n" class="rounded-[1px]" :class="[0,2,4,5,7,10,12,15,17,18,20,22,25,27,29,31,33,35].includes(n) ? 'bg-white' : 'bg-gray-900'" />
      </div>
    </div>
  </div>

  <!-- ════ ETA ════ -->
  <div v-else-if="id === 'eta'" class="w-full rounded-lg border border-black/10 dark:border-white/10 overflow-hidden">
    <div class="px-3 py-2 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-1.5">
      <UIcon name="i-lucide-file-check" class="size-3.5 text-amber-600" />
      <span class="text-[10px] font-bold text-amber-700 dark:text-amber-400">ETA · Egypt Tax Authority</span>
    </div>
    <div class="p-3 space-y-1.5">
      <div
        v-for="s in [
          { l: 'Validated', ok: true },
          { l: 'Submitted', ok: true },
          { l: 'Accepted', ok: true },
          { l: 'Cleared', ok: false }
        ]" :key="s.l"
        class="flex items-center gap-2"
      >
        <div class="size-4 rounded-full flex items-center justify-center" :class="s.ok ? 'bg-emerald-500 text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400'">
          <UIcon :name="s.ok ? 'i-lucide-check' : 'i-lucide-clock'" class="size-2.5" />
        </div>
        <span class="text-[10px] font-semibold" :class="s.ok ? '' : 'text-gray-400'">{{ s.l }}</span>
        <span v-if="s.ok" class="ms-auto text-[9px] text-gray-400">14:32:10</span>
      </div>
    </div>
  </div>

  <!-- ════ AI Assistant ════ -->
  <div v-else-if="id === 'ai'" class="w-full space-y-2">
    <div class="flex items-start gap-2">
      <div class="size-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
        <UIcon name="i-lucide-user" class="size-3 text-gray-500" />
      </div>
      <div class="flex-1 rounded-lg rounded-ss-sm bg-gray-100 dark:bg-white/5 p-2 text-[11px]">
        Can I book a facial this Friday evening?
      </div>
    </div>
    <div class="flex items-start gap-2">
      <div class="size-6 rounded-full bg-gradient-to-br from-secondary-400 to-secondary-600 flex items-center justify-center shrink-0">
        <UIcon name="i-lucide-sparkles" class="size-3 text-white" />
      </div>
      <div class="flex-1 rounded-lg rounded-ss-sm bg-secondary-500/10 border border-secondary-500/20 p-2 text-[11px]">
        <p>Yes — Lina has <b>18:30</b> open, Noura has <b>19:00</b>. Want me to book one?</p>
        <div class="mt-1.5 flex gap-1">
          <span class="text-[9px] px-1.5 py-0.5 rounded bg-secondary-500 text-white font-semibold">Book 18:30</span>
          <span class="text-[9px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 font-semibold">19:00</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ════ Reviews & Loyalty ════ -->
  <div v-else-if="id === 'reviews-loyalty'" class="w-full space-y-2">
    <div class="p-3 rounded-lg border border-black/10 dark:border-white/10">
      <div class="flex items-center gap-1 mb-1.5">
        <UIcon v-for="n in 5" :key="n" name="i-lucide-star" class="size-3 text-amber-500" />
        <span class="ms-auto text-[10px] text-gray-400">2d ago</span>
      </div>
      <p class="text-[10px] font-medium">"Best service in town, always leave happy."</p>
      <p class="text-[9px] text-gray-500 mt-1">— Lina H. · verified visit</p>
    </div>
    <div class="p-3 rounded-lg bg-gradient-to-br from-secondary-500 to-secondary-700 text-white">
      <div class="flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase opacity-80">Loyalty</span>
        <UIcon name="i-lucide-award" class="size-3.5" />
      </div>
      <p class="mt-1 text-xl font-black">1,240 <span class="text-[9px] opacity-70">pts</span></p>
      <div class="mt-1.5 h-1 bg-white/20 rounded-full overflow-hidden"><div class="h-full w-[62%] bg-white/80 rounded-full" /></div>
      <p class="mt-1 text-[9px] opacity-80">260 pts to Gold tier</p>
    </div>
  </div>

  <!-- ════ Notifications & Messaging — per-event rules + multi-channel + delivery log ════ -->
  <div v-else-if="id === 'notifications'" class="w-full text-[9px] space-y-2.5">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-black text-gray-900 dark:text-white tracking-tight leading-none">appointment.confirmed</p>
        <p class="text-[10px] text-gray-500 mt-0.5">Audience · Client + Assigned staff</p>
      </div>
      <span class="inline-flex items-center gap-1 ps-1.5 pe-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[9px] font-bold uppercase tracking-wider ring-1 ring-emerald-500/30">
        <span class="size-1 rounded-full bg-emerald-500" />
        Active
      </span>
    </div>

    <!-- Channel toggles -->
    <div class="rounded-lg ring-1 ring-black/10 dark:ring-white/10 p-2 space-y-1.5">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-bell" class="size-3 text-secondary-500" />
        <span class="text-[10px] font-semibold flex-1">In-app</span>
        <span class="text-[9px] text-gray-400">always</span>
        <span class="size-3 rounded-full bg-secondary-500 ring-2 ring-secondary-500/30" />
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-mail" class="size-3 text-secondary-500" />
        <span class="text-[10px] font-semibold flex-1">Email</span>
        <span class="text-[9px] text-gray-400">SendGrid</span>
        <span class="size-3 rounded-full bg-secondary-500 ring-2 ring-secondary-500/30" />
      </div>
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-message-square" class="size-3 text-emerald-500" />
        <span class="text-[10px] font-semibold flex-1">SMS</span>
        <span class="text-[9px] text-gray-400">Twilio</span>
        <span class="size-3 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30" />
      </div>
      <div class="flex items-center gap-2 opacity-60">
        <UIcon name="i-simple-icons-whatsapp" class="size-3 text-green-500" />
        <span class="text-[10px] font-semibold flex-1">WhatsApp</span>
        <span class="text-[9px] text-gray-400">off</span>
        <span class="size-3 rounded-full bg-black/10 dark:bg-white/15" />
      </div>
    </div>

    <!-- Delivery log -->
    <div class="rounded-lg bg-black/[0.03] dark:bg-white/[0.04] p-2">
      <div class="flex items-center gap-1.5 mb-1.5">
        <UIcon name="i-lucide-activity" class="size-3 text-gray-400" />
        <span class="text-[9px] uppercase tracking-wider font-bold text-gray-400">Last hour</span>
      </div>
      <div class="grid grid-cols-3 gap-1.5">
        <div>
          <p class="text-[11px] font-black tabular-nums text-emerald-600 dark:text-emerald-400">142</p>
          <p class="text-[9px] text-gray-500">delivered</p>
        </div>
        <div>
          <p class="text-[11px] font-black tabular-nums text-amber-600 dark:text-amber-400">3</p>
          <p class="text-[9px] text-gray-500">retrying</p>
        </div>
        <div>
          <p class="text-[11px] font-black tabular-nums text-gray-600 dark:text-gray-400">0</p>
          <p class="text-[9px] text-gray-500">failed</p>
        </div>
      </div>
    </div>
  </div>

  <!-- ════ Workspace Control — settings panel with branding, locations, retention, BNPL ════ -->
  <div v-else-if="id === 'workspace-control'" class="w-full text-[9px] space-y-2">
    <!-- Brand row -->
    <div class="flex items-center gap-2 p-2 rounded-lg ring-1 ring-black/10 dark:ring-white/10">
      <div class="size-8 rounded-lg bg-gradient-to-br from-secondary-500 to-rose-600 flex items-center justify-center text-white font-black text-[11px]">M</div>
      <div class="flex-1 min-w-0">
        <p class="text-[11px] font-black tracking-tight">Momentfy Studio</p>
        <p class="text-[9px] text-gray-500">SAR · ar/en · Asia/Riyadh</p>
      </div>
      <UIcon name="i-lucide-settings" class="size-3.5 text-gray-400" />
    </div>

    <!-- Settings rows -->
    <div class="space-y-1">
      <div class="flex items-center gap-2 p-1.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04]">
        <UIcon name="i-lucide-map-pin" class="size-3 text-secondary-500" />
        <span class="text-[10px] font-semibold flex-1">Locations</span>
        <span class="text-[9px] tabular-nums text-gray-500">3 branches</span>
      </div>
      <div class="flex items-center gap-2 p-1.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04]">
        <UIcon name="i-lucide-shield-check" class="size-3 text-emerald-500" />
        <span class="text-[10px] font-semibold flex-1">Permissions</span>
        <span class="text-[9px] tabular-nums text-gray-500">4 templates</span>
      </div>
      <div class="flex items-center gap-2 p-1.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04]">
        <UIcon name="i-lucide-database-backup" class="size-3 text-amber-500" />
        <span class="text-[10px] font-semibold flex-1">Backup</span>
        <span class="text-[9px] tabular-nums text-gray-500">last · 02:04</span>
      </div>
      <div class="flex items-center gap-2 p-1.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04]">
        <UIcon name="i-lucide-archive" class="size-3 text-secondary-500" />
        <span class="text-[10px] font-semibold flex-1">Retention</span>
        <span class="text-[9px] tabular-nums text-gray-500">90d / GDPR</span>
      </div>
      <div class="flex items-center gap-2 p-1.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04]">
        <UIcon name="i-lucide-credit-card" class="size-3 text-orange-500" />
        <span class="text-[10px] font-semibold flex-1">BNPL</span>
        <span class="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
          <span class="size-1 rounded-full bg-emerald-500" />
          Tabby + Tamara
        </span>
      </div>
    </div>
  </div>

  <!-- ════ Activity Logs & Audit — filter chips + audit trail rows + hash-chain footer ════ -->
  <div v-else-if="id === 'activity-logs'" class="w-full text-[9px] space-y-2">
    <!-- Filter chips -->
    <div class="flex items-center gap-1 flex-wrap">
      <span class="inline-flex items-center gap-1 ps-1.5 pe-2 py-0.5 rounded-full bg-primary text-white dark:bg-white dark:text-primary text-[9px] font-bold">
        Today
      </span>
      <span class="inline-flex items-center gap-1 ps-1.5 pe-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/10 text-[9px] font-semibold">
        All members
      </span>
      <span class="inline-flex items-center gap-1 ps-1.5 pe-2 py-0.5 rounded-full bg-black/[0.06] dark:bg-white/10 text-[9px] font-semibold">
        Sensitive
      </span>
      <span class="ms-auto text-[9px] tabular-nums text-gray-400 font-bold">1,284 events</span>
    </div>

    <!-- Audit rows -->
    <div class="space-y-1">
      <div class="flex items-start gap-2 p-1.5 rounded-md bg-rose-500/[0.06] ring-1 ring-rose-500/15">
        <span class="size-1.5 mt-1 rounded-full bg-rose-500 shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] leading-tight">
            <span class="font-bold">Lina H.</span>
            <span class="text-gray-500"> deleted invoice</span>
            <span class="font-bold tabular-nums"> #INV-2031</span>
          </p>
          <p class="text-[9px] text-gray-400 mt-0.5">11:42 · IP 41.32.•.•</p>
        </div>
        <UIcon name="i-lucide-trash-2" class="size-3 text-rose-500 shrink-0" />
      </div>
      <div class="flex items-start gap-2 p-1.5 rounded-md bg-amber-500/[0.06] ring-1 ring-amber-500/15">
        <span class="size-1.5 mt-1 rounded-full bg-amber-500 shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] leading-tight">
            <span class="font-bold">Owner</span>
            <span class="text-gray-500"> impersonated</span>
            <span class="font-bold"> Noura A.</span>
          </p>
          <p class="text-[9px] text-gray-400 mt-0.5">11:08 · session 14m</p>
        </div>
        <UIcon name="i-lucide-key" class="size-3 text-amber-500 shrink-0" />
      </div>
      <div class="flex items-start gap-2 p-1.5 rounded-md bg-secondary-500/[0.06] ring-1 ring-secondary-500/15">
        <span class="size-1.5 mt-1 rounded-full bg-secondary-500 shrink-0" />
        <div class="flex-1 min-w-0">
          <p class="text-[10px] leading-tight">
            <span class="font-bold">Reception</span>
            <span class="text-gray-500"> changed role for</span>
            <span class="font-bold"> Yasmine</span>
          </p>
          <p class="text-[9px] text-gray-400 mt-0.5">10:21 · Staff → Manager</p>
        </div>
        <UIcon name="i-lucide-user-cog" class="size-3 text-secondary-500 shrink-0" />
      </div>
    </div>

    <!-- Hash-chain footer -->
    <div class="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-emerald-500/[0.08] ring-1 ring-emerald-500/20">
      <UIcon name="i-lucide-shield-check" class="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span class="text-[9px] font-bold text-emerald-700 dark:text-emerald-300">Hash-chain · ledger sealed</span>
      <span class="ms-auto font-mono text-[9px] tabular-nums text-emerald-700 dark:text-emerald-400">7e2a…b91c</span>
    </div>
  </div>

  <!-- ════ Dental Chart (odontogram mock) ════ -->
  <div v-else-if="id === 'dental'" class="w-full">
    <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Odontogram · Upper R</p>
    <div class="flex gap-1 justify-center">
      <div v-for="(t, i) in [
        { n: 18, s: 'ok' }, { n: 17, s: 'filled' }, { n: 16, s: 'ok' }, { n: 15, s: 'caries' }, { n: 14, s: 'ok' }, { n: 13, s: 'ok' }, { n: 12, s: 'crown' }, { n: 11, s: 'ok' }
      ]" :key="i" class="flex-1 flex flex-col items-center gap-0.5">
        <span class="text-[8px] text-gray-400">{{ t.n }}</span>
        <div class="w-full aspect-square rounded-md border relative" :class="{
          'border-gray-300 bg-white dark:bg-white/5 dark:border-white/20': t.s === 'ok',
          'border-amber-400 bg-amber-100 dark:bg-amber-500/20': t.s === 'filled',
          'border-red-400 bg-red-100 dark:bg-red-500/20': t.s === 'caries',
          'border-secondary-400 bg-secondary-100 dark:bg-secondary-500/20': t.s === 'crown'
        }" />
      </div>
    </div>
    <div class="mt-3 flex flex-wrap gap-2 text-[9px]">
      <span class="inline-flex items-center gap-1"><span class="size-2 rounded-sm bg-amber-400" />Filled</span>
      <span class="inline-flex items-center gap-1"><span class="size-2 rounded-sm bg-red-400" />Caries</span>
      <span class="inline-flex items-center gap-1"><span class="size-2 rounded-sm bg-secondary-400" />Crown</span>
    </div>
  </div>

  <!-- ════ Medical Record / EMR ════ -->
  <div v-else-if="id === 'medical'" class="w-full">
    <div class="rounded-lg bg-white dark:bg-[#0c0c0c] border border-black/10 dark:border-white/10 p-3 text-[10px]">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-1.5">
          <UIcon name="i-lucide-heart-pulse" class="size-3.5 text-red-500" />
          <span class="font-bold">Visit · SOAP note</span>
        </div>
        <span class="text-gray-400">18 Apr · 14:30</span>
      </div>
      <div class="space-y-1.5">
        <p><span class="font-bold text-secondary-500">S</span> — patient reports headache · 3 days</p>
        <p><span class="font-bold text-secondary-500">O</span> — BP 120/80 · HR 76 · Temp 37.1°C</p>
        <p><span class="font-bold text-secondary-500">A</span> — tension-type headache</p>
        <p><span class="font-bold text-secondary-500">P</span> — ibuprofen 400mg · review 1wk</p>
      </div>
      <div class="mt-2 flex gap-1.5 pt-2 border-t border-black/5 dark:border-white/10">
        <span class="text-[9px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 font-semibold">Allergies · 1</span>
        <span class="text-[9px] px-1.5 py-0.5 rounded bg-secondary-500/15 text-secondary-600 font-semibold">Rx · 1</span>
      </div>
    </div>
  </div>

  <!-- ════ Barber queue ════ -->
  <div v-else-if="id === 'barber'" class="w-full">
    <div class="flex items-center justify-between mb-2">
      <p class="text-[10px] font-bold uppercase tracking-wider text-gray-500">Walk-in queue</p>
      <span class="text-[9px] text-gray-400">Now: 14:32</span>
    </div>
    <div class="space-y-1.5">
      <div
        v-for="(q, i) in [
          { p: 1, n: 'Ahmad', w: '0m', c: 'bg-emerald-500' },
          { p: 2, n: 'Yusuf', w: '4m', c: 'bg-amber-500' },
          { p: 3, n: 'Omar', w: '12m', c: 'bg-gray-400' },
          { p: 4, n: 'Rayan', w: '18m', c: 'bg-gray-400' }
        ]" :key="i"
        class="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10"
      >
        <div class="size-6 rounded-full text-white text-[10px] font-black flex items-center justify-center" :class="q.c">{{ q.p }}</div>
        <span class="text-[11px] font-bold flex-1">{{ q.n }}</span>
        <span class="text-[10px] text-gray-500">wait {{ q.w }}</span>
      </div>
    </div>
  </div>

  <!-- ════ Fitness / Classes ════ -->
  <div v-else-if="id === 'fitness'" class="w-full space-y-1.5">
    <div
      v-for="c in [
        { n: 'Yoga Flow', t: '07:00', seats: 14, cap: 16, c: 'from-emerald-400 to-secondary-500' },
        { n: 'HIIT Blast', t: '08:30', seats: 12, cap: 12, c: 'from-orange-400 to-red-500', full: true },
        { n: 'Pilates', t: '18:00', seats: 8, cap: 15, c: 'from-secondary-400 to-secondary-500' }
      ]" :key="c.n"
      class="p-2 rounded-lg bg-white dark:bg-[#0c0c0c] border border-black/5 dark:border-white/10"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-1 h-8 rounded-full bg-gradient-to-b" :class="c.c" />
          <div>
            <p class="text-[11px] font-bold">{{ c.n }}</p>
            <p class="text-[9px] text-gray-400">{{ c.t }}</p>
          </div>
        </div>
        <div class="text-end">
          <p class="text-[10px] font-bold">{{ c.seats }}/{{ c.cap }}</p>
          <span v-if="c.full" class="text-[8px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-600 font-bold">WAITLIST</span>
          <span v-else class="text-[8px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold">OPEN</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ════ Pet / Vet ════ -->
  <div v-else-if="id === 'pet'" class="w-full">
    <div class="rounded-lg bg-white dark:bg-[#0c0c0c] border border-black/10 dark:border-white/10 p-3">
      <div class="flex items-center gap-2 mb-2">
        <div class="size-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white">
          <UIcon name="i-lucide-paw-print" class="size-4" />
        </div>
        <div class="flex-1">
          <p class="text-[11px] font-bold">Max · Golden Retriever</p>
          <p class="text-[9px] text-gray-500">Age 4 · 28 kg · Client: Lina H.</p>
        </div>
      </div>
      <div class="space-y-1 text-[10px]">
        <div class="flex items-center justify-between p-1.5 rounded bg-emerald-500/10">
          <span class="flex items-center gap-1"><UIcon name="i-lucide-shield-check" class="size-3 text-emerald-600" />Rabies</span>
          <span class="text-emerald-700 dark:text-emerald-400">valid · Jul 26</span>
        </div>
        <div class="flex items-center justify-between p-1.5 rounded bg-amber-500/10">
          <span class="flex items-center gap-1"><UIcon name="i-lucide-alert-triangle" class="size-3 text-amber-600" />DHPP</span>
          <span class="text-amber-700 dark:text-amber-400">due · May 12</span>
        </div>
        <div class="flex items-center justify-between p-1.5 rounded bg-secondary-500/10">
          <span class="flex items-center gap-1"><UIcon name="i-lucide-scissors" class="size-3 text-secondary-600" />Grooming</span>
          <span class="text-secondary-700 dark:text-secondary-400">Monthly · SAR 150</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ════ fallback: abstract visual using color ════ -->
  <div v-else class="w-full space-y-2">
    <div class="h-2 rounded-full bg-black/10 dark:bg-white/10"><div class="h-full rounded-full bg-gradient-to-r w-3/4" :class="color" /></div>
    <div class="h-2 rounded-full bg-black/10 dark:bg-white/10"><div class="h-full rounded-full bg-gradient-to-r w-1/2" :class="color" /></div>
    <div class="h-2 rounded-full bg-black/10 dark:bg-white/10"><div class="h-full rounded-full bg-gradient-to-r w-[85%]" :class="color" /></div>
  </div>
</template>

<script setup>
// Order-review step between /portal/pricing and the Lemon Squeezy hosted
// checkout. Shows exactly what the customer will be charged (plan, promo,
// total) before pushing them to the payment gateway.
//
// URL: /portal/checkout/self-install?promo=WELCOME10
//
// If the visitor isn't logged in, we bounce to /auth/register and carry
// both the plan slug AND the promo through the redirect so the review
// page re-renders post-register without the user re-typing anything.

definePageMeta({ layout: 'landing' })
const copy = useLandingCopy()
const { locale } = useI18n()
const route = useRoute()
const toast = useToast()
const session = useUserSession()

const planSlug = computed(() => String(route.params.planSlug || ''))

// Carried promo code from ?promo= query. We keep it reactive so the user
// can apply / swap / remove it on this page too.
const promoInput = ref(typeof route.query.promo === 'string' ? route.query.promo : '')
const promoError = ref('')

// Single fetch returning plan + resolved promo + computed totals. Re-runs
// whenever planSlug or the applied promo change.
const { data: preview, refresh: refreshPreview, error } = await useFetch(
  () => `/api/portal/checkout/preview/${planSlug.value}`,
  {
    query: computed(() => (promoInput.value ? { promo: promoInput.value } : {})),
    watch: [planSlug, promoInput],
    default: () => null
  }
)

// "Currently-applied" promo is what the server resolved, not what's typed.
// If the user types an invalid code, the server quietly returns promo:null.
const applied = computed(() => preview.value?.promo ?? null)
const appliedInvalid = computed(
  () => !!promoInput.value && !applied.value && !error.value
)

const totals = computed(() => preview.value?.totals)
const plan = computed(() => preview.value?.plan)
const featureList = computed(() => {
  const list = plan.value?.features ?? []
  return list.map(f => (locale.value === 'ar' && f.labelAr ? f.labelAr : f.label))
})
const planName = computed(() =>
  locale.value === 'ar' && plan.value?.nameAr ? plan.value.nameAr : plan.value?.name
)

// Promo input UX — separate buffer so we only apply on submit.
const promoBuffer = ref(promoInput.value)
async function applyPromo() {
  const code = promoBuffer.value.trim().toUpperCase()
  if (!code) return
  promoInput.value = code
  promoBuffer.value = code
  await refreshPreview()
  if (!preview.value?.promo) {
    promoError.value = locale.value === 'ar'
      ? 'هذا الكود غير صالح أو منتهٍ أو لا يناسب هذه الخطة.'
      : 'Invalid, expired, or not applicable to this plan.'
  } else {
    promoError.value = ''
  }
}
function clearPromo() {
  promoInput.value = ''
  promoBuffer.value = ''
  promoError.value = ''
}

// Proceed → Lemon Squeezy. We keep this here rather than in pricing.vue
// because the review page is the canonical "last step before payment".
const submitting = ref(false)
const localePath = useLocalePath()
async function proceedToPayment() {
  if (!planSlug.value) return
  if (!session.loggedIn.value) {
    // Carry both the plan and the promo through register so the review
    // page re-renders with the discount after the round-trip.
    const q = applied.value ? `?promo=${encodeURIComponent(applied.value.code)}` : ''
    const back = `${localePath(`/portal/checkout/${planSlug.value}`)}${q}`
    return navigateTo(`${localePath('/auth/register')}?redirect=${encodeURIComponent(back)}`)
  }
  submitting.value = true
  try {
    const res = await $fetch(`/api/portal/checkout/${planSlug.value}`, {
      method: 'POST',
      body: applied.value ? { promoCode: applied.value.code } : undefined
    })
    window.location.href = res.url
  } catch (err) {
    toast.add({
      title: locale.value === 'ar' ? 'تعذّر إنشاء عملية الدفع' : 'Checkout unavailable',
      description: err.statusMessage || err.data?.statusMessage || err.message || 'Try again in a moment.',
      color: 'error',
      duration: 8000
    })
  } finally {
    submitting.value = false
  }
}

useHead(() => ({
  title: locale.value === 'ar'
    ? `مراجعة الطلب — ${planName.value || ''} — Momentfy`
    : `Review order — ${planName.value || ''} — Momentfy`,
  meta: [{ name: 'robots', content: 'noindex' }]
}))

// Localized copy bundle. Must be a single computed returning a plain string
// map — nested ComputedRefs inside a raw object do NOT auto-unwrap in Vue
// templates, which previously rendered "[object Object]" inside attributes
// bound via `:placeholder="t.placeholder"`.
const t = computed(() => {
  const ar = locale.value === 'ar'
  return {
    eyebrow: ar ? 'مراجعة الطلب' : 'Review order',
    heading: ar ? 'راجع طلبك قبل الدفع.' : 'Review before you pay.',
    sub: ar
      ? 'تأكد من خطتك، خصمك، وإجماليك قبل أن ننقلك إلى بوابة الدفع الآمنة.'
      : 'Confirm the plan, any discount and the total before we hand you to the payment gateway.',
    whatsIncluded: ar ? 'ما تحصل عليه' : "What's included",
    summary: ar ? 'ملخص الطلب' : 'Order summary',
    subtotal: ar ? 'السعر الأصلي' : 'Subtotal',
    discount: ar ? 'الخصم' : 'Discount',
    total: ar ? 'الإجمالي' : 'Total',
    promoLabel: ar ? 'كود خصم' : 'Promo code',
    applyBtn: ar ? 'تطبيق' : 'Apply',
    removeBtn: ar ? 'إزالة' : 'Remove',
    applied: ar ? 'تم التطبيق' : 'Applied',
    placeholder: ar ? 'أدخل الكود' : 'Enter code',
    proceed: ar ? 'المتابعة إلى الدفع' : 'Continue to payment',
    changePlan: ar ? 'تغيير الخطة' : 'Change plan',
    secure: ar
      ? 'الدفع مؤمّن عبر Lemon Squeezy. سننقلك لموقع آمن لإتمام المعاملة، ولا تمر بطاقتك أبداً من خوادمنا.'
      : "You'll be redirected to Lemon Squeezy's secure checkout. No card details touch our servers.",
    oneTime: ar ? 'دفعة واحدة' : 'One-time',
    lifetime: ar ? 'تحديثات مدى الحياة' : 'Lifetime updates',
    youSave: ar ? 'توفيرك' : 'You save'
  }
})
</script>

<template>
  <section class="relative py-16 sm:py-20 lg:py-28 overflow-hidden">
    <!-- Soft backdrop -->
    <div aria-hidden="true" class="absolute inset-0 -z-10">
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(40rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-secondary-500 blur-[160px] opacity-[0.10] rounded-full" />
    </div>

    <div class="max-w-6xl mx-auto px-5 sm:px-8">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-xs text-gray-500 mb-8" aria-label="Breadcrumb">
        <NuxtLink :to="localePath('/portal/pricing')" class="hover:text-primary dark:hover:text-white uppercase tracking-[0.2em]">
          {{ copy.pricingPage.eyebrow }}
        </NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-3 rtl:rotate-180" />
        <span class="uppercase tracking-[0.2em]">{{ t.eyebrow }}</span>
      </nav>

      <!-- Heading -->
      <div class="mb-10 sm:mb-16">
        <div class="flex items-baseline gap-3 mb-4">
          <span aria-hidden="true" class="h-px w-8 bg-secondary-500" />
          <p class="text-[11px] uppercase tracking-[0.25em] text-secondary-600 dark:text-secondary-400 font-bold">
            {{ t.eyebrow }}
          </p>
        </div>
        <h1 class="font-black tracking-tight leading-[0.95] text-4xl sm:text-5xl lg:text-6xl">
          {{ t.heading }}
        </h1>
        <p class="mt-5 text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
          {{ t.sub }}
        </p>
      </div>

      <!-- Plan-not-found fallback -->
      <div v-if="!plan && !error" class="py-10 text-center text-gray-500">
        <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin" />
      </div>
      <div v-else-if="error || !plan" class="rounded-2xl border border-black/10 dark:border-white/10 bg-red-500/5 p-8 text-center">
        <UIcon name="i-lucide-alert-triangle" class="size-6 mx-auto text-red-600 dark:text-red-400 mb-3" />
        <p class="text-lg font-black mb-2">
          {{ locale === 'ar' ? 'الخطة غير موجودة' : 'Plan not found' }}
        </p>
        <NuxtLink :to="localePath('/portal/pricing')" class="inline-block mt-4 text-sm font-bold text-primary dark:text-white underline">
          {{ t.changePlan }}
        </NuxtLink>
      </div>

      <!-- Two-column review layout -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <!-- LEFT — plan details + features -->
        <div class="lg:col-span-7">
          <div class="rounded-3xl bg-white dark:bg-white/[0.02] ring-1 ring-black/10 dark:ring-white/10 p-6 sm:p-8">
            <!-- Plan header -->
            <div class="flex items-start gap-4 pb-6 border-b border-black/10 dark:border-white/10">
              <div class="size-12 sm:size-16 rounded-2xl bg-gradient-to-br from-secondary-500 to-secondary-700 text-white flex items-center justify-center shadow-lg shrink-0">
                <UIcon name="i-lucide-package-check" class="size-6 sm:size-8" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-bold mb-1">{{ t.oneTime }} · {{ t.lifetime }}</p>
                <h2 class="font-black tracking-tight text-2xl sm:text-3xl">{{ planName }}</h2>
                <p v-if="plan.description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ locale === 'ar' && plan.descriptionAr ? plan.descriptionAr : plan.description }}
                </p>
              </div>
            </div>

            <!-- What's included -->
            <div class="pt-6">
              <p class="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-bold mb-4">{{ t.whatsIncluded }}</p>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <li v-for="f in featureList" :key="f" class="flex items-start gap-2.5 text-sm">
                  <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-0.5 text-emerald-500" />
                  <span class="text-gray-700 dark:text-gray-300">{{ f }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Change-plan link -->
          <NuxtLink :to="localePath('/portal/pricing')" class="mt-5 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary dark:hover:text-white transition-colors">
            <UIcon name="i-lucide-arrow-left" class="size-3.5 rtl:rotate-180" />
            {{ t.changePlan }}
          </NuxtLink>
        </div>

        <!-- RIGHT — order summary + promo + CTA (sticky on large screens) -->
        <div class="lg:col-span-5">
          <div class="lg:sticky lg:top-28 rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 sm:p-8 shadow-2xl shadow-emerald-500/25 ring-1 ring-white/10">
            <p class="text-[10px] uppercase tracking-[0.25em] opacity-70 font-bold mb-5">{{ t.summary }}</p>

            <!-- Promo code row -->
            <div class="mb-6 pb-6 border-b border-white/20">
              <label class="text-[11px] uppercase tracking-[0.2em] opacity-70 font-bold block mb-2">{{ t.promoLabel }}</label>

              <form v-if="!applied" class="flex items-stretch gap-2" @submit.prevent="applyPromo">
                <input
                  v-model="promoBuffer"
                  type="text"
                  :placeholder="t.placeholder"
                  class="flex-1 min-w-0 h-10 px-3 rounded-lg bg-white/15 text-white placeholder:text-white/50 text-sm font-semibold tracking-wide uppercase focus:outline-none focus:ring-2 focus:ring-white/40 transition"
                  autocomplete="off"
                  spellcheck="false"
                />
                <button
                  type="submit"
                  :disabled="!promoBuffer.trim()"
                  class="shrink-0 h-10 px-4 rounded-lg bg-white text-emerald-700 text-xs font-black uppercase tracking-wider disabled:opacity-50 transition"
                >{{ t.applyBtn }}</button>
              </form>

              <div v-else class="flex items-center justify-between gap-3 px-3 h-10 rounded-lg bg-white/15 ring-1 ring-white/30 text-white">
                <span class="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                  <UIcon name="i-lucide-check-circle-2" class="size-4" />
                  {{ applied.code }} · -{{ applied.discountPercent }}%
                </span>
                <button type="button" class="text-[10px] uppercase tracking-wider font-bold opacity-80 hover:opacity-100" @click="clearPromo">
                  {{ t.removeBtn }}
                </button>
              </div>

              <p v-if="appliedInvalid && promoError" class="mt-2 text-[11px] font-bold text-red-200">
                {{ promoError }}
              </p>
            </div>

            <!-- Price breakdown -->
            <dl class="space-y-3 mb-2 text-sm">
              <div class="flex justify-between">
                <dt class="opacity-80">{{ t.subtotal }}</dt>
                <dd class="tabular-nums font-bold">{{ totals.subtotalDisplay }}</dd>
              </div>
              <div v-if="applied" class="flex justify-between text-amber-200">
                <dt class="opacity-90">{{ t.discount }} · {{ applied.code }}</dt>
                <dd class="tabular-nums font-bold">−{{ totals.discountDisplay }}</dd>
              </div>
              <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2 pt-3 border-t border-white/20">
                <dt class="text-[11px] uppercase tracking-[0.2em] opacity-70 font-bold">{{ t.total }}</dt>
                <dd class="tabular-nums font-black text-3xl sm:text-4xl lg:text-5xl leading-none break-words">{{ totals.totalDisplay }}</dd>
              </div>
              <p v-if="applied" class="text-[11px] opacity-80 text-end">
                {{ t.youSave }} {{ totals.discountDisplay }}
              </p>
            </dl>

            <!-- Proceed CTA -->
            <button
              type="button"
              class="mt-6 flex items-center justify-center gap-3 w-full h-16 rounded-2xl bg-white text-emerald-700 text-sm font-black uppercase tracking-wider transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60 disabled:translate-y-0"
              :disabled="submitting"
              @click="proceedToPayment"
            >
              <UIcon :name="submitting ? 'i-lucide-loader-circle' : 'i-lucide-shield-check'" class="size-4" :class="{ 'animate-spin': submitting }" />
              {{ t.proceed }}
              <UIcon v-if="!submitting" name="i-lucide-arrow-right" class="size-4 rtl:rotate-180" />
            </button>

            <p class="mt-4 text-[11px] leading-relaxed opacity-75 text-center">
              <UIcon name="i-lucide-lock" class="size-3 inline-block me-1 align-[-2px]" />
              {{ t.secure }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

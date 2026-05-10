<script setup>
const localePath = useLocalePath()
definePageMeta({ layout: 'landing' });
const copy = useLandingCopy();
const { locale } = useI18n();
useLandingSeo({
    ar: {
        title: 'احصل على الكود — Momentfy',
        description: 'احصل على كود Momentfy خلال دقائق. دفع آمن عبر Lemon Squeezy، ثم وصول فوري إلى المستودع، مفتاح الترخيص، ودليل التنصيب.'
    },
    en: {
        title: 'Get the source — Momentfy',
        description: 'Buy the Momentfy source. Secure checkout via Lemon Squeezy. Instant download of the repo, license key and install docs.'
    }
});
const contactName = ref('');
const contactEmail = ref('');
const contactMessage = ref('');
const contactWebsite = ref(''); // honeypot — real visitors leave empty
const sent = ref(false);
const submitting = ref(false);
const submitError = ref('');
const toast = useToast();
async function submitContact() {
    if (!contactEmail.value || submitting.value)
        return;
    submitting.value = true;
    submitError.value = '';
    try {
        await $fetch('/api/portal/contact', {
            method: 'POST',
            body: {
                name: contactName.value,
                email: contactEmail.value,
                message: contactMessage.value,
                website: contactWebsite.value
            }
        });
        sent.value = true;
    }
    catch (err) {
        submitError.value = err.statusMessage || err.data?.statusMessage || err.message || copy.value.ui.contactSendError;
        toast.add({
            title: copy.value.ui.contactSendErrorTitle,
            description: submitError.value,
            color: 'error',
            duration: 6000
        });
    }
    finally {
        submitting.value = false;
    }
}
</script>

<template>
  <!-- ═══ Hero ═══ -->
  <LandingPageHero
    :crumb-label="copy.downloadPage.eyebrow"
    :headline="copy.downloadPage.h1"
    :sub="copy.downloadPage.sub"
  >
    <template #background>
      <div class="absolute top-0 start-1/2 -translate-x-1/2 w-[min(50rem,90vw)] h-[min(30rem,60vw)] sm:h-[30rem] bg-secondary-500 blur-[150px] opacity-[0.15] rounded-full" />
    </template>

    <!-- CTAs -->
    <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
      <NuxtLink :to="localePath('/portal/pricing')" class="group inline-flex items-center gap-3 text-sm font-bold">
        <span class="size-12 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover:scale-110">
          <UIcon name="i-lucide-credit-card" class="size-4" />
        </span>
        <span class="relative">
          {{ copy.downloadPage.buy }}
          <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover:bg-secondary-500 transition-colors" />
        </span>
      </NuxtLink>
      <a href="#contact" class="group inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary dark:hover:text-white transition-colors">
        <UIcon name="i-lucide-mail" class="size-3.5" />
        <span class="relative">
          {{ copy.downloadPage.talk }}
          <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current opacity-0 group-hover:opacity-100 transition-opacity" />
        </span>
      </a>
    </div>
  </LandingPageHero>

  <!-- ═══ Step timeline — hairline-separated ═══ -->
  <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <div class="flex items-baseline gap-3 mb-12 pb-4 border-b border-black/10 dark:border-white/10">
        <span class="text-[11px] tabular-nums text-gray-400">A</span>
        <p class="text-[11px] uppercase tracking-[0.25em] text-gray-400">{{ copy.ui.fromZeroToLive }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 md:divide-x md:divide-black/10 md:dark:divide-white/10 rtl:md:divide-x-reverse">
        <div v-for="(s, i) in copy.downloadPage.steps" :key="s.n"
          class="relative px-0 md:px-8 first:md:ps-0 last:md:pe-0 py-6 md:py-0"
        >
          <div class="flex items-baseline gap-3 mb-4">
            <span class="text-xs tabular-nums text-gray-400">{{ s.n }}</span>
            <span aria-hidden="true" class="h-px w-6 bg-black/20 dark:bg-white/20" />
            <span class="text-xs uppercase tracking-[0.2em] text-gray-500">{{ copy.ui.stepLabel }} {{ i + 1 }}</span>
          </div>
          <h3 class="text-2xl sm:text-3xl font-black tracking-tight">{{ s.title }}</h3>
          <p class="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ s.body }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ What's in the zip ═══ -->
  <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="2"
        :label="copy.downloadPage.inside.eyebrow"
        :heading="copy.downloadPage.inside.heading"
        :sub="copy.downloadPage.inside.body"
      />

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 border-t border-black/10 dark:border-white/10 pt-10">
        <!-- Left: item list -->
        <ul class="space-y-4">
          <li v-for="(item, i) in copy.downloadPage.inside.items" :key="item"
            class="flex items-start gap-4 pb-4 border-b border-black/10 dark:border-white/10 last:border-b-0"
          >
            <span class="text-xs tabular-nums text-gray-400 w-6 shrink-0 mt-1">{{ String(i + 1).padStart(2, '0') }}</span>
            <UIcon name="i-lucide-check" class="size-4 shrink-0 mt-0.5 text-emerald-500" />
            <span class="text-sm sm:text-base font-medium">{{ item }}</span>
          </li>
        </ul>

        <!-- Right: terminal mock (kept — it's a UI element, not a card) -->
        <div class="relative rounded-2xl overflow-hidden bg-[#0c0c0c] text-gray-300 text-xs shadow-2xl h-fit" dir="ltr">
          <div class="h-10 bg-white/5 border-b border-white/10 flex items-center px-4 gap-2">
            <div class="flex gap-1.5">
              <div class="size-2.5 rounded-full bg-red-400" />
              <div class="size-2.5 rounded-full bg-yellow-400" />
              <div class="size-2.5 rounded-full bg-emerald-400" />
            </div>
            <div class="mx-auto text-[11px] text-gray-400">~/momentfy</div>
          </div>
          <div class="p-5 space-y-1.5 leading-relaxed">
            <p><span class="text-emerald-400">➜</span> unzip momentfy-1.0.0.zip</p>
            <p class="text-gray-500"># extracting 1,284 files…</p>
            <p><span class="text-emerald-400">➜</span> cd momentfy && cp .env.example .env</p>
            <p><span class="text-emerald-400">➜</span> docker compose up -d</p>
            <p class="text-gray-500">[+] Running 3/3</p>
            <p class="text-gray-500"><span class="text-emerald-400">✔</span> Network momentfy_default Created</p>
            <p class="text-gray-500"><span class="text-emerald-400">✔</span> Container momentfy-db Started</p>
            <p class="text-gray-500"><span class="text-emerald-400">✔</span> Container momentfy-app Started</p>
            <p class="text-gray-500">→ Open <span class="text-sky-400">http://localhost:3000</span> to finish setup.</p>
            <p class="mt-2"><span class="text-violet-400">momentfy</span> is ready. <span class="animate-pulse">▊</span></p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ Changelog ═══ -->
  <section id="changelog" class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="3"
        :label="copy.downloadPage.changelog.eyebrow"
        :heading="copy.downloadPage.changelog.heading"
      />

      <div class="max-w-3xl border-t border-black/10 dark:border-white/10">
        <div v-for="(e, i) in copy.downloadPage.changelog.entries" :key="e.ver"
          class="grid grid-cols-12 gap-4 sm:gap-6 py-6 border-b border-black/10 dark:border-white/10 items-start"
        >
          <div class="col-span-12 sm:col-span-3 flex items-center gap-3">
            <span aria-hidden="true" class="size-2.5 rounded-full shrink-0"
              :class="e.current ? 'bg-secondary-500 ring-4 ring-secondary-500/20' : 'bg-gray-300 dark:bg-gray-700'"
            />
            <span class="text-xs uppercase tracking-[0.2em] text-gray-500">{{ e.ver }}</span>
          </div>
          <div class="col-span-12 sm:col-span-9">
            <h3 class="text-xl sm:text-2xl font-black tracking-tight">{{ e.title }}</h3>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ e.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ═══ Contact form ═══ -->
  <section id="contact" class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="4"
        :label="copy.downloadPage.contact.eyebrow"
        :heading="copy.downloadPage.contact.heading"
        :sub="copy.downloadPage.contact.sub"
      />

      <!-- Form: no card, just hairline-separated rows -->
      <form @submit.prevent="submitContact" class="max-w-3xl border-t border-black/10 dark:border-white/10">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-10">
          <label class="block py-5 border-b border-black/10 dark:border-white/10">
            <span class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ copy.downloadPage.contact.name }}</span>
            <input v-model="contactName" type="text" :placeholder="copy.downloadPage.contact.namePh"
              class="mt-2 w-full bg-transparent text-base font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none" />
          </label>
          <label class="block py-5 border-b border-black/10 dark:border-white/10">
            <span class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ copy.downloadPage.contact.email }}</span>
            <input v-model="contactEmail" required type="email" :placeholder="copy.downloadPage.contact.emailPh"
              class="mt-2 w-full bg-transparent text-base font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none" />
          </label>
        </div>
        <label class="block py-5 border-b border-black/10 dark:border-white/10">
          <span class="text-xs uppercase tracking-[0.2em] text-gray-400">{{ copy.downloadPage.contact.message }}</span>
          <textarea v-model="contactMessage" rows="4" :placeholder="copy.downloadPage.contact.messagePh"
            class="mt-2 w-full bg-transparent text-base font-medium placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none resize-none" />
        </label>
        <div aria-hidden="true" class="absolute left-[-9999px] h-0 w-0 overflow-hidden" tabindex="-1">
          <label>
            Website (leave empty)
            <input v-model="contactWebsite" type="text" tabindex="-1" autocomplete="off" />
          </label>
        </div>
        <button type="submit"
          class="group/cta mt-6 inline-flex items-center gap-3 text-sm font-bold disabled:opacity-60"
          :disabled="sent || submitting"
        >
          <span class="size-12 rounded-full bg-primary text-white dark:bg-white dark:text-primary flex items-center justify-center transition-transform group-hover/cta:scale-110"
            :class="sent ? 'bg-emerald-500 dark:bg-emerald-500 !text-white' : ''"
          >
            <UIcon
              :name="submitting ? 'i-lucide-loader-circle' : sent ? 'i-lucide-check' : 'i-lucide-send'"
              class="size-4"
              :class="{ 'animate-spin': submitting }"
            />
          </span>
          <span class="relative">
            {{ sent ? copy.downloadPage.contact.sent : copy.downloadPage.contact.submit }}
            <span aria-hidden="true" class="absolute -bottom-0.5 inset-x-0 h-px bg-current group-hover/cta:bg-secondary-500 transition-colors" />
          </span>
        </button>
      </form>
    </div>
  </section>

  <!-- ═══ Download FAQ ═══ -->
  <section class="py-16 sm:py-20 border-t border-black/10 dark:border-white/10">
    <div class="max-w-7xl mx-auto px-5 sm:px-8">
      <LandingSectionHeading
        number="5"
        :label="copy.downloadPage.faq.eyebrow"
        :heading="copy.downloadPage.faq.heading"
      />

      <div class="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0 border-t border-black/10 dark:border-white/10">
        <div v-for="f in copy.downloadPage.faq.items" :key="f.q"
          class="py-6 border-b border-black/10 dark:border-white/10"
        >
          <h3 class="text-base sm:text-lg font-bold">{{ f.q }}</h3>
          <p class="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{{ f.a }}</p>
        </div>
      </div>
    </div>
  </section>

  <LandingCTA />
</template>

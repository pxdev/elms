<script setup>
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const localePath = useLocalePath();
const t = computed(() => chrome.value.admin.settingsPage);
useHead({ title: () => chrome.value.admin.settingsPage.docTitle });
const { data: cfg } = await useFetch('/api/portal/admin/settings/integrations');
const prodWarnings = computed(() => {
    if (!cfg.value || cfg.value.nodeEnv !== 'production')
        return [];
    const w = [];
    if (!cfg.value.licensePepperSet)
        w.push(t.value.warnPepperMissing);
    if (!cfg.value.licenseSigning.privateKeySet)
        w.push(t.value.warnPrivateKeyMissing);
    if (!cfg.value.licenseSigning.keypairMatches)
        w.push(t.value.warnKeypairMismatch);
    if (!cfg.value.sessionCookieSecure)
        w.push(t.value.warnCookieInsecure);
    return w;
});
</script>

<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6">
    <header>
      <h1 class="text-2xl font-bold">{{ t.title }}</h1>
      <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
    </header>

    <UAlert
      v-if="prodWarnings.length"
      color="error"
      variant="soft"
      icon="i-lucide-alert-triangle"
      :title="t.warningTitle"
    >
      <ul class="mt-2 list-disc ps-5 text-sm space-y-1">
        <li v-for="(w, i) in prodWarnings" :key="i">{{ w }}</li>
      </ul>
    </UAlert>

    <UCard class="!shadow-none">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-shield-check" class="size-5 text-primary" />
          <h3 class="font-semibold">{{ t.secKeypair }}</h3>
        </div>
      </template>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt class="text-muted">{{ t.fieldPrivateSeed }}</dt>
          <dd>
            <UBadge :color="cfg?.licenseSigning.privateKeySet ? 'success' : 'error'" variant="soft" size="sm">
              {{ cfg?.licenseSigning.privateKeySet ? t.badgeConfigured : t.badgeMissing }}
            </UBadge>
          </dd>
        </div>
        <div>
          <dt class="text-muted">{{ t.fieldKeypairValid }}</dt>
          <dd>
            <UBadge :color="cfg?.licenseSigning.keypairMatches ? 'success' : 'error'" variant="soft" size="sm">
              {{ cfg?.licenseSigning.keypairMatches ? t.badgeRoundTripOk : t.badgeMismatch }}
            </UBadge>
          </dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-muted">{{ t.fieldPublicKey }}</dt>
          <dd class="font-mono text-xs">{{ cfg?.licenseSigning.publicKeyMasked || '—' }}</dd>
        </div>
      </dl>
      <p class="mt-4 text-xs text-muted">{{ t.keypairExplainer }}</p>
      <div class="mt-3 rounded-lg bg-elevated p-3 text-xs">
        <p class="font-semibold mb-1">{{ t.regenerateTitle }}</p>
        <pre class="font-mono overflow-x-auto">npx tsx scripts/generate-license-keypair.ts</pre>
      </div>
    </UCard>

    <UCard class="!shadow-none">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-server" class="size-5 text-primary" />
          <h3 class="font-semibold">{{ t.secRuntime }}</h3>
        </div>
      </template>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt class="text-muted">NODE_ENV</dt>
          <dd>
            <UBadge :color="cfg?.nodeEnv === 'production' ? 'primary' : 'neutral'" variant="soft" size="sm">
              {{ cfg?.nodeEnv }}
            </UBadge>
          </dd>
        </div>
        <div>
          <dt class="text-muted">{{ t.fieldPortalUrl }}</dt>
          <dd class="font-mono text-xs break-all">{{ cfg?.portalUrl || '—' }}</dd>
        </div>
        <div>
          <dt class="text-muted">{{ t.fieldCookieSecure }}</dt>
          <dd>
            <UBadge :color="cfg?.sessionCookieSecure ? 'success' : 'warning'" variant="soft" size="sm">
              {{ cfg?.sessionCookieSecure ? t.badgeEnabled : t.badgeDisabled }}
            </UBadge>
          </dd>
        </div>
        <div>
          <dt class="text-muted">LICENSE_PEPPER</dt>
          <dd>
            <UBadge :color="cfg?.licensePepperSet ? 'success' : 'warning'" variant="soft" size="sm">
              {{ cfg?.licensePepperSet ? t.badgeSet : t.badgeNotSet }}
            </UBadge>
          </dd>
        </div>
      </dl>
    </UCard>

    <div class="flex items-center justify-between p-4 rounded-xl bg-elevated">
      <div>
        <p class="font-semibold text-sm">{{ t.integrationsTitle }}</p>
        <p class="text-xs text-muted mt-0.5">{{ t.integrationsDesc }}</p>
      </div>
      <UButton :to="localePath('/admin/settings/integrations')" trailing-icon="i-lucide-arrow-right" variant="soft" size="sm">{{ t.integrationsOpen }}</UButton>
    </div>

    <div class="flex items-center justify-between p-4 rounded-xl bg-elevated">
      <div>
        <p class="font-semibold text-sm">{{ chrome.admin.backupPage.title }}</p>
        <p class="text-xs text-muted mt-0.5">{{ chrome.admin.backupPage.subtitle }}</p>
      </div>
      <UButton :to="localePath('/admin/settings/backup')" trailing-icon="i-lucide-arrow-right" variant="soft" size="sm">{{ t.integrationsOpen }}</UButton>
    </div>
  </div>
</template>

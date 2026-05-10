<script setup>
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const t = computed(() => chrome.value.admin.integrationsPage);
useHead({ title: () => chrome.value.admin.integrationsPage.docTitle });
const toast = useToast();
const { user } = useSession();
const { data: cfg, refresh, status } = await useFetch('/api/portal/admin/settings/integrations');
const lsForm = reactive({ apiKey: '', webhookSecret: '', storeId: '', storeDomain: '', testMode: false });
const ghForm = reactive({ token: '', org: '', teamSlug: '', repo: '' });
const smtpForm = reactive({ host: '', port: null, user: '', pass: '', from: '' });
watch(cfg, (v) => {
    if (!v)
        return;
    lsForm.storeId = v.lemonSqueezy.storeId || '';
    lsForm.storeDomain = v.lemonSqueezy.storeDomain || '';
    lsForm.testMode = v.lemonSqueezy.testMode;
    ghForm.org = v.github.org || '';
    ghForm.teamSlug = v.github.teamSlug || '';
    ghForm.repo = v.github.repo || '';
    smtpForm.host = v.smtp.host || '';
    smtpForm.port = v.smtp.port;
    smtpForm.from = v.smtp.from || '';
}, { immediate: true });
const savingLs = ref(false);
const savingGh = ref(false);
const savingSmtp = ref(false);
const testingLs = ref(false);
const testingGh = ref(false);
const testingSmtp = ref(false);
const smtpTestTo = ref('');
async function saveLemonSqueezy() {
    savingLs.value = true;
    try {
        await $fetch('/api/portal/admin/settings/integrations', {
            method: 'PATCH',
            body: {
                lemonSqueezy: {
                    // Empty string for secrets means "leave unchanged"; we send `undefined`
                    // by omitting the field. Any non-empty string overwrites or saves.
                    ...(lsForm.apiKey ? { apiKey: lsForm.apiKey } : {}),
                    ...(lsForm.webhookSecret ? { webhookSecret: lsForm.webhookSecret } : {}),
                    storeId: lsForm.storeId || null,
                    storeDomain: lsForm.storeDomain || null,
                    testMode: lsForm.testMode
                }
            }
        });
        lsForm.apiKey = '';
        lsForm.webhookSecret = '';
        toast.add({ title: t.value.toastSaved, color: 'success' });
        await refresh();
    }
    catch (err) {
        toast.add({ title: t.value.toastSaveFailed, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        savingLs.value = false;
    }
}
async function saveGithub() {
    savingGh.value = true;
    try {
        await $fetch('/api/portal/admin/settings/integrations', {
            method: 'PATCH',
            body: {
                github: {
                    ...(ghForm.token ? { token: ghForm.token } : {}),
                    org: ghForm.org || null,
                    teamSlug: ghForm.teamSlug || null,
                    repo: ghForm.repo || null
                }
            }
        });
        ghForm.token = '';
        toast.add({ title: t.value.toastSaved, color: 'success' });
        await refresh();
    }
    catch (err) {
        toast.add({ title: t.value.toastSaveFailed, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        savingGh.value = false;
    }
}
async function saveSmtp() {
    savingSmtp.value = true;
    try {
        await $fetch('/api/portal/admin/settings/integrations', {
            method: 'PATCH',
            body: {
                smtp: {
                    host: smtpForm.host || null,
                    port: smtpForm.port,
                    user: smtpForm.user || null,
                    ...(smtpForm.pass ? { pass: smtpForm.pass } : {}),
                    from: smtpForm.from || null
                }
            }
        });
        smtpForm.pass = '';
        smtpForm.user = '';
        toast.add({ title: t.value.toastSaved, color: 'success' });
        await refresh();
    }
    catch (err) {
        toast.add({ title: t.value.toastSaveFailed, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        savingSmtp.value = false;
    }
}
async function testLemonSqueezy() {
    testingLs.value = true;
    try {
        const r = await $fetch('/api/portal/admin/settings/test-lemon-squeezy', { method: 'POST' });
        toast.add({ title: t.value.toastTestOk, description: r.name || r.email || undefined, color: 'success' });
    }
    catch (err) {
        toast.add({ title: t.value.toastTestFailed, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        testingLs.value = false;
    }
}
async function testGithub() {
    testingGh.value = true;
    try {
        const r = await $fetch('/api/portal/admin/settings/test-github', { method: 'POST' });
        toast.add({ title: t.value.toastTestOk, description: `${r.login} · ${r.teamCheck}`, color: 'success' });
    }
    catch (err) {
        toast.add({ title: t.value.toastTestFailed, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        testingGh.value = false;
    }
}
async function testSmtp() {
    testingSmtp.value = true;
    try {
        const body = smtpTestTo.value ? { to: smtpTestTo.value } : {};
        const r = await $fetch('/api/portal/admin/settings/test-smtp', { method: 'POST', body });
        toast.add({ title: t.value.toastTestOk, description: r.to, color: 'success' });
    }
    catch (err) {
        toast.add({ title: t.value.toastTestFailed, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        testingSmtp.value = false;
    }
}
function secretHint(set) {
    return set ? t.value.secretSetHint : t.value.secretUnsetHint;
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto space-y-6">
    <header class="flex items-start justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold">{{ t.title }}</h1>
        <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
      </div>
      <UButton size="sm" variant="ghost" icon="i-lucide-refresh-cw" :loading="status === 'pending'" @click="refresh">{{ t.refresh }}</UButton>
    </header>

    <!-- Lemon Squeezy -->
    <UCard class="!shadow-none">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-shopping-cart" class="size-5 text-primary" />
            <h3 class="font-semibold">{{ t.lsTitle }}</h3>
          </div>
          <UBadge
            v-if="cfg?.lemonSqueezy.apiKeySet && cfg?.lemonSqueezy.storeId"
            color="success" variant="soft" size="sm"
          >
            {{ cfg.lemonSqueezy.testMode ? t.lsActiveTest : t.lsActive }}
          </UBadge>
          <UBadge v-else color="neutral" variant="soft" size="sm">{{ t.statusNotConfigured }}</UBadge>
        </div>
      </template>

      <div class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <UFormField :label="t.fieldApiKey" :hint="secretHint(cfg?.lemonSqueezy.apiKeySet ?? false)">
            <UInput v-model="lsForm.apiKey" type="password" autocomplete="off" placeholder="lsk_…" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldWebhookSecret" :hint="secretHint(cfg?.lemonSqueezy.webhookSecretSet ?? false)">
            <UInput v-model="lsForm.webhookSecret" type="password" autocomplete="off" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldStoreId">
            <UInput v-model="lsForm.storeId" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldStoreDomain">
            <UInput v-model="lsForm.storeDomain" placeholder="your-store.lemonsqueezy.com" size="lg" class="w-full" />
          </UFormField>
        </div>
        <UFormField :hint="t.lsTestModeHint">
          <label class="flex items-center gap-2 text-sm">
            <USwitch v-model="lsForm.testMode" />
            <span>{{ t.fieldTestMode }}</span>
          </label>
        </UFormField>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" :loading="testingLs" :disabled="!cfg?.lemonSqueezy.apiKeySet" @click="testLemonSqueezy">{{ t.test }}</UButton>
          <UButton :loading="savingLs" @click="saveLemonSqueezy">{{ t.save }}</UButton>
        </div>
      </template>
    </UCard>

    <!-- GitHub -->
    <UCard class="!shadow-none">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-simple-icons-github" class="size-5" />
            <h3 class="font-semibold">{{ t.ghTitle }}</h3>
          </div>
          <UBadge
            v-if="cfg?.github.tokenSet && cfg.github.tokenValid"
            color="success" variant="soft" size="sm"
          >{{ t.statusActive }}</UBadge>
          <UBadge
            v-else-if="cfg?.github.tokenSet && cfg.github.tokenValid === false"
            color="error" variant="soft" size="sm"
          >{{ t.statusMisconfigured }}</UBadge>
          <UBadge v-else color="neutral" variant="soft" size="sm">{{ t.statusNotConfigured }}</UBadge>
        </div>
      </template>

      <div class="space-y-5">
        <UFormField :label="t.fieldToken" :hint="cfg?.github.tokenSet ? t.secretSetHint : t.fieldTokenHint">
          <UInput v-model="ghForm.token" type="password" autocomplete="off" placeholder="ghp_…" size="lg" class="w-full" />
        </UFormField>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <UFormField :label="t.fieldOrg">
            <UInput v-model="ghForm.org" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldTeamSlug">
            <UInput v-model="ghForm.teamSlug" placeholder="customers" size="lg" class="w-full" />
          </UFormField>
        </div>
        <UFormField :label="t.fieldRepo">
          <UInput v-model="ghForm.repo" placeholder="org/repo" size="lg" class="w-full" />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" :loading="testingGh" :disabled="!cfg?.github.tokenSet" @click="testGithub">{{ t.test }}</UButton>
          <UButton :loading="savingGh" @click="saveGithub">{{ t.save }}</UButton>
        </div>
      </template>
    </UCard>

    <!-- SMTP -->
    <UCard class="!shadow-none">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-mail" class="size-5 text-primary" />
            <h3 class="font-semibold">{{ t.smtpTitle }}</h3>
          </div>
          <UBadge :color="cfg?.smtp.configured ? 'success' : 'neutral'" variant="soft" size="sm">
            {{ cfg?.smtp.configured ? t.statusActive : t.smtpDisabled }}
          </UBadge>
        </div>
      </template>

      <div class="space-y-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <UFormField :label="t.fieldHost">
            <UInput v-model="smtpForm.host" placeholder="smtp.example.com" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldPort">
            <UInput v-model.number="smtpForm.port" type="number" min="1" max="65535" placeholder="465" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldUser">
            <UInput v-model="smtpForm.user" autocomplete="off" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="t.fieldPass" :hint="secretHint(cfg?.smtp.userSet ?? false)">
            <UInput v-model="smtpForm.pass" type="password" autocomplete="off" size="lg" class="w-full" />
          </UFormField>
        </div>
        <UFormField :label="t.fieldFrom">
          <UInput v-model="smtpForm.from" placeholder="Momentfy <noreply@…>" size="lg" class="w-full" />
        </UFormField>
        <p class="text-xs text-muted">{{ t.smtpUnsetNote }}</p>
        <UFormField :label="t.smtpTestRecipient" :hint="user?.email ? fillTemplate(t.currentValueHint, { value: user.email }) : ''">
          <UInput v-model="smtpTestTo" type="email" :placeholder="user?.email" size="lg" class="w-full" />
        </UFormField>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="neutral" variant="outline" :loading="testingSmtp" :disabled="!cfg?.smtp.host" @click="testSmtp">{{ t.test }}</UButton>
          <UButton :loading="savingSmtp" @click="saveSmtp">{{ t.save }}</UButton>
        </div>
      </template>
    </UCard>

    <!-- License pepper (read-only, env-only) -->
    <UCard class="!shadow-none">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-key" class="size-5 text-primary" />
            <h3 class="font-semibold">{{ t.pepperTitle }}</h3>
          </div>
          <UBadge :color="cfg?.licensePepperSet ? 'success' : 'warning'" variant="soft" size="sm">
            {{ cfg?.licensePepperSet ? t.badgeSet : t.badgeMissing }}
          </UBadge>
        </div>
      </template>
      <p class="text-sm text-muted">{{ t.pepperDesc }}</p>
    </UCard>
  </div>
</template>

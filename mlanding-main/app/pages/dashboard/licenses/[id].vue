<script setup>
definePageMeta({ layout: 'portal', middleware: 'auth', colorMode: 'light' });
const chrome = useChromeCopy();
const localePath = useLocalePath();
useHead({ title: () => chrome.value.pages.dashboardLicenseDetail.docTitle });
const route = useRoute();
const id = route.params.id;
const toast = useToast();
const { data: license, refresh, status } = await useFetch(`/api/portal/licenses/${id}`);
const rotating = ref(false);
const rotatedKey = ref(null);
const showRotateConfirm = ref(false);
async function rotateKey() {
    rotating.value = true;
    try {
        const res = await $fetch(`/api/portal/licenses/${id}/rotate`, {
            method: 'POST'
        });
        rotatedKey.value = res.key;
        showRotateConfirm.value = false;
        await refresh();
    }
    catch (err) {
        toast.add({ title: chrome.value.pages.dashboardLicenseDetail.rotateFailed, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        rotating.value = false;
    }
}
async function copyKey() {
    if (!rotatedKey.value)
        return;
    await navigator.clipboard.writeText(rotatedKey.value);
    toast.add({ title: chrome.value.pages.dashboardLicenseDetail.keyCopied, color: 'success' });
}
function fmt(d) {
    return d ? new Date(d).toLocaleString() : '—';
}
const statusColor = {
    ACTIVE: 'success',
    REVOKED: 'error',
    EXPIRED: 'warning'
};
</script>

<template>
  <div v-if="license" class="space-y-6 sm:space-y-8">
    <div>
      <NuxtLink :to="localePath('/dashboard')" class="text-sm text-gray-500 hover:text-primary inline-flex items-center gap-1.5">
        <UIcon name="i-lucide-chevron-left" class="size-4 rtl:rotate-180" /> {{ chrome.pages.dashboardLicenseDetail.backToLicenses }}
      </NuxtLink>
      <h1 class="text-xl sm:text-2xl font-semibold mt-3 font-mono break-all">{{ license.keyPrefix }}…</h1>
      <div class="flex items-center gap-2 flex-wrap mt-2">
        <UBadge :color="statusColor[license.status]" variant="soft">{{ license.status }}</UBadge>
        <span class="text-sm text-gray-500">{{ license.plan.name }}</span>
        <span v-if="license.revokedReason" class="text-xs text-error">— {{ license.revokedReason }}</span>
      </div>
    </div>

    <!-- Rotate key -->
    <UCard v-if="license.status === 'ACTIVE'">
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-key-round" class="size-5 text-secondary" />
          <h2 class="font-semibold">{{ chrome.pages.dashboardLicenseDetail.rotateSection }}</h2>
        </div>
      </template>

      <!-- Freshly rotated -->
      <div v-if="rotatedKey">
        <div class="rounded-lg border border-secondary/30 bg-secondary/5 p-4 space-y-3">
          <div class="flex items-center gap-2 text-sm font-medium text-secondary">
            <UIcon name="i-lucide-circle-check" class="size-5" />
            {{ chrome.pages.dashboardLicenseDetail.newKeyHeading }}
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ chrome.pages.dashboardLicenseDetail.newKeyExplain }}
          </p>
          <code class="block w-full px-3 py-2.5 rounded bg-black/10 dark:bg-white/10 font-mono text-sm select-all break-all">{{ rotatedKey }}</code>
          <div class="flex flex-col sm:flex-row gap-2">
            <UButton icon="i-lucide-copy" color="secondary" @click="copyKey">{{ chrome.pages.dashboardLicenseDetail.copyKey }}</UButton>
            <UButton variant="soft" color="neutral" @click="rotatedKey = null">{{ chrome.pages.dashboardLicenseDetail.done }}</UButton>
          </div>
        </div>
      </div>

      <!-- Pre-rotate prompt -->
      <div v-else class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div class="text-sm min-w-0">
          <p class="font-medium">{{ chrome.pages.dashboardLicenseDetail.generateNewKey }}</p>
          <p class="text-gray-500 mt-1">
            {{ chrome.pages.dashboardLicenseDetail.rotateExplain }}
          </p>
        </div>
        <UButton v-if="!showRotateConfirm" color="secondary" variant="soft" icon="i-lucide-refresh-cw" class="w-full sm:w-auto justify-center shrink-0" @click="showRotateConfirm = true">
          {{ chrome.pages.dashboardLicenseDetail.rotateButton }}
        </UButton>
        <div v-else class="flex flex-col sm:flex-row gap-2 shrink-0">
          <UButton color="secondary" :loading="rotating" class="justify-center" @click="rotateKey">{{ chrome.pages.dashboardLicenseDetail.confirmRotate }}</UButton>
          <UButton variant="ghost" color="neutral" :disabled="rotating" class="justify-center" @click="showRotateConfirm = false">{{ chrome.pages.dashboardLicenseDetail.cancel }}</UButton>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ chrome.pages.dashboardLicenseDetail.detailsSection }}</h2>
      </template>
      <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt class="text-gray-500">{{ chrome.pages.dashboardLicenseDetail.plan }}</dt>
          <dd>{{ license.plan.name }}</dd>
        </div>
        <div>
          <dt class="text-gray-500">{{ chrome.pages.dashboardLicenseDetail.activations }}</dt>
          <dd>{{ license.activations.filter(a => !a.deactivatedAt).length }} / {{ license.maxActivations }}</dd>
        </div>
        <div>
          <dt class="text-gray-500">{{ chrome.pages.dashboardLicenseDetail.issued }}</dt>
          <dd>{{ fmt(license.issuedAt) }}</dd>
        </div>
        <div>
          <dt class="text-gray-500">{{ chrome.pages.dashboardLicenseDetail.expires }}</dt>
          <dd>{{ license.expiresAt ? fmt(license.expiresAt) : chrome.pages.dashboardLicenseDetail.neverPerpetual }}</dd>
        </div>
      </dl>
    </UCard>

    <!-- Where is my full key? -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-key-round" class="size-5 text-primary" />
          <h2 class="font-semibold">{{ chrome.pages.dashboardLicenseDetail.whereIsKey }}</h2>
        </div>
      </template>
      <div class="text-sm space-y-3">
        <p>
          {{ chrome.pages.dashboardLicenseDetail.wherePara1Lead }}
          <strong>{{ chrome.pages.dashboardLicenseDetail.wherePara1Strong }}</strong>{{ chrome.pages.dashboardLicenseDetail.wherePara1Tail }}
        </p>
        <p>{{ chrome.pages.dashboardLicenseDetail.whereYouCanFind }}</p>
        <ul class="list-disc ps-5 space-y-1 text-gray-600 dark:text-gray-400">
          <li>
            {{ chrome.pages.dashboardLicenseDetail.whereInEmailLead }}
            <strong>{{ chrome.pages.dashboardLicenseDetail.whereInEmailStrong }}</strong>
            {{ chrome.pages.dashboardLicenseDetail.whereInEmailTail }}
            <em>"{{ chrome.pages.dashboardLicenseDetail.whereInEmailSubject }}"</em>{{ chrome.pages.dashboardLicenseDetail.whereInEmailSearch }}
            <code class="font-mono bg-black/5 dark:bg-white/10 px-1 rounded">{{ license.keyPrefix }}</code>{{ chrome.pages.dashboardLicenseDetail.whereInEmailPeriod }}
          </li>
          <li>{{ chrome.pages.dashboardLicenseDetail.whereInPasswordManager }}</li>
          <li>
            {{ chrome.pages.dashboardLicenseDetail.whereInInstallerLead }}
            <strong>{{ chrome.pages.dashboardLicenseDetail.whereInInstallerStrong }}</strong>
            {{ chrome.pages.dashboardLicenseDetail.whereInInstallerTail }}
          </li>
        </ul>
        <p class="text-gray-600 dark:text-gray-400">
          {{ chrome.pages.dashboardLicenseDetail.whereLostLead }}
          <strong>{{ chrome.pages.dashboardLicenseDetail.whereLostStrong }}</strong>
          {{ chrome.pages.dashboardLicenseDetail.whereLostTail }}
        </p>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="font-semibold">{{ chrome.pages.dashboardLicenseDetail.activeInstalls }}</h2>
          <UButton size="xs" variant="ghost" icon="i-lucide-refresh-cw" :loading="status === 'pending'" @click="refresh" />
        </div>
      </template>

      <div v-if="!license.activations.length" class="text-center py-10 text-gray-500 dark:text-gray-400">
        <UIcon name="i-lucide-server-off" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ chrome.pages.dashboardLicenseDetail.noInstalls }}</p>
        <p class="text-xs mt-1">{{ chrome.pages.dashboardLicenseDetail.noInstallsHint }}</p>
      </div>

      <div v-else class="divide-y divide-black/5 dark:divide-white/10 -m-4">
        <div v-for="a in license.activations" :key="a.id" class="flex items-center gap-4 px-4 py-3">
          <UIcon :name="a.deactivatedAt ? 'i-lucide-server-off' : 'i-lucide-server'" class="size-5" :class="a.deactivatedAt ? 'text-gray-400' : 'text-success'" />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 text-sm">
              <span class="font-medium">{{ a.hostname || a.fingerprint.slice(0, 12) + '…' }}</span>
              <span v-if="a.appVersion" class="text-xs text-gray-500">v{{ a.appVersion }}</span>
            </div>
            <div class="text-xs text-gray-500 mt-0.5">
              <span v-if="!a.deactivatedAt">{{ fillTemplate(chrome.pages.dashboardLicenseDetail.lastSeen, { date: fmt(a.lastSeenAt) }) }}</span>
              <span v-else>{{ fillTemplate(chrome.pages.dashboardLicenseDetail.deactivated, { date: fmt(a.deactivatedAt) }) }}</span>
              <span v-if="a.ipAddress"> · {{ a.ipAddress }}</span>
            </div>
          </div>
        </div>
      </div>
    </UCard>

  </div>

  <div v-else class="text-center py-12 text-gray-500">
    <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
  </div>
</template>

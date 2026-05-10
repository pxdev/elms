<script setup>
import { fillTemplate } from '~/composables/useChromeCopy';
definePageMeta({ layout: 'portal', middleware: ['auth', 'admin'], colorMode: 'light' });
const chrome = useChromeCopy();
const localePath = useLocalePath();
const t = computed(() => chrome.value.admin.usersPage);
useHead({ title: () => chrome.value.admin.usersPage.docTitle });
const q = ref('');
const { data: users, refresh } = await useFetch('/api/portal/admin/users', {
    query: computed(() => ({ q: q.value || undefined })),
    default: () => []
});
function fmt(d) {
    return d ? new Date(d).toLocaleDateString() : '—';
}
function name(u) {
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email;
}
function pluralLicense(n) {
    return fillTemplate(n === 1 ? t.value.licenseOne : t.value.licenseMany, { n });
}
function pluralOrder(n) {
    return fillTemplate(n === 1 ? t.value.orderOne : t.value.orderMany, { n });
}
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto space-y-6">
    <header>
      <h1 class="text-2xl font-bold">{{ t.title }}</h1>
      <p class="text-sm text-muted mt-1">{{ t.subtitle }}</p>
    </header>

    <div class="flex gap-2">
      <UInput v-model="q" :placeholder="t.searchPlaceholder" icon="i-lucide-search" class="flex-1" @keyup.enter="refresh" />
      <UButton icon="i-lucide-search" @click="refresh">{{ t.search }}</UButton>
    </div>

    <UCard class="!shadow-none">
      <div v-if="!users.length" class="text-center py-10 text-muted">
        <UIcon name="i-lucide-users-round" class="size-8 mx-auto opacity-40" />
        <p class="mt-3 text-sm">{{ t.empty }}</p>
      </div>
      <div v-else class="divide-y divide-default -m-4">
        <NuxtLink
          v-for="u in users" :key="u.id" :to="localePath(`/admin/users/${u.id}`)"
          class="flex items-center gap-4 px-4 py-3 hover:bg-elevated transition"
        >
          <div class="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
            {{ (u.firstName?.[0] || u.email[0] || '?').toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 flex-wrap text-sm">
              <span class="font-medium truncate">{{ name(u) }}</span>
              <UBadge v-if="u.isAdmin" color="primary" variant="soft" size="sm">{{ t.adminBadge }}</UBadge>
              <UBadge v-if="!u.isActive" color="error" variant="soft" size="sm">{{ t.inactiveBadge }}</UBadge>
            </div>
            <div class="text-xs text-muted mt-0.5">
              {{ u.email }}
              <span v-if="u.githubUsername"> · gh:{{ u.githubUsername }}</span>
              · {{ t.joinedPrefix }} {{ fmt(u.createdAt) }}
            </div>
          </div>
          <div class="text-xs text-muted text-end">
            <div>{{ pluralLicense(u._count.licenses) }}</div>
            <div>{{ pluralOrder(u._count.orders) }}</div>
          </div>
          <UIcon name="i-lucide-chevron-right" class="size-4 text-muted rtl:rotate-180" />
        </NuxtLink>
      </div>
    </UCard>
  </div>
</template>

<script setup>
import { z } from 'zod';
definePageMeta({ layout: 'portal', middleware: 'auth', colorMode: 'light' });
const chrome = useChromeCopy();
useHead({ title: () => chrome.value.pages.dashboardProfile.docTitle });
const toast = useToast();
const { fetch: fetchSession } = useUserSession();
const { data: profile, refresh } = await useFetch('/api/portal/profile');
const profileSchema = z.object({
    firstName: z.string().min(1).max(80),
    lastName: z.string().min(1).max(80),
    githubUsername: z.string().regex(/^[a-zA-Z0-9-]{1,39}$/, 'Letters, numbers and dashes only').optional().or(z.literal(''))
});
const state = reactive({
    firstName: '',
    lastName: '',
    githubUsername: ''
});
watch(profile, (p) => {
    if (!p)
        return;
    state.firstName = p.firstName || '';
    state.lastName = p.lastName || '';
    state.githubUsername = p.githubUsername || '';
}, { immediate: true });
const profileLoading = ref(false);
async function saveProfile(event) {
    profileLoading.value = true;
    try {
        const res = await $fetch('/api/portal/profile', {
            method: 'PATCH',
            body: {
                firstName: event.data.firstName,
                lastName: event.data.lastName,
                githubUsername: event.data.githubUsername || null
            }
        });
        await fetchSession();
        await refresh();
        if (res.invite) {
            const ok = res.invite.status === 'SENT' || res.invite.status === 'ACCEPTED';
            toast.add({
                title: ok ? chrome.value.pages.dashboardProfile.profileSavedInviteSent : chrome.value.pages.dashboardProfile.profileSavedInviteIssue,
                description: ok ? chrome.value.pages.dashboardProfile.inviteAddedDesc : (res.invite.error || chrome.value.pages.dashboardProfile.inviteSeeProfile),
                color: ok ? 'success' : 'warning'
            });
        }
        else {
            toast.add({ title: chrome.value.pages.dashboardProfile.profileSavedToast, color: 'success' });
        }
    }
    catch (err) {
        toast.add({ title: chrome.value.pages.dashboardProfile.saveFailedToast, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        profileLoading.value = false;
    }
}
// ─── Change password ──
const pwdSchema = z.object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirm: z.string()
}).refine(d => d.newPassword === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });
const pwdState = reactive({ currentPassword: '', newPassword: '', confirm: '' });
const pwdLoading = ref(false);
async function changePassword(event) {
    pwdLoading.value = true;
    try {
        await $fetch('/api/auth/change-password', {
            method: 'POST',
            body: { currentPassword: event.data.currentPassword, newPassword: event.data.newPassword }
        });
        pwdState.currentPassword = '';
        pwdState.newPassword = '';
        pwdState.confirm = '';
        toast.add({ title: chrome.value.pages.dashboardProfile.passwordUpdatedToast, color: 'success' });
    }
    catch (err) {
        toast.add({ title: chrome.value.pages.dashboardProfile.updateFailedToast, description: err.statusMessage || err.message, color: 'error' });
    }
    finally {
        pwdLoading.value = false;
    }
}
const inviteColor = {
    ACCEPTED: 'success', SENT: 'success', PENDING: 'neutral', FAILED: 'error'
};
function fmt(d) { return d ? new Date(d).toLocaleString() : '—'; }
</script>

<template>
  <div v-if="profile" class="space-y-6 sm:space-y-8 max-w-2xl">
    <header>
      <h1 class="text-xl sm:text-2xl font-semibold">{{ chrome.pages.dashboardProfile.title }}</h1>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ chrome.pages.dashboardProfile.subtitle }}</p>
    </header>

    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ chrome.pages.dashboardProfile.accountSection }}</h2>
      </template>

      <UForm :schema="profileSchema" :state="state" class="space-y-4" @submit="saveProfile">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <UFormField :label="chrome.pages.dashboardProfile.firstName" name="firstName" required>
            <UInput v-model="state.firstName" size="lg" class="w-full" />
          </UFormField>
          <UFormField :label="chrome.pages.dashboardProfile.lastName" name="lastName" required>
            <UInput v-model="state.lastName" size="lg" class="w-full" />
          </UFormField>
        </div>

        <UFormField :label="chrome.pages.dashboardProfile.email">
          <UInput :model-value="profile.email" disabled size="lg" class="w-full" />
        </UFormField>

        <UFormField :label="chrome.pages.dashboardProfile.githubUsername" name="githubUsername" :hint="chrome.pages.dashboardProfile.githubHint">
          <UInput v-model="state.githubUsername" icon="i-simple-icons-github" size="lg" class="w-full" :placeholder="chrome.pages.dashboardProfile.githubPlaceholder" />
        </UFormField>

        <UButton type="submit" :loading="profileLoading" size="lg">{{ chrome.pages.dashboardProfile.save }}</UButton>
      </UForm>
    </UCard>

    <UCard v-if="profile.githubUsername">
      <template #header>
        <h2 class="font-semibold">{{ chrome.pages.dashboardProfile.sourceAccessSection }}</h2>
      </template>

      <div v-if="profile.repoInvite" class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <UBadge :color="inviteColor[profile.repoInvite.status]" variant="soft">{{ profile.repoInvite.status }}</UBadge>
          <span class="text-gray-500">{{ chrome.pages.dashboardProfile.inviteFor }} <code>{{ profile.githubUsername }}</code></span>
        </div>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-gray-500">
          <div><dt class="inline">{{ chrome.pages.dashboardProfile.sentLabel }} </dt><dd class="inline">{{ fmt(profile.repoInvite.sentAt) }}</dd></div>
          <div><dt class="inline">{{ chrome.pages.dashboardProfile.acceptedLabel }} </dt><dd class="inline">{{ fmt(profile.repoInvite.acceptedAt) }}</dd></div>
          <div v-if="profile.repoInvite.attempts"><dt class="inline">{{ chrome.pages.dashboardProfile.attemptsLabel }} </dt><dd class="inline">{{ profile.repoInvite.attempts }}</dd></div>
        </dl>
        <p v-if="profile.repoInvite.lastError" class="text-xs text-error mt-2">{{ profile.repoInvite.lastError }}</p>
        <p v-if="profile.repoInvite.status === 'SENT'" class="text-xs text-gray-500 mt-2">
          {{ chrome.pages.dashboardProfile.inviteSentInstructions }}
        </p>
      </div>
      <p v-else class="text-sm text-gray-500">
        {{ chrome.pages.dashboardProfile.noInviteYet }}
      </p>
    </UCard>

    <UCard>
      <template #header>
        <h2 class="font-semibold">{{ chrome.pages.dashboardProfile.changePassword }}</h2>
      </template>
      <UForm :schema="pwdSchema" :state="pwdState" class="space-y-4" @submit="changePassword">
        <UFormField :label="chrome.pages.dashboardProfile.currentPassword" name="currentPassword" required>
          <UInput v-model="pwdState.currentPassword" type="password" size="lg" class="w-full" autocomplete="current-password" />
        </UFormField>
        <UFormField :label="chrome.pages.dashboardProfile.newPassword" name="newPassword" required :hint="chrome.pages.dashboardProfile.newPasswordHint">
          <UInput v-model="pwdState.newPassword" type="password" size="lg" class="w-full" autocomplete="new-password" />
        </UFormField>
        <UFormField :label="chrome.pages.dashboardProfile.confirmPassword" name="confirm" required>
          <UInput v-model="pwdState.confirm" type="password" size="lg" class="w-full" autocomplete="new-password" />
        </UFormField>
        <UButton type="submit" :loading="pwdLoading" size="lg">{{ chrome.pages.dashboardProfile.updatePassword }}</UButton>
      </UForm>
    </UCard>

    <p class="text-xs text-gray-400">
      {{ fillTemplate(chrome.pages.dashboardProfile.joinedFooter, { joined: fmt(profile.createdAt), lastLogin: fmt(profile.lastLoginAt) }) }}
    </p>
  </div>

  <div v-else class="text-center py-12 text-gray-500">
    <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin mx-auto" />
  </div>
</template>

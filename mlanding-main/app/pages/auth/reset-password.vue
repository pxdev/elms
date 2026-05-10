<script setup>
import { z } from 'zod'
definePageMeta({ layout: 'auth', middleware: 'guest' })
const chrome = useChromeCopy()
const localePath = useLocalePath()
useHead({ title: () => chrome.value.auth.reset.docTitle })
const route = useRoute()
const toast = useToast()
const token = computed(() => route.query.token || '')
const schema = computed(() => z.object({
  password: z.string().min(8, chrome.value.auth.validation.passwordMin8).max(200),
  confirm: z.string()
}).refine(d => d.password === d.confirm, { message: chrome.value.auth.validation.passwordsDontMatch, path: ['confirm'] }))
const state = reactive({ password: '', confirm: '' })
const loading = ref(false)
const done = ref(false)
async function onSubmit(event) {
  if (!token.value) {
    toast.add({ title: chrome.value.auth.reset.missingTokenToast, description: chrome.value.auth.reset.missingTokenDesc, color: 'error' })
    return
  }
  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { token: token.value, password: event.data.password }
    })
    done.value = true
  }
  catch (err) {
    toast.add({ title: chrome.value.auth.reset.failedToast, description: localizeAuthError(err, chrome.value), color: 'error' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-10">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {{ chrome.auth.reset.title }}
      </h1>
      <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        {{ chrome.auth.reset.subtitle }}
      </p>
    </div>

    <!-- Success state -->
    <div v-if="done" class="text-center py-6">
      <div class="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-check-circle-2" class="size-6 text-emerald-500" />
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300">{{ chrome.auth.reset.doneBody }}</p>
      <NuxtLink :to="localePath('/auth/login')" class="inline-flex items-center justify-center gap-2 mt-6 w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
        {{ chrome.auth.reset.signIn }}
      </NuxtLink>
    </div>

    <!-- Form -->
    <UForm v-else :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
      <UFormField :label="chrome.auth.reset.newPassword" name="password" required>
        <UInput v-model="state.password" type="password" icon="i-lucide-lock" size="lg" class="w-full" autocomplete="new-password" />
      </UFormField>
      <UFormField :label="chrome.auth.reset.confirmPassword" name="confirm" required>
        <UInput v-model="state.confirm" type="password" icon="i-lucide-lock" size="lg" class="w-full" autocomplete="new-password" />
      </UFormField>
      <button
        type="submit"
        class="w-full h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        :disabled="loading || !token"
      >
        <UIcon v-if="loading" name="i-lucide-loader-2" class="size-4 animate-spin" />
        <span>{{ chrome.auth.reset.submit }}</span>
      </button>
      <p v-if="!token" class="text-xs text-center text-gray-400">
        {{ chrome.auth.reset.tokenMissing }}
      </p>
    </UForm>
  </div>
</template>

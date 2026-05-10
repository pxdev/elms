<script setup>
import { z } from 'zod'
definePageMeta({ layout: 'auth', middleware: 'guest' })
const chrome = useChromeCopy()
const localePath = useLocalePath()
useHead({ title: () => chrome.value.auth.forgot.docTitle })
const toast = useToast()
const schema = computed(() => z.object({
  email: z.string().email(chrome.value.auth.validation.invalidEmail)
}))
const state = reactive({ email: '' })
const loading = ref(false)
const sent = ref(false)
async function onSubmit(event) {
  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', { method: 'POST', body: event.data })
    sent.value = true
  }
  catch (err) {
    toast.add({ title: chrome.value.auth.forgot.failedToast, description: localizeAuthError(err, chrome.value), color: 'error' })
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
        {{ chrome.auth.forgot.title }}
      </h1>
      <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        {{ chrome.auth.forgot.subtitle }}
      </p>
    </div>

    <!-- Success state -->
    <div v-if="sent" class="text-center py-6">
      <div class="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-lucide-mail-check" class="size-6 text-emerald-500" />
      </div>
      <p class="text-sm text-gray-600 dark:text-gray-300">{{ chrome.auth.forgot.sentBody }}</p>
      <NuxtLink :to="localePath('/auth/login')" class="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-primary hover:underline">
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        {{ chrome.auth.forgot.backToSignIn }}
      </NuxtLink>
    </div>

    <!-- Form -->
    <UForm v-else :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
      <UFormField :label="chrome.auth.forgot.email" name="email" required>
        <UInput v-model="state.email" type="email" icon="i-lucide-mail" size="lg" class="w-full" autocomplete="email" />
      </UFormField>

      <button
        type="submit"
        class="w-full h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        :disabled="loading"
      >
        <UIcon v-if="loading" name="i-lucide-loader-2" class="size-4 animate-spin" />
        <span>{{ chrome.auth.forgot.submit }}</span>
      </button>
    </UForm>

    <!-- Back link -->
    <p v-if="!sent" class="mt-8 text-sm text-center">
      <NuxtLink :to="localePath('/auth/login')" class="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-medium">
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        {{ chrome.auth.forgot.backToSignIn }}
      </NuxtLink>
    </p>
  </div>
</template>

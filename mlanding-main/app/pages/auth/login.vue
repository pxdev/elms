<script setup>
import { z } from 'zod'
definePageMeta({ layout: 'auth', middleware: 'guest' })
const chrome = useChromeCopy()
useHead({ title: () => chrome.value.auth.signIn.docTitle })
const { fetch: fetchSession } = useUserSession()
const toast = useToast()
const route = useRoute()
const localePath = useLocalePath()
const redirectTo = computed(() => {
  const r = route.query.redirect
  return r && r.startsWith('/') && !r.startsWith('//') ? r : localePath('/dashboard')
})
const schema = computed(() => z.object({
  email: z.string().email(chrome.value.auth.validation.invalidEmail),
  password: z.string().min(1, chrome.value.auth.validation.passwordRequired),
  remember: z.boolean().optional()
}))
const state = reactive({ email: '', password: '', remember: false })
const loading = ref(false)
const showPassword = ref(false)
async function onSubmit(event) {
  loading.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { email: event.data.email, password: event.data.password } })
    await fetchSession()
    await navigateTo(redirectTo.value)
  }
  catch (err) {
    toast.add({ title: chrome.value.auth.signIn.failedToast, description: localizeAuthError(err, chrome.value), color: 'error' })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        {{ chrome.auth.signIn.title }}
      </h1>
      <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        {{ chrome.auth.signIn.subtitle }}
      </p>
    </div>

    <!-- Form -->
    <UForm :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
      <UFormField :label="chrome.auth.signIn.email" name="email" required>
        <UInput
          v-model="state.email"
          type="email"
          :placeholder="chrome.auth.signIn.emailPlaceholder"
          icon="i-lucide-mail"
          size="lg"
          class="w-full"
          autocomplete="email"
        />
      </UFormField>

      <UFormField :label="chrome.auth.signIn.password" name="password" required>
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          :placeholder="chrome.auth.signIn.passwordPlaceholder"
          icon="i-lucide-lock"
          size="lg"
          class="w-full"
          autocomplete="current-password"
        >
          <template #trailing>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
              @click="showPassword = !showPassword"
            >
              <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-4" />
            </button>
          </template>
        </UInput>
      </UFormField>

      <div class="flex items-center justify-between">
        <UCheckbox v-model="state.remember" :label="chrome.auth.signIn.rememberMe" />
        <NuxtLink
          :to="localePath('/auth/forgot-password')"
          class="text-xs font-medium text-gray-400 hover:text-primary transition-colors"
        >
          {{ chrome.auth.signIn.forgotPassword }}
        </NuxtLink>
      </div>

      <button
        type="submit"
        class="w-full h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        :disabled="loading"
      >
        <UIcon
          v-if="loading"
          name="i-lucide-loader-2"
          class="size-4 animate-spin"
        />
        <span>{{ chrome.auth.signIn.submit }}</span>
      </button>
    </UForm>

    <!-- Footer -->
    <p class="mt-8 text-sm text-center text-gray-400 dark:text-gray-500">
      {{ chrome.auth.signIn.newHerePrompt }}
      <NuxtLink
        :to="{ path: localePath('/auth/register'), query: route.query.redirect ? { redirect: route.query.redirect } : undefined }"
        class="font-semibold text-primary hover:underline"
      >
        {{ chrome.auth.signIn.newHereCta }}
      </NuxtLink>
    </p>
  </div>
</template>

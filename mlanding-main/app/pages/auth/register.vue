<script setup>
import { z } from 'zod'
definePageMeta({ layout: 'auth', middleware: 'guest' })
const chrome = useChromeCopy()
useHead({ title: () => chrome.value.auth.register.docTitle })
const { fetch: fetchSession } = useUserSession()
const toast = useToast()
const route = useRoute()
const localePath = useLocalePath()
const redirectTo = computed(() => {
  const r = route.query.redirect
  return r && r.startsWith('/') && !r.startsWith('//') ? r : localePath('/dashboard')
})
const schema = computed(() => z.object({
  firstName: z.string().min(1, chrome.value.auth.validation.firstNameRequired).max(80),
  lastName: z.string().min(1, chrome.value.auth.validation.lastNameRequired).max(80),
  email: z.string().email(chrome.value.auth.validation.invalidEmail).max(160),
  password: z.string().min(8, chrome.value.auth.validation.passwordMin8).max(200),
  githubUsername: z.string().regex(/^[a-zA-Z0-9-]{1,39}$/, chrome.value.auth.validation.githubFormat).optional().or(z.literal(''))
}))
const state = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  githubUsername: ''
})
const loading = ref(false)
const showPassword = ref(false)
async function onSubmit(event) {
  loading.value = true
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: {
        ...event.data,
        githubUsername: event.data.githubUsername || null
      }
    })
    await fetchSession()
    toast.add({
      title: chrome.value.auth.successToasts.accountCreatedTitle,
      description: chrome.value.auth.successToasts.accountCreatedDesc,
      color: 'success'
    })
    await navigateTo(redirectTo.value)
  }
  catch (err) {
    toast.add({ title: chrome.value.auth.register.failedToast, description: localizeAuthError(err, chrome.value), color: 'error' })
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
        {{ chrome.auth.register.title }}
      </h1>
      <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        {{ chrome.auth.register.subtitle }}
      </p>
    </div>

    <!-- Form -->
    <UForm :schema="schema" :state="state" class="space-y-5" @submit="onSubmit">
      <div class="grid grid-cols-2 gap-3">
        <UFormField :label="chrome.auth.register.firstName" name="firstName" required>
          <UInput v-model="state.firstName" size="lg" class="w-full" autocomplete="given-name" />
        </UFormField>
        <UFormField :label="chrome.auth.register.lastName" name="lastName" required>
          <UInput v-model="state.lastName" size="lg" class="w-full" autocomplete="family-name" />
        </UFormField>
      </div>

      <UFormField :label="chrome.auth.register.email" name="email" required>
        <UInput v-model="state.email" type="email" icon="i-lucide-mail" size="lg" class="w-full" autocomplete="email" />
      </UFormField>

      <UFormField :label="chrome.auth.register.password" name="password" required :hint="chrome.auth.register.passwordHint">
        <UInput
          v-model="state.password"
          :type="showPassword ? 'text' : 'password'"
          icon="i-lucide-lock"
          size="lg"
          class="w-full"
          autocomplete="new-password"
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

      <UFormField :label="chrome.auth.register.github" name="githubUsername">
        <UInput
          v-model="state.githubUsername"
          icon="i-simple-icons-github"
          size="lg"
          class="w-full"
          :placeholder="chrome.auth.register.githubPlaceholder"
        >
          <template #leading>
            <span class="text-gray-400 text-sm font-medium select-none pl-1">@</span>
          </template>
        </UInput>
        <p class="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
          {{ chrome.auth.register.githubHint }}
        </p>
      </UFormField>

      <button
        type="submit"
        class="w-full h-11 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        :disabled="loading"
      >
        <UIcon v-if="loading" name="i-lucide-loader-2" class="size-4 animate-spin" />
        <span>{{ chrome.auth.register.submit }}</span>
      </button>
    </UForm>

    <!-- Footer -->
    <p class="mt-8 text-sm text-center text-gray-400 dark:text-gray-500">
      {{ chrome.auth.register.haveAccountPrompt }}
      <NuxtLink
        :to="{ path: localePath('/auth/login'), query: route.query.redirect ? { redirect: route.query.redirect } : undefined }"
        class="font-semibold text-primary hover:underline"
      >
        {{ chrome.auth.register.haveAccountCta }}
      </NuxtLink>
    </p>
  </div>
</template>

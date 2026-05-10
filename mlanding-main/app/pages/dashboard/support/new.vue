<script setup>
definePageMeta({ layout: 'portal', middleware: 'auth', colorMode: 'light' })

const chrome = useChromeCopy()
const localePath = useLocalePath()
const toast = useToast()
const t = computed(() => chrome.value.dashboard.supportPage)
useHead({ title: () => t.value.newDocTitle })

const subject = ref('')
const body = ref('')
const submitting = ref(false)

async function submit() {
  if (subject.value.trim().length < 3 || body.value.trim().length < 1) return
  submitting.value = true
  try {
    const res = await $fetch('/api/portal/support/tickets', {
      method: 'POST',
      body: { subject: subject.value.trim(), body: body.value.trim() }
    })
    await navigateTo(localePath(`/dashboard/support/${res.id}`))
  }
  catch (err) {
    toast.add({
      title: err.statusMessage || 'Could not send',
      color: 'error'
    })
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <NuxtLink
      :to="localePath('/dashboard/support')"
      class="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-gray-500 hover:text-primary transition-colors"
    >
      <UIcon name="i-lucide-arrow-left" class="size-3.5 rtl:rotate-180" />
      {{ t.back }}
    </NuxtLink>

    <header>
      <h1 class="text-2xl font-bold">{{ t.newTitle }}</h1>
      <p class="text-sm text-muted mt-1">{{ t.newSubtitle }}</p>
    </header>

    <UCard class="!shadow-none">
      <form class="space-y-5" @submit.prevent="submit">
        <UFormField :label="t.fieldSubject" required>
          <UInput
            v-model="subject"
            :placeholder="t.fieldSubjectPlaceholder"
            size="lg"
            class="w-full"
            maxlength="160"
            required
          />
        </UFormField>

        <UFormField :label="t.fieldBody" required>
          <UTextarea
            v-model="body"
            :placeholder="t.fieldBodyPlaceholder"
            :rows="8"
            class="w-full"
            maxlength="10000"
            required
          />
        </UFormField>

        <div class="flex justify-end pt-2">
          <UButton
            type="submit"
            color="primary"
            icon="i-lucide-send"
            size="lg"
            :loading="submitting"
            :disabled="subject.trim().length < 3 || body.trim().length < 1"
          >
            {{ t.submit }}
          </UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

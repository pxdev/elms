<script setup lang="ts">
import { updateProfileSchema } from '~~/shared/schemas'

const { t } = useI18n()
const { user, fetch: refreshSession } = useUserSession()

definePageMeta({
  layout: 'dashboard',
  authorize: true
})

useSeoMeta({ title: `${t('nav.profile')} · ${t('app.title')}` })

const { data: profileData, refresh } = await useFetch('/api/profile')
const profile = computed(() => profileData.value?.user)

const state = reactive({
  name: '',
  avatarUrl: '',
  timeZone: '',
  phone: '',
  country: '',
  age: undefined as number | undefined,
  password: ''
})

watchEffect(() => {
  if (profile.value) {
    state.name = profile.value.name ?? ''
    state.avatarUrl = profile.value.avatarUrl ?? ''
    state.timeZone = profile.value.timeZone ?? ''
    state.phone = profile.value.phone ?? ''
    state.country = profile.value.country ?? ''
    state.age = profile.value.age ?? undefined
    state.password = ''
  }
})

const saving = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const validate = useZodForm(updateProfileSchema)
const formatZodErrors = useZodErrorFormatter()

async function onSubmit() {
  errorMessage.value = null
  successMessage.value = null
  saving.value = true
  try {
    await $fetch('/api/profile', {
      method: 'PATCH',
      body: {
        name: state.name || undefined,
        avatarUrl: state.avatarUrl || undefined,
        timeZone: state.timeZone || undefined,
        phone: state.phone || undefined,
        country: state.country || undefined,
        age: state.age,
        password: state.password || undefined
      }
    })
    await refresh()
    await refreshSession()
    successMessage.value = t('common.saved') || 'Profile updated successfully.'
    state.password = ''
  } catch (err: unknown) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      errorMessage.value = formatZodErrors(e.data.issues)
    } else {
      errorMessage.value = e.data?.message ?? e.message ?? t('errors.generic')
    }
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-8">
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">
          {{ t('nav.profile') }}
        </h1>
      </div>

      <UCard class="border-accented">
        <template #header>
          <h2 class="text-lg font-semibold">
            {{ t('nav.profile') }}
          </h2>
        </template>

        <UForm
          :state="state"
          :validate="validate"
          class="space-y-4"
          @submit="onSubmit"
        >
          <UFormField
            :label="t('fields.email')"
            name="email"
          >
            <UInput
              :model-value="profile?.email ?? ''"
              size="xl"
              class="w-full"
              disabled
            />
          </UFormField>

          <UFormField
            :label="t('fields.name')"
            name="name"
          >
            <UInput
              v-model="state.name"
              size="xl"
              class="w-full"
              :placeholder="t('fields.name')"
            />
          </UFormField>

          <UFormField
            :label="t('fields.imageUrl')"
            name="avatarUrl"
          >
            <AppImageUpload v-model="state.avatarUrl" />
          </UFormField>

          <UFormField
            :label="t('fields.timeZone')"
            name="timeZone"
          >
            <UInput
              v-model="state.timeZone"
              size="xl"
              class="w-full"
              :placeholder="t('fields.timeZone')"
            />
          </UFormField>

          <UFormField
            :label="t('fields.phone')"
            name="phone"
          >
            <UInput
              v-model="state.phone"
              size="xl"
              class="w-full"
              :placeholder="t('fields.phone')"
            />
          </UFormField>

          <UFormField
            :label="t('fields.country')"
            name="country"
          >
            <UInput
              v-model="state.country"
              size="xl"
              class="w-full"
              :placeholder="t('fields.country')"
            />
          </UFormField>

          <UFormField
            :label="t('fields.age')"
            name="age"
          >
            <UInput
              v-model="state.age"
              type="number"
              size="xl"
              class="w-full"
              :placeholder="t('fields.age')"
            />
          </UFormField>

          <USeparator />

          <UFormField
            :label="t('auth.newPassword')"
            name="password"
          >
            <UInput
              v-model="state.password"
              type="password"
              size="xl"
              class="w-full"
              :placeholder="t('auth.newPassword')"
            />
          </UFormField>

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-alert-circle"
            :title="errorMessage"
          />

          <UAlert
            v-if="successMessage"
            color="success"
            variant="soft"
            icon="i-lucide-check-circle"
            :title="successMessage"
          />

          <div class="flex gap-2">
            <UButton
              type="submit"
              color="primary"
              size="xl"
              :loading="saving"
              :disabled="saving"
            >
              {{ t('common.save') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </UContainer>
</template>

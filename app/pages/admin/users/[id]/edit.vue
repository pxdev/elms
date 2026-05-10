<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const id = Number(route.params.id)

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('common.edit')} ${t('fields.name')} · ${t('nav.admin')} · ${t('app.title')}` })

const { data: userData, refresh } = await useFetch(`/api/admin/users/${id}`)
const user = computed(() => userData.value?.user)

const state = reactive({
  name: '',
  role: 'STUDENT' as 'ADMIN' | 'TEACHER' | 'STUDENT',
  isActive: true,
  isAvailableForBooking: true
})

watchEffect(() => {
  if (user.value) {
    state.name = user.value.name ?? ''
    state.role = user.value.role
    state.isActive = user.value.isActive ?? true
    state.isAvailableForBooking = user.value.isAvailableForBooking ?? true
  }
})

const saving = ref(false)
const errorMessage = ref<string | null>(null)
const formatZodErrors = useZodErrorFormatter()

async function onSubmit() {
  errorMessage.value = null
  saving.value = true
  try {
    await $fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      body: {
        name: state.name || undefined,
        role: state.role,
        isActive: state.isActive,
        isAvailableForBooking: state.isAvailableForBooking
      }
    })
    await refresh()
    await navigateTo('/admin/users')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string; issues?: unknown[] }; message?: string }
    if (e.data?.issues) {
      errorMessage.value = formatZodErrors(e.data.issues as any)
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


      <UCard>
        <UForm :state="state" class="space-y-4" @submit="onSubmit">
          <UFormField :label="t('fields.name')" name="name">
            <UInput v-model="state.name" size="xl" class="w-full" />
          </UFormField>

          <UFormField :label="t('fields.role')" name="role">
            <USelect v-model="state.role" :items="['ADMIN', 'TEACHER', 'STUDENT']" size="xl" class="w-full" />
          </UFormField>

          <UFormField :label="t('fields.isActive')" name="isActive">
            <USwitch v-model="state.isActive" />
          </UFormField>

          <UFormField :label="t('fields.isAvailableForBooking')" name="isAvailableForBooking">
            <USwitch v-model="state.isAvailableForBooking" />
          </UFormField>

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-alert-circle"
            :title="errorMessage"
          />

          <div class="flex gap-2">
            <UButton type="submit" color="primary" size="xl" :loading="saving" :disabled="saving">
              {{ t('common.save') }}
            </UButton>
            <UButton to="/admin/users" variant="ghost" color="neutral" size="xl">
              {{ t('common.cancel') }}
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </UContainer>
</template>

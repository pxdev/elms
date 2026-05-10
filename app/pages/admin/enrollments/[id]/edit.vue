<script setup lang="ts">
import { updateEnrollmentSchema } from '~~/shared/schemas'

const { t } = useI18n()
const route = useRoute()
const id = Number(route.params.id)

definePageMeta({ authorize: ['ADMIN'] })

useSeoMeta({ title: `${t('admin.enrollments.title')} · ${t('nav.admin')} · ${t('app.title')}` })

const { data, refresh } = await useFetch(`/api/admin/enrollments/${id}`)
const enrollment = computed(() => data.value?.enrollment)

const statusOptions = [
  { value: 'PENDING', label: t('enrollments.status.PENDING') },
  { value: 'ACTIVE', label: t('enrollments.status.ACTIVE') },
  { value: 'COMPLETED', label: t('enrollments.status.COMPLETED') },
  { value: 'CANCELLED', label: t('enrollments.status.CANCELLED') }
]

const state = reactive({
  status: 'PENDING' as 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
})

watchEffect(() => {
  if (enrollment.value) {
    state.status = enrollment.value.status
  }
})

const saving = ref(false)
const errorMessage = ref<string | null>(null)
const formatZodErrors = useZodErrorFormatter()

async function onSubmit() {
  errorMessage.value = null
  saving.value = true
  try {
    await $fetch(`/api/admin/enrollments/${id}`, {
      method: 'PATCH',
      body: { status: state.status }
    })
    await refresh()
    await navigateTo('/admin/enrollments')
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


      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UCard class="lg:col-span-2">
          <template #header>
            <h2 class="text-lg font-semibold">{{ t('common.edit') }}</h2>
          </template>

          <UForm :state="state" class="space-y-4" @submit="onSubmit">
            <UFormField :label="t('fields.status')" name="status">
              <USelect v-model="state.status" :items="statusOptions" size="xl" class="w-full" />
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
              <UButton to="/admin/enrollments" variant="ghost" color="neutral" size="xl">
                {{ t('common.cancel') }}
              </UButton>
            </div>
          </UForm>
        </UCard>

        <div class="space-y-4">
          <UCard>
            <template #header>
              <h3 class="font-semibold">{{ t('fields.student') }}</h3>
            </template>
            <p class="font-medium">{{ enrollment?.user.name }}</p>
            <p class="text-sm text-muted-foreground">{{ enrollment?.user.email }}</p>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-semibold">{{ t('fields.course') }}</h3>
            </template>
            <p class="font-medium">{{ enrollment?.course.name }}</p>
            <p class="text-sm text-muted-foreground">{{ t('fields.totalSessions') }}: {{ enrollment?.course.totalSessions }}</p>
          </UCard>

          <UCard>
            <template #header>
              <h3 class="font-semibold">{{ t('fields.enrolledAt') }}</h3>
            </template>
            <p>{{ enrollment?.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : '-' }}</p>
          </UCard>

          <UCard v-if="enrollment?.amountCents">
            <template #header>
              <h3 class="font-semibold">{{ t('fields.paymentStatus') }}</h3>
            </template>
            <p class="font-medium">{{ enrollment.paymentStatus ?? '-' }}</p>
            <p class="text-sm text-muted-foreground">{{ enrollment.amountCents / 100 }} {{ enrollment.currency }}</p>
          </UCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>

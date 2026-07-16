<script setup lang="ts">
import { supportRequestSchema } from '~~/shared/schemas'

const { t } = useI18n()
definePageMeta({ layout: 'dashboard', authorize: true })
useSeoMeta({ title: `${t('support.title')} · ${t('app.title')}` })

const route = useRoute()
const { data: enrollmentsData } = await useFetch('/api/enrollments/me')
const { data: requestsData, refresh } = await useFetch('/api/support')
const state = reactive({
  enrollmentId: (Number(route.query.enrollment) || undefined) as number | undefined,
  subject: route.query.type === 'refund' ? t('support.refundSubject') : '',
  message: ''
})
const enrollmentItems = computed(() => [
  { label: t('support.general'), value: undefined },
  ...(enrollmentsData.value?.enrollments ?? []).map(item => ({ label: item.course.name, value: item.id }))
])
const loading = ref(false)
const sent = ref(false)
const errorMessage = ref<string | null>(null)
const validate = useZodForm(supportRequestSchema)

async function submit() {
  loading.value = true
  sent.value = false
  errorMessage.value = null
  try {
    await $fetch('/api/support', { method: 'POST', body: state })
    state.subject = ''
    state.message = ''
    sent.value = true
    await refresh()
  } catch (err: unknown) {
    const error = err as { data?: { message?: string }, message?: string }
    errorMessage.value = error.data?.message ?? error.message ?? t('errors.generic')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="py-8 max-w-3xl space-y-6">
    <div>
      <h1 class="text-2xl font-bold">{{ t('support.title') }}</h1>
      <p class="text-muted mt-1">{{ t('support.description') }}</p>
    </div>
    <UCard>
      <UForm :state="state" :validate="validate" class="space-y-4" @submit="submit">
        <UFormField :label="t('support.relatedEnrollment')" name="enrollmentId">
          <USelect v-model="state.enrollmentId" :items="enrollmentItems" class="w-full" size="xl" :aria-label="t('support.relatedEnrollment')" />
        </UFormField>
        <UFormField :label="t('support.subject')" name="subject" required>
          <UInput v-model="state.subject" class="w-full" size="xl" />
        </UFormField>
        <UFormField :label="t('support.message')" name="message" required>
          <UTextarea v-model="state.message" class="w-full" :rows="6" />
        </UFormField>
        <UAlert v-if="sent" color="success" variant="soft" :title="t('support.sent')" />
        <UAlert v-if="errorMessage" color="error" variant="soft" :title="errorMessage" />
        <UButton type="submit" :loading="loading" size="xl">{{ t('support.submit') }}</UButton>
      </UForm>
    </UCard>
    <section v-if="requestsData?.requests?.length" class="space-y-3">
      <h2 class="text-lg font-semibold">{{ t('support.history') }}</h2>
      <UCard v-for="request in requestsData.requests" :key="request.id">
        <div class="flex justify-between gap-4">
          <div><p class="font-medium">#{{ request.id }} · {{ request.subject }}</p><p class="text-sm text-muted">{{ request.enrollment?.course.name ?? t('support.general') }}</p></div>
          <UBadge :label="request.status" color="warning" variant="soft" />
        </div>
      </UCard>
    </section>
  </UContainer>
</template>

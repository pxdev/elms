import type { ZodIssue, ZodSchema } from 'zod'

function formatZodIssue(issue: ZodIssue, t: (key: string, params?: Record<string, unknown>) => string): string {
  const code = (issue as any).code as string

  if (code === 'invalid_string') {
    const validation = (issue as any).validation as string
    if (validation === 'email') return t('errors.validation.invalid_email')
    if (validation === 'url') return t('errors.validation.invalid_url')
  }

  if (code === 'too_small') {
    const type = (issue as any).type as string
    const minimum = (issue as any).minimum as number
    if (type === 'string') return t('errors.validation.min_string', { min: minimum })
    if (type === 'number') return t('errors.validation.min_number', { min: minimum })
  }

  if (code === 'custom') {
    const path = (issue as any).path as (string | number)[]
    if (path.includes('confirm')) return t('errors.validation.passwords_match')
    return (issue as any).message || t('errors.validation.invalid')
  }

  if (code === 'invalid_type') {
    const received = (issue as any).received as string
    if (received === 'undefined' || received === 'null') {
      return t('errors.validation.required')
    }
  }

  return (issue as any).message || t('errors.validation.invalid')
}

export function useZodForm<T>(schema: ZodSchema<T>) {
  const { t } = useI18n()
  return (state: Record<string, unknown>) => {
    const result = schema.safeParse(state)
    if (result.success) return []
    return result.error.issues.map(issue => ({
      name: (issue as any).path.join('.'),
      message: formatZodIssue(issue, t)
    }))
  }
}

export function useZodErrorFormatter() {
  const { t } = useI18n()
  return (issues: unknown[]) => {
    return issues.map(issue => formatZodIssue(issue as ZodIssue, t)).join(', ')
  }
}

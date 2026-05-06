import type { H3Event } from 'h3'
import type { ZodSchema } from 'zod'

export async function parseBody<T>(event: H3Event, schema: ZodSchema<T>): Promise<T> {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation Failed',
      message: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
      data: {
        issues: result.error.issues
      }
    })
  }
  return result.data
}

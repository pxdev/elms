import { z } from 'zod'
import type { H3Event } from 'h3'

// ── Auth schemas ──

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(80),
  lastName: z.string().min(1, 'Last name is required').max(80),
  email: z.string().email('Invalid email address').max(160),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200),
  // Optional at signup — can be added later in profile settings.
  githubUsername: z.string().regex(/^[a-zA-Z0-9-]{1,39}$/, 'Invalid GitHub username').optional().nullable()
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(200)
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters').max(200)
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>

// ── Marketing: contact form ──

export const contactSchema = z.object({
  name: z.string().max(160).optional().nullable(),
  email: z.string().email('Invalid email address').max(160),
  message: z.string().max(4000).optional().nullable(),
  // Honeypot — real browsers leave it empty; bots fill it in.
  website: z.string().max(0).optional().nullable()
})

// ── Admin: licenses ──

export const issueLicenseSchema = z.object({
  accountId: z.string().min(1),
  planId: z.string().min(1),
  maxActivations: z.number().int().positive().max(100).optional(),
  notes: z.string().max(2000).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable()
})

export const updateLicenseSchema = z.object({
  maxActivations: z.number().int().positive().max(100).optional(),
  notes: z.string().max(2000).optional().nullable(),
  status: z.enum(['ACTIVE', 'REVOKED', 'EXPIRED']).optional(),
  revokedReason: z.string().max(500).optional().nullable()
})

// ── Admin: users ──

export const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  githubUsername: z.string().regex(/^[a-zA-Z0-9-]{1,39}$/).optional().nullable()
})

// ── Public license validation API (called by self-hosted instances) ──

export const activateLicenseSchema = z.object({
  key: z.string().min(1).max(100),
  fingerprint: z.string().min(8).max(128),
  hostname: z.string().max(255).optional().nullable(),
  version: z.string().max(40).optional().nullable()
})

export const heartbeatSchema = z.object({
  activationToken: z.string().min(8).max(128),
  fingerprint: z.string().min(8).max(128),
  version: z.string().max(40).optional().nullable()
})

export const deactivateSchema = z.object({
  activationToken: z.string().min(8).max(128),
  fingerprint: z.string().min(8).max(128)
})

// ── Helpers ──

export async function validateBody<T>(event: H3Event, schema: z.ZodSchema<T>): Promise<T> {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: 'Validation Error',
      data: result.error.flatten().fieldErrors
    })
  }
  return result.data
}

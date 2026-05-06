import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  timeZone: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  age: z.coerce.number().int().positive().optional()
})

export const forgotPasswordSchema = z.object({
  email: z.string().email()
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8)
})

export const resendVerificationSchema = z.object({
  email: z.string().email()
})

export const createCourseSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  teacherId: z.coerce.number().int().positive().optional()
})

export const updateCourseSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  teacherId: z.coerce.number().int().positive().nullish(),
  isActive: z.boolean().optional()
})

export const createVariantSchema = z.object({
  name: z.string().min(1),
  sessionsPerMonth: z.coerce.number().int().min(1),
  price: z.coerce.number().min(0).optional(),
  lsVariantId: z.string().optional()
})

export const updateVariantSchema = z.object({
  name: z.string().min(1).optional(),
  sessionsPerMonth: z.coerce.number().int().min(1).optional(),
  price: z.coerce.number().min(0).optional(),
  isActive: z.boolean().optional(),
  lsVariantId: z.string().optional()
})

export const enrollmentSchema = z.object({
  courseVariantId: z.coerce.number().int().positive()
})

export const checkoutSchema = z.object({
  variantId: z.coerce.number().int().positive()
})

export const updateEnrollmentSchema = z.object({
  status: z.enum(['PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED'])
})

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.union([z.string().url(), z.literal('')]).optional(),
  timeZone: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  age: z.coerce.number().int().positive().optional(),
  password: z.string().min(8).optional()
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type CreateVariantInput = z.infer<typeof createVariantSchema>
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>
export type EnrollmentInput = z.infer<typeof enrollmentSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

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
  teacherId: z.coerce.number().int().positive().optional(),
  price: z.coerce.number().min(0).optional(),
  totalSessions: z.coerce.number().int().min(1).optional(),
  lsVariantId: z.string().optional()
})

export const updateCourseSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  imageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  teacherId: z.coerce.number().int().positive().nullish(),
  isActive: z.boolean().optional(),
  price: z.coerce.number().min(0).optional(),
  totalSessions: z.coerce.number().int().min(1).optional(),
  lsVariantId: z.string().nullish()
})

export const enrollmentSchema = z.object({
  courseId: z.coerce.number().int().positive()
})

export const checkoutSchema = z.object({
  courseId: z.coerce.number().int().positive(),
  promoCode: z.string().min(1).max(40).optional()
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
  password: z.string().min(8).optional(),
  isAvailableForBooking: z.boolean().optional()
})

export const updateUserSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'TEACHER', 'STUDENT']).optional(),
  isActive: z.boolean().optional(),
  isAvailableForBooking: z.boolean().optional(),
  timeZone: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  age: z.coerce.number().int().positive().optional()
})

export const createBlogCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
})

export const updateBlogCategorySchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional()
})

export const createBlogTagSchema = z.object({
  name: z.string().min(1)
})

export const updateBlogTagSchema = z.object({
  name: z.string().min(1).optional()
})

export const createBlogPostSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  imageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  published: z.boolean().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  tagIds: z.array(z.coerce.number().int().positive()).optional()
})

export const updateBlogPostSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  imageUrl: z.union([z.string().url(), z.literal('')]).optional(),
  published: z.boolean().optional(),
  categoryId: z.coerce.number().int().positive().nullish(),
  tagIds: z.array(z.coerce.number().int().positive()).optional()
})

export const teacherAvailabilitySchema = z.object({
  slots: z.array(
    z.object({
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startTime: z.coerce.number().int().min(0).max(1439),
      endTime: z.coerce.number().int().min(0).max(1439)
    })
  ),
  isAvailableForBooking: z.boolean().optional()
})

export const createSessionSchema = z.object({
  enrollmentId: z.coerce.number().int().positive(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.coerce.number().int().min(15).max(240).optional(),
  zoomLink: z.string().url().optional(),
  notes: z.string().optional()
})

export const updateSessionSchema = z.object({
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  zoomLink: z.string().url().optional(),
  notes: z.string().optional()
})

export const courseMaterialSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['LINK', 'PDF', 'SLIDE']),
  url: z.string().url().optional(),
  isPrivate: z.boolean().optional(),
  enrollmentId: z.coerce.number().int().positive().optional()
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>
export type CreateCourseInput = z.infer<typeof createCourseSchema>
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>
export type EnrollmentInput = z.infer<typeof enrollmentSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateBlogCategoryInput = z.infer<typeof createBlogCategorySchema>
export type UpdateBlogCategoryInput = z.infer<typeof updateBlogCategorySchema>
export type CreateBlogTagInput = z.infer<typeof createBlogTagSchema>
export type UpdateBlogTagInput = z.infer<typeof updateBlogTagSchema>
export type CreateBlogPostInput = z.infer<typeof createBlogPostSchema>
export type UpdateBlogPostInput = z.infer<typeof updateBlogPostSchema>
export type TeacherAvailabilityInput = z.infer<typeof teacherAvailabilitySchema>
export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type CourseMaterialInput = z.infer<typeof courseMaterialSchema>

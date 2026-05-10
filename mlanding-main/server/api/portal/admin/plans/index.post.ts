// Create a new plan.

import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'

const featureRefSchema = z.object({
  featureId: z.string().min(1),
  sortOrder: z.number().int().nonnegative().optional()
})

const bodySchema = z.object({
  slug: z.string().min(1).max(80).regex(/^[a-z0-9-]+$/, 'lowercase letters, digits, dashes'),
  name: z.string().min(1).max(120),
  nameAr: z.string().max(120).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  descriptionAr: z.string().max(1000).nullable().optional(),
  priceUsdCents: z.number().int().min(0).max(10_000_00),
  defaultActivations: z.number().int().positive().max(100).default(1),
  lsVariantId: z.string().max(100).nullable().optional(),
  sortOrder: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
  features: z.array(featureRefSchema).default([])
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten().fieldErrors })
  }

  const exists = await prisma.plan.findUnique({ where: { slug: parsed.data.slug } })
  if (exists) throw createError({ statusCode: 409, statusMessage: 'A plan with that slug already exists' })

  const { features, ...planData } = parsed.data
  const plan = await prisma.plan.create({
    data: {
      ...planData,
      features: { create: features.map((f, i) => ({ featureId: f.featureId, sortOrder: f.sortOrder ?? i })) }
    }
  })

  await auditLog({
    actorId: user.id,
    action: 'plan.created',
    targetType: 'Plan',
    targetId: plan.id,
    metadata: { slug: plan.slug, name: plan.name, priceUsdCents: plan.priceUsdCents, featureCount: features.length }
  })

  return { id: plan.id, slug: plan.slug }
})

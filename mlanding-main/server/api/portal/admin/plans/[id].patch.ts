// Update an existing plan (admin). Changing priceUsdCents or
// defaultActivations only affects future licenses; already-issued
// licenses keep their snapshot.
//
// Passing `features` replaces the current set. Omit it to leave the
// feature attachments untouched.

import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'

const featureRefSchema = z.object({
  featureId: z.string().min(1),
  sortOrder: z.number().int().nonnegative().optional()
})

const bodySchema = z.object({
  name: z.string().min(1).max(120).optional(),
  nameAr: z.string().max(120).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  descriptionAr: z.string().max(1000).nullable().optional(),
  priceUsdCents: z.number().int().min(0).max(10_000_00).optional(),
  defaultActivations: z.number().int().positive().max(100).optional(),
  lsVariantId: z.string().max(100).nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
  features: z.array(featureRefSchema).optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten().fieldErrors })
  }

  const before = await prisma.plan.findUnique({ where: { id } })
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })

  const { features, ...planData } = parsed.data

  await prisma.$transaction(async (tx) => {
    if (Object.keys(planData).length > 0) {
      await tx.plan.update({ where: { id }, data: planData })
    }
    if (features) {
      await tx.planFeature.deleteMany({ where: { planId: id } })
      if (features.length > 0) {
        await tx.planFeature.createMany({
          data: features.map((f, i) => ({ planId: id, featureId: f.featureId, sortOrder: f.sortOrder ?? i }))
        })
      }
    }
  })

  await auditLog({
    actorId: user.id,
    action: 'plan.updated',
    targetType: 'Plan',
    targetId: id,
    metadata: { changes: parsed.data, previous: { priceUsdCents: before.priceUsdCents, isActive: before.isActive } }
  })

  return { id }
})

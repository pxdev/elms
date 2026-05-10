import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'

const bodySchema = z.object({
  label: z.string().min(1).max(160),
  labelAr: z.string().max(160).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().nonnegative().default(0)
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten().fieldErrors })
  }

  const feature = await prisma.feature.create({ data: parsed.data })

  await auditLog({
    actorId: user.id,
    action: 'feature.created',
    targetType: 'Feature',
    targetId: feature.id,
    metadata: { label: feature.label }
  })

  return { id: feature.id }
})

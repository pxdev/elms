import { z } from 'zod'
import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'

const bodySchema = z.object({
  label: z.string().min(1).max(160).optional(),
  labelAr: z.string().max(160).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body', data: parsed.error.flatten().fieldErrors })
  }

  const before = await prisma.feature.findUnique({ where: { id } })
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Feature not found' })

  await prisma.feature.update({ where: { id }, data: parsed.data })

  await auditLog({
    actorId: user.id,
    action: 'feature.updated',
    targetType: 'Feature',
    targetId: id,
    metadata: { changes: parsed.data }
  })

  return { id }
})

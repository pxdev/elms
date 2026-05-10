// Update a license (admin): revoke, raise maxActivations, edit notes.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { updateLicenseSchema, validateBody } from '../../../../utils/validation'
import { auditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const data = await validateBody(event, updateLicenseSchema)

  const before = await prisma.license.findUnique({ where: { id } })
  if (!before) throw createError({ statusCode: 404, statusMessage: 'License not found' })

  const updates: any = {}
  if (data.maxActivations !== undefined) updates.maxActivations = data.maxActivations
  if (data.notes !== undefined) updates.notes = data.notes
  if (data.status !== undefined) {
    updates.status = data.status
    if (data.status === 'REVOKED' && before.status !== 'REVOKED') {
      updates.revokedAt = new Date()
      updates.revokedReason = data.revokedReason ?? 'admin_revoked'
    }
    if (data.status === 'ACTIVE' && before.status !== 'ACTIVE') {
      updates.revokedAt = null
      updates.revokedReason = null
    }
  }

  const after = await prisma.license.update({ where: { id }, data: updates })

  await auditLog({
    actorId: user.id,
    action: 'license.updated',
    targetType: 'License',
    targetId: id,
    metadata: {
      changes: updates,
      previousStatus: before.status,
      previousMaxActivations: before.maxActivations
    }
  })

  return { id: after.id, status: after.status, maxActivations: after.maxActivations }
})

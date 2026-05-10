// Update a customer's flags (admin): isActive, isAdmin, githubUsername.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { updateUserSchema, validateBody } from '../../../../utils/validation'
import { auditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const { user: actor } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!
  const data = await validateBody(event, updateUserSchema)

  const before = await prisma.account.findUnique({ where: { id } })
  if (!before) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  const updates: any = {}
  if (data.isActive !== undefined) updates.isActive = data.isActive
  if (data.isAdmin !== undefined) updates.isAdmin = data.isAdmin
  if (data.githubUsername !== undefined) updates.githubUsername = data.githubUsername

  if (id === actor.id && data.isAdmin === false) {
    throw createError({ statusCode: 400, statusMessage: 'You cannot remove your own admin role' })
  }

  const after = await prisma.account.update({ where: { id }, data: updates })

  await auditLog({
    actorId: actor.id,
    action: 'account.updated',
    targetType: 'Account',
    targetId: id,
    metadata: {
      changes: updates,
      previousIsActive: before.isActive,
      previousIsAdmin: before.isAdmin
    }
  })

  return { id: after.id, isActive: after.isActive, isAdmin: after.isAdmin }
})

// Force-deactivate an instance: deletes the Activation row so the next
// heartbeat from that fingerprint fails closed.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { auditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const id = getRouterParam(event, 'id')!

  const activation = await prisma.activation.findUnique({ where: { id } })
  if (!activation) throw createError({ statusCode: 404, statusMessage: 'Activation not found' })

  await prisma.activation.delete({ where: { id } })

  await auditLog({
    actorId: user.id,
    action: 'activation.reset',
    targetType: 'Activation',
    targetId: id,
    metadata: {
      licenseId: activation.licenseId,
      fingerprint: activation.fingerprint,
      hostname: activation.hostname
    }
  })

  return { ok: true }
})

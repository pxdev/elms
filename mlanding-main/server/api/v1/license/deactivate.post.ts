// Voluntary deactivation — used by an operator who's moving an install to
// a new server. Frees up an activation slot under the license's cap.
//
// Always 200 (idempotent). Doesn't reveal whether the token existed.

import prisma from '../../../utils/prisma'
import { deactivateSchema, validateBody } from '../../../utils/validation'
import { auditLog } from '../../../utils/audit'

export default defineEventHandler(async (event) => {
  enforceRateLimit(event, { max: 10, windowSeconds: 60 })
  const body = await validateBody(event, deactivateSchema)

  const activation = await prisma.activation.findUnique({
    where: { activationToken: body.activationToken }
  })

  if (activation && activation.fingerprint === body.fingerprint && !activation.deactivatedAt) {
    await prisma.activation.update({
      where: { id: activation.id },
      data: { deactivatedAt: new Date() }
    })
    await auditLog({
      actorId: null,
      action: 'license.deactivated',
      targetType: 'Activation',
      targetId: activation.id,
      metadata: {
        licenseId: activation.licenseId,
        fingerprint: activation.fingerprint,
        hostname: activation.hostname
      }
    })
  }

  return { ok: true }
})

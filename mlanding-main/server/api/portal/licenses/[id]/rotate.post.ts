// Rotate a license key. The old key stops working immediately and every
// existing activation is forced to re-activate. We soft-deactivate rather
// than delete so the install history (hostnames, last-seen, versions) is
// preserved for support forensics.
//
// The new plaintext key is returned ONCE; thereafter only the prefix is
// recoverable from the dashboard.

import prisma from '../../../../utils/prisma'
import { requireSession } from '../../../../utils/auth-guards'
import { generateLicenseKey } from '../../../../utils/license'
import { auditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)
  enforceRateLimit(event, { max: 5, windowSeconds: 60 })

  const id = getRouterParam(event, 'id')!
  const license = await prisma.license.findFirst({
    where: { id, accountId: user.id }
  })
  if (!license) throw createError({ statusCode: 404, statusMessage: 'License not found' })
  if (license.status !== 'ACTIVE') {
    throw createError({ statusCode: 400, statusMessage: 'Only active licenses can be rotated' })
  }

  const { key, prefix, hash } = generateLicenseKey()

  await prisma.$transaction([
    prisma.license.update({
      where: { id: license.id },
      data: { keyHash: hash, keyPrefix: prefix }
    }),
    // Soft-deactivate every live install under this license so the next
    // heartbeat returns 401 and the instance has to re-activate with the
    // new key. Rows are retained for the audit trail.
    prisma.activation.updateMany({
      where: { licenseId: license.id, deactivatedAt: null },
      data: { deactivatedAt: new Date() }
    })
  ])

  await auditLog({
    actorId: user.id,
    action: 'license.rotated',
    targetType: 'License',
    targetId: license.id,
    metadata: { previousPrefix: license.keyPrefix, newPrefix: prefix }
  })

  return {
    key,                                           // plaintext, shown once
    keyPrefix: prefix
  }
})

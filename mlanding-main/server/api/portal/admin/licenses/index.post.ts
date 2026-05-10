// Issue a new license to a customer (admin only).
// Returns the plaintext key ONCE.

import prisma from '../../../../utils/prisma'
import { requireAdmin } from '../../../../utils/auth-guards'
import { issueLicenseSchema, validateBody } from '../../../../utils/validation'
import { generateLicenseKey } from '../../../../utils/license'
import { auditLog } from '../../../../utils/audit'

export default defineEventHandler(async (event) => {
  const { user } = await requireAdmin(event)
  const data = await validateBody(event, issueLicenseSchema)

  const account = await prisma.account.findUnique({ where: { id: data.accountId } })
  if (!account) throw createError({ statusCode: 404, statusMessage: 'Account not found' })
  const plan = await prisma.plan.findUnique({ where: { id: data.planId } })
  if (!plan) throw createError({ statusCode: 404, statusMessage: 'Plan not found' })

  const { key, prefix, hash } = generateLicenseKey()

  const license = await prisma.license.create({
    data: {
      accountId: account.id,
      planId: plan.id,
      keyPrefix: prefix,
      keyHash: hash,
      maxActivations: data.maxActivations ?? plan.defaultActivations,
      notes: data.notes ?? null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
    }
  })

  await auditLog({
    actorId: user.id,
    action: 'license.issued.manual',
    targetType: 'License',
    targetId: license.id,
    metadata: {
      accountId: account.id,
      accountEmail: account.email,
      plan: plan.slug,
      maxActivations: license.maxActivations,
      expiresAt: license.expiresAt
    }
  })

  return {
    key,                                           // plaintext, shown once
    license: {
      id: license.id,
      keyPrefix: license.keyPrefix,
      maxActivations: license.maxActivations,
      issuedAt: license.issuedAt
    }
  }
})

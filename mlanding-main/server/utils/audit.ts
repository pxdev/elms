// Append a row to the AuditLog. Fire-and-forget — never throws into the
// caller's flow (logging failure shouldn't break the actual operation).
//
//   await auditLog({
//     actorId: session.user.id,        // or null for system actions
//     action: 'license.issued',
//     targetType: 'License',
//     targetId: license.id,
//     metadata: { plan: plan.slug, maxActivations }
//   })

import prisma from './prisma'

export interface AuditLogInput {
  actorId?: string | null
  action: string
  targetType?: string | null
  targetId?: string | null
  metadata?: Record<string, unknown> | null
}

export async function auditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        metadata: (input.metadata ?? null) as any
      }
    })
  } catch (err) {
    // Don't propagate — log to stderr and move on.
    console.error('[audit] failed to write log:', input.action, err)
  }
}

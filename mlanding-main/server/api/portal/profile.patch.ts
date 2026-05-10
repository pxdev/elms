// Update name + GitHub username. Email + password are changed elsewhere.
//
// When the customer adds/changes githubUsername AND has at least one active
// license, we trigger a fresh repo-invite. This is how customers who bought
// before adding their GH username eventually get repo access.

import prisma from '../../utils/prisma'
import { z } from 'zod'
import { requireSession } from '../../utils/auth-guards'
import { validateBody } from '../../utils/validation'
import { ensureRepoInvite } from '../../utils/github'

const profileSchema = z.object({
  firstName: z.string().min(1).max(80).optional(),
  lastName: z.string().min(1).max(80).optional(),
  githubUsername: z.string().regex(/^[a-zA-Z0-9-]{1,39}$/).optional().nullable()
})

export default defineEventHandler(async (event) => {
  const { user } = await requireSession(event)
  const data = await validateBody(event, profileSchema)

  const before = await prisma.account.findUnique({ where: { id: user.id } })
  if (!before) throw createError({ statusCode: 404, statusMessage: 'Account not found' })

  const updates: any = {}
  if (data.firstName !== undefined) updates.firstName = data.firstName
  if (data.lastName !== undefined) updates.lastName = data.lastName
  if (data.githubUsername !== undefined) updates.githubUsername = data.githubUsername || null

  const after = await prisma.account.update({ where: { id: user.id }, data: updates })

  // Trigger a repo invite if the GH username changed AND the customer has at
  // least one ACTIVE license. (No license = no source access yet.)
  let inviteResult: { status: string; error?: string } | null = null
  const newGh = after.githubUsername
  if (newGh && newGh !== before.githubUsername) {
    const activeLicenses = await prisma.license.count({
      where: { accountId: user.id, status: 'ACTIVE' }
    })
    if (activeLicenses > 0) {
      const r = await ensureRepoInvite({
        accountId: user.id,
        githubUsername: newGh,
        actorId: user.id
      })
      inviteResult = { status: r.status, error: r.error }
    }
  }

  return {
    id: after.id,
    firstName: after.firstName,
    lastName: after.lastName,
    githubUsername: after.githubUsername,
    invite: inviteResult
  }
})

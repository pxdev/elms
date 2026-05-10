// GitHub team-membership wrapper. We add customers to a single team in our
// org (default `customers`) that has read access to the source repo.
// One team, many customers — easier to manage than per-customer collaborator
// invites.
//
// Auth: PAT with `admin:org` (Members > Read & write) or fine-grained token
// scoped to the org. Configure via /admin/settings/integrations.
//
// API ref:
//   PUT  /orgs/{org}/teams/{team_slug}/memberships/{username}
//   DELETE /orgs/{org}/teams/{team_slug}/memberships/{username}
//   GET  /orgs/{org}/teams/{team_slug}/memberships/{username}
//
// Octokit handles retries internally; we only catch + format errors.

import { Octokit } from '@octokit/rest'
import prisma from './prisma'
import { auditLog } from './audit'
import { getSetting } from './integration-settings'

interface GhClient { octokit: Octokit; org: string; team: string }

// Build a fresh client each call. Octokit instantiation is cheap and this
// guarantees we read the latest DB-stored token after an admin update.
async function getClient(): Promise<GhClient> {
  const token = await getSetting('GITHUB_TOKEN')
  if (!token) throw new Error('GITHUB_TOKEN is not set')
  const org = await getSetting('GITHUB_ORG')
  if (!org) throw new Error('GITHUB_ORG is not set')
  const team = (await getSetting('GITHUB_TEAM_SLUG')) || 'customers'
  return { octokit: new Octokit({ auth: token }), org, team }
}

export async function inviteToCustomersTeam(githubUsername: string) {
  const { octokit, org, team } = await getClient()
  return octokit.teams.addOrUpdateMembershipForUserInOrg({
    org,
    team_slug: team,
    username: githubUsername,
    role: 'member'
  })
}

export async function removeFromCustomersTeam(githubUsername: string) {
  const { octokit, org, team } = await getClient()
  return octokit.teams.removeMembershipForUserInOrg({
    org,
    team_slug: team,
    username: githubUsername
  })
}

export async function checkMembership(githubUsername: string) {
  const { octokit, org, team } = await getClient()
  try {
    const res = await octokit.teams.getMembershipForUserInOrg({
      org,
      team_slug: team,
      username: githubUsername
    })
    return res.data.state as 'active' | 'pending'
  } catch (err: any) {
    if (err.status === 404) return null
    throw err
  }
}

// Highest-level helper: ensure the customer has a RepoInvite row and try
// to send it. Used by the LS webhook (after issuing a license) and by the
// profile page (after the customer adds their GitHub username).
//
// Safe to call repeatedly; caller doesn't need to know if an invite is
// already pending. Errors are recorded on the RepoInvite row, not thrown.
export async function ensureRepoInvite(args: {
  accountId: string
  githubUsername: string
  actorId?: string | null
}): Promise<{ ok: boolean; status: 'SENT' | 'ACCEPTED' | 'FAILED' | 'PENDING'; error?: string }> {
  const { accountId, githubUsername } = args

  const invite = await prisma.repoInvite.upsert({
    where: { accountId_githubUsername: { accountId, githubUsername } },
    create: { accountId, githubUsername, status: 'PENDING', attempts: 0 },
    update: {}
  })
  if (invite.status === 'ACCEPTED') return { ok: true, status: 'ACCEPTED' }

  const token = await getSetting('GITHUB_TOKEN')
  const org = await getSetting('GITHUB_ORG')
  if (!token || !org) {
    return { ok: false, status: 'PENDING', error: 'GitHub not configured' }
  }

  try {
    await inviteToCustomersTeam(githubUsername)
    const updated = await prisma.repoInvite.update({
      where: { id: invite.id },
      data: { status: 'SENT', sentAt: new Date(), attempts: invite.attempts + 1, lastError: null }
    })
    await auditLog({
      actorId: args.actorId ?? null,
      action: 'repo.invite.sent',
      targetType: 'RepoInvite',
      targetId: updated.id,
      metadata: { accountId, githubUsername }
    })
    return { ok: true, status: 'SENT' }
  } catch (err: any) {
    const msg = err?.message || String(err)
    await prisma.repoInvite.update({
      where: { id: invite.id },
      data: {
        status: 'FAILED',
        attempts: invite.attempts + 1,
        lastError: msg.slice(0, 500)
      }
    })
    await auditLog({
      actorId: args.actorId ?? null,
      action: 'repo.invite.failed',
      targetType: 'RepoInvite',
      targetId: invite.id,
      metadata: { accountId, githubUsername, error: msg.slice(0, 200) }
    })
    return { ok: false, status: 'FAILED', error: msg }
  }
}

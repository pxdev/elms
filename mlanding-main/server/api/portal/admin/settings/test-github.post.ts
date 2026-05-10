// Smoke-test the GitHub PAT and team-membership permissions.
//
// Two checks:
//   1. /user — confirms the token authenticates
//   2. /orgs/{org}/teams/{team_slug}/memberships/CHECK — confirms it has
//      the right scope to manage the customers team. We don't actually
//      add anyone; a 404 for an unknown user proves the team is reachable.

import { requireAdmin } from '../../../../utils/auth-guards'
import { getSetting } from '../../../../utils/integration-settings'

interface GhUser { login: string }

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const token = await getSetting('GITHUB_TOKEN')
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Token not configured' })

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }

  let login: string
  try {
    const res = await $fetch<GhUser>('https://api.github.com/user', { headers, timeout: 8000, retry: 0 })
    login = res.login
  } catch (err: any) {
    throw createError({ statusCode: 401, statusMessage: 'Token rejected by GitHub' })
  }

  const org = await getSetting('GITHUB_ORG')
  const team = (await getSetting('GITHUB_TEAM_SLUG')) || 'customers'
  if (!org) return { ok: true, login, teamCheck: 'skipped (org not set)' }

  // Probe the team endpoint with a username that won't exist. 404 = team
  // is reachable + token has scope; 403 = scope missing; 401 = bad token.
  try {
    await $fetch(`https://api.github.com/orgs/${org}/teams/${team}/memberships/__momentfy_probe__`, {
      headers, timeout: 8000, retry: 0
    })
    return { ok: true, login, teamCheck: 'probe unexpectedly succeeded' }
  } catch (err: any) {
    if (err.status === 404) return { ok: true, login, teamCheck: 'reachable' }
    if (err.status === 403) {
      throw createError({ statusCode: 403, statusMessage: 'Token lacks org admin permissions' })
    }
    throw createError({ statusCode: 502, statusMessage: err?.message || 'Team probe failed' })
  }
})

// Bootstrap admins via env var.
//
// PORTAL_ADMIN_EMAILS is a comma-separated allowlist. On register, and on
// every login for accounts that aren't admin yet, we check the email
// against this list and flip isAdmin to true. Seed-only — removing an
// email here does NOT demote; the DB flag stays true until an admin
// toggles it off.
//
// Rationale: solves the chicken-and-egg of "register → can't promote
// yourself without DB access" without making env the source of truth
// (which would block the eventual admin-management UI).

export function isBootstrapAdminEmail(email: string): boolean {
  const raw = process.env.PORTAL_ADMIN_EMAILS
  if (!raw) return false
  const target = email.trim().toLowerCase()
  if (!target) return false
  return raw
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(target)
}

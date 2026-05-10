// DB-backed integration settings with env-var fallback.
//
// Reads:
//   const apiKey = await getSetting('LEMON_SQUEEZY_API_KEY')
// Returns the DB row's decrypted value if present, else process.env[key],
// else null. Lets existing deployments keep working on env vars until
// admin saves a value through the UI.
//
// Writes:
//   await setSettings({ LEMON_SQUEEZY_API_KEY: 'lsk_...', ... }, actorId)
// Empty string clears the row (next read will fall back to env again).

import prisma from './prisma'
import { decryptSecret, encryptSecret } from './encryption'

// Keys whose values must be encrypted at rest. Anything not in this set is
// stored as plaintext (host, port, store id, repo URL, etc.).
const SENSITIVE_KEYS = new Set([
  'LEMON_SQUEEZY_API_KEY',
  'LEMON_SQUEEZY_WEBHOOK_SECRET',
  'GITHUB_TOKEN',
  'SMTP_PASS'
])

let _cache: Map<string, string | null> | null = null
function getCache() { return _cache ??= new Map() }
export function invalidateIntegrationCache() { _cache = null }

export async function getSetting(key: string): Promise<string | null> {
  const cache = getCache()
  if (cache.has(key)) return cache.get(key)!

  const row = await prisma.integrationSetting.findUnique({ where: { key } })
  let val: string | null
  if (row) {
    val = row.encrypted ? decryptSecret(row.value) : row.value
  } else {
    val = process.env[key] || null
  }
  cache.set(key, val)
  return val
}

export interface SettingsPatch {
  // null  → delete the row (revert to env fallback)
  // ''    → also delete (treat blank as "clear")
  // string → save (encrypted iff key is in SENSITIVE_KEYS)
  [key: string]: string | null | undefined
}

export async function setSettings(patch: SettingsPatch, actorId: string | null) {
  const ops = []
  for (const [key, raw] of Object.entries(patch)) {
    if (raw === undefined) continue
    const trimmed = raw === null ? null : String(raw).trim()
    if (!trimmed) {
      ops.push(prisma.integrationSetting.deleteMany({ where: { key } }))
      continue
    }
    const encrypted = SENSITIVE_KEYS.has(key)
    const value = encrypted ? encryptSecret(trimmed) : trimmed
    ops.push(prisma.integrationSetting.upsert({
      where: { key },
      create: { key, value, encrypted, updatedById: actorId },
      update: { value, encrypted, updatedById: actorId }
    }))
  }
  await prisma.$transaction(ops)
  invalidateIntegrationCache()
}

// Convenience boolean. process.env values are strings; treat 'true'/'1' as true.
export async function getBoolSetting(key: string): Promise<boolean> {
  const v = await getSetting(key)
  return v === 'true' || v === '1'
}

// Bulk read for the admin GET endpoint and the test handlers — avoids N
// per-key roundtrips. Returns a Map (key → value | null with env fallback).
export async function getSettings(keys: readonly string[]): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {}
  await Promise.all(keys.map(async k => { out[k] = await getSetting(k) }))
  return out
}

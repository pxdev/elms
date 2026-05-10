// License key generation + hashing.
//
// Key format: MFY-XXXX-XXXX-XXXX-XXXX-XXXX
//   - 5 groups of 4 chars from a Crockford-style base32 alphabet (no I/L/O/U)
//   - 100 bits of entropy (20 chars × 5 bits)
//   - Stable in chat, email, terminals — no ambiguous glyphs
//
// Storage: only the SHA-256 hash (mixed with LICENSE_PEPPER from env) lives
// in the database. The plaintext key is shown to the customer ONCE at issue
// time; thereafter only the prefix ("MFY-XXXX") is recoverable.
//
// We pepper the hash so a stolen DB dump alone can't be brute-forced offline
// without the env secret. Pepper rotation invalidates all keys — design the
// rollout accordingly.

import { createHash, randomBytes } from 'node:crypto'

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'
const GROUP_LEN = 4
const GROUP_COUNT = 5
const TOTAL_CHARS = GROUP_LEN * GROUP_COUNT // 20

export function generateLicenseKey(): { key: string; prefix: string; hash: string } {
  // 13 random bytes = 104 random bits. We consume 20 × 5 = 100 of them and
  // discard the trailing 4 — still 100 bits of entropy, well above the ~64
  // bits at which brute-force becomes implausible against a rate-limited API.
  //
  // Streaming 5-bit extractor: accumulate incoming bytes into a small integer,
  // pop 5-bit groups off the top. Max accumulator width = 4 (holdover) + 8
  // (new byte) = 12 bits, so plain 32-bit math is safe — no BigInt.
  const bytes = randomBytes(13)
  const chars: string[] = []
  let acc = 0
  let bits = 0
  for (const b of bytes) {
    acc = (acc << 8) | b
    bits += 8
    while (bits >= 5 && chars.length < TOTAL_CHARS) {
      bits -= 5
      chars.push(ALPHABET[(acc >>> bits) & 0x1f]!)
    }
  }

  const groups: string[] = []
  for (let i = 0; i < TOTAL_CHARS; i += GROUP_LEN) {
    groups.push(chars.slice(i, i + GROUP_LEN).join(''))
  }
  const key = `MFY-${groups.join('-')}`
  return { key, prefix: key.slice(0, 8), hash: hashLicenseKey(key) }
}

export function hashLicenseKey(key: string): string {
  const pepper = process.env.LICENSE_PEPPER || ''
  if (!pepper && process.env.NODE_ENV === 'production') {
    // Refuse to operate without a pepper in prod — silent fallback would
    // weaken every key issued during the lapse.
    throw new Error('LICENSE_PEPPER must be set in production')
  }
  return createHash('sha256').update(key + pepper).digest('hex')
}

export function isLicenseKeyShape(s: unknown): s is string {
  if (typeof s !== 'string') return false
  // MFY- followed by 5 groups of 4 chars from the alphabet
  return /^MFY-[0-9A-HJKMNP-TV-Z]{4}(-[0-9A-HJKMNP-TV-Z]{4}){4}$/.test(s)
}

/**
 * User-facing normalisation: uppercase, strip every whitespace and
 * every non-hyphen separator the customer might have pasted in. The
 * canonical shape on storage is MFY-XXXX-XXXX-XXXX-XXXX-XXXX.
 *
 * We do NOT enforce the shape here — isLicenseKeyShape does that. This
 * just cleans up friendly-looking input so the shape check has a chance.
 */
export function normaliseLicenseKey(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[\s\u00A0\u200B]/g, '') // spaces, NBSP, zero-width
    .replace(/[_.,;:|]/g, '-')       // common delimiter typos → hyphen
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '')           // trim leading/trailing hyphens
}

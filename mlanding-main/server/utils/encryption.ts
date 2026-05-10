// AES-256-GCM at-rest encryption for integration credentials.
//
// The master key is derived from `NUXT_SESSION_PASSWORD` via HKDF-SHA-256
// (RFC 5869) so we don't introduce yet another env var. Rotating
// NUXT_SESSION_PASSWORD will make existing ciphertexts unreadable; admin
// must re-enter the affected secrets through the UI in that case.
//
// Wire format (base64):
//   <12-byte IV><16-byte auth tag><ciphertext>
//
// We tag the encoded value with a `gcm:` prefix so a future migration
// (e.g. envelope encryption with KMS) can be detected without ambiguity.

import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'node:crypto'

const PREFIX = 'gcm:'
const ALGO = 'aes-256-gcm'
const IV_LEN = 12
const TAG_LEN = 16
const KEY_LEN = 32

let cachedKey: Buffer | null = null

function masterKey(): Buffer {
  if (cachedKey) return cachedKey
  const seed = process.env.NUXT_SESSION_PASSWORD || ''
  if (!seed || seed.length < 32) {
    throw new Error(
      'NUXT_SESSION_PASSWORD must be set and at least 32 chars to derive integration encryption key'
    )
  }
  // HKDF: stable salt + context-specific info string.
  cachedKey = Buffer.from(
    hkdfSync('sha256', seed, Buffer.from('momentfy-portal-integration'), 'integration-settings:v1', KEY_LEN)
  )
  return cachedKey
}

export function encryptSecret(plaintext: string): string {
  const iv = randomBytes(IV_LEN)
  const cipher = createCipheriv(ALGO, masterKey(), iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return PREFIX + Buffer.concat([iv, tag, ct]).toString('base64')
}

export function decryptSecret(encoded: string): string {
  if (!encoded.startsWith(PREFIX)) {
    // Legacy plaintext row written before encryption was added — return as-is.
    return encoded
  }
  const buf = Buffer.from(encoded.slice(PREFIX.length), 'base64')
  if (buf.length < IV_LEN + TAG_LEN + 1) throw new Error('Encrypted value too short')
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const ct = buf.subarray(IV_LEN + TAG_LEN)
  const decipher = createDecipheriv(ALGO, masterKey(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
}

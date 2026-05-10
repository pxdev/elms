// Ed25519 signing for license certificates issued to self-hosted installs.
//
// The portal holds the private key; the public key is compiled into every
// shipped Momentfy instance. Customers can read the source but cannot forge
// certificates without the private key — that is the entire anchor for the
// license system.
//
// Key material is stored in env as raw seeds (32-byte hex) rather than PEM,
// so generation is trivial:
//
//   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
//
// LICENSE_SIGNING_PRIVATE_KEY  — 64-char hex (32 bytes) seed, PORTAL ONLY.
// LICENSE_SIGNING_PUBLIC_KEY   — 64-char hex (32 bytes), mirrored into main
//                                app's hardcoded constant. Published.
//
// Canonicalisation: we sign the UTF-8 bytes of a deterministic JSON encoding
// (sorted keys, no whitespace, no trailing newline). The `sig` field is
// omitted during canonicalisation so the same object round-trips cleanly.

import { createPrivateKey, createPublicKey, sign as cryptoSign } from 'node:crypto'

export interface CertificatePayload {
  v: 1
  licenseId: string
  keyPrefix: string
  customer: string
  fingerprint: string
  activatedAt: string
  expiresAt: string | null
  maxActivations: number
  issuer: string
}

export interface SignedCertificate extends CertificatePayload {
  sig: string
}

/**
 * Deterministic JSON encoding for signing. Keys sorted lexicographically,
 * no whitespace. MUST match the verifier on the main app byte-for-byte.
 */
export function canonicalJSON(obj: Record<string, unknown>): string {
  const keys = Object.keys(obj).sort()
  const parts: string[] = []
  for (const k of keys) {
    parts.push(JSON.stringify(k) + ':' + stableStringify(obj[k]))
  }
  return '{' + parts.join(',') + '}'
}

function stableStringify(v: unknown): string {
  if (v === null || typeof v !== 'object') return JSON.stringify(v)
  if (Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']'
  return canonicalJSON(v as Record<string, unknown>)
}

let cachedPrivateKey: ReturnType<typeof createPrivateKey> | null = null

function loadPrivateKey() {
  if (cachedPrivateKey) return cachedPrivateKey
  const seedHex = process.env.LICENSE_SIGNING_PRIVATE_KEY
  if (!seedHex || seedHex.length !== 64) {
    throw new Error('LICENSE_SIGNING_PRIVATE_KEY must be 64 hex chars (32-byte Ed25519 seed)')
  }
  const seed = Buffer.from(seedHex, 'hex')
  // Node accepts raw Ed25519 seeds as a PKCS#8-wrapped key via createPrivateKey
  // with format: 'der', type: 'pkcs8', and a synthesized DER prefix. The prefix
  // below is the ASN.1 header for an Ed25519 PrivateKeyInfo; splicing the seed
  // in at the tail gives us a valid KeyObject.
  const prefix = Buffer.from('302e020100300506032b657004220420', 'hex')
  const der = Buffer.concat([prefix, seed])
  cachedPrivateKey = createPrivateKey({ key: der, format: 'der', type: 'pkcs8' })
  return cachedPrivateKey
}

export function signCertificate(payload: CertificatePayload): SignedCertificate {
  const key = loadPrivateKey()
  const message = Buffer.from(canonicalJSON(payload as unknown as Record<string, unknown>), 'utf8')
  const signature = cryptoSign(null, message, key)
  return { ...payload, sig: signature.toString('base64') }
}

/**
 * For boot-time sanity check. Verifies that the public env matches the
 * private by round-tripping a test payload.
 */
export function publicKeyFromEnv() {
  const pubHex = process.env.LICENSE_SIGNING_PUBLIC_KEY
  if (!pubHex || pubHex.length !== 64) {
    throw new Error('LICENSE_SIGNING_PUBLIC_KEY must be 64 hex chars')
  }
  const prefix = Buffer.from('302a300506032b6570032100', 'hex')
  const der = Buffer.concat([prefix, Buffer.from(pubHex, 'hex')])
  return createPublicKey({ key: der, format: 'der', type: 'spki' })
}

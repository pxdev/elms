import { createHash, randomBytes } from 'node:crypto'

// Generate a URL-safe random token + its SHA-256 hash for storage.
// Email the plaintext token; persist only the hash.
export function generateToken(bytes = 32): { token: string; hash: string } {
  const token = randomBytes(bytes).toString('hex')
  return { token, hash: hashToken(token) }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

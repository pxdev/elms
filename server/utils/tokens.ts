import { randomBytes, createHash } from 'node:crypto'

export type TokenPurpose = 'email_verify' | 'password_reset'

const TTL_MS: Record<TokenPurpose, number> = {
  email_verify: 24 * 60 * 60 * 1000, // 24h
  password_reset: 60 * 60 * 1000 // 1h
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function issueToken(userId: number, purpose: TokenPurpose) {
  const token = randomBytes(32).toString('hex')
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + TTL_MS[purpose])

  await prisma.verificationToken.create({
    data: { userId, tokenHash, purpose, expiresAt }
  })

  return token
}

/**
 * Look up a token, verify it, mark it used. Throws on invalid/expired.
 */
export async function consumeToken(token: string, purpose: TokenPurpose) {
  const tokenHash = hashToken(token)
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } })

  if (!record || record.purpose !== purpose) {
    throw createError({ statusCode: 400, message: 'Invalid or unknown token.' })
  }
  if (record.usedAt) {
    throw createError({ statusCode: 400, message: 'This link has already been used.' })
  }
  if (record.expiresAt < new Date()) {
    throw createError({ statusCode: 400, message: 'This link has expired.' })
  }

  await prisma.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() }
  })

  return record.userId
}

/**
 * Invalidate all outstanding tokens of a given purpose for the user.
 * Useful e.g. when issuing a fresh reset link.
 */
export async function revokeOutstandingTokens(userId: number, purpose: TokenPurpose) {
  await prisma.verificationToken.updateMany({
    where: { userId, purpose, usedAt: null },
    data: { usedAt: new Date() }
  })
}

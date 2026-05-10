// One-off: generate an Ed25519 keypair for license certificate signing.
//
//   npx tsx scripts/generate-license-keypair.ts
//
// The seed is kept only in the portal env. The public key goes into the
// main Momentfy app as a hardcoded constant (see server/utils/license/
// public-key.ts over there). Rotating requires re-issuing every certificate,
// so you generate this ONCE at project setup.

import { createPrivateKey, createPublicKey, generateKeyPairSync, randomBytes } from 'node:crypto'

const { privateKey } = generateKeyPairSync('ed25519')

const priv = privateKey.export({ format: 'der', type: 'pkcs8' })
// The last 32 bytes of the PKCS#8 blob are the raw seed.
const seed = priv.subarray(priv.length - 32)

// Derive public from the synthesized private to emit matching hex.
const prefix = Buffer.from('302e020100300506032b657004220420', 'hex')
const der = Buffer.concat([prefix, seed])
const loaded = createPrivateKey({ key: der, format: 'der', type: 'pkcs8' })
const pub = createPublicKey(loaded)
const pubDer = pub.export({ format: 'der', type: 'spki' })
const pubRaw = pubDer.subarray(pubDer.length - 32)

// Split the public key into two random XOR shards. Either shard alone is
// uniform random bytes; together they reconstruct the key. Matches the
// combine logic in the main app's server/utils/license/public-key.ts.
const shardA = randomBytes(32)
const shardB = Buffer.alloc(32)
for (let i = 0; i < 32; i++) shardB[i] = pubRaw[i]! ^ shardA[i]!

console.log('# Ed25519 keypair for Momentfy license signing\n')
console.log('# Portal .env:')
console.log(`LICENSE_SIGNING_PRIVATE_KEY=${seed.toString('hex')}`)
console.log(`LICENSE_SIGNING_PUBLIC_KEY=${pubRaw.toString('hex')}\n`)
console.log('# Main app — replace the SHARD_A / SHARD_B constants in')
console.log('# server/utils/license/public-key.ts with:')
console.log(`const SHARD_A = '${shardA.toString('hex')}'`)
console.log(`const SHARD_B = '${shardB.toString('hex')}'`)

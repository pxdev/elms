// Liveness + readiness probe for Coolify, the container HEALTHCHECK,
// and external uptime monitors.
//
// Returns 200 with `{ ok: true, ts, uptime, version, db: 'up' }` when the
// process is alive AND can talk to Postgres. Returns 503 with `db: 'down'`
// when the DB ping fails — that surfaces the bad state to Coolify so it
// stops routing traffic to this replica (and rolls back if a deploy
// breaks the connection string).
//
// The query is intentionally trivial: $queryRaw`SELECT 1` is cheaper
// than any model-level read and doesn't touch the schema, so it stays
// stable across migrations.

import prisma from '../utils/prisma'

export default defineEventHandler(async (event) => {
  const started = Date.now()
  let dbOk = false
  let dbError: string | undefined

  try {
    await prisma.$queryRaw`SELECT 1`
    dbOk = true
  } catch (err) {
    dbError = err instanceof Error ? err.message : String(err)
  }

  const body = {
    ok: dbOk,
    db: dbOk ? 'up' : 'down',
    ts: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    version: process.env.npm_package_version || 'unknown',
    latencyMs: Date.now() - started,
    ...(dbError ? { error: dbError } : {})
  }

  if (!dbOk) {
    setResponseStatus(event, 503)
  }
  return body
})

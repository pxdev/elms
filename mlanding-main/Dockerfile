# syntax=docker/dockerfile:1.7
#
# Momentfy Portal — production image.
#
# Three stages: deps → build → runtime.
#   - deps   : install ALL dependencies (incl. devDeps, prisma CLI). No
#              postinstall scripts because nuxt prepare needs the full app
#              tree, which we don't have yet at this stage.
#   - build  : copy the rest of the source, generate the Prisma client,
#              run `nuxt build` → emits a self-contained .output/ bundle.
#   - runtime: minimal Debian-slim with just the artifacts needed to
#              (a) run pending Prisma migrations on boot and (b) serve the
#              Nitro bundle. Drops to non-root, runs under tini for clean
#              SIGTERM forwarding.
#
# The image is intended for Coolify's Dockerfile build pack. Build context
# is kept tiny by .dockerignore. Persistent uploads live on the /app/data
# volume that Coolify mounts at deploy time.

# ─── 1. deps ────────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS deps
WORKDIR /app

# OpenSSL is required by Prisma's Postgres adapter at install + runtime.
# ca-certificates lets npm + Prisma talk to TLS endpoints (registry,
# binary download mirror) over HTTPS.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

# Cache-bust this stage only on lockfile changes. Copy the prisma schema
# alongside so anything in the lockfile that wants to peek at it (the
# Prisma engine post-install hook does, when scripts run) can find it —
# even though we skip scripts here, the schema is harmless to ship.
COPY package.json package-lock.json ./
COPY prisma ./prisma

# --ignore-scripts skips both `nuxt prepare` and `prisma generate` from
# the package's postinstall hook. We do them explicitly in the build
# stage where the full source tree is available.
RUN --mount=type=cache,target=/root/.npm \
    npm ci --ignore-scripts

# ─── 2. build ───────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS build
WORKDIR /app

RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

ENV NUXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Reuse the resolved deps from the previous stage.
COPY --from=deps /app/node_modules ./node_modules

# Bring in the rest of the application source. .dockerignore keeps build
# artifacts (.nuxt, .output, .cache), git metadata, screenshots, and any
# committed-but-irrelevant files out of the context.
COPY . .

# Generate the Prisma client into ./generated/ (path declared in
# prisma.config.ts) and produce the Nitro production bundle.
RUN npx prisma generate \
 && npm run build

# ─── 3. runtime ─────────────────────────────────────────────────────
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

# tini   → forwards SIGTERM/SIGINT to the Node process so Coolify can
#          shut us down cleanly during a redeploy.
# openssl→ Prisma's Postgres adapter calls into libssl at runtime.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates tini \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system --gid 1001 nuxt \
 && useradd  --system --uid 1001 --gid nuxt --home-dir /app --shell /sbin/nologin nuxt

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0 \
    NUXT_TELEMETRY_DISABLED=1

# Nuxt's .output/ is self-contained — it bundles its own server-side
# node_modules in .output/server/node_modules so the runtime tree below
# only needs the Prisma CLI + engines + generated client for migrations.
COPY --from=build --chown=nuxt:nuxt /app/.output ./.output

# Prisma assets needed at boot:
#   - prisma/schema.prisma + prisma/migrations/  → migration source of truth
#   - node_modules/prisma                        → the CLI we invoke
#   - node_modules/@prisma/*                     → engines + adapter-pg
#   - node_modules/.prisma + ./generated         → the generated client
COPY --from=build --chown=nuxt:nuxt /app/prisma                 ./prisma
COPY --from=build --chown=nuxt:nuxt /app/node_modules/prisma    ./node_modules/prisma
COPY --from=build --chown=nuxt:nuxt /app/node_modules/@prisma   ./node_modules/@prisma
COPY --from=build --chown=nuxt:nuxt /app/node_modules/.prisma   ./node_modules/.prisma
COPY --from=build --chown=nuxt:nuxt /app/generated              ./generated

# Persistent uploads live here. Coolify mounts a host volume at this
# path; the directory is pre-created with the right ownership so the
# non-root nuxt user can write to it on first boot.
RUN mkdir -p /app/data \
 && chown -R nuxt:nuxt /app/data
VOLUME ["/app/data"]

USER nuxt
EXPOSE 3000

# Container-level health probe. Coolify also has its own healthcheck
# config at the application level (path: /api/health) — duplicating
# here means `docker ps` shows health status and Docker can refuse to
# route traffic to a container whose DB is unreachable.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

ENTRYPOINT ["/usr/bin/tini", "--"]
# Apply pending migrations, then start Nitro. If migrations fail the
# container exits non-zero and Coolify rolls back to the previous image.
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy && node .output/server/index.mjs"]

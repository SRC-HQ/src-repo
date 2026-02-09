# =============================================================================
# Sperm Race API - Production Dockerfile
# Build from repo root: docker build -f apps/api/Dockerfile .
# Uses Node 24 + Yarn for install/build, Node for runtime. With turbo prune.
# =============================================================================

FROM node:24-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# -----------------------------------------------------------------------------
# Prepare: turbo prune for API (pruned lockfile + split json/full for caching)
# -----------------------------------------------------------------------------
FROM base AS prepare
RUN npm install -g turbo@^2.3.3
COPY . .
RUN turbo prune @sperm-race/api --docker

# -----------------------------------------------------------------------------
# Builder: install deps & build NestJS API from pruned workspace
# -----------------------------------------------------------------------------
FROM base AS builder
# Install pruned dependencies (json + pruned yarn.lock from turbo prune)
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/yarn.lock ./yarn.lock
RUN corepack enable && corepack prepare yarn@1.22.19 --activate && yarn install --frozen-lockfile
# App source (includes only @sperm-race/api and its deps)
COPY --from=prepare /app/out/full/ .
WORKDIR /app/apps/api
RUN yarn build

# -----------------------------------------------------------------------------
# Runner: minimal Node image, runtime env via env file / secrets
# -----------------------------------------------------------------------------
FROM node:24-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs
WORKDIR /app
# Runtime deps + workspaces (contract-types) + compiled dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages/contract-types ./packages/contract-types
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/apps/api/src/main.js"]


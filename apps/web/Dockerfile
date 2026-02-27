# =============================================================================
# Sperm Race Web (Next.js) - Production Dockerfile
# Build from repo root: docker build -f apps/web/Dockerfile .
# On Apple Silicon, if yarn install fails on @next/swc-*, use:
#   docker build --platform linux/amd64 -f apps/web/Dockerfile .
# Uses Node 24 + Yarn for install/build, Node for runtime. With turbo prune.
# =============================================================================

FROM node:24-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# -----------------------------------------------------------------------------
# Prepare: turbo prune for Web
# -----------------------------------------------------------------------------
FROM base AS prepare
RUN npm install -g turbo@^2.3.3
COPY . .
RUN turbo prune @sperm-race/web --docker

# -----------------------------------------------------------------------------
# Builder: install deps & build Next.js (standalone) from pruned workspace
# -----------------------------------------------------------------------------
FROM base AS builder
COPY --from=prepare /app/out/json/ .
COPY --from=prepare /app/out/yarn.lock ./yarn.lock
# Use a writable cache dir and clean before install to avoid ENOENT on @next/swc-* optional deps
ENV YARN_CACHE_FOLDER=/tmp/yarn-cache
RUN corepack enable && corepack prepare yarn@1.22.19 --activate && \
    rm -rf /tmp/yarn-cache && \
    yarn install --frozen-lockfile --network-timeout 100000
COPY --from=prepare /app/out/full/ .

# Build Next.js app (respects NEXT_PUBLIC_* envs passed as build args)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_SOLANA_NETWORK
ARG NEXT_PUBLIC_SOLANA_RPC_URL
ARG NEXT_PUBLIC_PROGRAM_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_SOLANA_NETWORK=$NEXT_PUBLIC_SOLANA_NETWORK
ENV NEXT_PUBLIC_SOLANA_RPC_URL=$NEXT_PUBLIC_SOLANA_RPC_URL
ENV NEXT_PUBLIC_PROGRAM_ID=$NEXT_PUBLIC_PROGRAM_ID
WORKDIR /app/apps/web
RUN yarn build

# -----------------------------------------------------------------------------
# Runner: minimal Node image, Next.js standalone
# -----------------------------------------------------------------------------
FROM node:24-bookworm-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs
USER nextjs
WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000
CMD ["node", "apps/web/server.js"]


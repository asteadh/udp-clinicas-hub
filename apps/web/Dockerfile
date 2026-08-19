FROM --platform=$BUILDPLATFORM node:24-alpine AS base

# ── builder: prune workspace to only what web needs ──────────────────────────
FROM base AS builder
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.22.0 turbo --prefer-offline
WORKDIR /app
COPY . .
RUN turbo prune @hubnegocios/web --docker

# ── installer: install deps and build ────────────────────────────────────────
FROM base AS installer
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.22.0 --prefer-offline
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm-web,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts
COPY --from=builder /app/out/full/ .
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so the
# API URL must be present here (passed as a --build-arg by CI). Without it the
# browser bundle falls back to http://localhost:4000 for client-side fetches.
ARG NEXT_PUBLIC_HUBNEGOCIOS_API_URL
ENV NEXT_PUBLIC_HUBNEGOCIOS_API_URL=$NEXT_PUBLIC_HUBNEGOCIOS_API_URL
RUN pnpm turbo build --filter=@hubnegocios/web

# ── runner: target-platform Node — receives pure-JS standalone output ─────────
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

FROM --platform=$BUILDPLATFORM node:24-alpine AS base

# ── builder: prune workspace to only what admin needs ─────────────────────────
FROM base AS builder
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.22.0 turbo --prefer-offline
WORKDIR /app
COPY . .
RUN turbo prune @hubnegocios/admin --docker

# ── installer: install deps and build ──────────────────────────────────────
FROM base AS installer
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.22.0 --prefer-offline
WORKDIR /app
COPY --from=builder /app/out/json/ .
RUN --mount=type=cache,id=pnpm-admin,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts
COPY --from=builder /app/out/full/ .
# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so
# these must be present here (passed as --build-arg by CI). Without them the
# admin bundle falls back to localhost URLs and social login is hidden.
ARG NEXT_PUBLIC_HUBNEGOCIOS_API_URL
ARG NEXT_PUBLIC_HUBNEGOCIOS_WEB_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_HUBNEGOCIOS_API_URL=$NEXT_PUBLIC_HUBNEGOCIOS_API_URL
ENV NEXT_PUBLIC_HUBNEGOCIOS_WEB_URL=$NEXT_PUBLIC_HUBNEGOCIOS_WEB_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
RUN pnpm turbo build --filter=@hubnegocios/admin

# ── runner: target-platform Node — receives pure-JS standalone output ─────────
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3101
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer --chown=nextjs:nodejs /app/apps/admin/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/admin/.next/static ./apps/admin/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/admin/public ./apps/admin/public
EXPOSE 3101
CMD ["node", "apps/admin/server.js"]

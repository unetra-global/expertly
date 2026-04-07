# Build context: monorepo root
# Usage: docker build -f apps/web/Dockerfile -t expertly-web .

FROM node:20-alpine AS base

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM base AS builder
# libc6-compat might be needed by some node-gyp native modules 
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Explicitly set development to ensure pnpm installs devDependencies
ENV NODE_ENV=development

# Enable corepack for pnpm
RUN corepack enable

# Workspace definitions
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Workspace source code
COPY packages ./packages
COPY apps/web ./apps/web/

# Build-time public env vars (baked into the Next.js bundle)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Install dependencies and build
RUN pnpm install --frozen-lockfile
# Ensure public directory exists even if the repo doesn't contain any static assets
RUN mkdir -p /app/apps/web/public
RUN pnpm --filter web build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=4000

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 4000
CMD ["node", "apps/web/server.js"]

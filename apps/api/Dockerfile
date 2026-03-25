# Build context: monorepo root
# Usage: docker build -f apps/api/Dockerfile -t expertly-api .

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Add libc6-compat as it might be needed by some node-gyp native modules or turbo
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Explicitly set to development to ensure devDependencies are installed by pnpm
ENV NODE_ENV=development

# Enable corepack for pnpm
RUN corepack enable

# Copy the entire workspace to ensure absolutely no local configuration or source files are missing
# (This naturally respects .dockerignore so node_modules are excluded)
COPY . .

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Print verbose output for the build command to help debug if it fails again
RUN pnpm --filter api build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy workspace manifests
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# We still need the raw package source folders in production if nest compiled dist doesn't inline them
COPY packages ./packages

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

WORKDIR /app/apps/api
EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]

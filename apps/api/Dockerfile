# Build context: monorepo root
# Usage: docker build -f apps/api/Dockerfile -t expertly-api .

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy workspace configuration and lockfiles
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json turbo.json tsconfig.base.json ./

# Copy package.json files for dependency linking
COPY apps/api/package.json ./apps/api/
COPY packages/schemas/package.json ./packages/schemas/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/

# Since packages aren't listed in apps/api/package.json explicitly but are used via tsconfig paths,
# we need the actual package source code to compile
COPY packages ./packages

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy remaining API source files
COPY apps/api/tsconfig.json apps/api/nest-cli.json ./apps/api/
COPY apps/api/src ./apps/api/src

# Build NestJS app
RUN pnpm --filter api build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable

# Copy workspace manifests
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
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

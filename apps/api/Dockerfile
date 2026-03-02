# Build context: monorepo root
# Usage: docker build -f apps/api/Dockerfile -t expertly-api .

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace root tsconfig (extended by apps/api/tsconfig.json)
COPY tsconfig.base.json ./

# Copy shared packages referenced via tsconfig path aliases
COPY packages ./packages

# Copy API manifests first for layer caching
COPY apps/api/package.json apps/api/package-lock.json ./apps/api/

# Install all dependencies using npm (flat layout ensures transitive deps like fastify are accessible)
WORKDIR /app/apps/api
RUN npm ci

# Copy remaining API source files
COPY apps/api/tsconfig.json apps/api/nest-cli.json /app/apps/api/
COPY apps/api/src /app/apps/api/src

# Build NestJS app
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN apk add --no-cache dumb-init

ENV NODE_ENV=production

WORKDIR /app

# Install production deps only
COPY apps/api/package.json apps/api/package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output from builder
COPY --from=builder /app/apps/api/dist ./dist

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]

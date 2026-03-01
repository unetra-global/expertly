# CLAUDE CODE PROMPTS — Expertly Platform
> Version 1.0
> This file contains all 10 weekly prompts for autonomous building.
> Each prompt is pasted directly into Claude Code at the start of that week.
> Claude Code runs all sessions for that week unattended.
>
> BEFORE YOU START ANY WEEK:
> 1. Your .env files must be populated (apps/api/.env and apps/web/.env.local)
> 2. Your Supabase project must be created and extensions enabled
> 3. Your Redis (Upstash) instance must be created
> 4. Run: cd ~/Projects/expertly && claude
> 5. Paste the week's prompt and walk away

---

# WEEK 1 PROMPT — Foundation
> Paste this entire block into Claude Code. Estimated runtime: 60-90 minutes.

```
Read CLAUDE.md fully before doing anything else.
Then read MASTER_TDD.md Sections 1, 2, 3, 4, 5, 6, 7, 8, 9.

You are building the Expertly platform from scratch.
This is Week 1. Your goal is to complete Sessions 1.1 through 1.4.
Do not stop between sessions. Commit after each session completes.
TypeScript must compile with zero errors before each commit.

═══════════════════════════════════════════════
SESSION 1.1 — Monorepo Scaffolding
═══════════════════════════════════════════════

Create the following files exactly as specified in MASTER_TDD.md Section 2:

1. turbo.json — pipeline with build, dev, typecheck, lint
2. pnpm-workspace.yaml — apps/*, packages/*
3. Root package.json — with turbo, scripts: dev/build/typecheck/lint
4. .gitignore — node_modules, dist, .next, .env*, .DS_Store
5. .nvmrc — node 20
6. tsconfig.base.json:
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}

Create the full folder structure from Section 2:
apps/api/src/
apps/api/src/common/guards/
apps/api/src/common/interceptors/
apps/api/src/common/decorators/
apps/api/src/common/filters/
apps/api/src/common/pipes/
apps/api/src/common/services/
apps/api/src/config/
apps/api/src/modules/ (with subdirs: auth, homepage, members, applications,
  articles, events, consultation, search, taxonomy, upload, automation,
  ai, email, dashboard, contact, consent, ops, admin, scheduler, rss, health)
apps/web/app/(platform)/
apps/web/app/(platform)/members/[slug]/
apps/web/app/(platform)/articles/[slug]/
apps/web/app/(platform)/events/[slug]/
apps/web/app/(auth)/auth/callback/
apps/web/app/(member)/member/dashboard/
apps/web/app/(member)/member/profile/
apps/web/app/(member)/member/articles/
apps/web/app/(member)/member/settings/
apps/web/app/(ops)/ops/applications/[id]/
apps/web/app/(ops)/ops/members/[id]/
apps/web/app/(ops)/ops/articles/[id]/
apps/web/app/(ops)/ops/events/
apps/web/app/(ops)/ops/seats/
apps/web/app/(ops)/ops/regulatory/
apps/web/app/(ops)/ops/broadcast/
apps/web/app/(ops)/ops/admin/
apps/web/app/onboarding/
apps/web/app/application/status/
apps/web/app/api/revalidate/
apps/web/components/ui/
apps/web/components/layout/
apps/web/components/members/
apps/web/components/articles/
apps/web/components/events/
apps/web/components/onboarding/
apps/web/components/ops/
apps/web/components/shared/
apps/web/hooks/
apps/web/stores/
apps/web/lib/
packages/types/src/
packages/utils/src/
packages/schemas/src/
supabase/migrations/
supabase/seed/
.github/workflows/

Verify: all folders exist.
Run: git add . && git commit -m "Session 1.1: monorepo scaffold"

═══════════════════════════════════════════════
SESSION 1.2 — Shared Packages
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 29 fully.

Create packages/types/package.json:
{
  "name": "@expertly/types",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts"
}

Create packages/types/src/index.ts with ALL interfaces from Section 29:
User, Member, Article, Event, Application, ServiceCategory, Service,
ConsultationRequest, AuthUser, PaginatedResponse, ApiResponse, ApiError,
and ALL JSONB interfaces: Availability, Engagement, Credential, Testimonial,
WorkExperience, Education, Speaker.
Every field must match the database schema in Section 3 exactly.
Use camelCase for TypeScript interfaces (the API returns camelCase via ResponseInterceptor).

Create packages/utils/package.json:
{
  "name": "@expertly/utils",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts"
}

Create packages/utils/src/index.ts with ALL functions from Section 29:
slugify, countWords, extractExcerpt, formatFee, calculateReadTime, randomSuffix.
Implement each function exactly as specified.

Create packages/schemas/package.json:
{
  "name": "@expertly/schemas",
  "version": "1.0.0",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "dependencies": { "zod": "^3.22.0" }
}

Create packages/schemas/src/index.ts with Zod schemas for:
- ApplicationStep1Schema (fields from Section 22)
- ApplicationStep2Schema
- ApplicationStep3Schema
- ArticleCreateSchema (title min 10, body min 300 words, tags max 5)
- ConsultationRequestSchema
- MemberUpdateSchema
- EventCreateSchema

Run: cd packages/types && npx tsc --noEmit
Run: cd packages/utils && npx tsc --noEmit
Fix all TypeScript errors before continuing.
Run: git add . && git commit -m "Session 1.2: shared packages (types, utils, schemas)"

═══════════════════════════════════════════════
SESSION 1.3 — Database Migrations
═══════════════════════════════════════════════

Read MASTER_TDD.md Sections 3, 4, 5, 6, 7, 9 fully.

Create all 17 migration files in supabase/migrations/ using the EXACT SQL
from the TDD. Do not modify any field names, types, or constraints.
Every table, enum, function, trigger, policy, and index must match exactly.

Files to create:
001_extensions.sql — uuid-ossp, vector, pg_trgm, unaccent
002_enums.sql — all 8 enum types
003_tables_core.sql — service_categories, services, users
004_tables_members.sql — members, member_services, seat_allocations
005_tables_applications.sql — applications
006_tables_content.sql — articles, events
007_tables_comms.sql — consultation_requests, user_digest_subscriptions,
  digest_send_log, member_notification_preferences
008_tables_ops.sql — regulatory_updates, background_jobs,
  consent_log, email_logs, broadcast_logs
009_triggers.sql — update_updated_at on all tables + handle_new_auth_user
010_functions.sql — claim_seat, release_seat, increment_view_count,
  get_ops_action_counts
011_rls.sql — all RLS policies from Section 6
012_storage.sql — avatars, article-images, documents buckets + RLS
013_realtime.sql — enable Realtime on background_jobs
014_vector_functions.sql — search_members, search_articles, search_events
015_digest_function.sql — get_digest_data
016_indexes.sql — all performance indexes
017_seed_taxonomy.sql — all service categories and services from Section 9

Read the DATABASE_URL from apps/api/.env.
Run each file in order against the database:
psql "$DATABASE_URL" -f supabase/migrations/001_extensions.sql
(repeat for 002 through 017)

After running all migrations, verify:
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
ORDER BY table_name;

Expected tables: articles, background_jobs, broadcast_logs, consent_log,
consultation_requests, digest_send_log, email_logs, events, member_notification_preferences,
member_services, members, regulatory_updates, seat_allocations,
service_categories, services, user_digest_subscriptions, users

If any table is missing, fix the migration and re-run.
Run: git add . && git commit -m "Session 1.3: database migrations (17 files)"

═══════════════════════════════════════════════
SESSION 1.4 — NestJS Bootstrap
═══════════════════════════════════════════════

Read MASTER_TDD.md Sections 10, 11 fully.

Create apps/api/package.json with these exact dependencies:
{
  "name": "@expertly/api",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start:prod": "node dist/main",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-fastify": "^10.3.0",
    "@nestjs/schedule": "^4.0.0",
    "@nestjs/bull": "^10.0.0",
    "@nestjs/config": "^3.1.1",
    "@fastify/cookie": "^9.3.1",
    "@fastify/multipart": "^8.1.0",
    "@fastify/helmet": "^11.1.1",
    "@supabase/supabase-js": "^2.39.0",
    "bullmq": "^5.1.0",
    "ioredis": "^5.3.2",
    "resend": "^3.2.0",
    "sharp": "^0.33.2",
    "openai": "^4.28.0",
    "@anthropic-ai/sdk": "^0.17.1",
    "sanitize-html": "^2.12.1",
    "file-type": "^19.0.0",
    "rss-parser": "^3.13.0",
    "axios": "^1.6.7",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1",
    "@nestjs/schedule": "^4.0.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/schematics": "^10.1.0",
    "@types/node": "^20.0.0",
    "@types/sanitize-html": "^2.11.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.0.0"
  }
}

Create apps/api/tsconfig.json:
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "outDir": "dist",
    "rootDir": "src",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "paths": {
      "@expertly/types": ["../../packages/types/src"],
      "@expertly/utils": ["../../packages/utils/src"],
      "@expertly/schemas": ["../../packages/schemas/src"]
    }
  },
  "include": ["src/**/*"]
}

Create apps/api/nest-cli.json:
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src"
}

Create apps/api/.env.example with all variables from MASTER_TDD.md Section 8.
Do NOT create apps/api/.env — the user has this already.

Now create all source files from MASTER_TDD.md Sections 10 and 11:

apps/api/src/main.ts — exact Fastify bootstrap from Section 10
  - Validate all required env vars on startup (fail fast if missing)
  - Register @fastify/cookie, @fastify/multipart, @fastify/helmet
  - Enable CORS (production: expertly.net only, dev: localhost:3000)
  - Enable URI versioning (defaultVersion: '1', prefix: 'api/v')
  - Register ValidationPipe, ResponseInterceptor, LoggingInterceptor, HttpExceptionFilter
  - Listen on PORT from env, default 3001

apps/api/src/app.module.ts — imports ConfigModule (global), ScheduleModule,
  and all future modules (leave as empty imports array for now,
  modules will be added as they are built)

apps/api/src/common/interceptors/response.interceptor.ts
  - Envelope: { success: true, data: T }
  - deepCamelCase all snake_case keys recursively
  - Skip SSE routes (content-type: text/event-stream)
  - For paginated: { success: true, data: T[], meta: PaginationMeta }

apps/api/src/common/interceptors/logging.interceptor.ts
  - Log: method, url, status, duration in ms on every request

apps/api/src/common/filters/http-exception.filter.ts
  - Error envelope: { success: false, error: { code, message, statusCode, path, timestamp } }
  - Log 5xx errors with stack trace
  - Convert error message to UPPER_SNAKE_CASE for code field

apps/api/src/common/guards/jwt-auth.guard.ts — from Section 10
  - Extract token from Authorization header OR sb-access-token cookie
  - Call supabase.adminClient.auth.getUser(token)
  - Query users table to get dbId, role, is_active, is_deleted
  - If member role, query members table for memberId and membership_status
  - If suspended, set effectiveRole = 'user'
  - Attach to request.user: { ...supabaseUser, dbId, role, memberId }
  - Respect @Public() decorator

apps/api/src/common/guards/optional-jwt.guard.ts — from Section 10
  - Extend JwtAuthGuard, catch all errors, return true

apps/api/src/common/guards/roles.guard.ts — from Section 10
  - Role levels: user=1, member=2, ops=3, backend_admin=4
  - Throw ForbiddenException if user level < required level

apps/api/src/common/decorators/public.decorator.ts
apps/api/src/common/decorators/roles.decorator.ts
apps/api/src/common/decorators/current-user.decorator.ts

apps/api/src/common/services/supabase.service.ts — from Section 11
  - adminClient using SERVICE_ROLE_KEY
  - revalidatePath() method — POST to NEXT_REVALIDATION_URL

apps/api/src/common/services/redis.service.ts — from Section 11
  - ioredis client with TLS in production
  - retryStrategy: max 10 retries, exponential backoff
  - Log connect and error events

apps/api/src/common/services/cache.service.ts — from Section 11
  - buildKey(), get(), set(), del(), delByPattern(), getOrFetch()
  - Stampede protection in getOrFetch() using Redis lock

Create apps/api/src/modules/health/health.controller.ts:
  @Public()
  @Get('health')
  Returns: { status: 'ok', timestamp: ISO string, version: '1.0.0',
             services: { database: 'ok'|'error', cache: 'ok'|'error' } }
  Check database by running: SELECT 1 FROM users LIMIT 1
  Check cache by running: redis PING

Run: cd apps/api && pnpm install
Run: cd apps/api && pnpm build
Fix ALL TypeScript errors before continuing.

Start the API: cd apps/api && pnpm dev &
Run: curl http://localhost:3001/api/v1/health
Expected: { "success": true, "data": { "status": "ok", ... } }

If health check fails, fix the error before committing.

Run: git add . && git commit -m "Session 1.4: NestJS bootstrap with Fastify, guards, interceptors, health check"

═══════════════════════════════════════════════
WEEK 1 COMPLETE — Final verification
═══════════════════════════════════════════════

Run these checks. All must pass:
1. pnpm build — builds without errors
2. curl http://localhost:3001/api/v1/health — returns { status: "ok" }
3. Check Supabase Dashboard — all 17 tables exist
4. git log --oneline — shows 4 commits for this week

Report: list all files created, confirm all checks passed,
state any issues encountered.
```

---

# WEEK 2 PROMPT — Core Backend
> Paste this entire block into Claude Code. Estimated runtime: 90-120 minutes.

```
Read CLAUDE.md fully before doing anything else.
Read MASTER_TDD.md Sections 12, 13 fully.
Read USER_STORIES.md sections US-02 fully.

This is Week 2. Build Sessions 2.1 through 2.5.
TypeScript must compile with zero errors before each commit.
Every endpoint must be tested with curl before committing.

═══════════════════════════════════════════════
SESSION 2.1 — Auth Module
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 13 fully.

Create apps/api/src/modules/auth/auth.module.ts
Create apps/api/src/modules/auth/auth.controller.ts with:

POST /auth/sync (JWT required)
  - Get user from request (already set by guard)
  - Update last_login_at in users table
  - Return: { id, email, firstName, lastName, role, memberId }

GET /auth/me (JWT required)
  - Return full user object with member details if role = member

POST /auth/logout (JWT required)
  - No server-side action needed (Supabase handles token invalidation)
  - Return: { message: 'Logged out successfully' }

Register auth.module in app.module.ts.

Test:
curl -H "Authorization: Bearer INVALID_TOKEN" http://localhost:3001/api/v1/auth/me
Expected: 401 with error envelope

Run: git add . && git commit -m "Session 2.1: auth module (sync, me, logout)"

═══════════════════════════════════════════════
SESSION 2.2 — Taxonomy Module
═══════════════════════════════════════════════

Create apps/api/src/modules/taxonomy/taxonomy.module.ts
Create apps/api/src/modules/taxonomy/taxonomy.controller.ts
Create apps/api/src/modules/taxonomy/taxonomy.service.ts

All taxonomy endpoints are @Public() — no auth required.
All taxonomy responses are cached for 3600 seconds (1 hour).

GET /taxonomy/categories
  Cache key: 'taxonomy:categories'
  Query: SELECT id, name, slug, domain, sort_order FROM service_categories
         WHERE is_active = true ORDER BY sort_order

GET /taxonomy/services?categoryId=
  Cache key: 'taxonomy:services:{categoryId|all}'
  Query: SELECT id, category_id, name, slug, regions, sort_order
         FROM services WHERE is_active = true
         AND (categoryId IS NULL OR category_id = $categoryId)
         ORDER BY sort_order

GET /taxonomy/services/:slug
  Cache key: 'taxonomy:service:{slug}'
  Query by slug

Register taxonomy.module in app.module.ts.

Test:
curl http://localhost:3001/api/v1/taxonomy/categories
Expected: { success: true, data: [...categories] }

Run: git add . && git commit -m "Session 2.2: taxonomy module"

═══════════════════════════════════════════════
SESSION 2.3 — Members Module (Read Paths)
═══════════════════════════════════════════════

Read MASTER_TDD.md Sections 12, 21 fully.
Read USER_STORIES.md US-01, US-16 fully.

Create apps/api/src/modules/members/members.module.ts
Create apps/api/src/modules/members/members.controller.ts
Create apps/api/src/modules/members/members.service.ts

CRITICAL: Route order must be EXACT — static routes BEFORE :slug
Order in controller:
1. GET /members/featured  (Public)
2. GET /members/me        (JWT + Member)
3. GET /members/id/:id    (JWT)
4. GET /members           (OptionalJWT)
5. GET /members/:slug     (OptionalJWT)

GET /members/featured
  Returns 6 featured members where is_featured=true AND membership_status='active'
  Cache key: 'members:featured'
  TTL: 600 seconds
  NEVER SELECT embedding column
  Fields: id, slug, first_name(users), last_name(users), designation,
          headline, profile_photo_url, city, country, member_tier,
          is_verified, is_featured, primary_service_id, service_name(join)

GET /members (OptionalJWT)
  Query params: page, limit(max 20 for guests), search, country, serviceId,
                memberTier, isVerified
  If guest (no user): limit capped at 20, return teaser fields only:
    first_name, last_name, designation, profile_photo_url, city, country,
    member_tier, is_verified, primary_service_name, slug
  If authenticated: full fields including headline, years_of_experience,
    consultation_fee_min_usd, consultation_fee_max_usd
    limit up to 50
  Filter: membership_status = 'active' always
  Cache key built from all query params
  TTL: 300 seconds

GET /members/:slug (OptionalJWT)
  Same field logic as list (teaser for guests, full for auth)
  Cache key: 'members:profile:{slug}'
  TTL: 600 seconds
  Increment profile_view_count in Redis (not DB — flushed by scheduler)
  Redis key: member:views:{memberId} INCR

GET /members/id/:id (JWT)
  Full member details regardless of auth level
  Used by ops and member portal

GET /members/me (JWT + Member role)
  Returns own full member record with all JSONB fields

For all queries: NEVER select the embedding column.
Join users table to get first_name, last_name.
Join services table to get primary_service_name.

Register members.module in app.module.ts.

Test:
curl http://localhost:3001/api/v1/members/featured
curl http://localhost:3001/api/v1/members
curl http://localhost:3001/api/v1/members?country=IN&page=1&limit=10

Run: git add . && git commit -m "Session 2.3: members module read paths"

═══════════════════════════════════════════════
SESSION 2.4 — Members Module (Write Paths)
═══════════════════════════════════════════════

Read USER_STORIES.md US-06 fully.

Add to members.controller.ts and members.service.ts:

PATCH /members/me (JWT + Member)
  DTO: UpdateMemberDto — all profile fields except slug, user_id,
       membership_status, membership_start_date, membership_expiry_date,
       is_verified, verified_at, is_featured, embedding fields
  BADGE REMOVAL RULE (critical):
    If any of these fields are in the update payload:
    headline, bio, designation, qualifications, credentials,
    work_experience, education
    → Set is_verified = false
    → Set re_verification_requested_at = NOW()
    → Set re_verification_reason = 'Fields updated: {list of changed fields}'
    → Queue K11 email to member
  After update:
    Invalidate Redis: members:profile:{slug}, members:list:*, members:featured
    ISR revalidate: /members/{slug}
  Return: updated member

PATCH /members/me/notifications (JWT + Member)
  Update member_notification_preferences
  Return: updated preferences

POST /members/me/service-change (JWT + Member)
  DTO: { serviceId: string }
  Set pending_service_change = serviceId
  Set pending_service_change_at = NOW()
  Ops will approve/reject separately
  Return: { message: 'Service change request submitted' }

POST /members/search/ai (OptionalJWT)
  DTO: { query: string, filters?: { country?, serviceId?, verified? } }
  Generate embedding for query via OpenAI text-embedding-3-small
  Call search_members() Supabase RPC with embedding and filters
  Return: array of member results with similarity score
  Guest: teaser fields only

Register all new endpoints in members.module.

Test:
curl -X PATCH http://localhost:3001/api/v1/members/me \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"headline": "Test"}'

Run: git add . && git commit -m "Session 2.4: members module write paths + AI search"

═══════════════════════════════════════════════
SESSION 2.5 — Homepage Module
═══════════════════════════════════════════════

Create apps/api/src/modules/homepage/homepage.module.ts
Create apps/api/src/modules/homepage/homepage.controller.ts
Create apps/api/src/modules/homepage/homepage.service.ts

GET /homepage (Public)
  Cache key: 'homepage:data'
  TTL: 300 seconds
  Returns in a single response:
  {
    featuredMembers: [...6 featured members — teaser fields],
    latestArticles: [...6 latest published articles],
    upcomingEvents: [...4 upcoming published events]
  }
  Single cached DB call — do not make 3 separate uncached calls.

Register homepage.module in app.module.ts.

Test:
curl http://localhost:3001/api/v1/homepage
Expected: { success: true, data: { featuredMembers, latestArticles, upcomingEvents } }

Run: git add . && git commit -m "Session 2.5: homepage module"

═══════════════════════════════════════════════
WEEK 2 COMPLETE — Final verification
═══════════════════════════════════════════════

Run all checks. All must pass:
1. pnpm typecheck — zero errors
2. curl /api/v1/health — ok
3. curl /api/v1/taxonomy/categories — returns data
4. curl /api/v1/members — returns data (may be empty, that's fine)
5. curl /api/v1/homepage — returns { featuredMembers, latestArticles, upcomingEvents }
6. git log --oneline — shows 5 commits for this week

Report results.
```

---

# WEEK 3 PROMPT — Applications and Articles Backend
> Paste this entire block into Claude Code. Estimated runtime: 120-150 minutes.

```
Read CLAUDE.md fully before doing anything else.
Read MASTER_TDD.md Sections 12, 18, 19, 20 fully.
Read USER_STORIES.md US-03, US-04, US-07, US-08 fully.

This is Week 3. Build Sessions 3.1 through 3.5.
TypeScript must compile with zero errors before each commit.

═══════════════════════════════════════════════
SESSION 3.1 — Applications Module
═══════════════════════════════════════════════

Create apps/api/src/modules/applications/ with:
module, controller, service, and DTOs.

Endpoints:
GET  /applications/me (JWT) — get current user's latest application
POST /applications (JWT) — create or resume draft

POST /applications duplicate check logic (CRITICAL — from Section 22):
  Query latest application for user_id ordered by created_at DESC
  If draft → return existing draft id (do not create new)
  If submitted/under_review → throw ConflictException('APPLICATION_UNDER_REVIEW')
  If approved → throw ConflictException('APPLICATION_APPROVED')
  If waitlisted → throw ConflictException('APPLICATION_WAITLISTED')
  If rejected:
    Check re_application_eligible_at
    If too soon → throw ConflictException('REAPPLICATION_TOO_SOON') with eligible date
    If eligible → create new draft
  If no application → create new draft

PATCH /applications/:id/step-1 (JWT) — identity fields
  Fields: firstName, lastName, designation, headline, bio, linkedinUrl,
          profilePhotoUrl, currentStep
  Server-side step enforcement:
    if dto.step > application.current_step + 1 throw BadRequestException
  Update current_step if advancing

PATCH /applications/:id/step-2 (JWT) — experience fields
  Fields: yearsOfExperience, firmName, firmSize, country, city,
          consultationFeeMinUsd, consultationFeeMaxUsd, qualifications,
          credentials, workExperience, education

PATCH /applications/:id/step-3 (JWT) — services + availability
  Fields: primaryServiceId, secondaryServiceIds, engagements, availability

POST /applications/:id/submit (JWT)
  Validate all 3 steps complete (current_step = 3)
  Validate required fields: firstName, lastName, country, primaryServiceId
  Set status = 'submitted', submitted_at = NOW()
  Send K1 email to OPS_EMAIL
  Return updated application

Register applications.module in app.module.ts.

Test:
curl -X POST http://localhost:3001/api/v1/applications \
  -H "Authorization: Bearer TOKEN"
Expected: draft application created or existing draft returned

Run: git add . && git commit -m "Session 3.1: applications module with duplicate prevention"

═══════════════════════════════════════════════
SESSION 3.2 — Upload Module
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 20 fully.

Create apps/api/src/modules/upload/ with module, controller, service.

POST /upload/avatar (JWT)
  Accept multipart/form-data with file field
  Validate: file-type magic bytes must be image/jpeg, image/png, or image/webp
  If invalid: throw BadRequestException('INVALID_FILE_TYPE')
  If > 5MB: throw BadRequestException('FILE_TOO_LARGE')
  Process with sharp: resize to 400x400 (cover + entropy crop), convert to webp 85%
  Upload to Supabase Storage: avatars/{userId}/profile.webp
  Return: { url: string }

POST /upload/article-image (JWT + Member)
  Validate: same image types, max 5MB
  Process with sharp: resize max 1200px wide maintaining ratio, webp 85%
  Upload to: article-images/{articleId or timestamp}/cover.webp
  Return: { url: string }

POST /upload/document (JWT)
  Validate: file-type must be application/pdf, image/jpeg, or image/png
  Max 10MB
  No resizing — store as-is
  Upload to: documents/{userId}/{type}/{uuid}.{ext}
  type is query param: 'credentials' or 'testimonials'
  Return: { url: string }

Register upload.module in app.module.ts.

Test:
curl -X POST http://localhost:3001/api/v1/upload/avatar \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@test.jpg"

Run: git add . && git commit -m "Session 3.2: upload module with sharp processing"

═══════════════════════════════════════════════
SESSION 3.3 — Articles Module (CRUD)
═══════════════════════════════════════════════

Create apps/api/src/modules/articles/ with module, controller, service, DTOs.

CRITICAL route order:
1. POST /articles/search/ai  (OptionalJWT)
2. POST /articles/generate   (JWT + Member) — SSE, handled in 3.4
3. GET  /articles/member/me  (JWT + Member)
4. GET  /articles            (OptionalJWT)
5. POST /articles            (JWT + Member)
6. GET  /articles/id/:id     (JWT + Member)
7. GET  /articles/:slug      (OptionalJWT)
8. GET  /articles/:id/related (OptionalJWT)
9. PATCH /articles/:id       (JWT + Member)
10. DELETE /articles/:id     (JWT + Member)
11. POST /articles/:id/submit (JWT + Member)

GET /articles (OptionalJWT)
  Params: page, limit(20), status(default: published), categoryId, serviceId
  If no auth: only published articles
  If member: their own articles at any status
  Cache published list: 'articles:list:{hash}' TTL 300s
  NEVER select embedding column

POST /articles (JWT + Member)
  DTO: CreateArticleDto — title (min 10), body (sanitize-html!), categoryId,
       serviceId, tags (max 5), featuredImageUrl
  Auto-generate: slug from title (slugify + randomSuffix on collision)
  Auto-compute: word_count (countWords from utils), read_time_minutes,
                excerpt (extractExcerpt from utils)
  Set creation_mode = 'manual'
  Return: created article

PATCH /articles/:id (JWT + Member)
  Check ownership: article.member_id must match requesting member
  Sanitize body with sanitize-html
  Recompute word_count, read_time_minutes, excerpt on body change
  Only allowed in draft or rejected status
  Invalidate cache after update

DELETE /articles/:id (JWT + Member)
  Check ownership
  Only allowed in draft status
  Delete from DB

POST /articles/:id/submit (JWT + Member)
  Validate: word_count >= 300
  Validate: featured_image_url is set
  Validate: member has < 2 articles in submitted/under_review status
    If already 2: throw ConflictException('MAX_ARTICLES_IN_REVIEW')
  Set status = 'submitted', submitted_at = NOW()
  Send K8 email to OPS_EMAIL
  Invalidate member's article cache

POST /articles/search/ai (OptionalJWT)
  Same pattern as member AI search — generate embedding, call search_articles() RPC

Register articles.module in app.module.ts.

Test:
curl http://localhost:3001/api/v1/articles
curl -X POST http://localhost:3001/api/v1/articles \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Article Title Here", "body": "<p>...</p>", "categoryId": "..."}'

Run: git add . && git commit -m "Session 3.3: articles module CRUD"

═══════════════════════════════════════════════
SESSION 3.4 — Articles AI Generation (SSE)
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 19 (AI generation) fully.

Add POST /articles/generate to articles controller:
  Uses @Sse() decorator (NestJS SSE)
  JWT + Member required

  DTO: { qa: Array<{question: string, answer: string}>, categoryId: string }

  Prompt injection prevention (CRITICAL):
    For each QA item:
      - Slice question to max 200 chars
      - Slice answer to max 500 chars
      - Remove < > characters from both
      - Filter these keywords (case insensitive): ignore, forget, disregard,
        "previous instructions", "system prompt", "you are now"
        If found: replace with empty string
    Wrap all user inputs in XML delimiters in the final prompt:
    <user_qa>
      <question>{sanitized question}</question>
      <answer>{sanitized answer}</answer>
    </user_qa>

  Build system prompt:
    "You are a professional financial and legal content writer.
     Write a high-quality article based on the professional's
     responses below. The article should be informative, authoritative,
     and written in first person. Output ONLY valid JSON with keys:
     title (string), body (HTML string with h2/h3/p/ul tags),
     tags (array of max 5 lowercase strings).
     Do not include markdown code fences."

  Call OpenAI streaming: model gpt-4o-mini, stream: true
  Stream each token as SSE event: { data: token }
  On completion: parse full response as JSON
    Send final event: { data: JSON.stringify({ type: 'done', title, body, tags }) }
  On error: send { data: JSON.stringify({ type: 'error', message: '...' }) }
  Set timeout: 120 seconds

  For Fastify SSE: set headers manually:
    Content-Type: text/event-stream
    Cache-Control: no-cache
    Connection: keep-alive

Test:
curl -N -H "Authorization: Bearer TOKEN" \
  -X POST http://localhost:3001/api/v1/articles/generate \
  -H "Content-Type: application/json" \
  -d '{"qa": [{"question": "What is transfer pricing?", "answer": "It is..."}], "categoryId": "..."}'
Expected: stream of SSE tokens followed by done event

Run: git add . && git commit -m "Session 3.4: article AI generation with SSE streaming"

═══════════════════════════════════════════════
SESSION 3.5 — Events, Consultation, Search, Dashboard
═══════════════════════════════════════════════

Create 4 lightweight modules:

1. Events Module
GET /events (OptionalJWT)
  Params: page, limit(20), country, format, upcoming(bool)
  Filter: is_published = true
  If upcoming=true: start_datetime > NOW()
  Cache: 'events:list:{hash}' TTL 300s
  NEVER select embedding

GET /events/:slug (OptionalJWT)
  Cache: 'events:detail:{slug}' TTL 600s

2. Consultation Module
POST /consultation-requests (JWT)
  DTO: { memberId, serviceId?, subject (required), description?, preferredTime? }
  Check member is active
  Check no duplicate request in last 7 days (same userId + memberId)
    If duplicate: throw ConflictException('DUPLICATE_REQUEST')
  Insert consultation_request
  Send K6 email to member (include requester's email address in email body)
  Send K7 confirmation to requester
  Return: created request

GET /consultation-requests/received (JWT + Member)
  Returns consultation requests where member_id = req.user.memberId
  Ordered by created_at DESC, limit 20

GET /consultation-requests/sent (JWT)
  Returns consultation requests where user_id = req.user.dbId

PATCH /consultation-requests/:id/status (JWT + Member)
  Updates status to 'responded' or 'closed'
  Must own the request (member_id matches)

3. Search Module
GET /search?q=&type= (OptionalJWT)
  type: 'all' | 'members' | 'articles' | 'events'
  Generate single embedding for q
  Run relevant search_* RPC functions in parallel
  Return: { members: [...], articles: [...], events: [...] }
  Guest: member teasers only

4. Dashboard Module
GET /dashboard/stats (JWT + Member)
  Returns:
  {
    profileCompletion: number (0-100, calculate based on filled fields),
    publishedArticlesCount: number,
    totalArticleViews: number,
    consultationRequestsLast30Days: number,
    membershipExpiryDate: string,
    isVerified: boolean,
    recentConsultationRequests: [...last 3],
    recentArticles: [...last 3 with status]
  }

Register all 4 modules in app.module.ts.

Run: pnpm typecheck — fix all errors
Run: git add . && git commit -m "Session 3.5: events, consultation, search, dashboard modules"

═══════════════════════════════════════════════
WEEK 3 COMPLETE — Final verification
═══════════════════════════════════════════════

All checks must pass:
1. pnpm typecheck — zero errors
2. curl /api/v1/articles — returns data structure
3. curl /api/v1/events — returns data structure
4. curl /api/v1/taxonomy/categories — returns categories
5. Health check passes
6. git log --oneline — 5 new commits this week

Report results.
```

---

# WEEK 4 PROMPT — Frontend Foundation
> Paste this entire block into Claude Code. Estimated runtime: 90-120 minutes.

```
Read CLAUDE.md fully before doing anything else.
Read MASTER_TDD.md Sections 2, 8, 13, 21 fully.
Read USER_STORIES.md US-01, US-02 fully.

This is Week 4. Build Sessions 4.1 through 4.4.
Design standard: Linear, Vercel, Stripe — premium, clean, generous whitespace.
Brand: navy #1e3a5f, gold #c9a84c, surface #f9fafb, text #111827.
Mobile-first. Every component must look good at 375px and 1440px.

═══════════════════════════════════════════════
SESSION 4.1 — Next.js Setup
═══════════════════════════════════════════════

Create apps/web/package.json:
{
  "name": "@expertly/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/ssr": "^0.3.0",
    "@supabase/supabase-js": "^2.39.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.5.0",
    "react-hook-form": "^7.49.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.4",
    "@tiptap/react": "^2.2.0",
    "@tiptap/starter-kit": "^2.2.0",
    "@tiptap/extension-link": "^2.2.0",
    "@tiptap/extension-image": "^2.2.0",
    "lucide-react": "^0.316.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "@expertly/types": "workspace:*",
    "@expertly/utils": "workspace:*",
    "@expertly/schemas": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.0.0"
  }
}

Run: cd apps/web && pnpm install

Create apps/web/tsconfig.json:
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"],
      "@expertly/types": ["../../packages/types/src"],
      "@expertly/utils": ["../../packages/utils/src"],
      "@expertly/schemas": ["../../packages/schemas/src"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}

Create apps/web/tailwind.config.ts with brand theme:
  colors.brand.navy = '#1e3a5f'
  colors.brand.gold = '#c9a84c'
  colors.brand.surface = '#f9fafb'
  fontFamily.sans = ['Inter', 'system-ui', 'sans-serif']
  Include shadcn/ui paths in content array

Create apps/web/next.config.ts:
  images.domains: ['[ref].supabase.co']
  experimental.serverComponentsExternalPackages: []

Create apps/web/.env.example from Section 8 (frontend vars only).
Do NOT create .env.local — user has this.

Create apps/web/lib/supabase.ts:
  createBrowserClient from @supabase/ssr
  createServerClient for Server Components

Create apps/web/lib/queryClient.ts:
  QueryClient with defaults:
    staleTime: 60 * 1000 (1 minute)
    retry: 1
    refetchOnWindowFocus: false

Create apps/web/lib/apiClient.ts — EXACT implementation from Section 13:
  getAuthHeader() using supabase.auth.getSession()
  request() with 401 retry using refreshSession()
  On refresh failure: redirect to /auth?returnTo={current path}
  export: apiClient.get, apiClient.post, apiClient.patch, apiClient.delete

Create apps/web/hooks/queryKeys.ts — exact queryKeys from Section 21.

Create apps/web/app/providers.tsx:
  QueryClientProvider wrapping children

Create apps/web/app/layout.tsx:
  Root layout with Inter font, Providers wrapper,
  html lang="en", body with brand background #f9fafb

Run: cd apps/web && pnpm typecheck
Fix all errors.
Run: cd apps/web && pnpm dev &
Verify: http://localhost:3000 loads without errors

Run: git add . && git commit -m "Session 4.1: Next.js setup with Tailwind, queryClient, apiClient"

═══════════════════════════════════════════════
SESSION 4.2 — Auth Pages
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 13 fully (auth callback 7-state handler).
Read USER_STORIES.md US-02 fully.

Create apps/web/app/(auth)/auth/page.tsx:
  Static page
  Shows Expertly logo and tagline
  Single "Continue with LinkedIn" button
  On click: supabase.auth.signInWithOAuth({ provider: 'linkedin_oidc',
    options: { redirectTo: '{APP_URL}/auth/callback' } })
  Save current URL to sessionStorage before redirect (for returnTo)
  Show loading state while redirecting
  If ?error=account_suspended in URL: show error message
  If ?authError=oauth_failed: show error message
  Premium design — not a generic login page

Create apps/web/app/(auth)/auth/callback/route.ts:
  EXACT 7-state handler from MASTER_TDD.md Section 13:
  1. error or no code → redirect to / (guest, stay home)
  2. exchange fails → redirect to /?authError=oauth_failed
  3. account suspended → sign out + redirect to /auth?error=account_suspended
  4. role = backend_admin or ops → redirect to /ops
  5. role = member → redirect to /member/dashboard
  6. role = user with draft application → redirect to /application
  7. role = user with submitted/under_review/approved/waitlisted → /application/status
  8. role = user with rejected application:
     - eligible to reapply → /application/status?canReApply=true
     - not yet eligible → /application/status
  9. new user or no application → redirect to /

After redirect to /: if sessionStorage has returnTo URL,
  the homepage or wherever they land should check and redirect.

Create apps/web/hooks/useAuth.ts:
  useUser() — returns current Supabase user
  useSession() — returns current session
  useSignOut() — signs out and redirects to /

Test: Open http://localhost:3000/auth — should show LinkedIn button

Run: git add . && git commit -m "Session 4.2: auth page + callback 7-state handler"

═══════════════════════════════════════════════
SESSION 4.3 — Layout Components
═══════════════════════════════════════════════

Create apps/web/components/layout/Navbar.tsx:
  Left: Expertly logo (navy text, gold dot or accent)
  Center: Search bar (desktop), hidden on mobile
  Right: "Members" link, "Articles" link, "Events" link
         If logged out: "Sign in" button (gold)
         If logged in as user: "Apply" button + user avatar dropdown
         If logged in as member: "Portal" button + user avatar dropdown
         If logged in as ops: "Dashboard" button + avatar dropdown
  Mobile: hamburger menu with all links
  Sticky on scroll with subtle shadow
  Uses server component to check session, renders correct state

Create apps/web/components/layout/Footer.tsx:
  3 columns: About Expertly, Quick Links, Contact
  Bottom bar: © 2025 Expertly. All rights reserved.
  Navy background, white/grey text

Create apps/web/app/(platform)/layout.tsx:
  Wraps platform pages with Navbar + Footer

Create apps/web/app/(member)/layout.tsx:
  Wraps member portal — checks auth, redirects to /auth if not member

Create apps/web/app/(ops)/layout.tsx:
  Wraps ops pages — checks auth, redirects to /auth if not ops/backend_admin

Create apps/web/app/api/revalidate/route.ts:
  POST handler — exact implementation from Section 21
  Validates REVALIDATION_SECRET header
  Calls revalidatePath(body.path)

Run: pnpm typecheck — fix all errors
Run: git add . && git commit -m "Session 4.3: Navbar, Footer, route group layouts, revalidation endpoint"

═══════════════════════════════════════════════
SESSION 4.4 — Homepage
═══════════════════════════════════════════════

Read USER_STORIES.md US-01-01 fully.

Create apps/web/app/(platform)/page.tsx:
  ISR with revalidate: 300
  Fetch: apiClient.get('/homepage')
  Renders 3 sections

Create apps/web/components/home/HeroSection.tsx:
  Full-width hero
  Headline: "The professional network for finance and legal experts"
  Subheadline: "Connect with verified professionals. Read expert insights. Discover events."
  Two CTAs: "Explore Members" (navy button) and "Apply for Membership" (gold button)
  Premium — not generic

Create apps/web/components/home/FeaturedMembersSection.tsx:
  Section title: "Featured Experts"
  6 member cards in responsive grid (2 cols mobile, 3 cols tablet, 6 cols desktop)
  Each card: photo, name, designation, service, city+country, verified badge
  Click → /members/{slug}

Create apps/web/components/home/LatestArticlesSection.tsx:
  Section title: "Latest Insights"
  6 article cards in grid
  Each card: featured image, title, excerpt, author name, read time, date
  Click → /articles/{slug}

Create apps/web/components/home/UpcomingEventsSection.tsx:
  Section title: "Upcoming Events"
  4 event cards
  Each card: title, date, location, format, organiser

Create apps/web/components/shared/MemberCard.tsx — reusable card component
Create apps/web/components/shared/ArticleCard.tsx — reusable card component
Create apps/web/components/shared/Badge.tsx — verified badge, tier badge

Test: http://localhost:3000 — homepage renders with sections

Run: git add . && git commit -m "Session 4.4: homepage with featured members, articles, events"

═══════════════════════════════════════════════
WEEK 4 COMPLETE — Final verification
═══════════════════════════════════════════════

All checks:
1. pnpm typecheck — zero errors (both api and web)
2. http://localhost:3000 — homepage renders correctly
3. http://localhost:3000/auth — LinkedIn button visible
4. API and frontend both running without errors
5. git log --oneline — 4 new commits this week

Report results.
```

---

# WEEK 5 PROMPT — Public Pages
> Paste this entire block into Claude Code. Estimated runtime: 90-120 minutes.

```
Read CLAUDE.md fully.
Read MASTER_TDD.md Sections 21, 25 fully.
Read USER_STORIES.md US-01, US-16 fully.

This is Week 5. Build Sessions 5.1 through 5.4.
All public pages use ISR. Design quality: Linear/Vercel/Stripe level.

═══════════════════════════════════════════════
SESSION 5.1 — Member Directory
═══════════════════════════════════════════════

Create apps/web/app/(platform)/members/page.tsx:
  ISR revalidate: 300
  Server component fetches initial data for first page
  HydrationBoundary passes initial data to client component

Create apps/web/components/members/MemberDirectory.tsx (Client Component):
  Uses useQuery with queryKeys.members.list(filters)
  Filter sidebar: service (dropdown), country (dropdown)
  Search bar: debounced 300ms, updates query
  Filters persist in URL params

  Guest behaviour (from US-01-02):
    - Shows max 20 results
    - Member cards show: photo, name, designation, service, city, country,
      verified badge, tier badge
    - After 20 results: "Sign in to see more professionals" CTA
    - No fee range, no headline visible

  Authenticated behaviour:
    - Unlimited pagination (next page button)
    - Full cards with headline, years, fee range
    - Member card shows consultation request button

Create apps/web/components/members/MemberCard.tsx:
  Two variants: teaser (guest) and full (authenticated)
  Premium card design: photo left, details right
  Verified badge: blue checkmark icon + "Verified"
  Tier badge: gold for Seasoned, silver for Budding
  Hover: subtle elevation shadow

Create apps/web/app/(platform)/members/[slug]/page.tsx:
  ISR revalidate: 600
  generateMetadata() with Schema.org Person markup (from Section 25)
  Server component fetches member data

Create apps/web/components/members/MemberProfile.tsx:
  Full profile display:
  - Hero: large photo, name, designation, location, badges
  - Headline and bio
  - Primary service + secondary services as tags
  - Consultation fee range
  - Work experience timeline
  - Education
  - Qualifications as tags
  - Credentials (verified ones shown with verified icon)
  - Testimonials (verified ones shown)
  - Engagements (speaking, publications, awards)
  - Availability section

  Consultation request button:
    - Guest: "Sign in to contact this expert" → /auth
    - Authenticated: opens consultation request form modal

Run: git add . && git commit -m "Session 5.1: member directory and profile pages"

═══════════════════════════════════════════════
SESSION 5.2 — Articles Pages
═══════════════════════════════════════════════

Create apps/web/app/(platform)/articles/page.tsx:
  ISR revalidate: 300
  Server fetches first page
  Filter by category

Create apps/web/components/articles/ArticleList.tsx (Client Component):
  Grid of article cards
  Filter: by service category
  Infinite scroll or pagination

Create apps/web/app/(platform)/articles/[slug]/page.tsx:
  ISR revalidate: 300
  generateMetadata() with Schema.org Article markup (from Section 25)

Create apps/web/components/articles/ArticleDetail.tsx:
  Featured image full width
  Title, subtitle, author byline (links to /members/{slug}), date, read time
  Article body (rendered HTML — use dangerouslySetInnerHTML with sanitize)
  Tags displayed as clickable chips
  Disclaimer shown at bottom (already in body from ops approval)
  Related articles section (from /articles/:id/related)
  Author card at bottom: photo, name, designation, CTA to view profile

Run: git add . && git commit -m "Session 5.2: articles list and detail pages"

═══════════════════════════════════════════════
SESSION 5.3 — Events Pages
═══════════════════════════════════════════════

Create apps/web/app/(platform)/events/page.tsx:
  ISR revalidate: 300
  Shows upcoming events only
  Filter: by country, format (online/in-person)

Create apps/web/app/(platform)/events/[slug]/page.tsx:
  Full event details
  Registration link button
  Speakers section (if speakers array is non-empty)

Run: git add . && git commit -m "Session 5.3: events list and detail pages"

═══════════════════════════════════════════════
SESSION 5.4 — SEO Files
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 25 fully.

Create apps/web/app/sitemap.ts — exact implementation from Section 25
Create apps/web/app/robots.ts — exact implementation from Section 25

Verify sitemap loads: http://localhost:3000/sitemap.xml
Verify robots loads: http://localhost:3000/robots.txt

Run: git add . && git commit -m "Session 5.4: sitemap and robots.txt"

═══════════════════════════════════════════════
WEEK 5 COMPLETE — Final verification
═══════════════════════════════════════════════

1. http://localhost:3000/members — directory renders
2. http://localhost:3000/members/{any-slug} — profile renders (or graceful 404)
3. http://localhost:3000/articles — articles render
4. http://localhost:3000/events — events render
5. http://localhost:3000/sitemap.xml — valid XML
6. http://localhost:3000/robots.txt — correct disallows
7. pnpm typecheck — zero errors
8. git log — 4 new commits

Report results.
```

---

# WEEK 6 PROMPT — Onboarding and Application Flow
> Paste this entire block into Claude Code. Estimated runtime: 120 minutes.

```
Read CLAUDE.md fully.
Read MASTER_TDD.md Sections 18, 22 fully.
Read USER_STORIES.md US-03, US-04, US-05 fully.

This is Week 6. Build Sessions 6.1 through 6.5.

═══════════════════════════════════════════════
SESSION 6.1 — Onboarding Store (Zustand)
═══════════════════════════════════════════════

Create apps/web/stores/onboardingStore.ts:
  State: formData (all 3 steps merged), currentStep (1|2|3),
         applicationId (null or string), linkedInPrefillApplied (bool),
         isSubmitting (bool), errors (Record)

  Actions:
    setStep1(data) — update step 1 fields
    setStep2(data) — update step 2 fields
    setStep3(data) — update step 3 fields
    setApplicationId(id)
    applyLinkedInPrefill(result) — exact merge logic from Section 22:
      Only fill empty fields. Never overwrite manual input.
      country, yearsOfExperience, consultationFeeMinUsd NEVER overwritten.
    resetForm() — clear all state

  Persistence: persist to sessionStorage (not localStorage)
    Key: 'expertly-onboarding'
    Hydrate on mount

═══════════════════════════════════════════════
SESSION 6.2 — Onboarding Page
═══════════════════════════════════════════════

Create apps/web/app/onboarding/page.tsx:
  Redirects to /auth if not logged in
  Redirects to /application if draft exists (check via apiClient)
  Redirects to /application/status if submitted/approved/waitlisted

Create apps/web/components/onboarding/OnboardingLayout.tsx:
  3-step progress bar at top (navy fill for completed, gold for current)
  Step titles: "Identity", "Experience", "Services"
  Back/Next navigation buttons

Create apps/web/components/onboarding/Step1Identity.tsx:
  Profile photo upload (shows preview immediately)
  Fields: firstName, lastName, designation, headline (char count),
          bio (char count), linkedinUrl
  LinkedIn Import button:
    Shows consent dialog: "We will fetch your public LinkedIn profile..."
    On agree: POST /automation/linkedin-scrape
    Subscribe to Supabase Realtime on background_jobs table
    Show loading spinner on button
    On job complete: call store.applyLinkedInPrefill(result)
    Show toast: "LinkedIn data imported. Review your details below."
    On failure: show toast error, form unchanged
  Validation: required fields before Next

Create apps/web/components/onboarding/Step2Experience.tsx:
  Fields: yearsOfExperience, firmName, firmSize (dropdown),
          country (searchable dropdown), city
  Fee range: minUsd and maxUsd
  Qualifications: tag input (add/remove text tags)
  Credentials: document upload with name/institution/year fields (max 5)
  Work experience: dynamic list with add/remove (max 5 entries)
    Each entry: title, company, startDate, endDate, isCurrent toggle
  Education: dynamic list (max 3 entries)
    Each entry: institution, degree, field, startYear, endYear

Create apps/web/components/onboarding/Step3Services.tsx:
  Primary service: required select from taxonomy
  Secondary services: multi-select, max 3
  Engagements: dynamic list (max 5) — type, title, org, year, url
  Availability: days checkboxes, time slots, timezone, response time,
    preferred contact methods, notes
  Consent checkboxes (both required):
    "I agree to the Terms of Service and Privacy Policy"
    "I consent to Expertly verifying my professional credentials"
  Submit button: disabled until both consents checked
  On submit:
    POST /applications (creates draft if none, or gets existing)
    PATCH /applications/:id/step-1 with step 1 data
    PATCH /applications/:id/step-2 with step 2 data
    PATCH /applications/:id/step-3 with step 3 data
    POST /applications/:id/submit
    Log both consents to /consent (POST /consent endpoint — create this)
    On success: redirect to /application/status
    On error: show error toast, stay on form

Run: git add . && git commit -m "Session 6.2: onboarding 3-step form with LinkedIn import"

═══════════════════════════════════════════════
SESSION 6.3 — Application Status Page
═══════════════════════════════════════════════

Read USER_STORIES.md US-04 fully.

Create apps/web/app/application/page.tsx:
  Redirects to /auth if not logged in
  Loads existing draft application via apiClient.get('/applications/me')
  If no application: redirects to /onboarding
  If application exists: resumes at current step (shows onboarding form)

Create apps/web/app/application/status/page.tsx:
  CSR with React Query
  Polls every 30 seconds (refetchInterval: 30000)

  Shows status in a premium status card:

  SUBMITTED / UNDER_REVIEW:
    Green progress indicator
    "Your application is under review"
    "Our team will review your application within 5 business days."
    Submitted date shown

  APPROVED:
    Gold celebration state
    "Your application has been approved!"
    "Please check your email for payment instructions.
     Your account will be activated within 1 business day of payment."
    Support email shown

  WAITLISTED:
    Amber waiting state
    "You're on the waitlist"
    "We'll email you as soon as a seat opens for your service."
    K4 sent note

  REJECTED:
    Red state (but sympathetic tone — not harsh)
    "Application not approved"
    Show rejection reason from application.rejection_reason
    If re_application_eligible_at in past: show "Re-apply" button
    If in future: show "You may re-apply after {formatted date}"

  DRAFT:
    Redirects back to /application (resume form)

Run: git add . && git commit -m "Session 6.3: application status page (all 5 states)"

═══════════════════════════════════════════════
WEEK 6 COMPLETE — Final verification
═══════════════════════════════════════════════

1. http://localhost:3000/onboarding — redirects to /auth if not logged in
2. /onboarding — shows step 1 form when authenticated
3. /application/status — shows correct state based on application status
4. pnpm typecheck — zero errors
5. git log — 3 new commits

Report results.
```

---

# WEEK 7 PROMPT — Member Portal
> Paste this entire block into Claude Code. Estimated runtime: 120-150 minutes.

```
Read CLAUDE.md fully.
Read MASTER_TDD.md Sections 12, 19, 23 fully.
Read USER_STORIES.md US-06, US-07, US-08, US-09, US-10 fully.

This is Week 7. Build Sessions 7.1 through 7.5.
All member portal pages are CSR with React Query. Auth required.

═══════════════════════════════════════════════
SESSION 7.1 — Member Dashboard
═══════════════════════════════════════════════

Create apps/web/app/(member)/member/dashboard/page.tsx:
  useQuery(queryKeys.dashboard.stats) → apiClient.get('/dashboard/stats')
  Show loading skeleton while fetching

Create apps/web/components/member/DashboardStats.tsx:
  6 stat cards in responsive grid:
    Profile completion (circular progress), Published articles,
    Total views, Consultation requests (30 days),
    Membership expiry (red if < 30 days), Verified status
  3 recent consultation requests (mini cards)
  3 recent articles with status badges
  Quick action buttons: Write Article (→ /member/articles/new),
    Edit Profile (→ /member/profile), View Public Profile (→ /members/{slug})

═══════════════════════════════════════════════
SESSION 7.2 — Member Profile Editor
═══════════════════════════════════════════════

Read USER_STORIES.md US-06 fully.

Create apps/web/app/(member)/member/profile/page.tsx:
Create apps/web/components/member/ProfileEditor.tsx:
  Loads data from GET /members/me
  Save button per section (not a single big save)
  Show warning before saving fields that remove verified badge:
    "Saving changes to this section will temporarily remove your
     verified badge pending re-review."
  Sections:
    Photo: upload with preview
    Basic info: name, designation, headline (char count), bio (char count)
    Contact: linkedinUrl, fee range
    Location: country, city, firm name, firm size
    Services: view current, "Request change" button
    Qualifications: tag input
    Work experience: same dynamic list as onboarding
    Education: same dynamic list
    Credentials: upload + view existing (verified ones show green checkmark)
    Testimonials: upload + view existing (verified show checkmark)
    Engagements: dynamic list
    Availability: full availability editor

  On save: PATCH /members/me with changed fields
    Show success toast
    Invalidate queryKeys.members.me

═══════════════════════════════════════════════
SESSION 7.3 — Article List and Editor
═══════════════════════════════════════════════

Read USER_STORIES.md US-07 fully.

Create apps/web/app/(member)/member/articles/page.tsx:
  List of member's articles with status badges
  Status badge colours: draft=grey, submitted=blue, under_review=amber,
    published=green, rejected=red, archived=grey
  Actions per status:
    draft: Edit, Submit (if 300+ words + image), Delete
    submitted/under_review: View only (read-only preview link)
    published: View public, Edit (re-enters review)
    rejected: Edit + see rejection reason, Resubmit
    archived: View only

Create apps/web/app/(member)/member/articles/new/page.tsx:
Create apps/web/app/(member)/member/articles/[id]/edit/page.tsx:
  Both load ArticleEditor component

Create apps/web/components/member/ArticleEditor.tsx:
  Tiptap editor with toolbar:
    H2, H3, Bold, Italic, Link, BulletList, OrderedList,
    Image (upload via /upload/article-image), Blockquote
  Right sidebar:
    Title input (min 10 chars, shows count)
    Live word count (red if < 300, green if 300+)
    Featured image upload with preview
    Category select
    Tags input (max 5, shows current count)
  Auto-save: every 30 seconds via PATCH /articles/:id
    Show "Saving..." then "Saved {time}" in toolbar
  Submit button: disabled if < 300 words or no featured image
    Clicking shows confirmation dialog
    POST /articles/:id/submit on confirm
  AI Generate button: opens AI panel (Session 7.4)

═══════════════════════════════════════════════
SESSION 7.4 — AI Article Generation Panel
═══════════════════════════════════════════════

Read USER_STORIES.md US-08 fully.

Create apps/web/components/member/AIGeneratePanel.tsx:
  Slide-in panel (right side) with close button
  5-8 questions based on selected category:
    (Default questions — shown for all categories)
    1. "What specific topic or issue will this article address?"
    2. "Who is your target audience for this piece?"
    3. "What are the key points or arguments you want to make?"
    4. "Are there any recent developments, regulations, or cases
        that prompted this article?"
    5. "What practical advice or takeaways should readers leave with?"
    6. "Do you have any real examples or anonymised case studies to include?"
  Text areas for each answer
  Generate button:
    POST /articles/generate with { qa, categoryId } — SSE stream
    Show streaming text appearing in the main editor in real time
    Token by token display
    Progress bar at bottom of panel
    On done event: populate title, body, tags in editor
    Close panel automatically
    Show toast: "Article draft generated. Review and edit before submitting."
  Error handling: show retry button, form unchanged

═══════════════════════════════════════════════
SESSION 7.5 — Member Settings and Notifications
═══════════════════════════════════════════════

Create apps/web/app/(member)/member/settings/page.tsx:

Sections:
  Notification Preferences:
    Toggle each preference (PATCH /members/me/notifications)
    consultation_requests, article_status, membership_reminders,
    regulatory_nudges, platform_updates
    Auto-save on toggle

  Digest Subscriptions:
    List of all service categories
    Toggle subscription per category
    Frequency selector per subscribed category: weekly / fortnightly
    (calls digest subscription endpoint — build in backend if not done)

  Membership:
    Show current tier, status, expiry date
    Contact to renew CTA (mailto:ops@expertly.net)

Run: pnpm typecheck — fix all errors
Run: git add . && git commit -m "Session 7.1-7.5: member portal (dashboard, profile, articles, AI, settings)"

═══════════════════════════════════════════════
WEEK 7 COMPLETE — Final verification
═══════════════════════════════════════════════

1. /member/dashboard — stats displayed
2. /member/profile — profile editor loads
3. /member/articles — list with status badges
4. /member/articles/new — Tiptap editor loads
5. AI panel opens and questions display
6. pnpm typecheck — zero errors

Report results.
```

---

# WEEK 8 PROMPT — Automation, Email, and Workers
> Paste this entire block into Claude Code. Estimated runtime: 120 minutes.

```
Read CLAUDE.md fully.
Read MASTER_TDD.md Sections 14, 15, 16, 17 fully.

This is Week 8. Build Sessions 8.1 through 8.5.
All workers run in the NestJS process via BullMQ.

═══════════════════════════════════════════════
SESSION 8.1 — Queue Infrastructure + LinkedIn Worker
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 14 fully.

Create apps/api/src/config/queue.config.ts:
  BullMQ connection config from Redis env vars
  Export queue names and job types constants from Section 14

Create apps/api/src/modules/automation/automation.module.ts
Create apps/api/src/modules/automation/automation.controller.ts:
  POST /automation/linkedin-scrape (JWT)
    Creates background_jobs record: { user_id, queue: 'linkedin-queue',
      job_type: 'linkedin_scrape', status: 'queued' }
    Adds BullMQ job to linkedin-queue with jobId = background_jobs.id
    Returns: { jobId: string }
  POST /automation/parse-linkedin-pdf (JWT)
    Accepts PDF upload, queues linkedin_pdf_parse job
  GET /automation/job/:jobId/status (JWT)
    Query background_jobs by id, check ownership
    Return: { status, result, error }
  GET /automation/job/:jobId/result (JWT)
    Return full result from background_jobs

Create apps/api/src/modules/automation/linkedin.processor.ts:
  @Processor('linkedin-queue') with concurrency 2
  Handles linkedin_scrape:
    Call Apify API: actor 'anchor/linkedin-profile-scraper'
    Input: { profileUrls: [linkedinUrl from user's profile] }
    Poll Apify for result (max 90 seconds, check every 5s)
    On success: Update background_jobs status='completed', result=scraped_data
    On failure: Update status='failed', error=error_message
    Supabase Realtime fires automatically (background_jobs has REPLICA IDENTITY FULL)

Register automation.module in app.module.ts.

Run: git add . && git commit -m "Session 8.1: queue infrastructure + LinkedIn scraper worker"

═══════════════════════════════════════════════
SESSION 8.2 — Embedding Worker
═══════════════════════════════════════════════

Create apps/api/src/modules/ai/ai.module.ts
Create apps/api/src/modules/ai/embedding.processor.ts:
  @Processor('ai-queue') with concurrency 5
  Handles generate_embedding:
    Job data: { entityType: 'member'|'article'|'event', entityId: string }
    For member: build text = "{firstName} {lastName} {designation} {headline}
      {bio} {serviceName} {country} {city} {qualifications.join(' ')}"
    For article: build text = "{title} {subtitle} {excerpt} {tags.join(' ')}"
    For event: build text = "{title} {description} {eventType} {country} {city}"
    Call OpenAI: embeddings.create({ model: 'text-embedding-3-small', input: text })
    Update entity: embedding = vector, embedding_status = 'generated',
      embedding_generated_at = NOW()
    On failure: embedding_status = 'failed', embedding_error = error.message

Register ai.module in app.module.ts.

Run: git add . && git commit -m "Session 8.2: embedding generation worker"

═══════════════════════════════════════════════
SESSION 8.3 — Email Service
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 17 fully (all 22 templates).

Create apps/api/src/modules/email/email.module.ts
Create apps/api/src/modules/email/email.service.ts:
  sendEmail(template: string, to: string, variables: Record) method
  Use Resend SDK: resend.emails.send({...})
  Log to email_logs table after every send (success or failure)
  Do not throw on send failure — log and continue

  Implement ALL 22 templates K1 through K22:
    Each template: subject + HTML body
    Use the variables listed in Section 17 for each template
    K2 must include bank transfer details from env vars:
      PAYMENT_BANK_NAME, PAYMENT_ACCOUNT_NUMBER,
      PAYMENT_SORT_CODE, PAYMENT_AMOUNT_USD
    K6 must include requester's email address in body (member replies directly)
    All emails include Expertly logo (text-based, not image dependency)
    All emails have consistent header (navy) and footer with unsubscribe note

Create apps/api/src/modules/email/email.processor.ts:
  @Processor('email-queue') with concurrency 10
  Handles send_email job
  Calls emailService.sendEmail(template, to, variables)

Register email.module in app.module.ts.

Run: git add . && git commit -m "Session 8.3: email service with all 22 templates"

═══════════════════════════════════════════════
SESSION 8.4 — RSS Ingestion Worker
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 16 fully.

Create apps/api/src/modules/rss/rss.module.ts
Create apps/api/src/modules/rss/rss.processor.ts:
  @Processor('rss-queue') with concurrency 3

  Handles ingest_all_feeds:
    Loop through RSS_FEEDS from Section 16
    Queue one ingest_single_feed job per feed

  Handles ingest_single_feed:
    Parse RSS feed using rss-parser
    For each item in feed:
      Check if source_url already exists in regulatory_updates
      If exists: skip (deduplication)
      If new:
        Use OpenAI to generate 2-sentence summary of the item
        Insert into regulatory_updates:
          source, source_url, title, summary,
          relevant_categories (from feed config), relevant_regions
          published_date, is_processed=false
        Queue process_regulatory_update job

  Handles process_regulatory_update:
    Query active members where primary_service maps to
      update.relevant_categories
    Filter by member.notification_preferences.regulatory_nudges = true
    Send K16 email to each matching member
    Update regulatory_updates: nudges_sent++, nudges_sent_at=NOW(), is_processed=true

Register rss.module in app.module.ts.

Run: git add . && git commit -m "Session 8.4: RSS ingestion worker with regulatory nudges"

═══════════════════════════════════════════════
SESSION 8.5 — Ops Module (Backend)
═══════════════════════════════════════════════

Read MASTER_TDD.md Sections 12, 18, 19 fully.

Create apps/api/src/modules/ops/ops.module.ts
Create apps/api/src/modules/ops/ops.controller.ts
Create apps/api/src/modules/ops/ops.service.ts

All ops endpoints require @Roles('ops') minimum.

Application endpoints:
  GET  /ops/applications?status=&service=&country=
  GET  /ops/applications/:id
  PATCH /ops/applications/:id/approve — from Section 18 step 3: assign service + tier
    → K2 email to applicant
  PATCH /ops/applications/:id/reject — requires rejection_reason (min 20 chars)
    → set re_application_eligible_at = NOW() + 6 months
    → K3 email
  PATCH /ops/applications/:id/waitlist → K4 email

Member endpoints:
  GET  /ops/members?pendingReVerification=&pendingServiceChange=&expiringDays=
  GET  /ops/members/:id
  POST /ops/members/:id/activate — EXACT 16 steps from Section 18
    Validate: application status = 'approved'
    Validate: operator != applicant (no self-activation)
    claim_seat() — throw ConflictException if fails
    Generate unique slug
    Create members record
    Set payment_received_at from DTO
    Create member_services
    Update user.role = 'member'
    Create member_notification_preferences (all true)
    Auto-subscribe to primary category digest
    Update application status = 'approved'
    Queue GENERATE_EMBEDDING for member
    Invalidate caches
    ISR revalidate /members/{slug}
    Send K17 email
  PATCH /ops/members/:id/verify → award verified badge, K12 email
  PATCH /ops/members/:id/suspend → suspend, K-none (internal action)
  PATCH /ops/members/:id/tier → upgrade tier (budding → seasoned only)
  PATCH /ops/members/:id/featured → toggle is_featured
  PATCH /ops/members/:id/credentials → verify individual credential
  PATCH /ops/members/:id/testimonials → verify individual testimonial
  PATCH /ops/members/:id/approve-service-change → service change flow from Section 18
  PATCH /ops/members/:id/reject-service-change → K20 email
  PATCH /ops/members/:id/renew → renewal flow from Section 18, K22 email

Article endpoints:
  GET  /ops/articles?status=
  PATCH /ops/articles/:id/approve — APPEND disclaimer, set published, K9, embed queue, ISR
  PATCH /ops/articles/:id/reject — K10 email, back to draft
  PATCH /ops/articles/:id/archive — K21 email

Seat endpoints:
  GET  /ops/seats
  POST /ops/seats
  PATCH /ops/seats/:id

Event endpoints (backend_admin only for create/delete):
  POST  /ops/events
  PATCH /ops/events/:id
  DELETE /ops/events/:id

Broadcast endpoint (backend_admin only):
  POST /ops/broadcast
  GET  /ops/broadcast-logs

Register ops.module in app.module.ts.

Create apps/api/src/modules/admin/admin.module.ts
Create apps/api/src/modules/admin/admin.controller.ts (@Roles('backend_admin')):
  GET /admin/users
  GET /admin/stats — calls get_ops_action_counts() RPC
  PATCH /admin/users/:id/role
  DELETE /admin/users/:id — soft delete / anonymise

Run: pnpm typecheck — fix all errors
Run: git add . && git commit -m "Session 8.5: ops module (applications, members, articles, seats, events)"

═══════════════════════════════════════════════
WEEK 8 COMPLETE — Final verification
═══════════════════════════════════════════════

1. pnpm typecheck — zero errors
2. POST /ops/members/:id/activate with valid data — activates member
3. Email service queues correctly
4. git log — 5 new commits

Report results.
```

---

# WEEK 9 PROMPT — Ops Dashboard Frontend
> Paste this entire block into Claude Code. Estimated runtime: 120 minutes.

```
Read CLAUDE.md fully.
Read MASTER_TDD.md Section 24 fully.
Read USER_STORIES.md US-12, US-13, US-14, US-15, US-18 fully.

This is Week 9. Build Sessions 9.1 through 9.6.
Ops dashboard is CSR. All routes under /ops require ops role.

═══════════════════════════════════════════════
SESSION 9.1 — Ops Layout and Overview
═══════════════════════════════════════════════

Create apps/web/app/(ops)/ops/page.tsx:
  Fetches /admin/stats every 60 seconds (refetchInterval)
  4 action counter cards (large numbers, bold):
    Applications Pending Review
    Articles Pending Review
    Members Pending Re-verification
    Members Expiring in 30 Days
  Each card links to filtered view

Create apps/web/components/ops/OpsLayout.tsx:
  Left sidebar navigation:
    Overview, Applications, Members, Articles, Events,
    Seat Allocations, Regulatory Updates, Broadcast (admin only), Admin (admin only)
  Top bar: "Ops Dashboard" title + logged-in user name

═══════════════════════════════════════════════
SESSION 9.2 — Application Review
═══════════════════════════════════════════════

Create apps/web/app/(ops)/ops/applications/page.tsx:
  Table of applications: name, service, country, status, submitted date
  Filter: status dropdown, service, country
  Click row → /ops/applications/:id

Create apps/web/app/(ops)/ops/applications/[id]/page.tsx:
  Two-panel layout:
    Left panel (60%): full applicant details
      All fields from US-12-02
    Right panel (40%):
      Seat availability bar: "{current}/{max} seats — {available} available"
      Service assignment dropdown
      Tier dropdown: Budding Entrepreneur / Seasoned Professional
      Notes textarea
      Three action buttons: Approve (green), Reject (red), Waitlist (amber)
      Approve: calls PATCH /ops/applications/:id/approve
      Reject: shows inline reason input (min 20 chars) before confirming
      Waitlist: confirmation dialog

═══════════════════════════════════════════════
SESSION 9.3 — Member Management
═══════════════════════════════════════════════

Create apps/web/app/(ops)/ops/members/page.tsx:
  Members table with filters
  Quick filter buttons: Pending Re-verification, Pending Service Change, Expiring Soon

Create apps/web/app/(ops)/ops/members/[id]/page.tsx:
  Full member details plus all action buttons from US-13
  Credentials section with verify forms
  Testimonials section with verify forms
  Service change section (if pending)
  Membership renewal section: date picker + confirm button

═══════════════════════════════════════════════
SESSION 9.4 — Article Review
═══════════════════════════════════════════════

Create apps/web/app/(ops)/ops/articles/page.tsx:
  Articles table with status filter, creation mode badge (AI / Manual)

Create apps/web/app/(ops)/ops/articles/[id]/page.tsx:
  Full article preview (read-only, rendered HTML)
  Right panel: metadata + Approve / Reject / Archive buttons
  Reject requires reason input

═══════════════════════════════════════════════
SESSION 9.5 — Seats and Events
═══════════════════════════════════════════════

Create apps/web/app/(ops)/ops/seats/page.tsx:
  Table from US-15-01
  Inline max seats editor
  Warning highlight on 100% utilisation

Create apps/web/app/(ops)/ops/events/page.tsx:
  Events table + create event modal
  Full event form from US-15-02

═══════════════════════════════════════════════
SESSION 9.6 — Broadcast and Admin
═══════════════════════════════════════════════

Create apps/web/app/(ops)/ops/broadcast/page.tsx:
  Audience selector from US-18-03
  Recipient count preview
  Subject + rich text body composer
  Confirmation before send
  Recent broadcasts table

Create apps/web/app/(ops)/ops/admin/page.tsx:
  Users table with search
  Role change dropdown (backend_admin only sees this page)
  Soft delete with reason

Run: pnpm typecheck — fix all errors
Run: git add . && git commit -m "Session 9.1-9.6: ops dashboard (all screens)"

═══════════════════════════════════════════════
WEEK 9 COMPLETE — Final verification
═══════════════════════════════════════════════

1. /ops — overview dashboard with action counters
2. /ops/applications — table renders
3. /ops/applications/:id — two-panel review
4. /ops/members — table renders
5. /ops/articles — table renders
6. /ops/seats — seat allocation table
7. pnpm typecheck — zero errors

Report results.
```

---

# WEEK 10 PROMPT — Scheduler, Polish, and Deployment
> Paste this entire block into Claude Code. Estimated runtime: 90-120 minutes.

```
Read CLAUDE.md fully.
Read MASTER_TDD.md Sections 15, 26, 27, 33 fully.

This is Week 10. Final week. Build Sessions 10.1 through 10.5.
Goal: Production-ready, deployed, and verified end-to-end.

═══════════════════════════════════════════════
SESSION 10.1 — Scheduler Module
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 15 fully.

Create apps/api/src/modules/scheduler/scheduler.module.ts
Create apps/api/src/modules/scheduler/scheduler.service.ts:

Implement all 6 cron jobs from Section 15:

@Cron('0 1 * * *') handleMembershipExpiry():
  Query members WHERE membership_expiry_date <= CURRENT_DATE
    AND membership_status = 'active'
  For each:
    Update membership_status = 'expired'
    Update user.role = 'user'
    Release seat via release_seat() RPC
    Invalidate member caches
    ISR revalidate /members/{slug}
    Send K14 email

@Cron('0 2 * * *') handleRenewalReminders():
  Query members WHERE membership_expiry_date = CURRENT_DATE + 30 days
    AND membership_status = 'active'
  For each: Send K13 email

@Cron('0 8 * * 1') handleWeeklyDigest():
  Calculate week_start (last Monday)
  Check digest_send_log — skip if already sent this week
  Call get_digest_data(week_start) RPC
  For each row: queue SEND_WEEKLY_DIGEST job if articles.length > 0

@Cron('0 6 * * *') handleRssIngestion():
  Queue INGEST_ALL_FEEDS job

@Cron('*/15 * * * *') flushViewCounts():
  SCAN Redis for keys matching 'member:views:*' and 'article:views:*'
  For each key:
    GET value (increment count)
    Update DB: profile_view_count or view_count += count
    DELETE Redis key

@Cron('0 3 * * *') retryFailedEmbeddings():
  Query articles WHERE embedding_status = 'failed' LIMIT 20
  Query members WHERE embedding_status = 'failed' LIMIT 20
  Queue GENERATE_EMBEDDING for each

Register scheduler.module in app.module.ts.

Run: git add . && git commit -m "Session 10.1: scheduler module (6 cron jobs)"

═══════════════════════════════════════════════
SESSION 10.2 — Digest Worker
═══════════════════════════════════════════════

Create apps/api/src/modules/email/digest.processor.ts:
  @Processor('digest-queue') with concurrency 1

  Handles send_weekly_digest:
    job.data: { weekStart: string }
    Get all subscribers and their articles via get_digest_data(weekStart)
    Split into batches of 50
    Queue SEND_DIGEST_BATCH for each batch

  Handles send_digest_batch:
    job.data: { recipients: [...], weekStart: string }
    For each recipient:
      Check digest_send_log — skip if already sent
      Send K15 email with their articles
      Insert into digest_send_log (idempotency)

Run: git add . && git commit -m "Session 10.2: digest worker with idempotency"

═══════════════════════════════════════════════
SESSION 10.3 — Performance and Polish
═══════════════════════════════════════════════

1. Cache TTL audit — verify all endpoints use correct TTLs:
   homepage: 300s, member list: 300s, member detail: 600s,
   article list: 300s, article detail: 300s, taxonomy: 3600s

2. NEVER SELECT * audit — scan all service files:
   grep -r "select\(\*\)" apps/api/src/
   grep -r "select('\*')" apps/api/src/
   If any found: fix them to list columns explicitly

3. Route order audit — scan all controllers:
   grep -r "@Get(" apps/api/src/
   Verify no static route appears after a :param route in same controller

4. Missing email sends audit — check every mutation that should send email:
   Member activate → K17 ✓
   Article approve → K9 ✓
   Article reject → K10 ✓
   Application approve → K2 ✓
   Application reject → K3 ✓
   Application waitlist → K4 ✓
   Verified badge remove → K11 ✓
   Verified badge restore → K12 ✓
   Service change approve → K19 ✓
   Service change reject → K20 ✓
   Membership renew → K22 ✓
   Expiry → K14 ✓
   Renewal reminder → K13 ✓
   Article archive → K21 ✓

5. TypeScript strict audit:
   pnpm typecheck
   Fix every error. Zero errors required.

6. Mobile responsiveness check:
   For each public page, verify Tailwind breakpoints are correct:
   sm:, md:, lg: modifiers used appropriately

Run: git add . && git commit -m "Session 10.3: performance audit, cache TTL review, quality checks"

═══════════════════════════════════════════════
SESSION 10.4 — Dockerfile and CI
═══════════════════════════════════════════════

Read MASTER_TDD.md Section 26 fully.

Create apps/api/Dockerfile — exact content from Section 26

Create .github/workflows/ci.yml — exact content from Section 26

Test Dockerfile builds:
  cd apps/api && docker build -t expertly-api .
  docker run -p 3001:3001 --env-file .env expertly-api &
  curl http://localhost:3001/api/v1/health
  Expected: { status: 'ok' }
  Stop container after test

Run: git add . && git commit -m "Session 10.4: Dockerfile and CI pipeline"

═══════════════════════════════════════════════
SESSION 10.5 — Deployment
═══════════════════════════════════════════════

Read MASTER_TDD.md Sections 26, 33 fully.

1. Railway deployment (backend):
   Run: railway login
   Run: railway init (in project root — select apps/api as root)
   Run: railway up
   Set all env vars from apps/api/.env in Railway dashboard
   Get Railway URL (e.g. https://expertly-api.up.railway.app)
   Test: curl https://expertly-api.up.railway.app/api/v1/health

2. Update apps/web/.env.local (or Vercel env):
   NEXT_PUBLIC_API_URL = https://expertly-api.up.railway.app

3. Vercel deployment (frontend):
   Run: vercel login
   Run: vercel --cwd apps/web
   Set all env vars from apps/web/.env.local in Vercel dashboard
   Get Vercel URL (e.g. https://expertly.vercel.app)
   Test: open https://expertly.vercel.app in browser

4. Update CORS in api main.ts:
   Add Vercel URL to allowed origins
   Redeploy backend: railway up

5. Final end-to-end test:
   a. Open production URL in browser — homepage loads ✓
   b. Click Sign in with LinkedIn — OAuth flow works ✓
   c. Navigate to /members — directory loads ✓
   d. Navigate to /articles — articles load ✓
   e. Open /api/v1/health — returns ok ✓

Run: git add . && git commit -m "Session 10.5: deployment verified"
Run: git push origin main

═══════════════════════════════════════════════
WEEK 10 COMPLETE — Full platform verification
═══════════════════════════════════════════════

Run the complete pre-launch checklist from MASTER_TDD.md Section 33.
Every checkbox must be ticked.

Report:
- Production API URL
- Production frontend URL
- Any failing checks and how you fixed them
- Any TODOs deferred to post-launch

CONGRATULATIONS — Expertly platform is live.
```

---

# HOW TO USE THIS FILE

## Setup (one time)
```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Open in your project
cd ~/Projects/expertly
claude

# Allow Claude Code to run commands without asking every time
# In Claude Code settings: enable auto-approve for bash commands
```

## Each week
```
1. Open terminal in ~/Projects/expertly
2. Run: claude
3. Copy the week's prompt block (between the ``` markers)
4. Paste it into Claude Code
5. Walk away
6. Come back 1-2 hours later
7. Review what was built
8. Fix any issues Claude Code flagged
9. Commit and push
10. Move to next week
```

## If Claude Code gets stuck or drifts
```
Stop. Read CLAUDE.md.
Read MASTER_TDD.md Section [X].
Your implementation of [X] diverges from the spec.
Specifically: [what is wrong].
Fix [X] to match the TDD exactly.
```

## Pre-requisites before Week 1
```
□ Supabase project created (Pro plan) — 4 values saved
□ Upstash Redis created — host, port, password saved
□ OpenAI billing enabled — API key saved
□ Resend account — API key + sending domain verified
□ Apify account — API token saved
□ apps/api/.env populated with all values
□ apps/web/.env.local populated with all values
□ Node.js 20 installed (check: node --version)
□ pnpm 9 installed (check: pnpm --version)
□ Docker Desktop running (for Dockerfile test in Week 10)
□ Railway CLI installed: npm install -g @railway/cli
□ Vercel CLI installed: npm install -g vercel
```

---

*CLAUDE_CODE_PROMPTS.md — Version 1.0*
*10 weeks. 10 prompts. One production platform.*

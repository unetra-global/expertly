# CLAUDE.md — AI Agent Instructions for Expertly Platform
> Place this file in the repository root.
> Every Claude Code session must read this file first, before any other file.

---

## What This Repository Is

Expertly is a curated professional network for verified finance and legal
professionals. It is a monorepo containing a NestJS backend (apps/api)
and a Next.js frontend (apps/web), with shared packages (packages/).

The platform has three surfaces:
1. Public website — discoverable by Google, visible to guests
2. Member portal — verified professionals only
3. Ops dashboard — internal team only

---

## The Three Documents You Must Know

| File | What It Contains | When To Read It |
|------|-----------------|-----------------|
| MASTER_TDD.md | Architecture, database schema, API contract, all technical specs | The relevant sections for today's task |
| USER_STORIES.md | What users need to accomplish, acceptance criteria | The relevant sections for today's task |
| CLAUDE.md (this file) | How to work in this codebase | Every session, fully |

---

## How To Start Every Session

### Step 1 — Identify what you are building
The user will tell you which module or feature is the goal for this session.
Map it to the relevant sections in both documents.

### Step 2 — Load only what is relevant
Do NOT read MASTER_TDD.md and USER_STORIES.md in full every session.
Load only the sections that apply to today's task.

Reference guide — what to load per module:

```
Monorepo setup          → TDD Section 2
Database migrations     → TDD Sections 3, 4, 5, 6, 7
Auth flow               → TDD Section 13 + USER_STORIES US-02
Member directory        → TDD Section 21 + USER_STORIES US-01, US-16
Member profile page     → TDD Section 21 + USER_STORIES US-01, US-06
Onboarding form         → TDD Section 22 + USER_STORIES US-03
Application status      → TDD Section 18 + USER_STORIES US-04
Member activation       → TDD Section 18 + USER_STORIES US-05
Member portal — profile → TDD Section 23 + USER_STORIES US-06
Member portal — articles→ TDD Section 23 + USER_STORIES US-07, US-08
Consultation requests   → TDD Section 12 + USER_STORIES US-09
Member dashboard        → TDD Section 23 + USER_STORIES US-10
Membership renewal      → TDD Section 18 + USER_STORIES US-11
Ops — applications      → TDD Section 24 + USER_STORIES US-12
Ops — members           → TDD Section 24 + USER_STORIES US-13
Ops — articles          → TDD Section 24 + USER_STORIES US-14
Ops — seats + events    → TDD Section 24 + USER_STORIES US-15
Search                  → TDD Section 12 + USER_STORIES US-16
Digest + notifications  → TDD Section 15 + USER_STORIES US-17
Admin panel             → TDD Section 12 + USER_STORIES US-18
NestJS bootstrap        → TDD Section 10
Shared services         → TDD Section 11
Queue architecture      → TDD Section 14
Scheduled jobs          → TDD Section 15
Email templates         → TDD Section 17
Upload service          → TDD Section 20
SEO                     → TDD Section 25
Deployment              → TDD Section 26
Local setup             → TDD Section 27
```

### Step 3 — Confirm before writing code
After reading the relevant sections, state:
1. What you are building (in one sentence)
2. The files you will create or modify (list them)
3. Any dependencies that must exist before you start
4. Your implementation plan (step by step)

Wait for the user to confirm before writing any code.

### Step 4 — Validate against user stories
Before marking any feature complete, check every acceptance criterion
in the relevant USER_STORIES section.
Every ✅ criterion must be satisfied by your implementation.
If a criterion is not met, fix it before declaring the feature done.

---

## Non-Negotiable Rules

### Architecture
```
✅ TypeScript strict mode everywhere — no 'any', no exceptions
✅ NestJS backend uses Fastify adapter (not Express)
✅ All API responses go through ResponseInterceptor (envelope + camelCase)
✅ Frontend uses Next.js App Router with Server and Client Components
✅ All frontend API calls go through apiClient (never raw fetch)
✅ All database access from backend uses Supabase service role client
✅ Frontend never uses service role key — only anon key
```

### Database
```
✅ Never SELECT * from any table that has an embedding column
   (members, articles, events) — always list columns explicitly
✅ RLS is enabled on all tables — backend bypasses via service role key
✅ All mutations go through NestJS — never direct Supabase from frontend
✅ Slugs are always generated server-side — never client-side
✅ Vector columns are vector(768) — Google gemini-embedding-001 with
   outputDimensionality: 768 via v1beta REST API (NOT @google/generative-ai SDK,
   which uses v1beta but doesn't support text-embedding-004)
```

### AI Search (POST /search/ai)
```
✅ EmbeddingService uses direct REST fetch to gemini-embedding-001 (not SDK)
✅ AiSearchDto accepts optional scope: 'members'|'articles'|'events'|'all'
✅ scope overrides the LLM's parsed intent — always pass scope from listing pages
✅ HeroSearchBar accepts scope prop → appends &scope=... to /search URL
✅ /search page reads scope from URL, passes to apiClient.search.ai(q, scope)
✅ GlobalSearchBar (navbar) has no scope → always searches all types
✅ To re-embed all records: run scripts/backfill-embeddings.mjs from apps/api/
```

### Routes (CRITICAL)
```
✅ Static routes always BEFORE dynamic :param routes in every controller
   Wrong order breaks the entire module silently.

   ✅ Correct:    @Get('featured') then @Get('me') then @Get(':slug')
   ❌ Wrong:      @Get(':slug') then @Get('featured')  ← 'featured' never reached
```

### Cache invalidation (Required after every mutation)
```
✅ After any data mutation:
   1. Update the database
   2. Invalidate Redis cache keys
   3. Call supabase.revalidatePath() for ISR pages
   Skipping cache invalidation causes stale data for up to 10 minutes.
```

### Security
```
✅ SUPABASE_SERVICE_ROLE_KEY never in frontend code or .env.local
✅ No credentials hardcoded — all from process.env
✅ File uploads: always validate MIME type using file-type (magic bytes)
✅ Article HTML: always sanitise with sanitize-html before storing
✅ AI generation: always apply prompt injection prevention
   (see TDD Section 19 for exact rules)
```

### Error handling
```
✅ Every async function has explicit try/catch or throws typed exceptions
✅ Use NestJS HTTP exceptions with error codes, not generic Error
✅ Frontend reads error.code for specific user-facing messages
✅ Never use console.log — use NestJS Logger
```

---

## Code Quality Bar

Every piece of code must meet this standard before being considered done:

**Backend:**
- Controller has correct decorators (guards, roles, public)
- Service separates business logic from controller
- DTO has validation decorators matching the spec
- Cache invalidated after every mutation
- ISR revalidated after every mutation that affects a public page
- Email sent where TDD specifies (check Section 17)
- Error codes match the spec

**Frontend:**
- Server Components used for data fetching
- Client Components used for interactivity only
- Mobile-first responsive (check at 375px and 1440px)
- Loading states shown (skeleton or spinner)
- Error states handled (not just happy path)
- Empty states handled (list with no items)
- Uses shadcn/ui base components
- Tailwind only — no custom CSS files
- Matches brand: navy #1e3a5f, gold #c9a84c

**Design standard:** Linear, Vercel, Stripe — premium, clean,
generous whitespace. If it looks like a generic template, it is not done.

---

## Build Order

Follow this order. Do not skip ahead.

```
Week 1:  Monorepo → NestJS bootstrap → Database → Shared packages
Week 2:  Core backend (auth, taxonomy, members read/write)
Week 3:  Applications + Articles backend (CRUD + AI generation)
Week 4:  Frontend foundation (setup + auth + layout + homepage)
Week 5:  Public pages (directory, profiles, articles, events)
Week 6:  Onboarding + Application flow
Week 7:  Member portal (dashboard, profile editor, article editor)
Week 8:  Automation + Email (LinkedIn scraper, embeddings, RSS, Resend)
Week 9:  Ops dashboard (all screens)
Week 10: Scheduler + SEO + Performance + Deployment
```

Full session breakdown is in MASTER_TDD.md Section 30.

---

## When You Are Unsure

If any implementation detail is ambiguous:
1. Check MASTER_TDD.md first — the answer is usually there
2. Check USER_STORIES.md acceptance criteria — they clarify expected behaviour
3. If still unclear, ask the user one specific question before proceeding

Do not invent behaviour that is not specified in either document.
Do not make assumptions about business rules — every rule is documented.

---

## Session Closing Checklist

At the end of every session:
```
□ List every file created or modified
□ State whether all USER_STORIES acceptance criteria are met
□ Note any TODOs or incomplete implementations
□ State what the next session should build
□ Confirm no hardcoded credentials or keys
□ Confirm TypeScript compiles with no errors
```

---

*CLAUDE.md — Version 1.1 (updated: AI search scope, embeddings)*
*Read this file at the start of every session.*

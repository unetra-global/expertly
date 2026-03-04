# MASTER TDD — Expertly Platform
> Version 1.0 | Complete Technical Design Document
> This is the single source of truth for the entire Expertly platform.
> Every architectural decision, every database table, every API endpoint,
> every frontend page, every background job, and every business rule
> is defined here. Any developer or AI agent should be able to read
> this document and build the platform without asking a single
> clarifying question.

---

# SECTION 0 — HOW TO USE THIS DOCUMENT

## For Developers
Read Sections 1 and 2 first (overview and stack). Then read Section 18
(local setup) and get the project running. Then read whichever section
covers the module you are building.

## For AI Agents (Claude Code, Copilot, etc.)
Read this entire document before writing any code. When in doubt about
any behaviour, decision, or implementation detail — the answer is in
this document. Do not invent behaviour that is not specified here.

## For Claude Code Sessions
Every session starts with:
"Read MASTER_TDD.md fully. Today we are building [specific module].
Do not write any code until you confirm your understanding."

## Document Conventions
- SQL blocks are production-ready and should be used as-is
- TypeScript blocks show exact implementation patterns
- "TBD" does not appear anywhere — every decision is made
- Business rules are marked with ► 
- Security rules are marked with 🔒
- Performance rules are marked with ⚡

---

# SECTION 1 — PROJECT OVERVIEW

## What Expertly Is
Expertly is a curated professional network exclusively for verified
finance and legal professionals. It is not a social network. It is
not a job board. It is a trust-based directory and knowledge platform
where professionals can be discovered, read their expertise, and be
contacted for consultations.

## The Three Surfaces
1. **Public Website** — visible to everyone including Google
   Members appear as teasers. Articles are fully readable.
   Events are listed. No directory browsing without login.

2. **Member Portal** — for verified members only
   Full profile management, article creation, consultation inbox,
   digest preferences, membership management.

3. **Ops Dashboard** — for ops and backend_admin roles only
   Application review, member activation, article approval,
   event management, seat allocation, broadcast emails.

## The Four User Types
| Role | What They Can Do |
|------|-----------------|
| Guest (unauthenticated) | Browse homepage, read articles, see member teasers |
| User (authenticated, not member) | Everything guest can do + apply for membership |
| Member (verified professional) | Everything user can do + full member portal |
| Ops / backend_admin | Everything + ops dashboard |

## Core Business Rules
► Members are manually vetted by ops — no self-service activation
► Membership is annual and paid manually (bank transfer)
► Seats per service per country are limited (configured by ops)
► Verified badge is awarded by ops after credential review
► Articles require ops approval before publication
► LinkedIn OAuth is the primary signup method
► USD is the only supported currency
► The platform is finance and legal professionals only —
  no other industries

## Brand
- Name: Expertly
- Tagline: The professional network for finance and legal experts
- Primary colour: #1e3a5f (deep navy)
- Accent colour: #c9a84c (gold)
- Surface: #f9fafb
- Text primary: #111827
- Text secondary: #6b7280
- Success: #10b981
- Error: #ef4444
- Font: Inter (body), system font stack fallback
- Design reference quality: Linear, Vercel, Stripe —
  premium, clean, generous whitespace

---

# SECTION 2 — TECH STACK AND MONOREPO STRUCTURE

## Tech Stack (Non-Negotiable)
| Layer | Technology | Version |
|-------|-----------|---------|
| Monorepo | pnpm workspaces + Turborepo | pnpm 9, turbo latest |
| Frontend | Next.js App Router | 14.x |
| Frontend language | TypeScript strict mode | 5.x |
| Frontend styling | Tailwind CSS + shadcn/ui | tailwind 3.x |
| Frontend state | Zustand | 4.x |
| Frontend server state | TanStack Query | 5.x |
| Frontend forms | React Hook Form + Zod | latest |
| Rich text editor | Tiptap | 2.x |
| Backend | NestJS with Fastify adapter | 10.x |
| Backend language | TypeScript strict mode | 5.x |
| Database | Supabase (Postgres 15) | latest |
| Auth | Supabase Auth | latest |
| Storage | Supabase Storage | latest |
| Realtime | Supabase Realtime | latest |
| Cache | Redis via Upstash | latest |
| Queue | BullMQ | latest |
| AI primary | OpenAI | gpt-4o-mini (completion), text-embedding-3-small |
| AI fallback | Anthropic | claude-3-haiku |
| Email | Resend | latest |
| LinkedIn scraper | Apify | anchor/linkedin-profile-scraper |
| Image processing | sharp | 0.33.x |
| Frontend deployment | Vercel | - |
| Backend deployment | Railway | - |
| DNS + CDN | Cloudflare | - |

## Monorepo Structure
```
expertly/
├── apps/
│   ├── api/                         # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   ├── optional-jwt.guard.ts
│   │   │   │   │   └── roles.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── response.interceptor.ts
│   │   │   │   │   └── logging.interceptor.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   ├── roles.decorator.ts
│   │   │   │   │   ├── current-user.decorator.ts
│   │   │   │   │   └── public.decorator.ts
│   │   │   │   ├── filters/
│   │   │   │   │   └── http-exception.filter.ts
│   │   │   │   ├── pipes/
│   │   │   │   │   └── validation.pipe.ts
│   │   │   │   └── services/
│   │   │   │       ├── supabase.service.ts
│   │   │   │       ├── redis.service.ts
│   │   │   │       └── cache.service.ts
│   │   │   ├── config/
│   │   │   │   ├── env.validation.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   └── queue.config.ts
│   │   │   └── modules/
│   │   │       ├── auth/
│   │   │       ├── homepage/
│   │   │       ├── members/
│   │   │       ├── applications/
│   │   │       ├── articles/
│   │   │       ├── events/
│   │   │       ├── consultation/
│   │   │       ├── search/
│   │   │       ├── taxonomy/
│   │   │       ├── upload/
│   │   │       ├── automation/
│   │   │       ├── ai/
│   │   │       ├── email/
│   │   │       ├── dashboard/
│   │   │       ├── contact/
│   │   │       ├── consent/
│   │   │       ├── ops/
│   │   │       ├── admin/
│   │   │       ├── scheduler/
│   │   │       ├── rss/
│   │   │       └── health/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                         # Next.js frontend
│       ├── app/
│       │   ├── (platform)/          # Public-facing pages
│       │   │   ├── page.tsx         # Homepage
│       │   │   ├── members/
│       │   │   │   ├── page.tsx     # Member directory
│       │   │   │   └── [slug]/
│       │   │   │       └── page.tsx # Member profile
│       │   │   ├── articles/
│       │   │   │   ├── page.tsx
│       │   │   │   └── [slug]/
│       │   │   │       └── page.tsx
│       │   │   └── events/
│       │   │       ├── page.tsx
│       │   │       └── [slug]/
│       │   │           └── page.tsx
│       │   ├── (auth)/              # Auth pages
│       │   │   ├── auth/
│       │   │   │   └── page.tsx
│       │   │   └── auth/
│       │   │       └── callback/
│       │   │           └── route.ts
│       │   ├── (member)/            # Member portal
│       │   │   └── member/
│       │   │       ├── dashboard/
│       │   │       ├── profile/
│       │   │       ├── articles/
│       │   │       └── settings/
│       │   ├── (ops)/               # Ops dashboard
│       │   │   └── ops/
│       │   │       ├── page.tsx
│       │   │       ├── applications/
│       │   │       ├── members/
│       │   │       ├── articles/
│       │   │       ├── events/
│       │   │       ├── seats/
│       │   │       ├── regulatory/
│       │   │       ├── broadcast/
│       │   │       └── admin/
│       │   ├── onboarding/
│       │   │   └── page.tsx
│       │   ├── application/
│       │   │   ├── page.tsx
│       │   │   └── status/
│       │   │       └── page.tsx
│       │   ├── sitemap.ts
│       │   ├── robots.ts
│       │   └── layout.tsx
│       ├── components/
│       │   ├── ui/                  # shadcn/ui base components
│       │   ├── layout/              # Navbar, Footer, Sidebar
│       │   ├── members/
│       │   ├── articles/
│       │   ├── events/
│       │   ├── onboarding/
│       │   ├── ops/
│       │   └── shared/
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useMember.ts
│       │   ├── useArticles.ts
│       │   ├── useSearch.ts
│       │   ├── useOnboarding.ts
│       │   └── queryKeys.ts
│       ├── stores/
│       │   ├── authStore.ts
│       │   └── onboardingStore.ts
│       ├── lib/
│       │   ├── apiClient.ts
│       │   ├── queryClient.ts
│       │   └── supabase.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── types/                       # Shared TypeScript interfaces
│   │   └── src/index.ts
│   ├── utils/                       # Shared utility functions
│   │   └── src/index.ts
│   └── schemas/                     # Shared Zod schemas
│       └── src/index.ts
├── supabase/
│   ├── migrations/                  # SQL migrations — run in order
│   └── config.toml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── MASTER_TDD.md                    # This file
├── CLAUDE.md                        # AI agent instructions
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "lint": {}
  }
}
```

## pnpm-workspace.yaml
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

## Root package.json
```json
{
  "name": "expertly",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "typecheck": "turbo typecheck",
    "lint": "turbo lint"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.0.0"
  }
}
```

---

# SECTION 3 — DATABASE SCHEMA

## Extensions Required
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
```

## Enums
```sql
CREATE TYPE user_role AS ENUM (
  'user', 'member', 'ops', 'backend_admin'
);

CREATE TYPE auth_provider AS ENUM (
  'linkedin', 'email'
);

CREATE TYPE membership_status AS ENUM (
  'pending_payment', 'active', 'expired',
  'suspended', 'cancelled'
);

CREATE TYPE member_tier AS ENUM (
  'budding_entrepreneur', 'seasoned_professional'
);

CREATE TYPE application_status AS ENUM (
  'draft', 'submitted', 'under_review',
  'approved', 'rejected', 'waitlisted', 'archived'
);

CREATE TYPE article_status AS ENUM (
  'draft', 'submitted', 'under_review',
  'published', 'rejected', 'archived'
);

CREATE TYPE consultation_status AS ENUM (
  'pending', 'responded', 'closed'
);

CREATE TYPE embedding_status AS ENUM (
  'pending', 'generated', 'failed'
);
```

## Table: users
```sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id           UUID UNIQUE REFERENCES auth.users(id)
                      ON DELETE CASCADE,
  email             TEXT UNIQUE NOT NULL,
  first_name        TEXT,
  last_name         TEXT,
  avatar_url        TEXT,
  role              user_role NOT NULL DEFAULT 'user',
  auth_provider     auth_provider DEFAULT 'email',
  linkedin_id       TEXT,
  is_active         BOOLEAN DEFAULT TRUE,
  is_deleted        BOOLEAN DEFAULT FALSE,
  deleted_at        TIMESTAMPTZ,
  deletion_reason   TEXT,
  timezone          TEXT DEFAULT 'UTC',
  last_login_at     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

## Table: service_categories
```sql
-- Must be created before members (foreign key dependency)
CREATE TABLE service_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  domain      TEXT,        -- 'finance' | 'legal' | 'both'
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## Table: services
```sql
-- Must be created before members (foreign key dependency)
CREATE TABLE services (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id  UUID NOT NULL
                 REFERENCES service_categories(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  regions      TEXT[],      -- NULL = global, ['IN','SG'] = region-specific
  is_active    BOOLEAN DEFAULT TRUE,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_slug ON services(slug);
```

## Table: members
```sql
CREATE TABLE members (
  id                             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                        UUID UNIQUE NOT NULL
                                   REFERENCES users(id) ON DELETE CASCADE,
  slug                           TEXT UNIQUE,
  profile_photo_url              TEXT,
  designation                    TEXT,
  headline                       TEXT,
  bio                            TEXT,
  years_of_experience            INTEGER,
  firm_name                      TEXT,
  firm_size                      TEXT,
  country                        TEXT,
  city                           TEXT,

  -- Membership
  member_tier                    member_tier DEFAULT 'budding_entrepreneur',
  membership_status              membership_status DEFAULT 'pending_payment',
  membership_start_date          DATE,
  membership_expiry_date         DATE,

  -- Payment (manual confirmation by ops)
  payment_received_at            TIMESTAMPTZ,
  payment_received_by            UUID REFERENCES users(id),

  -- Verification
  is_verified                    BOOLEAN DEFAULT FALSE,
  verified_at                    TIMESTAMPTZ,
  re_verification_requested_at   TIMESTAMPTZ,
  re_verification_reason         TEXT,

  -- Service
  primary_service_id             UUID REFERENCES services(id),
  pending_service_change         UUID REFERENCES services(id),
  pending_service_change_at      TIMESTAMPTZ,

  -- Contact
  linkedin_url                   TEXT,
  consultation_fee_min_usd       DECIMAL(10,2),
  consultation_fee_max_usd       DECIMAL(10,2),

  -- Qualifications
  qualifications                 TEXT[],

  -- JSONB columns (see Section 5 for exact structures)
  availability                   JSONB DEFAULT '{}',
  engagements                    JSONB DEFAULT '[]',
  work_experience                JSONB DEFAULT '[]',
  education                      JSONB DEFAULT '[]',
  credentials                    JSONB DEFAULT '[]',
  testimonials                   JSONB DEFAULT '[]',

  -- AI
  embedding                      vector(1536),
  embedding_status               embedding_status DEFAULT 'pending',
  embedding_generated_at         TIMESTAMPTZ,

  -- Display
  is_featured                    BOOLEAN DEFAULT FALSE,
  profile_view_count             INTEGER DEFAULT 0,

  created_at                     TIMESTAMPTZ DEFAULT NOW(),
  updated_at                     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_members_user_id ON members(user_id);
CREATE INDEX idx_members_slug ON members(slug);
CREATE INDEX idx_members_status ON members(membership_status);
CREATE INDEX idx_members_country ON members(country);
CREATE INDEX idx_members_service ON members(primary_service_id);
CREATE INDEX idx_members_featured ON members(is_featured)
  WHERE is_featured = TRUE;
CREATE INDEX idx_members_verified ON members(is_verified)
  WHERE is_verified = TRUE;
CREATE INDEX idx_members_embedding ON members
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 20);
```

## Table: member_services
```sql
CREATE TABLE member_services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id   UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES services(id),
  is_primary  BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, service_id)
);

CREATE INDEX idx_member_services_member ON member_services(member_id);
CREATE INDEX idx_member_services_service ON member_services(service_id);
```

## Table: applications
```sql
CREATE TABLE applications (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                     UUID NOT NULL REFERENCES users(id),

  -- Status
  status                      application_status DEFAULT 'draft',
  current_step                INTEGER DEFAULT 1,

  -- Step 1 — Identity
  first_name                  TEXT,
  last_name                   TEXT,
  designation                 TEXT,
  headline                    TEXT,
  bio                         TEXT,
  linkedin_url                TEXT,
  profile_photo_url           TEXT,

  -- Step 2 — Experience
  years_of_experience         INTEGER,
  firm_name                   TEXT,
  firm_size                   TEXT,
  country                     TEXT,
  city                        TEXT,
  consultation_fee_min_usd    DECIMAL(10,2),
  consultation_fee_max_usd    DECIMAL(10,2),
  qualifications              TEXT[],
  credentials                 JSONB DEFAULT '[]',
  work_experience             JSONB DEFAULT '[]',
  education                   JSONB DEFAULT '[]',

  -- Step 3 — Services
  primary_service_id          UUID REFERENCES services(id),
  secondary_service_ids       UUID[],
  engagements                 JSONB DEFAULT '[]',
  availability                JSONB DEFAULT '{}',

  -- LinkedIn prefill cache
  linkedin_prefill            JSONB,

  -- Ops fields
  reviewed_by                 UUID REFERENCES users(id),
  assigned_service_id         UUID REFERENCES services(id),
  assigned_member_tier        member_tier,
  rejection_reason            TEXT,
  ops_notes                   TEXT,
  re_application_eligible_at  TIMESTAMPTZ,

  -- Timestamps
  submitted_at                TIMESTAMPTZ,
  approved_at                 TIMESTAMPTZ,
  rejected_at                 TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
```

## Table: articles
```sql
CREATE TABLE articles (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- ON DELETE CASCADE: deleting a member deletes their articles
  member_id              UUID NOT NULL
                           REFERENCES members(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  slug                   TEXT UNIQUE NOT NULL,
  subtitle               TEXT,
  body                   TEXT NOT NULL,        -- Sanitised HTML
  excerpt                TEXT,                 -- Auto-generated plain text
  featured_image_url     TEXT,

  -- Taxonomy
  category_id            UUID REFERENCES service_categories(id),
  service_id             UUID REFERENCES services(id),
  tags                   TEXT[] DEFAULT '{}',  -- Max 5, member-set

  -- Stats
  word_count             INTEGER DEFAULT 0,
  read_time_minutes      INTEGER DEFAULT 1,
  view_count             INTEGER DEFAULT 0,

  -- AI
  creation_mode          TEXT DEFAULT 'manual', -- 'manual' | 'ai_assisted'
  ai_qa_inputs           JSONB,
  regulatory_update_id   UUID,
  embedding              vector(1536),
  embedding_status       embedding_status DEFAULT 'pending',
  embedding_error        TEXT,
  embedding_generated_at TIMESTAMPTZ,

  -- Status
  status                 article_status DEFAULT 'draft',
  submitted_at           TIMESTAMPTZ,
  published_at           TIMESTAMPTZ,
  reviewed_by            UUID REFERENCES users(id),
  rejection_reason       TEXT,

  -- SEO
  meta_title             TEXT,
  meta_description       TEXT,

  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_articles_member ON articles(member_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published ON articles(published_at)
  WHERE status = 'published';
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_embedding ON articles
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 15);
CREATE INDEX idx_articles_actionable ON articles(status)
  WHERE status IN ('submitted', 'under_review');
```

## Table: events
```sql
CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT,
  organiser_name   TEXT,
  event_type       TEXT,   -- 'conference'|'webinar'|'workshop'|'networking'
  event_format     TEXT,   -- 'in_person'|'virtual'|'hybrid'
  start_datetime   TIMESTAMPTZ NOT NULL,
  end_datetime     TIMESTAMPTZ,
  timezone         TEXT,
  country          TEXT,
  city             TEXT,
  venue_name       TEXT,
  online_url       TEXT,
  registration_url TEXT,
  is_free          BOOLEAN DEFAULT FALSE,
  speakers         JSONB DEFAULT '[]',
  source           TEXT,    -- 'manual' | 'scraped'
  is_published     BOOLEAN DEFAULT FALSE,
  is_featured      BOOLEAN DEFAULT FALSE,
  tags             TEXT[] DEFAULT '{}',
  embedding        vector(1536),
  embedding_status embedding_status DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_start ON events(start_datetime);
CREATE INDEX idx_events_published ON events(is_published, start_datetime)
  WHERE is_published = TRUE;
CREATE INDEX idx_events_embedding ON events
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
```

## Table: consultation_requests
```sql
CREATE TABLE consultation_requests (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id     UUID NOT NULL REFERENCES members(id),
  user_id       UUID NOT NULL REFERENCES users(id),
  service_id    UUID REFERENCES services(id),
  subject       TEXT NOT NULL,
  description   TEXT,
  preferred_time TEXT,
  status        consultation_status DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ► MVP NOTE: Members respond to consultation requests via email.
-- The K6 email includes the requester's email address.
-- Status tracking (responded/closed) is Phase 2.

CREATE INDEX idx_consultation_member ON consultation_requests(member_id);
CREATE INDEX idx_consultation_user ON consultation_requests(user_id);
```

## Table: seat_allocations
```sql
CREATE TABLE seat_allocations (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id     UUID NOT NULL REFERENCES services(id),
  country        TEXT NOT NULL,
  max_seats      INTEGER NOT NULL DEFAULT 5,
  current_count  INTEGER NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, country),
  CONSTRAINT count_non_negative CHECK (current_count >= 0),
  CONSTRAINT count_within_max CHECK (current_count <= max_seats)
);
```

## Table: user_digest_subscriptions
```sql
CREATE TABLE user_digest_subscriptions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id  UUID NOT NULL
                 REFERENCES service_categories(id),
  frequency    TEXT NOT NULL DEFAULT 'weekly', -- 'weekly'|'fortnightly'
  is_active    BOOLEAN DEFAULT TRUE,
  last_sent_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

CREATE INDEX idx_digest_user ON user_digest_subscriptions(user_id);
CREATE INDEX idx_digest_active ON user_digest_subscriptions(is_active)
  WHERE is_active = TRUE;
```

## Table: digest_send_log
```sql
CREATE TABLE digest_send_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES service_categories(id),
  week_start  DATE NOT NULL,
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, week_start)
);

CREATE INDEX idx_digest_log_week ON digest_send_log(week_start);
```

## Table: member_notification_preferences
```sql
CREATE TABLE member_notification_preferences (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id             UUID UNIQUE NOT NULL
                          REFERENCES members(id) ON DELETE CASCADE,
  consultation_requests BOOLEAN DEFAULT TRUE,
  article_status        BOOLEAN DEFAULT TRUE,
  membership_reminders  BOOLEAN DEFAULT TRUE,
  regulatory_nudges     BOOLEAN DEFAULT TRUE,
  platform_updates      BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);
```

## Table: regulatory_updates
```sql
CREATE TABLE regulatory_updates (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source              TEXT NOT NULL,
  source_url          TEXT,
  title               TEXT NOT NULL,
  summary             TEXT,
  relevant_categories UUID[],
  relevant_regions    TEXT[],
  published_date      DATE,
  nudges_sent         INTEGER DEFAULT 0,
  nudges_sent_at      TIMESTAMPTZ,
  is_processed        BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_regulatory_processed ON regulatory_updates(is_processed)
  WHERE is_processed = FALSE;
```

## Table: background_jobs
```sql
CREATE TABLE background_jobs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  queue       TEXT NOT NULL,
  job_type    TEXT NOT NULL,
  status      TEXT DEFAULT 'queued',
              -- 'queued'|'processing'|'completed'|'failed'
  result      JSONB,
  error       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Realtime enabled so frontend can poll via Supabase Realtime
ALTER TABLE background_jobs REPLICA IDENTITY FULL;

CREATE INDEX idx_jobs_user ON background_jobs(user_id);
CREATE INDEX idx_jobs_status ON background_jobs(status);
```

## Table: consent_log
```sql
CREATE TABLE consent_log (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address     INET,
  consent_type   TEXT NOT NULL,
    -- 'terms_privacy'|'application_data'|'linkedin_autofill'
    -- |'cookie'|'marketing'
  consent_given  BOOLEAN NOT NULL,
  version        TEXT NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consent_user ON consent_log(user_id);
```

## Table: email_logs
```sql
CREATE TABLE email_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES users(id) ON DELETE SET NULL,
  to_email         TEXT NOT NULL,
  template_key     TEXT NOT NULL,
  subject          TEXT,
  provider         TEXT,
  provider_msg_id  TEXT,
  status           TEXT NOT NULL, -- 'sent'|'failed'|'bounced'
  error_message    TEXT,
  sent_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_logs_user ON email_logs(user_id);
CREATE INDEX idx_email_logs_template ON email_logs(template_key);
CREATE INDEX idx_email_logs_status ON email_logs(status);
```

## Table: broadcast_logs
```sql
CREATE TABLE broadcast_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sent_by         UUID NOT NULL REFERENCES users(id),
  audience        TEXT NOT NULL,
  service_id      UUID REFERENCES services(id),
  country         TEXT,
  subject         TEXT NOT NULL,
  recipient_count INTEGER DEFAULT 0,
  sent_at         TIMESTAMPTZ DEFAULT NOW()
);
```

## updated_at Trigger (applied to all tables)
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'users','members','applications','articles','events',
    'consultation_requests','seat_allocations',
    'user_digest_subscriptions','member_notification_preferences',
    'background_jobs'
  ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at
       BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t
    );
  END LOOP;
END;
$$;
```

---

# SECTION 4 — DATABASE FUNCTIONS AND TRIGGERS

## Auth Trigger — Auto-create public.users on signup
```sql
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    auth_id, email, first_name, last_name,
    avatar_url, auth_provider, linkedin_id, role
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'given_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'family_name', ''),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.raw_app_meta_data->>'provider' = 'linkedin_oidc'
      THEN 'linkedin'::auth_provider
      ELSE 'email'::auth_provider
    END,
    NEW.raw_user_meta_data->>'sub',
    'user'::user_role
  )
  ON CONFLICT (email)
  DO UPDATE SET
    auth_id       = EXCLUDED.auth_id,
    auth_provider = EXCLUDED.auth_provider,
    linkedin_id   = COALESCE(EXCLUDED.linkedin_id, public.users.linkedin_id),
    avatar_url    = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at    = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();
```

## Seat Management Functions
```sql
-- Atomically claim a seat (returns true if successful)
CREATE OR REPLACE FUNCTION claim_seat(
  p_service_id UUID,
  p_country    TEXT
) RETURNS BOOLEAN AS $$
DECLARE v_claimed BOOLEAN := FALSE;
BEGIN
  UPDATE seat_allocations
  SET    current_count = current_count + 1,
         updated_at    = NOW()
  WHERE  service_id    = p_service_id
    AND  country       = p_country
    AND  current_count < max_seats
  RETURNING TRUE INTO v_claimed;
  RETURN COALESCE(v_claimed, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Release a seat (on expiry or suspension)
CREATE OR REPLACE FUNCTION release_seat(
  p_service_id UUID,
  p_country    TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE seat_allocations
  SET    current_count = GREATEST(current_count - 1, 0),
         updated_at    = NOW()
  WHERE  service_id = p_service_id
    AND  country    = p_country;
END;
$$ LANGUAGE plpgsql;
```

## View Count Function
```sql
CREATE OR REPLACE FUNCTION increment_view_count(
  article_id UUID,
  increment  INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + increment
  WHERE id = article_id;
END;
$$ LANGUAGE plpgsql;
```

## Ops Action Counts (used for ops dashboard badges)
```sql
CREATE OR REPLACE FUNCTION get_ops_action_counts()
RETURNS TABLE (
  pending_applications   BIGINT,
  pending_articles       BIGINT,
  pending_reverification BIGINT,
  expiring_soon          BIGINT
) LANGUAGE sql STABLE AS $$
  SELECT
    (SELECT COUNT(*) FROM applications
     WHERE status IN ('submitted', 'under_review')),
    (SELECT COUNT(*) FROM articles
     WHERE status IN ('submitted', 'under_review')),
    (SELECT COUNT(*) FROM members
     WHERE is_verified = FALSE
       AND re_verification_requested_at IS NOT NULL
       AND membership_status = 'active'),
    (SELECT COUNT(*) FROM members
     WHERE membership_status = 'active'
       AND membership_expiry_date <=
         CURRENT_DATE + INTERVAL '30 days'
       AND membership_expiry_date >= CURRENT_DATE)
$$;
```

## Optimised Indexes for Ops Queries
```sql
CREATE INDEX idx_applications_actionable
  ON applications(status)
  WHERE status IN ('submitted', 'under_review');

CREATE INDEX idx_members_reverification
  ON members(re_verification_requested_at)
  WHERE is_verified = FALSE
    AND re_verification_requested_at IS NOT NULL;

CREATE INDEX idx_members_expiring
  ON members(membership_expiry_date)
  WHERE membership_status = 'active';
```

## Vector Search Functions
```sql
-- Member semantic search
CREATE OR REPLACE FUNCTION search_members(
  query_embedding   vector(1536),
  match_threshold   FLOAT DEFAULT 0.3,
  match_count       INT DEFAULT 20,
  filter_country    TEXT DEFAULT NULL,
  filter_service_id UUID DEFAULT NULL,
  filter_min_years  INT  DEFAULT NULL,
  filter_max_years  INT  DEFAULT NULL,
  filter_verified   BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id                UUID,
  slug              TEXT,
  full_name         TEXT,
  designation       TEXT,
  headline          TEXT,
  city              TEXT,
  country           TEXT,
  member_tier       member_tier,
  is_verified       BOOLEAN,
  profile_photo_url TEXT,
  primary_service   TEXT,
  similarity        FLOAT
) LANGUAGE sql STABLE AS $$
  SELECT
    m.id, m.slug,
    u.first_name || ' ' || u.last_name AS full_name,
    m.designation, m.headline, m.city, m.country,
    m.member_tier, m.is_verified, m.profile_photo_url,
    s.name AS primary_service,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM members m
  JOIN users u ON m.user_id = u.id
  LEFT JOIN services s ON m.primary_service_id = s.id
  WHERE
    m.membership_status = 'active'
    AND m.embedding IS NOT NULL
    AND m.embedding_status = 'generated'
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
    AND (filter_country IS NULL OR m.country = filter_country)
    AND (filter_service_id IS NULL
         OR m.primary_service_id = filter_service_id
         OR EXISTS (
           SELECT 1 FROM member_services ms
           WHERE ms.member_id = m.id
             AND ms.service_id = filter_service_id
         ))
    AND (filter_min_years IS NULL
         OR m.years_of_experience >= filter_min_years)
    AND (filter_max_years IS NULL
         OR m.years_of_experience <= filter_max_years)
    AND (filter_verified IS NULL OR m.is_verified = filter_verified)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Article semantic search
CREATE OR REPLACE FUNCTION search_articles(
  query_embedding    vector(1536),
  match_threshold    FLOAT DEFAULT 0.3,
  match_count        INT DEFAULT 10,
  filter_category_id UUID DEFAULT NULL,
  filter_service_id  UUID DEFAULT NULL,
  exclude_id         UUID DEFAULT NULL
)
RETURNS TABLE (
  id                 UUID,
  slug               TEXT,
  title              TEXT,
  excerpt            TEXT,
  featured_image_url TEXT,
  read_time_minutes  INT,
  published_at       TIMESTAMPTZ,
  category_name      TEXT,
  author_name        TEXT,
  similarity         FLOAT
) LANGUAGE sql STABLE AS $$
  SELECT
    a.id, a.slug, a.title, a.excerpt,
    a.featured_image_url, a.read_time_minutes, a.published_at,
    sc.name AS category_name,
    u.first_name || ' ' || u.last_name AS author_name,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM articles a
  JOIN members m ON a.member_id = m.id
  JOIN users u ON m.user_id = u.id
  LEFT JOIN service_categories sc ON a.category_id = sc.id
  WHERE
    a.status = 'published'
    AND a.embedding IS NOT NULL
    AND a.embedding_status = 'generated'
    AND 1 - (a.embedding <=> query_embedding) > match_threshold
    AND (filter_category_id IS NULL OR a.category_id = filter_category_id)
    AND (filter_service_id IS NULL OR a.service_id = filter_service_id)
    AND (exclude_id IS NULL OR a.id != exclude_id)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Event semantic search
CREATE OR REPLACE FUNCTION search_events(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.3,
  match_count     INT DEFAULT 10,
  filter_country  TEXT DEFAULT NULL,
  filter_format   TEXT DEFAULT NULL
)
RETURNS TABLE (
  id             UUID,
  slug           TEXT,
  title          TEXT,
  event_type     TEXT,
  event_format   TEXT,
  start_datetime TIMESTAMPTZ,
  country        TEXT,
  city           TEXT,
  is_free        BOOLEAN,
  similarity     FLOAT
) LANGUAGE sql STABLE AS $$
  SELECT
    e.id, e.slug, e.title, e.event_type, e.event_format,
    e.start_datetime, e.country, e.city, e.is_free,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM events e
  WHERE
    e.is_published = TRUE
    AND e.start_datetime > NOW()
    AND e.embedding IS NOT NULL
    AND e.embedding_status = 'generated'
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
    AND (filter_country IS NULL OR e.country = filter_country)
    AND (filter_format IS NULL OR e.event_format = filter_format)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;
```

## Weekly Digest Query Function
```sql
CREATE OR REPLACE FUNCTION get_digest_data(p_week_start DATE)
RETURNS TABLE (
  user_id       UUID,
  email         TEXT,
  first_name    TEXT,
  category_id   UUID,
  category_name TEXT,
  frequency     TEXT,
  articles      JSONB
) LANGUAGE sql STABLE AS $$
  SELECT
    u.id AS user_id,
    u.email,
    u.first_name,
    sc.id AS category_id,
    sc.name AS category_name,
    uds.frequency,
    COALESCE(
      json_agg(
        json_build_object(
          'id',                 a.id,
          'slug',               a.slug,
          'title',              a.title,
          'excerpt',            a.excerpt,
          'featured_image_url', a.featured_image_url,
          'read_time_minutes',  a.read_time_minutes,
          'published_at',       a.published_at,
          'author_name',
            au.first_name || ' ' || au.last_name
        ) ORDER BY a.published_at DESC
      ) FILTER (WHERE a.id IS NOT NULL),
      '[]'::json
    )::JSONB AS articles
  FROM user_digest_subscriptions uds
  JOIN users u ON uds.user_id = u.id
  JOIN service_categories sc ON uds.category_id = sc.id
  LEFT JOIN articles a
    ON  a.category_id = uds.category_id
    AND a.status      = 'published'
    AND a.published_at >= p_week_start::TIMESTAMPTZ
    AND a.published_at 
          (p_week_start + INTERVAL '7 days')::TIMESTAMPTZ
  LEFT JOIN members m ON a.member_id = m.id
  LEFT JOIN users au ON m.user_id = au.id
  WHERE
    uds.is_active = TRUE
    AND u.is_active = TRUE
  GROUP BY
    u.id, u.email, u.first_name,
    sc.id, sc.name, uds.frequency
  HAVING (COUNT(a.id) > 0 OR uds.frequency = 'weekly')
$$;
```

---

# SECTION 5 — JSONB FIELD STRUCTURES

These are the exact TypeScript interfaces for all JSONB columns.
Every field that is stored in JSONB must conform to these structures.

## Availability
```typescript
interface Availability {
  days: Array
    'monday'|'tuesday'|'wednesday'|
    'thursday'|'friday'|'saturday'|'sunday'
  >
  timeSlots: Array<'morning'|'afternoon'|'evening'>
  timezone: string          // e.g. 'Asia/Kolkata'
  responseTime: string      // e.g. '24 hours', '48 hours', '1 week'
  preferredContact: Array<'email'|'phone'|'video'>
  notes: string | null      // max 200 chars
}
```

## Engagement
```typescript
interface Engagement {
  type: 'speaking'|'publication'|'board'|'media'|'award'|'other'
  title: string             // "Keynote at ICAI National Conference"
  organisation: string      // "ICAI"
  year: number
  url: string | null
  description: string | null
}
// Stored as Engagement[]
```

## Credential
```typescript
interface Credential {
  name: string              // "CA", "LLB", "CFA"
  institution: string       // "ICAI", "Mumbai University"
  year: number | null
  document_url: string | null   // Supabase storage URL
  is_verified: boolean
  submitted_at: string          // ISO timestamp
  verified_at: string | null
  verified_by: string | null    // ops user UUID
  verified_name: string | null  // ops-entered canonical name
  verified_institution: string | null
  verified_year: number | null
}
// Stored as Credential[]
```

## Testimonial
```typescript
interface Testimonial {
  document_url: string | null   // Supabase storage URL
  giver_name: string | null     // populated by ops after verification
  giver_designation: string | null
  giver_company: string | null
  testimonial_text: string | null
  is_verified: boolean
  submitted_at: string
  verified_at: string | null
  verified_by: string | null    // ops user UUID
}
// Stored as Testimonial[]
```

## WorkExperience
```typescript
interface WorkExperience {
  title: string
  company: string
  startDate: string             // "Jan 2018" or "2018"
  endDate: string | null        // null = current
  description: string | null
  isCurrent: boolean
}
// Stored as WorkExperience[]
```

## Education
```typescript
interface Education {
  institution: string
  degree: string | null
  field: string | null
  startYear: number | null
  endYear: number | null
}
// Stored as Education[]
```

## Event Speaker
```typescript
interface Speaker {
  name: string
  designation: string | null
  organisation: string | null
  bio: string | null
  photoUrl: string | null
}
// Stored as Speaker[] in events.speakers
```

---

# SECTION 6 — ROW LEVEL SECURITY
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE seat_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_digest_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_logs ENABLE ROW LEVEL SECURITY;

-- 🔒 NOTE: NestJS uses service role key which bypasses RLS.
-- These policies protect direct Supabase client access only.

-- Users
CREATE POLICY users_read_own ON users
  FOR SELECT USING (auth_id = auth.uid());

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth_id = auth.uid());

-- Members — public read for active profiles
CREATE POLICY members_public_read ON members
  FOR SELECT USING (membership_status = 'active');

-- Articles — public read for published
CREATE POLICY articles_public_read ON articles
  FOR SELECT USING (status = 'published');

-- Events — public read for published future events
CREATE POLICY events_public_read ON events
  FOR SELECT USING (is_published = TRUE);

-- Taxonomy — always public
CREATE POLICY categories_public_read ON service_categories
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY services_public_read ON services
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY member_services_public_read ON member_services
  FOR SELECT USING (TRUE);

-- Digest subscriptions — users manage own
CREATE POLICY digest_own ON user_digest_subscriptions
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Notification preferences — member manages own
CREATE POLICY notif_prefs_own ON member_notification_preferences
  FOR ALL USING (
    member_id IN (
      SELECT m.id FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );

-- Background jobs — users see own jobs
CREATE POLICY jobs_own ON background_jobs
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Applications — users manage own
CREATE POLICY applications_own ON applications
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- Consultation requests — users see own sent/received
CREATE POLICY consultation_own ON consultation_requests
  FOR SELECT USING (
    user_id IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
    OR
    member_id IN (
      SELECT m.id FROM members m
      JOIN users u ON m.user_id = u.id
      WHERE u.auth_id = auth.uid()
    )
  );
```

---

# SECTION 7 — STORAGE BUCKETS
```sql
-- 1. avatars — public (profile photos)
INSERT INTO storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars', 'avatars', TRUE, 5242880,
  ARRAY['image/jpeg','image/png','image/webp']
);

-- 2. article-images — public
INSERT INTO storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'article-images', 'article-images', TRUE, 5242880,
  ARRAY['image/jpeg','image/png','image/webp']
);

-- 3. documents — private (credentials, testimonials)
INSERT INTO storage.buckets
  (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents', 'documents', FALSE, 10485760,
  ARRAY['application/pdf','image/jpeg','image/png']
);
```

## Storage Path Conventions
```
avatars/          {userId}/profile.webp
article-images/   {articleId}/cover.webp
documents/        {userId}/credentials/{filename}
documents/        {userId}/testimonials/{filename}
documents/        {userId}/linkedin/{timestamp}.pdf
```

## Storage RLS Policies
```sql
CREATE POLICY "Public avatar read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated avatar upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Public article image read" ON storage.objects
  FOR SELECT USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated article image upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'article-images'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Owner reads own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Owner uploads own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

# SECTION 8 — ENVIRONMENT VARIABLES

## apps/api/.env (Backend — NEVER expose)
```bash
# App
PORT=3001
NODE_ENV=production
COOKIE_SECRET=<random 64 char hex string>

# Supabase
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_DB_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres

# Redis (Upstash)
REDIS_HOST=your-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-password

# AI
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Email
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
OPS_EMAIL=ops@expertly.net
SUPPORT_EMAIL=support@expertly.net

# Automation
APIFY_API_TOKEN=apify_api_...

# Payment (manual bank transfer details for K2 email)
PAYMENT_BANK_NAME=
PAYMENT_ACCOUNT_NUMBER=
PAYMENT_SORT_CODE=
PAYMENT_AMOUNT_USD=

# Next.js ISR
NEXT_REVALIDATION_URL=https://expertly.net/api/revalidate
NEXT_REVALIDATION_SECRET=<random 32 char hex string>
```

## apps/web/.env.local (Frontend)
```bash
# Supabase (public — safe for browser)
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# API
NEXT_PUBLIC_API_URL=https://api.expertly.net
NEXT_PUBLIC_APP_URL=https://expertly.net

# ISR (server-side only — no NEXT_PUBLIC prefix)
REVALIDATION_SECRET=<same as NEXT_REVALIDATION_SECRET in api>
API_BUILD_TOKEN=<random 32 char hex string>
```

## 🔒 Security Rules
- `SUPABASE_SERVICE_ROLE_KEY` NEVER in frontend
- `OPENAI_API_KEY` NEVER in frontend
- Any secret NEVER committed to Git
- All secrets in Railway dashboard for production

---

# SECTION 9 — TAXONOMY SEED DATA
```sql
INSERT INTO service_categories
  (id, name, slug, domain, sort_order)
VALUES
  ('cat-001', 'Direct Tax',         'direct-tax',      'finance', 1),
  ('cat-002', 'Indirect Tax',       'indirect-tax',    'finance', 2),
  ('cat-003', 'Accounting',         'accounting',      'finance', 3),
  ('cat-004', 'Audit & Assurance',  'audit-assurance', 'finance', 4),
  ('cat-005', 'Corporate Law',      'corporate-law',   'legal',   5),
  ('cat-006', 'Legal Services',     'legal-services',  'legal',   6),
  ('cat-007', 'Legal - Industries', 'legal-industries','legal',   7),
  ('cat-008', 'Others',             'others',          'both',    8);

-- Direct Tax
INSERT INTO services (category_id, name, slug, sort_order) VALUES
  ('cat-001', 'Corporate Tax',                'corporate-tax',       1),
  ('cat-001', 'Transfer Pricing',             'transfer-pricing',    2),
  ('cat-001', 'International Tax',            'international-tax',   3),
  ('cat-001', 'M&A Tax',                      'ma-tax',              4),
  ('cat-001', 'Tax Compliances',              'tax-compliances',     5),
  ('cat-001', 'Tax Litigation',               'tax-litigation',      6),
  ('cat-001', 'Estate & Succession Planning', 'estate-succession',   7);

-- Indirect Tax
INSERT INTO services (category_id, name, slug, regions, sort_order) VALUES
  ('cat-002', 'GST Advisory',   'gst-advisory',  ARRAY['IN'],      1),
  ('cat-002', 'GST Compliance', 'gst-compliance',ARRAY['IN'],      2),
  ('cat-002', 'GST Litigation', 'gst-litigation',ARRAY['IN'],      3),
  ('cat-002', 'Customs & Trade','customs-trade', NULL,             4),
  ('cat-002', 'VAT Advisory',   'vat-advisory',  ARRAY['AE','UK'], 5),
  ('cat-002', 'Excise & Duties','excise-duties', NULL,             6);

-- Accounting
INSERT INTO services (category_id, name, slug, sort_order) VALUES
  ('cat-003', 'Bookkeeping',         'bookkeeping',         1),
  ('cat-003', 'Financial Reporting', 'financial-reporting', 2),
  ('cat-003', 'Management Accounts', 'management-accounts', 3),
  ('cat-003', 'Payroll',             'payroll',             4),
  ('cat-003', 'Virtual CFO',         'virtual-cfo',         5);

-- Audit & Assurance
INSERT INTO services (category_id, name, slug, sort_order) VALUES
  ('cat-004', 'Statutory Audit', 'statutory-audit', 1),
  ('cat-004', 'Internal Audit',  'internal-audit',  2),
  ('cat-004', 'Due Diligence',   'due-diligence',   3),
  ('cat-004', 'Forensic Audit',  'forensic-audit',  4);

-- Corporate Law
INSERT INTO services (category_id, name, slug, sort_order) VALUES
  ('cat-005', 'Company Incorporation','company-incorporation', 1),
  ('cat-005', 'Corporate Governance', 'corporate-governance',  2),
  ('cat-005', 'M&A Advisory',         'ma-advisory',           3),
  ('cat-005', 'Securities Law',       'securities-law',        4),
  ('cat-005', 'Regulatory Compliance','regulatory-compliance', 5);

-- Legal Services
INSERT INTO services (category_id, name, slug, sort_order) VALUES
  ('cat-006', 'Contract Drafting',    'contract-drafting',    1),
  ('cat-006', 'Dispute Resolution',   'dispute-resolution',   2),
  ('cat-006', 'Employment Law',       'employment-law',       3),
  ('cat-006', 'Intellectual Property','intellectual-property',4),
  ('cat-006', 'Real Estate Law',      'real-estate-law',      5);
```

---

# SECTION 10 — NESTJS BOOTSTRAP

## main.ts
```typescript
import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication
} from '@nestjs/platform-fastify'
import { VersioningType, Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  // Startup validation — fail fast if env vars missing
  const required = [
    'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_ANON_KEY',
    'REDIS_HOST', 'COOKIE_SECRET', 'OPENAI_API_KEY',
    'RESEND_API_KEY', 'APIFY_API_TOKEN',
    'NEXT_REVALIDATION_URL', 'NEXT_REVALIDATION_SECRET'
  ]
  const missing = required.filter(k => !process.env[k])
  if (missing.length) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`)
  }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY ===
      process.env.SUPABASE_ANON_KEY) {
    throw new Error('SERVICE_ROLE_KEY must not equal ANON_KEY')
  }

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false })
  )

  // Fastify plugins
  await app.register(
    require('@fastify/cookie'),
    { secret: process.env.COOKIE_SECRET }
  )
  await app.register(require('@fastify/multipart'), {
    limits: { fileSize: 15 * 1024 * 1024 } // 15MB
  })
  await app.register(require('@fastify/helmet'), {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: [
          "'self'", 'data:', 'blob:',
          '*.supabase.co', 'storage.expertly.net'
        ],
        fontSrc: ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
        frameSrc: ["'none'"],
        connectSrc: ["'self'", '*.supabase.co']
      }
    }
  })

  // CORS
  const isProd = process.env.NODE_ENV === 'production'
  app.enableCors({
    origin: isProd
      ? ['https://expertly.net', 'https://www.expertly.net']
      : ['http://localhost:3000'],
    credentials: true,
    maxAge: 86400
  })

  // API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v'
  })

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }))

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor()
  )

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter())

  const port = process.env.PORT ?? 3001
  await app.listen(port, '0.0.0.0')
  logger.log(`API running on port ${port}`)
}

bootstrap()
```

## Response Interceptor (envelope + camelCase)
```typescript
// common/interceptors/response.interceptor.ts
import {
  Injectable, NestInterceptor,
  ExecutionContext, CallHandler
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import _ from 'lodash'

function normalizeDate(value: unknown): unknown {
  if (typeof value === 'string') {
    const iso = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
    if (iso) {
      return new Date(value).toISOString()
    }
  }
  return value
}

function deepCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(deepCamelCase)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        _.camelCase(k),
        deepCamelCase(normalizeDate(v))
      ])
    )
  }
  return normalizeDate(obj)
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Observable<unknown> {
    // Skip SSE streams
    const response = context.switchToHttp().getResponse()
    if (response.getHeader?.('content-type')
        ?.includes('text/event-stream')) {
      return next.handle()
    }

    return next.handle().pipe(
      map(data => {
        if (data && typeof data === 'object' && 'data' in data
            && 'meta' in data) {
          return {
            success: true,
            data: deepCamelCase(data.data),
            meta: deepCamelCase(data.meta)
          }
        }
        return { success: true, data: deepCamelCase(data) }
      })
    )
  }
}
```

## HTTP Exception Filter
```typescript
// common/filters/http-exception.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger
} from '@nestjs/common'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof HttpException
      ? (exception.getResponse() as Record<string, unknown>)
          .message ?? exception.message
      : 'Internal server error'

    const code = exception instanceof HttpException
      ? (exception.getResponse() as Record<string, unknown>)
          .error ?? exception.message
      : 'INTERNAL_ERROR'

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : String(exception)
      )
    }

    response.status(status).send({
      success: false,
      error: {
        code: String(code).toUpperCase().replace(/ /g, '_'),
        message,
        statusCode: status,
        path: request.url,
        timestamp: new Date().toISOString()
      }
    })
  }
}
```

## JWT Auth Guard
```typescript
// common/guards/jwt-auth.guard.ts
import {
  Injectable, CanActivate, ExecutionContext,
  UnauthorizedException, Logger
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { SupabaseService } from '../services/supabase.service'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name)

  constructor(
    private readonly supabase: SupabaseService,
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'isPublic',
      [context.getHandler(), context.getClass()]
    )
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    const token = this.extractToken(request)

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }

    const { data: { user }, error } =
      await this.supabase.adminClient.auth.getUser(token)

    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token')
    }

    const { data: dbUser } = await this.supabase.adminClient
      .from('users')
      .select('id, role, is_active, is_deleted')
      .eq('auth_id', user.id)
      .single()

    if (!dbUser || !dbUser.is_active || dbUser.is_deleted) {
      throw new UnauthorizedException('Account not active')
    }

    // Check for suspended member
    let effectiveRole = dbUser.role
    let isSuspended = false
    let memberId: string | undefined

    if (dbUser.role === 'member') {
      const { data: member } = await this.supabase.adminClient
        .from('members')
        .select('id, membership_status')
        .eq('user_id', dbUser.id)
        .single()

      if (member) {
        memberId = member.id
        if (member.membership_status === 'suspended') {
          effectiveRole = 'user'
          isSuspended = true
        }
      }
    }

    request.user = {
      ...user,
      dbId: dbUser.id,
      role: effectiveRole,
      isSuspended,
      memberId
    }

    return true
  }

  private extractToken(request: Record<string, unknown>): string | null {
    const headers = request.headers as Record<string, string>
    const auth = headers['authorization']
    if (auth?.startsWith('Bearer ')) {
      return auth.slice(7)
    }
    const cookies = request.cookies as Record<string, string>
    return cookies?.['sb-access-token'] ?? null
  }
}
```

## Optional JWT Guard
```typescript
// common/guards/optional-jwt.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common'
import { JwtAuthGuard } from './jwt-auth.guard'

@Injectable()
export class OptionalJwtAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await super.canActivate(context)
    } catch {
      // No token or invalid token — continue as guest
      return true
    }
  }
}
```

## Roles Guard
```typescript
// common/guards/roles.guard.ts
import {
  Injectable, CanActivate,
  ExecutionContext, ForbiddenException
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'

const ROLE_LEVELS: Record<string, number> = {
  user: 1, member: 2, ops: 3, backend_admin: 4
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      'roles',
      [context.getHandler(), context.getClass()]
    )
    if (!requiredRoles?.length) return true

    const { user } = context.switchToHttp().getRequest()
    if (!user) throw new ForbiddenException('Authentication required')

    const userLevel = ROLE_LEVELS[user.role] ?? 0
    const minLevel = Math.min(
      ...requiredRoles.map(r => ROLE_LEVELS[r] ?? 99)
    )

    if (userLevel < minLevel) {
      throw new ForbiddenException('Insufficient permissions')
    }

    return true
  }
}
```

## Decorators
```typescript
// common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common'
export const Public = () => SetMetadata('isPublic', true)

// common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common'
export const Roles = (...roles: string[]) =>
  SetMetadata('roles', roles)

// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
export const CurrentUser = createParamDecorator(
  (field: string | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user
    return field ? user?.[field] : user
  }
)
```

---

# SECTION 11 — SHARED SERVICES

## SupabaseService
```typescript
// common/services/supabase.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name)

  readonly adminClient: SupabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      db: { schema: 'public' }
    }
  )

  async revalidatePath(path: string): Promise<void> {
    try {
      await fetch(process.env.NEXT_REVALIDATION_URL!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: process.env.NEXT_REVALIDATION_SECRET,
          path
        })
      })
    } catch (err) {
      // Non-fatal — log and continue
      this.logger.warn(`ISR revalidation failed for ${path}: ${err}`)
    }
  }
}
```

## RedisService
```typescript
// common/services/redis.service.ts
import {
  Injectable, OnModuleDestroy, Logger
} from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name)

  readonly client: Redis = new Redis({
    host:     process.env.REDIS_HOST!,
    port:     parseInt(process.env.REDIS_PORT ?? '6379'),
    password: process.env.REDIS_PASSWORD,
    tls:      process.env.NODE_ENV === 'production' ? {} : undefined,
    retryStrategy: (times) => {
      if (times > 10) return null  // Stop retrying
      return Math.min(times * 500, 2000)  // Exponential backoff
    },
    reconnectOnError: (err) => {
      const target = err.message
      return target.includes('READONLY') ||
             target.includes('ECONNRESET')
    }
  })

  constructor() {
    this.client.on('connect', () =>
      this.logger.log('Redis connected'))
    this.client.on('error', (err) =>
      this.logger.error(`Redis error: ${err.message}`))
  }

  async onModuleDestroy() {
    await this.client.quit()
  }
}
```

## CacheService
```typescript
// common/services/cache.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { RedisService } from './redis.service'
import crypto from 'crypto'

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)

  constructor(private readonly redis: RedisService) {}

  buildKey(
    prefix: string,
    params?: Record<string, unknown>
  ): string {
    if (!params) return prefix
    const sorted = JSON.stringify(
      Object.fromEntries(
        Object.entries(params).sort(([a], [b]) => a.localeCompare(b))
      )
    )
    const hash = crypto
      .createHash('md5').update(sorted).digest('hex').slice(0, 8)
    return `${prefix}:${hash}`
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.client.get(key)
      return value ? JSON.parse(value) : null
    } catch {
      return null
    }
  }

  async set(
    key: string,
    value: unknown,
    ttlSeconds: number
  ): Promise<void> {
    try {
      await this.redis.client.setex(
        key, ttlSeconds, JSON.stringify(value)
      )
    } catch (err) {
      this.logger.warn(`Cache set failed for ${key}: ${err}`)
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await this.redis.client.del(...keys)
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.client.keys(pattern)
      if (keys.length) await this.redis.client.del(...keys)
    } catch (err) {
      this.logger.warn(`Cache delByPattern failed: ${err}`)
    }
  }

  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    // Stampede protection
    const lockKey = `lock:${key}`
    const locked = await this.redis.client.set(
      lockKey, '1', 'EX', 10, 'NX'
    )

    if (!locked) {
      // Wait briefly and try cache again
      await new Promise(r => setTimeout(r, 200))
      const retry = await this.get<T>(key)
      if (retry !== null) return retry
    }

    try {
      const value = await fetchFn()
      await this.set(key, value, ttlSeconds)
      return value
    } finally {
      await this.redis.client.del(lockKey)
    }
  }
}
```

---

# SECTION 12 — API CONTRACT

## Base URL
```
Development: http://localhost:3001/api/v1
Production:  https://api.expertly.net/api/v1
```

## Response Envelope (all responses)
```typescript
// Success
{ success: true, data: T }
{ success: true, data: T[], meta: PaginationMeta }

// Error
{
  success: false,
  error: {
    code: string,       // e.g. "NOT_FOUND", "FORBIDDEN"
    message: string,
    statusCode: number,
    path: string,
    timestamp: string
  }
}

interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}
```

## All Endpoints

### Health
```
GET  /health                    Public    Returns system status
```

### Auth
```
POST /auth/sync                 JWT       Sync Supabase auth user to DB
GET  /auth/me                   JWT       Get current user + role
POST /auth/logout               JWT       Clear session
```

### Homepage
```
GET  /homepage                  Public    Featured members + latest articles
                                          + upcoming events
```

### Taxonomy
```
GET  /taxonomy/categories       Public    All service categories
GET  /taxonomy/services         Public    All services (filterable by category)
GET  /taxonomy/services/:slug   Public    Single service by slug
```

### Members
```
GET  /members/featured          Public    Featured members (homepage)
GET  /members/me                JWT+Member  Own full profile
PATCH /members/me               JWT+Member  Update own profile
PATCH /members/me/notifications JWT+Member  Update notification prefs
POST /members/search/ai         OptJWT    AI-powered member search
GET  /members                   OptJWT    Member list (teaser for guests)
GET  /members/id/:id            JWT       Member by UUID
GET  /members/:slug             OptJWT    Member by slug
```

### Applications
```
GET  /applications/me           JWT       Own application (latest)
POST /applications              JWT       Create draft application
PATCH /applications/:id/step-1  JWT       Save step 1
PATCH /applications/:id/step-2  JWT       Save step 2
PATCH /applications/:id/step-3  JWT       Save step 3
POST /applications/:id/submit   JWT       Submit application
```

### Articles
```
POST /articles/search/ai        OptJWT    AI article search
POST /articles/generate         JWT+Member  SSE AI generation stream
GET  /articles/member/me        JWT+Member  Own articles
GET  /articles                  OptJWT    Published articles list
POST /articles                  JWT+Member  Create draft article
GET  /articles/id/:id           JWT+Member  Article by UUID (own only)
GET  /articles/:slug            OptJWT    Published article by slug
GET  /articles/:id/related      OptJWT    Related articles
PATCH /articles/:id             JWT+Member  Update article
DELETE /articles/:id            JWT+Member  Delete draft article
POST /articles/:id/submit       JWT+Member  Submit for review
```

### Events
```
GET  /events                    OptJWT    Events list
GET  /events/:slug              OptJWT    Event by slug
```

### Consultation
```
POST /consultation-requests              JWT  Send request to member
GET  /consultation-requests/received     JWT+Member  Received requests
GET  /consultation-requests/sent         JWT  Sent requests
PATCH /consultation-requests/:id/status  JWT+Member  Update status
```

### Search
```
GET  /search?q=&type=           OptJWT    Global search (members+articles+events)
```

### Upload
```
POST /upload/avatar             JWT       Upload + resize profile photo
POST /upload/article-image      JWT+Member  Upload + resize article image
POST /upload/document           JWT       Upload credential/testimonial doc
```

### Automation
```
POST /automation/linkedin-scrape      JWT  Trigger LinkedIn scrape
POST /automation/parse-linkedin-pdf   JWT  Parse LinkedIn PDF
GET  /automation/job/:jobId/status    JWT  Poll job status
GET  /automation/job/:jobId/result    JWT  Get job result
```

### Dashboard (Member)
```
GET  /dashboard/stats           JWT+Member  Member dashboard stats
```

### Ops
```
GET    /ops/applications              Ops  List applications
GET    /ops/applications/:id          Ops  Application detail
PATCH  /ops/applications/:id/approve  Ops  Approve application
PATCH  /ops/applications/:id/reject   Ops  Reject application
PATCH  /ops/applications/:id/waitlist Ops  Waitlist application

GET    /ops/members                   Ops  List members
GET    /ops/members/:id               Ops  Member detail
POST   /ops/members/:id/activate      Ops  Activate member
PATCH  /ops/members/:id/verify        Ops  Award verified badge
PATCH  /ops/members/:id/suspend       Ops  Suspend member
PATCH  /ops/members/:id/tier          Ops  Upgrade tier
PATCH  /ops/members/:id/featured      Ops  Toggle featured
PATCH  /ops/members/:id/credentials   Ops  Verify credential
PATCH  /ops/members/:id/testimonials  Ops  Verify testimonial
PATCH  /ops/members/:id/approve-service-change  Ops  Approve service change
PATCH  /ops/members/:id/reject-service-change   Ops  Reject service change
PATCH  /ops/members/:id/renew         Ops  Renew membership

GET    /ops/articles                  Ops  List articles
PATCH  /ops/articles/:id/approve      Ops  Approve + publish article
PATCH  /ops/articles/:id/reject       Ops  Reject article
PATCH  /ops/articles/:id/archive      Ops  Archive published article

POST   /ops/events                    Ops  Create event
PATCH  /ops/events/:id                Ops  Update event
DELETE /ops/events/:id                Ops  Delete event

GET    /ops/seats                     Ops  Seat allocations
POST   /ops/seats                     Ops  Create allocation
PATCH  /ops/seats/:id                 Ops  Update max seats

POST   /ops/broadcast                 Admin  Send broadcast email
GET    /ops/broadcast-logs            Ops    Broadcast history
GET    /ops/regulatory-updates        Ops    Ingested regulatory updates
```

### Admin
```
GET    /admin/users              Admin  All users
GET    /admin/stats              Admin  Platform statistics
PATCH  /admin/users/:id/role     Admin  Change user role
DELETE /admin/users/:id          Admin  Soft-delete + anonymise user
GET    /admin/consent-logs       Admin  Consent log
GET    /admin/email-logs         Admin  Email delivery log
```

---

# SECTION 13 — AUTHENTICATION FLOW

## LinkedIn OAuth Flow (Complete)
```
1. User clicks "Sign in with LinkedIn"
2. Frontend calls: supabase.auth.signInWithOAuth({
     provider: 'linkedin_oidc',
     options: { redirectTo: 'https://expertly.net/auth/callback' }
   })
3. Browser redirects to LinkedIn
4. User authorises (or cancels)
5. LinkedIn redirects to /auth/callback?code=xxx
   (or /auth/callback?error=access_denied if cancelled)
6. /auth/callback/route.ts handles all states (see below)
7. POST /auth/sync called to create/update public.users record
```

## Auth Callback Route Handler
```typescript
// apps/web/app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  // Case 1: User cancelled LinkedIn OAuth
  if (error || !code) {
    return NextResponse.redirect(`${origin}/`)
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.delete({ name, ...options })
      }
    }
  )

  const { data: { session }, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(code)

  // Case 2: Code exchange failed
  if (exchangeError || !session) {
    return NextResponse.redirect(`${origin}/?authError=oauth_failed`)
  }

  // Get user role from database
  const { data: user } = await supabase
    .from('users')
    .select('id, role, is_active, is_deleted')
    .eq('auth_id', session.user.id)
    .single()

  if (!user) {
    return NextResponse.redirect(`${origin}/`)
  }

  if (!user.is_active || user.is_deleted) {
    await supabase.auth.signOut()
    return NextResponse.redirect(
      `${origin}/auth?error=account_suspended`
    )
  }

  // Route by role
  switch (user.role) {
    case 'backend_admin':
    case 'ops':
      return NextResponse.redirect(`${origin}/ops`)

    case 'member':
      return NextResponse.redirect(`${origin}/member/dashboard`)

    case 'user': {
      const { data: application } = await supabase
        .from('applications')
        .select('id, status, re_application_eligible_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (application) {
        switch (application.status) {
          case 'draft':
            return NextResponse.redirect(`${origin}/application`)
          case 'submitted':
          case 'under_review':
          case 'approved':
          case 'waitlisted':
            return NextResponse.redirect(
              `${origin}/application/status`
            )
          case 'rejected': {
            const eligible = application.re_application_eligible_at
              ? new Date(application.re_application_eligible_at)
                  <= new Date()
              : false
            return NextResponse.redirect(
              `${origin}/application/status${eligible
                ? '?canReApply=true' : ''}`
            )
          }
        }
      }
      return NextResponse.redirect(`${origin}/`)
    }

    default:
      return NextResponse.redirect(`${origin}/`)
  }
}
```

## Token Refresh Strategy
```typescript
// apps/web/lib/apiClient.ts
// Industry standard: silent refresh via Supabase client
// The Supabase JS client automatically refreshes the access token
// when it expires, before making the next request.
// The 401 interceptor below handles the edge case where
// the refresh token itself has expired (user inactive 60+ days)

import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number
  ) {
    super(message)
  }
}

async function getAuthHeader(): Promise<HeadersInit> {
  // getSession() triggers silent refresh if token expired
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return {}
  return { Authorization: `Bearer ${session.access_token}` }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Record<string, string | number | boolean | undefined>
): Promise<{ data: T; meta?: unknown }> {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1${path}`
  )

  if (params) {
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null)
      .forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }

  const headers = await getAuthHeader()

  const response = await fetch(url.toString(), {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include'
  })

  // 401 — attempt one silent refresh
  if (response.status === 401) {
    const { data: { session: refreshed }, error } =
      await supabase.auth.refreshSession()

    if (error || !refreshed) {
      const returnUrl = encodeURIComponent(window.location.pathname)
      window.location.href = `/auth?returnTo=${returnUrl}`
      throw new ApiError('SESSION_EXPIRED', 'Session expired', 401)
    }

    // Retry once with new token
    const retryResponse = await fetch(url.toString(), {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${refreshed.access_token}`
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    })

    if (!retryResponse.ok) {
      const err = await retryResponse.json()
      throw new ApiError(
        err.error?.code ?? 'ERROR',
        err.error?.message ?? 'Request failed',
        retryResponse.status
      )
    }

    return retryResponse.json()
  }

  if (!response.ok) {
    const err = await response.json()
    throw new ApiError(
      err.error?.code ?? 'ERROR',
      err.error?.message ?? 'Request failed',
      response.status
    )
  }

  return response.json()
}

export const apiClient = {
  get:    <T>(path: string, params?: Record<string, unknown>) =>
            request<T>('GET', path, undefined,
              params as Record<string, string | undefined>),
  post:   <T>(path: string, body?: unknown) =>
            request<T>('POST', path, body),
  patch:  <T>(path: string, body?: unknown) =>
            request<T>('PATCH', path, body),
  delete: <T>(path: string) =>
            request<T>('DELETE', path)
}
```

---

# SECTION 14 — QUEUE ARCHITECTURE

## Queue Names and Job Types
```typescript
// apps/api/src/config/queue.config.ts

export const QUEUE_NAMES = {
  LINKEDIN:    'linkedin-queue',
  AI:          'ai-queue',
  EMAIL:       'email-queue',
  DIGEST:      'digest-queue',
  RSS:         'rss-queue',
  MAINTENANCE: 'maintenance-queue'
} as const

export const QUEUE_JOB_TYPES = {
  // LinkedIn queue
  LINKEDIN_SCRAPE:         'linkedin_scrape',
  LINKEDIN_PDF_PARSE:      'linkedin_pdf_parse',
  // AI queue
  GENERATE_EMBEDDING:      'generate_embedding',
  // Email queue
  SEND_EMAIL:              'send_email',
  // Digest queue
  SEND_WEEKLY_DIGEST:      'send_weekly_digest',
  SEND_DIGEST_BATCH:       'send_digest_batch',
  // RSS queue
  INGEST_ALL_FEEDS:        'ingest_all_feeds',
  INGEST_SINGLE_FEED:      'ingest_single_feed',
  PROCESS_REGULATORY:      'process_regulatory_update',
  // Maintenance queue
  FLUSH_VIEW_COUNTS:       'flush_view_counts',
  CLEANUP_OLD_JOBS:        'cleanup_old_jobs'
} as const
```

## Queue Configurations
```typescript
export const QUEUE_CONFIG = {
  [QUEUE_NAMES.LINKEDIN]: {
    concurrency: 2,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 10_000 },
      removeOnComplete: { age: 3600, count: 50 },
      removeOnFail: { age: 86400 }
    }
  },
  [QUEUE_NAMES.AI]: {
    concurrency: 5,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 3600, count: 100 },
      removeOnFail: { age: 86400 }
    }
  },
  [QUEUE_NAMES.EMAIL]: {
    concurrency: 10,
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: { age: 3600, count: 200 },
      removeOnFail: { age: 86400 * 7 }
    }
  },
  [QUEUE_NAMES.DIGEST]: {
    concurrency: 1,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'fixed', delay: 60_000 },
      removeOnComplete: { age: 86400, count: 10 },
      removeOnFail: { age: 86400 * 3 }
    }
  },
  [QUEUE_NAMES.RSS]: {
    concurrency: 3,
    defaultJobOptions: {
      attempts: 2,
      backoff: { type: 'exponential', delay: 30_000 },
      removeOnComplete: { age: 3600, count: 30 },
      removeOnFail: { age: 86400 }
    }
  },
  [QUEUE_NAMES.MAINTENANCE]: {
    concurrency: 1,
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: { age: 3600, count: 20 },
      removeOnFail: { age: 86400 }
    }
  }
}
```

---

# SECTION 15 — SCHEDULED JOBS

All cron jobs are in `SchedulerService` using `@nestjs/schedule`.
```typescript
// Daily 1:00 AM UTC — Membership Expiry
@Cron('0 1 * * *')
async handleMembershipExpiry() {
  // Query members where membership_expiry_date <= today
  // Call opsService.downgradeToUser(memberId) for each
  // Sends K14 email, releases seat, downgrades role
}

// Daily 2:00 AM UTC — Renewal Reminders
@Cron('0 2 * * *')
async handleRenewalReminders() {
  // Query members where expiry_date = today + 30 days
  // Send K13 email to each
}

// Monday 8:00 AM UTC — Weekly Digest
@Cron('0 8 * * 1')
async handleWeeklyDigest() {
  // Queue SEND_WEEKLY_DIGEST job with weekStart date
}

// Daily 6:00 AM UTC — RSS Ingestion
@Cron('0 6 * * *')
async handleRssIngestion() {
  // Queue INGEST_ALL_FEEDS job
}

// Every 15 Minutes — Flush Article View Counts
@Cron('*/15 * * * *')
async flushViewCounts() {
  // Read article:views:* keys from Redis
  // Batch call increment_view_count() RPC
  // Delete Redis keys after flush
}

// Daily 3:00 AM UTC — Retry Failed Embeddings
@Cron('0 3 * * *')
async retryFailedEmbeddings() {
  // Query articles + members with embedding_status = 'failed'
  // Queue GENERATE_EMBEDDING jobs (limit 20 each)
}
```

---

# SECTION 16 — RSS FEEDS
```typescript
export const RSS_FEEDS = [
  // India
  {
    source: 'CBIC',
    url: 'https://www.cbic.gov.in/rss',
    categories: ['indirect-tax'],
    regions: ['IN']
  },
  {
    source: 'MCA',
    url: 'https://www.mca.gov.in/content/mca/global/en/mca/rss.html',
    categories: ['corporate-law'],
    regions: ['IN']
  },
  {
    source: 'RBI',
    url: 'https://rbi.org.in/scripts/rss.aspx',
    categories: ['accounting', 'audit-assurance'],
    regions: ['IN']
  },
  {
    source: 'SEBI',
    url: 'https://www.sebi.gov.in/sebiweb/other/rss/sebi_rss.xml',
    categories: ['corporate-law', 'legal-services'],
    regions: ['IN']
  },
  // Singapore
  {
    source: 'MAS',
    url: 'https://www.mas.gov.sg/rss/news',
    categories: ['accounting', 'legal-services'],
    regions: ['SG']
  },
  {
    source: 'ACRA',
    url: 'https://www.acra.gov.sg/rss',
    categories: ['corporate-law'],
    regions: ['SG']
  },
  // USA
  {
    source: 'IRS',
    url: 'https://www.irs.gov/newsroom/irs-guidance/rss',
    categories: ['direct-tax'],
    regions: ['US']
  },
  {
    source: 'SEC',
    url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&output=atom',
    categories: ['corporate-law', 'legal-services'],
    regions: ['US']
  },
  // UAE — no RSS feed, manual entry only
  {
    source: 'UAE_FTA',
    url: null,
    categories: ['indirect-tax'],
    regions: ['AE'],
    manual: true
  }
]
```

---

# SECTION 17 — EMAIL TEMPLATES

## Complete Template Reference
| Key | Trigger | Subject |
|-----|---------|---------|
| K1  | Application submitted → ops | `New application: {name} — {service}` |
| K2  | Application approved → applicant | `Your Expertly application has been approved` |
| K3  | Application rejected | `Update on your Expertly application` |
| K4  | Application waitlisted | `You've been added to the Expertly waitlist` |
| K5  | Seat opened broadcast | `Good news — a spot has opened for {service}` |
| K6  | Consultation request → member | `New consultation request from {requester}` |
| K7  | Consultation sent → confirmation | `Your consultation request has been sent` |
| K8  | Article submitted → ops | `New article for review: {title}` |
| K9  | Article approved | `Your article has been published!` |
| K10 | Article rejected | `Update on your article submission` |
| K11 | Verified badge removed | `Your verified badge has been temporarily removed` |
| K12 | Verified badge restored | `Your verified badge has been restored` |
| K13 | Membership renewal reminder | `Your Expertly membership expires in 30 days` |
| K14 | Membership expired | `Your Expertly membership has expired` |
| K15 | Weekly/fortnightly digest | `Your {category} digest — {date}` |
| K16 | Regulatory nudge | `New update relevant to your practice` |
| K17 | Member welcome (activation) | `Welcome to Expertly — your membership is now active!` |
| K18 | User welcome (signup) | `Welcome to Expertly` |
| K19 | Service change approved | `Your service change has been approved` |
| K20 | Service change rejected | `Update on your service change request` |
| K21 | Article archived by ops | `Update on your published article` |
| K22 | Membership renewed | `Your Expertly membership has been renewed` |

## K2 Email — Must Include Payment Instructions
```
K2 template variables:
- firstName
- serviceAssigned (service name)
- tier (Budding Entrepreneur / Seasoned Professional)
- bankName (from PAYMENT_BANK_NAME env var)
- accountNumber (from PAYMENT_ACCOUNT_NUMBER env var)
- sortCode (from PAYMENT_SORT_CODE env var)
- amount (from PAYMENT_AMOUNT_USD env var)
- referenceCode ("EXPERTLY-{firstName}-{lastName}")

K2 body must say:
"Please make payment of ${amount} USD via bank transfer:
Bank: {bankName}
Account: {accountNumber}
Sort Code: {sortCode}
Reference: {referenceCode}

Once payment is confirmed, our team will activate your
account within 1 business day."
```

## Base Email Template
```typescript
export function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont,
               'Segoe UI', sans-serif; background: #f9fafb;
               margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto;
                     background: white; border-radius: 8px;
                     overflow: hidden; }
        .header { background: #1e3a5f; padding: 24px 32px; }
        .header-logo { color: white; font-size: 22px;
                       font-weight: 700; text-decoration: none; }
        .content { padding: 32px; color: #374151; line-height: 1.6; }
        .cta-button { display: inline-block; background: #1e3a5f;
                      color: white; padding: 12px 24px;
                      border-radius: 6px; text-decoration: none;
                      font-weight: 600; margin: 16px 0; }
        .footer { background: #f3f4f6; padding: 24px 32px;
                  font-size: 13px; color: #6b7280; text-align: center; }
        .divider { border: none; border-top: 1px solid #e5e7eb;
                   margin: 24px 0; }
        .disclaimer { font-size: 12px; color: #9ca3af;
                      font-style: italic; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="https://expertly.net" class="header-logo">
            Expertly
          </a>
        </div>
        <div class="content">${content}</div>
        <div class="footer">
          <p>Expertly — The professional network for
             finance &amp; legal experts</p>
          <p>
            <a href="https://expertly.net/privacy">Privacy</a>
            &nbsp;·&nbsp;
            <a href="https://expertly.net/terms">Terms</a>
            &nbsp;·&nbsp;
            <a href="https://expertly.net/dashboard">Preferences</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}
```

---

# SECTION 18 — MEMBER LIFECYCLE (Complete State Machine)

## Application States
```
draft → submitted → under_review → approved → [activated as member]
                                 → rejected  (re-apply after 6 months)
                                 → waitlisted (notified when seat opens)
draft → archived  (auto-expiry Phase 2, not MVP)
```

## ► Business Rules for Application
- Max 2 applications in submitted/under_review at once
- Rejected applicants wait 6 months before re-applying
- Waitlisted applicants are notified via K5 broadcast when seat opens
- Ops cannot approve their own application
- Ops cannot approve without checking seat availability first
- If approved + no seat available → must waitlist instead

## Member Activation (POST /ops/members/:id/activate)
```
1. Validate application status = 'approved'
2. Validate operator ≠ applicant (no self-activation)
3. Call claim_seat() atomically
4. If claim fails → throw ConflictException (no seats)
5. Generate unique slug ({firstName}-{lastName}, collision retry)
6. Create members record with all fields from application
7. Set payment_received_at and payment_received_by from DTO
8. Create member_services records (primary + secondary)
9. Upgrade user role to 'member'
10. Create member_notification_preferences (all true by default)
11. Auto-subscribe to primary service category digest
12. Update application status to 'approved', set approved_at
13. Queue GENERATE_EMBEDDING job for new member
14. Invalidate caches (members:list:*, homepage:data)
15. ISR revalidate /members/{slug}
16. Send K17 welcome email
```

## Verified Badge Rules
- ► Awarded manually by ops after reviewing credentials
- ► Removed automatically when member edits profile fields
  (headline, bio, designation, qualifications, credentials,
   work_experience, education)
- ► When removed: set is_verified=false,
  re_verification_requested_at=now(),
  re_verification_reason="Fields updated: {changed fields}"
- ► K11 email sent to member when badge removed
- ► K12 email sent when badge re-awarded by ops
- ► Ops can filter ?pendingReVerification=true to find these

## Membership Renewal (POST /ops/members/:id/renew)
```
DTO: { paymentReceivedAt: string, renewalPeriodYears: 1 }

1. Update membership_expiry_date + 1 year
2. If status was 'expired' → set to 'active'
3. If role was downgraded to 'user' → restore to 'member'
4. Set payment_received_at and payment_received_by
5. Send K22 renewal confirmation email
6. Invalidate caches
```

## Member Tier Assignment Guidelines
```
Budding Entrepreneur: typically fewer than 10 years of independent
practice, emerging professional, or building their practice.

Seasoned Professional: typically 10+ years of independent practice,
recognised expertise, established client base, leadership roles.

► Ops applies discretion. A formal rule book is maintained
  separately by the ops lead and updated as the platform matures.
► Tier upgrade is one-way: budding → seasoned only.
  Never downgrade.
```

---

# SECTION 19 — ARTICLE LIFECYCLE

## Article States
```
draft → submitted → under_review → published
                                 → rejected → draft (member edits)
published → archived (ops only, immediate takedown)
```

## ► Business Rules for Articles
- Word count: 300 minimum, 5000 maximum
- Featured image: required before submission
- Max 2 articles in submitted/under_review simultaneously
- Excerpt: auto-generated server-side on create/update
  (first 200 chars of HTML-stripped body)
- Slug: auto-generated from title, collision retry with suffix
- Tags: member-set free-form, max 5, lowercased, max 30 chars each
- AI suggests tags on AI-assisted generation
- HTML body: sanitised with sanitize-html before storage

## On Article Publish (OpsService.approveArticle)
```typescript
// Append disclaimer to body before storing
const disclaimerHtml = `
  <hr style="margin: 32px 0; border-color: #e5e7eb">
  <p style="font-size: 13px; color: #6b7280; font-style: italic">
    This article is for informational purposes only and does not
    constitute professional advice. Always consult a qualified
    professional before acting on any information herein.
  </p>
`
// Store: article.body + disclaimerHtml
// Queue: GENERATE_EMBEDDING (priority: 1 — high)
// Invalidate: articles:list:*, articles:detail:{slug}, homepage:data
// Revalidate: /articles/{slug}
// Email: K9 to member
```

## AI Article Generation (SSE Endpoint)
```
POST /articles/generate
Content-Type: text/event-stream

DTO: {
  qa: Array<{ question: string, answer: string }>,
  categoryId: string,
  serviceId: string
}

Prompt injection prevention:
- Slice each Q&A field to max 500 chars
- Remove < > characters
- Filter keywords: ignore|forget|disregard|previous instructions
- Wrap inputs in XML delimiters before passing to AI

Response: Server-Sent Events
- Token by token streaming
- Final event: { type: 'done', data: { title, body, tags } }
- Timeout: 120 seconds (set via @SetMetadata('timeout', 120_000))
```

---

# SECTION 20 — UPLOAD SERVICE
```typescript
// All uploads use sharp for resizing before storage

// Profile photo
Input:  JPEG, PNG, or WEBP, max 5MB
Process: Resize to 400x400 (cover + entropy crop), convert to WEBP 85%
Output: Stored at avatars/{userId}/profile.webp
Returns: { url: string }  ← public Supabase Storage URL

// Article image
Input:  JPEG, PNG, or WEBP, max 5MB
Process: Resize to max 1200px wide (maintain ratio), convert to WEBP 85%
Output: Stored at article-images/{articleId}/cover.webp
Returns: { url: string }

// Document (credential/testimonial proof)
Input:  PDF, JPEG, or PNG, max 10MB
Process: No resizing — store as-is
Output: Stored at documents/{userId}/credentials/{uuid}.{ext}
        or documents/{userId}/testimonials/{uuid}.{ext}
Returns: { url: string }  ← private URL, owner-access only

// 🔒 Security: Always validate MIME type using file-type
// (magic bytes check), not just Content-Type header
```

---

# SECTION 21 — FRONTEND PAGES

## Page Inventory
| Route | Auth | Rendering | Data Source |
|-------|------|-----------|-------------|
| / | Optional | ISR 300s | GET /homepage |
| /members | Optional | ISR 300s | GET /members |
| /members/:slug | Optional | ISR 600s | GET /members/:slug |
| /articles | Optional | ISR 300s | GET /articles |
| /articles/:slug | Optional | ISR 300s | GET /articles/:slug |
| /events | Optional | ISR 300s | GET /events |
| /events/:slug | Optional | ISR 300s | GET /events/:slug |
| /auth | None | Static | - |
| /auth/callback | None | Route Handler | Supabase Auth |
| /onboarding | None | Static | - |
| /application | JWT | CSR | GET /applications/me |
| /application/status | JWT | CSR | GET /applications/me |
| /member/dashboard | JWT+Member | CSR | GET /dashboard/stats |
| /member/profile | JWT+Member | CSR | GET /members/me |
| /member/articles | JWT+Member | CSR | GET /articles/member/me |
| /member/articles/new | JWT+Member | CSR | - |
| /member/articles/:id/edit | JWT+Member | CSR | GET /articles/id/:id |
| /member/settings | JWT+Member | CSR | GET /members/me |
| /ops | Ops | CSR | GET /admin/stats |
| /ops/applications | Ops | CSR | GET /ops/applications |
| /ops/applications/:id | Ops | CSR | GET /ops/applications/:id |
| /ops/members | Ops | CSR | GET /ops/members |
| /ops/members/:id | Ops | CSR | GET /ops/members/:id |
| /ops/articles | Ops | CSR | GET /ops/articles |
| /ops/articles/:id | Ops | CSR | GET /ops/articles/:id (detail) |
| /ops/events | Ops | CSR | GET /events + CRUD |
| /ops/seats | Ops | CSR | GET /ops/seats |
| /ops/broadcast | Admin | CSR | POST /ops/broadcast |
| /ops/admin | Admin | CSR | GET /admin/users |

## ISR Revalidation Endpoint
```typescript
// apps/web/app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  const body = await request.json()

  if (body.secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: 'Invalid secret' }, { status: 401 }
    )
  }

  revalidatePath(body.path)
  return NextResponse.json({ revalidated: true, path: body.path })
}
```

## Member Directory — Guest vs Authenticated
```
Guest sees:
  - Name, designation, primary service
  - City, country
  - Verified badge, member tier badge
  - Profile photo
  - MAX 20 results (2 pages) — then "Sign in to see more"

Authenticated sees:
  - Everything guest sees
  - Headline
  - Years of experience
  - Consultation fee range (Seasoned Professional only)
  - Unlimited pagination

Google crawler sees guest view → can index names + services
```

## React Query Setup
```typescript
// apps/web/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'
import { cache } from 'react'

// cache() ensures one QueryClient per server request
// (avoids data leaking between requests)
const getQueryClient = cache(
  () => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,   // 1 minute
        gcTime: 5 * 60 * 1000  // 5 minutes
      }
    }
  })
)
export default getQueryClient
```

## Query Keys
```typescript
// apps/web/hooks/queryKeys.ts
export const queryKeys = {
  members: {
    all: ['members'] as const,
    list: (filters: unknown) => ['members', 'list', filters] as const,
    detail: (slug: string) => ['members', 'detail', slug] as const,
    me: ['members', 'me'] as const,
    featured: ['members', 'featured'] as const
  },
  articles: {
    all: ['articles'] as const,
    list: (filters: unknown) => ['articles', 'list', filters] as const,
    detail: (slug: string) => ['articles', 'detail', slug] as const,
    me: ['articles', 'me'] as const
  },
  events: {
    all: ['events'] as const,
    list: (
    filters: unknown) => ['events', 'list', filters] as const,
    detail: (slug: string) => ['events', 'detail', slug] as const
  },
  applications: {
    me: ['applications', 'me'] as const
  },
  taxonomy: {
    categories: ['taxonomy', 'categories'] as const,
    services: (categoryId?: string) =>
      ['taxonomy', 'services', categoryId] as const
  },
  search: {
    global: (query: string) => ['search', 'global', query] as const
  },
  ops: {
    stats: ['ops', 'stats'] as const,
    applications: (filters: unknown) =>
      ['ops', 'applications', filters] as const,
    application: (id: string) =>
      ['ops', 'application', id] as const,
    members: (filters: unknown) =>
      ['ops', 'members', filters] as const,
    member: (id: string) =>
      ['ops', 'member', id] as const,
    articles: (filters: unknown) =>
      ['ops', 'articles', filters] as const,
    seats: (filters: unknown) =>
      ['ops', 'seats', filters] as const
  },
  dashboard: {
    stats: ['dashboard', 'stats'] as const
  }
}
```

---

# SECTION 22 — ONBOARDING FLOW

## Overview
Onboarding is a 3-step form to collect everything needed for a
member application. It is separate from the application form
(/application). Onboarding is the marketing entry point. The
/application route is where users who have already decided to
apply manage their in-progress application.

► Onboarding is NOT triggered automatically after signup.
  Users land on the homepage. They choose to apply.

## Step 1 — Identity
```
Fields:
  - First name (pre-filled from LinkedIn if available)
  - Last name (pre-filled from LinkedIn)
  - Profile photo (upload, resized to 400x400)
  - Designation (job title, e.g. "Partner, Tax Advisory")
  - Headline (one-liner, max 120 chars)
  - Bio (max 500 chars)
  - LinkedIn URL

LinkedIn Import Button:
  - User clicks "Import from LinkedIn"
  - Consent dialog: "We will fetch your public profile data
    to pre-fill this form. You can edit any field."
  - User clicks Agree → POST /automation/linkedin-scrape
  - Loading spinner shown on button
  - Realtime subscription starts on background_jobs table
  - On job complete → applyLinkedInPrefill() called
  - Only empty fields are populated (never overwrite manual input)
  - Toast: "LinkedIn data imported. Review your details below."
```

## Step 2 — Experience
```
Fields:
  - Years of experience (number)
  - Firm name
  - Firm size (dropdown: Solo, 2-10, 11-50, 51-200, 200+)
  - Country (dropdown, searchable)
  - City (text)
  - Consultation fee min USD (number)
  - Consultation fee max USD (number)
  - Qualifications (multi-text, e.g. "CA", "LLB")
  - Credentials (upload documents — max 5)
    Each credential:
      - name (text)
      - institution (text)
      - year (number)
      - document_url (after upload)
  - Work experience (dynamic list — max 5 entries)
  - Education (dynamic list — max 3 entries)
```

## Step 3 — Services and Availability
```
Fields:
  - Primary service (required — select from taxonomy)
  - Secondary services (optional — max 3)
  - Engagements (speaking, publications, awards — max 5)
  - Availability
    - Working days (multi-select)
    - Time slots (multi-select: morning/afternoon/evening)
    - Timezone (dropdown)
    - Response time (dropdown: 24h/48h/1 week)
    - Preferred contact (multi-select: email/phone/video)
    - Notes (text, max 200 chars)
  - Consent checkboxes (required before submission):
    - "I agree to the Terms and Privacy Policy"
    - "I consent to Expertly verifying my credentials"
    Both logged to consent_log table
```

## Onboarding Submission
```
POST /onboarding
Body:
  { step: 1|2|3, data: { ... } }

Step 1:
  - Validate required fields
  - If LinkedIn import used:
    - Check rate limit (1 per hour per user)
    - If exceeded → 429 error
    - Create background job to scrape LinkedIn
    - Return job ID immediately
  - Return { success: true, step: 2 }

Step 2:
  - Validate all required fields
  - If credentials uploaded:
    - Validate file types (PDF/JPEG/PNG, max 10MB)
    - Resize images to 1200px max
    - Store in documents/{userId}/credentials/
    - Return URLs
  - Create credentials array in DB
  - Return { success: true, step: 3 }

Step 3:
  - Validate required fields
  - Validate services (must exist in taxonomy)
  - Validate availability (working days, time slots)
  - Validate timezone (IANA format)
  - Validate response time (24h/48h/1 week)
  - Validate preferred contact (email/phone/video)
  - Validate consent checkboxes checked
  - Create member_applications row (status: onboarding_complete)
  - Return { success: true, redirect: '/application' }
```

## LinkedIn Import Flow (Detailed)
```
1. User clicks "Import from LinkedIn"
2. Consent dialog appears:
   "We will fetch your public profile data to pre-fill this form.
    You can edit any field. We never post without your permission."
   [Agree] [Cancel]

3. User clicks Agree → POST /automation/linkedin-scrape
   Headers: { Authorization: 'Bearer ' + JWT }
   Body: { }

4. Server:
   - Check rate limit: max 1 import per hour per user
   - If exceeded → 429 Too Many Requests
   - Create background job:
     - type: 'linkedin_scrape'
     - user_id: current user
     - payload: { }
     - status: 'pending'
   - Return:
     { success: true, job_id: 'uuid' }

5. Frontend subscribes to background_jobs via Realtime
   - On job_id change → subscribe to job updates
   - On job status = 'completed':
     - Fetch job result: GET /automation/linkedin-scrape/{job_id}
     - Parse result:
       {
         name: string,
         headline: string,
         bio: string,
         linkedin_url: string,
         experience: Array<{ firm: string, title: string, years: number }>
       }
     - Apply to form:
       - Only populate empty fields
       - Never overwrite manual input
     - Show toast:
       "LinkedIn data imported. Review your details below."
   - On job status = 'failed':
     - Show error toast:
       "Failed to import from LinkedIn. Please enter your details manually."
```

## Onboarding vs Application
```
Onboarding (/onboarding):
  - Marketing entry point
  - Collects identity, experience, services
  - Creates member_applications (status: onboarding_complete)
  - Optional — users can skip and apply later
  - No payment required

Application (/application):
  - Formal application process
  - Collects credentials, work history, education
  - Requires payment (USD 100)
  - Creates applications (status: submitted)
  - Required to become member
```

---

# SECTION 23 — APPLICATION FLOW

## Overview
Applications are created after onboarding is complete. Users can
save progress and return later. Applications require payment and
formal verification.

## Application Creation
```
POST /applications
Body:
  { onboarding_complete: true }

Server:
  - Validate user has completed onboarding
  - Create applications row:
    - user_id: current user
    - status: submitted
    - created_at: now
    - updated_at: now
  - Return:
    { success: true, application_id: 'uuid' }
```

## Application Steps
```
Step 1 — Credentials (required)
  - Upload credentials (max 5)
  - Each credential:
    - name (text)
    - institution (text)
    - year (number)
    - document_url (after upload)
  - Must upload at least 1 credential

Step 2 — Work Experience (required)
  - Dynamic list (max 5 entries)
  - Each entry:
    - firm (text)
    - title (text)
    - years (number)
    - description (text, max 500 chars)
  - Must have at least 1 entry

Step 3 — Education (required)
  - Dynamic list (max 3 entries)
  - Each entry:
    - degree (text)
    - institution (text)
    - year (number)
  - Must have at least 1 entry

Step 4 — Services (required)
  - Primary service (select from taxonomy)
  - Secondary services (optional, max 3)
  - Must select at least 1 service

Step 5 — Availability (required)
  - Working days (multi-select)
  - Time slots (multi-select: morning/afternoon/evening)
  - Timezone (dropdown)
  - Response time (dropdown: 24h/48h/1 week)
  - Preferred contact (multi-select: email/phone/video)
  - Notes (text, max 200 chars)

Step 6 — Payment (required)
  - USD 100 fee
  - Stripe Checkout session
  - On success → update application status to payment_complete

Step 7 — Review & Submit (required)
  - Display all information
  - User must confirm:
    - "I confirm all information is accurate"
    - "I consent to verification"
  - On submit:
    - Update status to submitted
    - Queue verification job
    - Send email to ops
```

## Application Status Transitions
```
onboarding_complete → submitted (on creation)
submitted → payment_complete (on payment)
payment_complete → review_complete (on review confirmation)
review_complete → approved (ops approval)
approved → active (onboarding complete)
approved → rejected (ops rejection)
```

## Application Payment
```
POST /applications/{id}/payment
Body: { }

Server:
  - Validate application exists and status = payment_complete
  - Create Stripe Checkout session:
    - amount: 10000 (USD 100)
    - currency: 'usd'
    - line_items: [{ price_data: { ... }, quantity: 1 }]
    - success_url: 'https://expertly.ai/application/success?session_id={CHECKOUT_SESSION_ID}'
    - cancel_url: 'https://expertly.ai/application/cancel'
    - metadata: { application_id: id }
  - Return:
    { success: true, checkout_url: 'https://checkout.stripe.com/...' }

Stripe Webhook (POST /api/webhooks/stripe):
  - On checkout.session.completed:
    - Extract application_id from metadata
    - Update application status to payment_complete
    - Queue verification job
    - Send email to ops: "New application payment received"
```

## Application Verification
```
Verification Job (triggered after payment):
  1. Verify credentials:
     - Check each document exists in storage
     - Verify institution exists in taxonomy
     - Verify year is reasonable
  2. Verify work experience:
     - Check firm exists in taxonomy
     - Verify years is reasonable
  3. Verify education:
     - Check institution exists in taxonomy
     - Verify year is reasonable
  4. Verify services:
     - Check each service exists in taxonomy
  5. Verify availability:
     - Check timezone is valid
     - Check working days/slots are reasonable


Server-Side Step Enforcement
typescript// PATCH /applications/:id/step-N
// Before processing any step update:

if (dto.step > application.current_step + 1) {
  throw new BadRequestException(
    `Cannot skip to step ${dto.step}.
     Complete step ${application.current_step + 1} first.`
  )
}
// Frontend handles UX progression.
// This server check is the safety net against
// direct API calls skipping steps.
```

---

# SECTION 23 — MEMBER PORTAL SCREENS

## Dashboard (/member/dashboard)
```
Data: GET /dashboard/stats

Displays:
  - Profile completion percentage
  - Published articles count
  - Total article views
  - Consultation requests received (last 30 days)
  - Membership expiry date
  - Verified badge status
  - Recent consultation requests (last 3)
  - Recent articles (last 3)
  - Quick actions:
    - Write new article
    - Edit profile
    - View public profile
```

## Profile (/member/profile)
```
Data: GET /members/me

Sections:
  - Profile photo (upload button)
  - Basic info (name, designation, headline, bio)
  - Contact (LinkedIn URL, consultation fee range)
  - Experience (years, firm name, firm size, country, city)
  - Services (primary + secondary — change triggers ops review)
  - Qualifications (text list)
  - Work experience (timeline)
  - Education (list)
  - Credentials (documents — upload triggers ops verification)
  - Testimonials (documents — upload triggers ops verification)
  - Engagements (speaking, publications, awards)
  - Availability (days, times, response time)

🔒 Profile edit badge removal rule:
  Editing any of these fields removes verified badge:
  headline, bio, designation, qualifications,
  credentials, work_experience, education
  → Sets is_verified=false, triggers K11 email
  → re_verification_requested_at set to NOW()
```

## Articles (/member/articles)
```
Data: GET /articles/member/me

Shows all member's articles with status badges:
  draft | submitted | under_review | published | rejected

Actions per article:
  draft → Edit, Submit, Delete
  submitted/under_review → View (read-only)
  published → View public, Edit (re-enters review)
  rejected → Edit (pre-fills existing content), Resubmit
```

## Article Editor (/member/articles/new or /member/articles/:id/edit)
```
Editor: Tiptap

Toolbar:
  H2, H3, Bold, Italic, Link, Bullet List,
  Numbered List, Image Upload, Blockquote

Required fields before submission:
  - Title (min 10 chars)
  - Body (min 300 words — real-time word count shown)
  - Featured image (upload required)
  - Category (select)
  - Tags (free-form, max 5)

AI Generation button:
  - Opens Q&A panel (5-8 guided questions based on category)
  - On submit → POST /articles/generate (SSE)
  - Token-by-token streaming shown in editor
  - On complete → title, body, suggested tags populated
  - Member can edit everything before submitting

Auto-save:
  - Draft saved every 30 seconds via PATCH /articles/:id
  - "Saved" indicator shown in toolbar
```

---

# SECTION 24 — OPS DASHBOARD SCREENS

## Overview (/ops)
```
Data: GET /admin/stats

Action counters (live, refresh every 60s):
  - Applications pending review
  - Articles pending review
  - Members pending re-verification
  - Members expiring in 30 days

Requires Action list linking to each filtered view
```

## Application Review (/ops/applications/:id)
```
Layout: two-panel

Left panel (60%):
  - Applicant full name, email, LinkedIn link
  - Designation, country, city
  - Bio
  - Primary service requested
  - Credentials (PDF links)
  - Work experience
  - Education
  - LinkedIn prefill (collapsible)

Right panel (40%):
  - Seat availability for service+country
    (e.g. "8/10 seats taken, 2 available")
  - Decision form:
    - Service dropdown (assign)
    - Tier dropdown (Budding / Seasoned)
    - Notes (optional)
  - Buttons: Approve | Reject | Waitlist
  - Reject requires rejection_reason (min 20 chars)
```

## Member Management (/ops/members/:id)
```
Shows full member record plus:
  - Published article count
  - Consultation request count
  - Auth provider, last login

Actions available:
  ✅ Award Verified Badge
  ⬆️  Upgrade to Seasoned Professional
  ⭐ Toggle Featured
  ⚠️  Suspend Member
  🔑 Approve / Reject Service Change (if pending)
  🔄 Renew Membership (with paymentReceivedAt date input)

Credentials section:
  Each credential shows document link + verify form:
    - Verified name, institution, year fields
    - Verify button

Testimonials section:
  Each testimonial shows document link + verify form:
    - Giver name, designation, company, testimonial text
    - Verify button
```

## Article Review (/ops/articles/:id)
```
Shows full article rendered in preview mode (read-only)
Ops CANNOT edit articles — only approve or reject

Right panel:
  - Word count ✅/❌
  - Featured image ✅/❌
  - Author verified status
  - Creation mode (Manual / AI-assisted)
  - Approve button
  - Reject (requires rejection_reason)
  - Archive (for already-published articles)
```

## Seat Allocations (/ops/seats)
```
Table showing per service+country:
  - Service name, category
  - Country
  - Current count / Max seats (progress bar)
  - Available count
  - Utilisation percentage

⚠️  Warning row when utilisation >= 100%

Actions:
  - Edit max seats (inline)
  - Add new allocation (service + country + max)
```

## Broadcast (/ops/broadcast) — backend_admin only
```
Audience options:
  ○ All Members
  ○ All Users
  ● Waitlist (requires service + country selection)
  ○ Expiring Soon (next 30 days)

Shows estimated recipient count before sending

Subject + rich text body composer

Recent broadcasts table showing:
  date | audience | subject | recipient count

SECTION 25 — SEO IMPLEMENTATION
Sitemap
typescript// apps/web/app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const API = process.env.NEXT_PUBLIC_API_URL

  const [membersRes, articlesRes] = await Promise.all([
    fetch(`${API}/api/v1/members?limit=500`,
          { next: { revalidate: 3600 } }),
    fetch(`${API}/api/v1/articles?limit=500&status=published`,
          { next: { revalidate: 3600 } })
  ])

  const { data: members } = await membersRes.json()
  const { data: articles } = await articlesRes.json()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://expertly.net',
      changeFrequency: 'daily', priority: 1.0
    },
    {
      url: 'https://expertly.net/members',
      changeFrequency: 'daily', priority: 0.9
    },
    {
      url: 'https://expertly.net/articles',
      changeFrequency: 'daily', priority: 0.9
    },
    {
      url: 'https://expertly.net/events',
      changeFrequency: 'daily', priority: 0.8
    }
  ]

  const memberPages: MetadataRoute.Sitemap = (members ?? []).map(
    (m: { slug: string; updated_at: string }) => ({
      url: `https://expertly.net/members/${m.slug}`,
      lastModified: m.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8
    })
  )

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map(
    (a: { slug: string; published_at: string }) => ({
      url: `https://expertly.net/articles/${a.slug}`,
      lastModified: a.published_at,
      changeFrequency: 'monthly' as const,
      priority: 0.7
    })
  )

  return [...staticPages, ...memberPages, ...articlePages]
}
robots.ts
typescript// apps/web/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/ops/',
          '/member/',
          '/onboarding',
          '/application/',
          '/auth/'
        ]
      }
    ],
    sitemap: 'https://expertly.net/sitemap.xml'
  }
}
Schema.org — Member Profile
typescript// In member profile generateMetadata():
other: {
  'application/ld+json': JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: `${member.firstName} ${member.lastName}`,
    jobTitle: member.designation,
    description: member.headline,
    image: member.profilePhotoUrl,
    url: `https://expertly.net/members/${member.slug}`,
    worksFor: member.firmName ? {
      '@type': 'Organization',
      name: member.firmName
    } : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: member.city,
      addressCountry: member.country
    }
  })
}
Schema.org — Article
typescript// In article detail generateMetadata():
other: {
  'application/ld+json': JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    image: article.featuredImageUrl,
    author: {
      '@type': 'Person',
      name: article.author.fullName,
      url: `https://expertly.net/members/${article.author.slug}`
    },
    publisher: {
      '@type': 'Organization',
      name: 'Expertly',
      url: 'https://expertly.net'
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt
  })
}
```

---

# SECTION 26 — INFRASTRUCTURE AND DEPLOYMENT

## Supabase Configuration
```
Plan: Pro
Extensions: uuid-ossp, vector, pg_trgm, unaccent
Auth providers: LinkedIn OIDC (primary), Email
Realtime: enabled on background_jobs table
Connection pooler: Transaction mode, port 6543
```

## Railway (Backend)
```
Dockerfile at: apps/api/Dockerfile
Auto-deploy: on push to main
Health check: GET /api/v1/health
Custom domain: api.expertly.net
Dockerfile (apps/api/Dockerfile)
dockerfileFROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
USER nestjs
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

## Vercel (Frontend)
```
Framework: Next.js (auto-detected)
Root directory: apps/web
Auto-deploy: on push to main
Custom domain: expertly.net
Environment variables: set in Vercel dashboard
GitHub Actions CI
yaml# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm build
Health Check Endpoint
typescript// GET /health
// Returns:
{
  status: 'ok',
  timestamp: string,
  services: {
    database: 'ok' | 'error',
    cache: 'ok' | 'error'
  },
  version: string
}
Nginx Configuration (production)
nginxclient_max_body_size 15M;
proxy_read_timeout 120s;

# SSE-specific — disable buffering for streaming
location /api/v1/articles/generate {
  proxy_pass http://api;
  proxy_buffering off;
  proxy_cache off;
  proxy_set_header Connection '';
  proxy_http_version 1.1;
  chunked_transfer_encoding on;
}

SECTION 27 — LOCAL DEVELOPMENT SETUP
Prerequisites
bashnode --version   # Must be v20.x (use nvm)
pnpm --version   # Must be 9.x
supabase --version  # Supabase CLI
docker --version    # Docker Desktop running
First-Time Setup
bash# 1. Clone
git clone https://github.com/YOUR_ORG/expertly.git
cd expertly

# 2. Install all dependencies
pnpm install

# 3. Start Redis
docker compose up -d redis

# 4. Copy env files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local

# 5. Fill in env vars (see Section 8)

# 6. Run database migrations
supabase db push --db-url $SUPABASE_DB_URL

# 7. Run seed data
psql $SUPABASE_DB_URL -f supabase/seed/taxonomy.sql

# 8. Build shared packages
pnpm turbo build --filter=@expertly/types
pnpm turbo build --filter=@expertly/utils

# 9. Start dev servers
pnpm dev
# api → http://localhost:3001
# web → http://localhost:3000

# 10. Verify
curl http://localhost:3001/api/v1/health
docker-compose.yml
yamlversion: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

volumes:
  redis_data:
Generate Secrets
bash# COOKIE_SECRET (64 chars)
node -e "console.log(require('crypto')
  .randomBytes(32).toString('hex'))"

# REVALIDATION_SECRET (32 chars)
node -e "console.log(require('crypto')
  .randomBytes(16).toString('hex'))"
```

## Create First Admin Account
```
1. Sign up at http://localhost:3000/auth
2. Open Supabase Dashboard → Table Editor → users
3. Find your record
4. Set role = 'backend_admin'
5. Refresh the app — you now have access to /ops
```

## Common Issues
```
"CORS error"
→ Check NEXT_PUBLIC_API_URL in apps/web/.env.local
  Must match exactly: http://localhost:3001

"Invalid JWT / 401 on every request"
→ Check SUPABASE_URL matches between frontend and backend
→ Verify SUPABASE_SERVICE_ROLE_KEY is the service role key,
  not the anon key

"BullMQ jobs not processing"
→ Run: docker compose ps
→ Verify Redis is running on localhost:6379
→ Check NestJS startup logs for "Redis connected"

"Supabase Realtime not firing"
→ In Supabase Dashboard → Database → Replication
→ Verify background_jobs is in supabase_realtime publication

"camelCase fields returning as snake_case"
→ Check ResponseInterceptor is registered in main.ts
→ Verify you are calling NestJS API (not Supabase directly)

"Upload returns 413"
→ Check Fastify multipart limits in main.ts
→ Check Nginx client_max_body_size in production

"Embeddings not generating"
→ Check background_jobs table for failed status and error field
→ Verify OPENAI_API_KEY is set and has billing enabled
```

---

# SECTION 28 — CODE CONVENTIONS

## Non-Negotiable Rules

### TypeScript
```
✅ Strict mode everywhere — no 'any', no exceptions
✅ Every async function has explicit error handling
✅ Explicit return types on all functions
✅ Use unknown not any when type is genuinely unknown
```

### NestJS Backend
```
✅ Never SELECT * from tables that have embedding columns
✅ Static routes always before dynamic :param routes
✅ Every mutation: check ownership THEN mutate
✅ Every mutation: invalidate cache THEN revalidate ISR
✅ Never expose SUPABASE_SERVICE_ROLE_KEY to client
✅ Never hardcode credentials — all from env vars
✅ Use NestJS Logger — never console.log
Route Order (CRITICAL — breaks app if wrong)
typescript// ✅ CORRECT
@Get('featured')   // static first
getFeatured() {}

@Get('me')         // static second
getMe() {}

@Get(':slug')      // dynamic last
getBySlug() {}

// ❌ WRONG — :slug matches 'featured' and 'me'
@Get(':slug')
getBySlug() {}

@Get('featured')   // NEVER REACHED
getFeatured() {}
Cache Invalidation Pattern
typescript// Every mutation must follow this exact pattern:
await this.supabase.adminClient.from('members').update(dto).eq('id', id)
await this.cache.del(`members:profile:${member.slug}`)
await this.cache.delByPattern('members:list:*')
await this.supabase.revalidatePath(`/members/${member.slug}`)
// Skipping cache invalidation causes stale data for up to 10 minutes
```

### Frontend
```
✅ Server Components fetch data
✅ Client Components handle interaction
✅ Never call Supabase directly from Client Components
   — always go through apiClient
✅ All API calls via apiClient abstraction (never raw fetch)
✅ Every page that shows user-specific data uses
   HydrationBoundary
✅ Mobile-first responsive on every component
✅ No custom CSS files — Tailwind utility classes only
✅ shadcn/ui for all base components
Error Handling
typescript// Backend — use NestJS HTTP exceptions with codes:
throw new NotFoundException('Member not found')
throw new ConflictException('DUPLICATE_REQUEST')
throw new ForbiddenException('Cannot approve your own application')
throw new BadRequestException('WORD_COUNT_TOO_LOW')

// Frontend — read error.code for specific handling:
if (error.code === 'DUPLICATE_REQUEST') {
  toast.error('You already sent a request to this member recently')
}

SECTION 29 — SHARED PACKAGES
packages/types/src/index.ts
typescript// All database entity types
export interface User {
  id: string
  authId: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  role: 'user' | 'member' | 'ops' | 'backend_admin'
  authProvider: 'linkedin' | 'email'
  linkedinId: string | null
  isActive: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Member {
  id: string
  userId: string
  slug: string
  profilePhotoUrl: string | null
  designation: string | null
  headline: string | null
  bio: string | null
  yearsOfExperience: number | null
  firmName: string | null
  firmSize: string | null
  country: string | null
  city: string | null
  memberTier: 'budding_entrepreneur' | 'seasoned_professional'
  membershipStatus:
    'pending_payment' | 'active' | 'expired' | 'suspended' | 'cancelled'
  membershipStartDate: string | null
  membershipExpiryDate: string | null
  isVerified: boolean
  verifiedAt: string | null
  isFeatured: boolean
  primaryServiceId: string | null
  linkedinUrl: string | null
  consultationFeeMinUsd: number | null
  consultationFeeMaxUsd: number | null
  qualifications: string[]
  availability: Availability
  engagements: Engagement[]
  workExperience: WorkExperience[]
  education: Education[]
  credentials: Credential[]
  testimonials: Testimonial[]
  createdAt: string
  updatedAt: string
}

export interface Article {
  id: string
  memberId: string
  title: string
  slug: string
  subtitle: string | null
  body: string
  excerpt: string | null
  featuredImageUrl: string | null
  categoryId: string | null
  serviceId: string | null
  tags: string[]
  wordCount: number
  readTimeMinutes: number
  viewCount: number
  creationMode: 'manual' | 'ai_assisted'
  status:
    'draft' | 'submitted' | 'under_review' |
    'published' | 'rejected' | 'archived'
  submittedAt: string | null
  publishedAt: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  title: string
  slug: string
  description: string | null
  organiserName: string | null
  eventType: string | null
  eventFormat: string | null
  startDatetime: string
  endDatetime: string | null
  timezone: string | null
  country: string | null
  city: string | null
  venueName: string | null
  onlineUrl: string | null
  registrationUrl: string | null
  isFree: boolean
  isPublished: boolean
  isFeatured: boolean
  createdAt: string
}

export interface Application {
  id: string
  userId: string
  status:
    'draft' | 'submitted' | 'under_review' |
    'approved' | 'rejected' | 'waitlisted' | 'archived'
  currentStep: number
  firstName: string | null
  lastName: string | null
  designation: string | null
  headline: string | null
  bio: string | null
  linkedinUrl: string | null
  profilePhotoUrl: string | null
  yearsOfExperience: number | null
  firmName: string | null
  firmSize: string | null
  country: string | null
  city: string | null
  consultationFeeMinUsd: number | null
  consultationFeeMaxUsd: number | null
  qualifications: string[]
  credentials: Credential[]
  workExperience: WorkExperience[]
  education: Education[]
  primaryServiceId: string | null
  secondaryServiceIds: string[]
  engagements: Engagement[]
  availability: Availability
  submittedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  domain: string | null
  sortOrder: number
  isActive: boolean
}

export interface Service {
  id: string
  categoryId: string
  name: string
  slug: string
  regions: string[] | null
  isActive: boolean
  sortOrder: number
}

export interface ConsultationRequest {
  id: string
  memberId: string
  userId: string
  serviceId: string | null
  subject: string
  description: string | null
  preferredTime: string | null
  status: 'pending' | 'responded' | 'closed'
  createdAt: string
}

// JSONB structures (see Section 5 for full definitions)
export interface Availability { /* ... see Section 5 */ }
export interface Engagement { /* ... see Section 5 */ }
export interface Credential { /* ... see Section 5 */ }
export interface Testimonial { /* ... see Section 5 */ }
export interface WorkExperience { /* ... see Section 5 */ }
export interface Education { /* ... see Section 5 */ }

// Auth types
export interface AuthUser {
  id: string           // Supabase auth ID
  dbId: string         // public.users.id
  email: string
  role: 'user' | 'member' | 'ops' | 'backend_admin'
  memberId?: string
  isSuspended: boolean
}

// API response types
export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    statusCode: number
    path: string
    timestamp: string
  }
}
packages/utils/src/index.ts
typescriptimport { JSDOM } from 'jsdom'

/**
 * Converts a string to a URL-safe slug
 * "Transfer Pricing & Tax" → "transfer-pricing-tax"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

/**
 * Counts words in an HTML string (strips tags first)
 */
export function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ')
  const words = text.trim().split(/\s+/)
  return words.filter(w => w.length > 0).length
}

/**
 * Extracts plain text excerpt from HTML (max 200 chars)
 */
export function extractExcerpt(
  html: string,
  maxLength = 200
): string {
  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).replace(/\s\S*$/, '') + '...'
}

/**
 * Deep-converts all object keys to camelCase recursively
 * Used by ResponseInterceptor
 */
export function deepCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(deepCamelCase)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .map(([k, v]) => [
          k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
          deepCamelCase(v)
        ])
    )
  }
  return obj
}

/**
 * Formats consultation fee range
 * (50, 150) → "$50 – $150 / hour"
 * (null, null) → "Contact for pricing"
 */
export function formatFee(
  min: number | null,
  max: number | null
): string {
  if (!min && !max) return 'Contact for pricing'
  if (!max) return `$${min} / hour`
  return `$${min} – $${max} / hour`
}

/**
 * Calculates read time in minutes
 * Based on 200 words per minute reading speed
 */
export function calculateReadTime(wordCount: number): number {
  return Math.max(1, Math.ceil(wordCount / 200))
}

/**
 * Generates a random slug suffix for collision resolution
 */
export function randomSuffix(length = 4): string {
  return Math.random().toString(36).substring(2, 2 + length)
}
```

---

# SECTION 30 — BUILD ORDER AND SESSION GUIDE

## Recommended Build Order

### Week 1 — Foundation
```
Session 1.1  Monorepo scaffolding
             (pnpm + Turborepo + app shells + packages)

Session 1.2  NestJS bootstrap
             (main.ts, guards, interceptors, filters, services)

Session 1.3  Database migrations
             (all SQL files in supabase/migrations/)

Session 1.4  Shared packages
             (packages/types, packages/utils, packages/schemas)
```

### Week 2 — Core Backend
```
Session 2.1  SupabaseService + RedisService + CacheService

Session 2.2  Auth module
             (JWT extraction, guards, /auth/sync, /auth/me)

Session 2.3  Taxonomy module
             (categories + services endpoints)

Session 2.4  Members module — read paths
             (list, detail by slug, featured, AI search)

Session 2.5  Members module — write paths
             (updateMe, service change, badge removal)
```

### Week 3 — Applications and Articles Backend
```
Session 3.1  Applications module
             (create draft, steps 1-2-3, submit, duplicate check)

Session 3.2  Upload module
             (profile photo, article image, document — with sharp)

Session 3.3  Articles module — CRUD
             (create, update, submit, slug generation, sanitize)

Session 3.4  Articles module — AI generation
             (SSE streaming endpoint, prompt injection prevention)

Session 3.5  Events + Consultation + Search modules
```

### Week 4 — Frontend Foundation
```
Session 4.1  Next.js setup
             (shadcn/ui, Tailwind brand tokens, apiClient,
              queryClient, queryKeys, route group structure)

Session 4.2  Auth pages
             (/auth page — LinkedIn sign in,
              /auth/callback/route.ts — 7-state handler)

Session 4.3  Layout components
             (Navbar with search, Footer, route group layouts)

Session 4.4  Homepage
             (ISR, featured members, latest articles, events)
```

### Week 5 — Public-Facing Pages
```
Session 5.1  Member directory
             (/members — guest teaser vs auth full card,
              filters, pagination, AI search integration)

Session 5.2  Member profile page
             (/members/:slug — full profile display,
              Schema.org, consultation request form)

Session 5.3  Articles list + article detail
             (ISR, Schema.org, related articles)

Session 5.4  Events list + event detail
```

### Week 6 — Onboarding and Application
```
Session 6.1  Onboarding store (Zustand)
             (3-step form state, LinkedIn prefill merge logic)

Session 6.2  Onboarding Step 1
             (identity form, LinkedIn import button,
              Realtime polling, photo upload)

Session 6.3  Onboarding Step 2
             (experience form, credentials upload)

Session 6.4  Onboarding Step 3
             (services, availability, consent checkboxes, submit)

Session 6.5  Application status page
             (/application/status — all 6 states)
```

### Week 7 — Member Portal
```
Session 7.1  Member portal layout + dashboard
Session 7.2  Member profile editor
             (all sections, badge removal on edit)
Session 7.3  Article list + article editor
             (Tiptap setup, toolbar, auto-save)
Session 7.4  AI article generation
             (Q&A panel, SSE streaming display)
Session 7.5  Member settings + notification preferences
```

### Week 8 — Automation and AI
```
Session 8.1  LinkedIn scraper worker
             (Apify integration, background_jobs, Realtime)

Session 8.2  Embedding generation worker
             (OpenAI text-embedding-3-small, all 3 types)

Session 8.3  RSS ingestion worker
             (feed parsing, dedup, AI summarisation)

Session 8.4  Regulatory nudge system
             (member matching, K16 email)

Session 8.5  Email service
             (Resend integration, all 22 templates)
```

### Week 9 — Ops Dashboard
```
Session 9.1  Ops layout + overview dashboard
             (action counters, live badge refresh)

Session 9.2  Application review
             (list, detail, approve/reject/waitlist)

Session 9.3  Member management
             (list with filters, detail, all actions)

Session 9.4  Article review queue

Session 9.5  Events CRUD + seat allocations

Session 9.6  Broadcast composer + admin panel
```

### Week 10 — Scheduler, SEO, Polish
```
Session 10.1 Scheduler module
             (all 6 cron jobs)

Session 10.2 Digest worker
             (get_digest_data, batch sending, idempotency)

Session 10.3 SEO
             (sitemap.ts, robots.ts, Schema.org on all pages)

Session 10.4 Performance
             (image optimization audit, cache TTL review,
              Core Web Vitals check)

Session 10.5 Deployment
             (Railway backend, Vercel frontend,
              Cloudflare DNS, full flow verification)
```

## Claude Code Session Protocol

### Every Session Starts With
```
Read MASTER_TDD.md fully.

Today's goal: [specific module from build order above]

Relevant sections: Section [X], Section [Y]

Do not write any code yet. First:
1. Confirm what we are building
2. List the files you will create or modify
3. Identify any dependencies that must exist first
4. State your implementation plan

Once I confirm, proceed.
```

### Every Session Ends With
```
List all files you created or modified.
Are there any TODOs or incomplete implementations?
What should the next session build?
```

### When Claude Drifts from TDD
```
Stop. Re-read MASTER_TDD.md Section [X].
Your implementation of [function] contradicts the spec.
Specifically: [what is wrong]
Rewrite [function] to match the specification exactly.
```

### For Complex Logic (Ask for Plan First)
```
Before writing any code, write a step-by-step
implementation plan for [feature].
Reference the relevant MASTER_TDD.md sections.
I will review and approve the plan before you proceed.
```

### Quality Bar for UI
```
This component must look like it was designed by
a world-class product design team.
Reference quality: Linear, Vercel, Stripe.
Premium feel. Generous whitespace. Clean typography.
Navy (#1e3a5f) and gold (#c9a84c) brand palette.
shadcn/ui base components with Tailwind customisation.
```

---

# SECTION 31 — ARCHITECTURAL DECISION LOG

Every decision below was made deliberately.
Do not reverse any of these without understanding the rationale.

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo tool | Turborepo + pnpm | Industry standard, caching, workspace management |
| Frontend framework | Next.js App Router | ISR for SEO, server components for performance |
| Backend framework | NestJS + Fastify | Type-safe, modular, Fastify is 2x faster than Express |
| Database | Supabase Postgres | Managed Postgres + auth + storage + realtime in one |
| Vector search | pgvector (not Pinecone) | Same DB, no sync issues, cheaper, sufficient at this scale |
| Cache | Redis (Upstash) | BullMQ requires Redis, so zero additional cost for caching |
| Queue | BullMQ | Best-in-class for Node.js, Redis-based, retry logic built-in |
| Auth | Supabase Auth | Native LinkedIn OIDC, manages tokens, RLS integration |
| Token refresh | Silent (Supabase client) | Industry standard, no custom code needed, seamless UX |
| Rich text editor | Tiptap | Best Next.js editor, headless, clean HTML output |
| Image resizing | sharp | Fastest Node.js image processing, webp conversion |
| Article ON DELETE | CASCADE | Simplest for MVP. Post-MVP: SET NULL with "Former Member" |
| Account deletion | Anonymise (soft delete) | GDPR compliance, audit trail preservation, content retention |
| Currency | USD only | MVP simplicity. Phase 2: local currency + fx rates |
| Payment | Manual bank transfer | Ops confirms receipt. Stripe integration is Phase 2 |
| Consultation response | Email only (MVP) | No in-app messaging needed at this scale |
| Member tier criteria | Ops discretion | Rule book maintained by ops lead, not hardcoded |
| Guest directory view | Teaser cards (public) | SEO indexing of member names/services, drives signup |
| Disclaimer | Appended on publish | Finance/legal liability protection, cannot be skipped |
| Draft auto-expiry | Phase 2 | Not needed for MVP, low user volume initially |

---

# SECTION 32 — MIGRATION FILE CHECKLIST

Create these files in order in supabase/migrations/:
```
001_extensions.sql           Extensions (uuid-ossp, vector, pg_trgm, unaccent)
002_enums.sql                All enum types
003_tables_core.sql          service_categories, services, users
004_tables_members.sql       members, member_services, seat_allocations
005_tables_applications.sql  applications
006_tables_content.sql       articles, events
007_tables_comms.sql         consultation_requests, user_digest_subscriptions,
                             digest_send_log, member_notification_preferences
008_tables_ops.sql           regulatory_updates, background_jobs,
                             consent_log, email_logs, broadcast_logs
009_triggers.sql             update_updated_at trigger on all tables,
                             handle_new_auth_user auth trigger
010_functions.sql            claim_seat, release_seat, increment_view_count,
                             get_ops_action_counts
011_rls.sql                  All RLS policies
012_storage.sql              3 buckets + storage RLS policies
013_realtime.sql             background_jobs Realtime publication
014_vector_functions.sql     search_members, search_articles, search_events
015_digest_function.sql      get_digest_data
016_indexes.sql              All performance indexes
017_seed_taxonomy.sql        service_categories + services seed data
Run all migrations in order:
bashsupabase db push --db-url $SUPABASE_DB_URL
Verify:
bashsupabase db diff --db-url $SUPABASE_DB_URL
# Should show: No schema changes
```

---

# SECTION 33 — FINAL PRE-BUILD CHECKLIST

Before writing a single line of application code,
verify every item below is complete:

### Accounts and Keys
```
□ Supabase project created (Pro plan)
  - URL, anon key, service role key saved
  - Connection string (port 6543) saved
□ Upstash Redis created
  - Host, port, password saved
□ OpenAI account with billing
  - API key saved (starts with sk-)
□ Resend account
  - API key saved (starts with re_)
  - Sending domain verified (SPF + DKIM)
□ Apify account
  - API token saved
□ GitHub repository created (private)
□ Railway account (for backend deployment)
□ Vercel account (for frontend deployment)
□ Cloudflare account (for DNS — do when ready to go live)
```

### Supabase Configuration
```
□ Extensions enabled (uuid-ossp, vector, pg_trgm, unaccent)
□ LinkedIn OIDC provider configured in Auth settings
□ Email auth enabled
□ All migrations run in order (001-017)
□ Seed data applied (taxonomy)
□ Realtime enabled on background_jobs table
□ Storage buckets created (avatars, article-images, documents)
□ Connection pooler URL confirmed (Transaction mode, port 6543)
```

### Local Environment
```
□ Node.js 20 installed
□ pnpm 9 installed
□ Supabase CLI installed
□ Docker Desktop installed and running
□ Redis container running (docker compose up -d redis)
□ apps/api/.env populated with all values
□ apps/web/.env.local populated with all values
□ COOKIE_SECRET generated (64 char hex)
□ NEXT_REVALIDATION_SECRET generated (32 char hex)
□ pnpm install run successfully
□ Shared packages built (types, utils)
□ API health check returns ok (GET /api/v1/health)
□ Frontend loads at localhost:3000
□ First backend_admin account created
```

### Payment Configuration
```
□ Bank transfer details set in env vars:
  PAYMENT_BANK_NAME
  PAYMENT_ACCOUNT_NUMBER
  PAYMENT_SORT_CODE
  PAYMENT_AMOUNT_USD
□ K2 email template includes these details
□ Ops knows the process:
  1. Applicant receives K2 with bank details
  2. Member transfers payment with reference code
  3. Ops confirms receipt
  4. Ops activates via POST /ops/members/:id/activate
     with paymentReceivedAt date
```

---

*MASTER_TDD.md — End of Document*
*Version 1.0 | All sections complete*
*Total sections: 33*
*This document is the single source of truth for the Expertly platform.*
*Any developer or AI agent can read this document and build the*
*platform without asking a single clarifying question.*
```

---

That is the complete `MASTER_TDD.md`. Save the file, then run:
```bash
git add MASTER_TDD.md
git commit -m "docs: add complete master TDD"
git push
```

The document covers everything — all 33 sections, every database table with exact SQL, every API endpoint, every business rule, every JSONB structure, all email templates, the full auth flow, every state machine, the ops workflows, SEO implementation, deployment config, local setup, and the complete build order with Claude Code session prompts.

Any developer or AI agent who reads this file has everything they need to build the entir
-- Migration 019: Week 3 schema extensions for Applications, Articles, Consultation

-- ─── Enum extensions ─────────────────────────────────────────────────────────

-- Add 'waitlisted' to application_status
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'waitlisted';

-- Add article review statuses
ALTER TYPE article_status ADD VALUE IF NOT EXISTS 'submitted';
ALTER TYPE article_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE article_status ADD VALUE IF NOT EXISTS 'rejected';

-- Add consultation lifecycle statuses
ALTER TYPE consultation_status ADD VALUE IF NOT EXISTS 'responded';
ALTER TYPE consultation_status ADD VALUE IF NOT EXISTS 'closed';

-- ─── applications: extend with full profile + step tracking ──────────────────
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS first_name                TEXT,
  ADD COLUMN IF NOT EXISTS last_name                 TEXT,
  ADD COLUMN IF NOT EXISTS headline                  TEXT,
  ADD COLUMN IF NOT EXISTS bio                       TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url              TEXT,
  ADD COLUMN IF NOT EXISTS designation               TEXT,
  ADD COLUMN IF NOT EXISTS profile_photo_url         TEXT,
  ADD COLUMN IF NOT EXISTS current_step              INTEGER      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS re_application_eligible_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS firm_name                 TEXT,
  ADD COLUMN IF NOT EXISTS firm_size                 TEXT,
  ADD COLUMN IF NOT EXISTS country                   TEXT,
  ADD COLUMN IF NOT EXISTS city                      TEXT,
  ADD COLUMN IF NOT EXISTS consultation_fee_min_usd  INTEGER,
  ADD COLUMN IF NOT EXISTS consultation_fee_max_usd  INTEGER,
  ADD COLUMN IF NOT EXISTS qualifications            TEXT,
  ADD COLUMN IF NOT EXISTS credentials               JSONB        NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS work_experience           JSONB        NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS education                 JSONB        NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS primary_service_id        UUID         REFERENCES services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS secondary_service_ids     UUID[]       NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS engagements               JSONB        NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS availability              JSONB        NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS creation_mode             TEXT         NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS submitted_at              TIMESTAMPTZ;

-- ─── articles: extend with word_count, category, service, submitted_at ───────
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS word_count    INTEGER,
  ADD COLUMN IF NOT EXISTS category_id  UUID         REFERENCES service_categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_id   UUID         REFERENCES services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS creation_mode TEXT        NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS submitted_at  TIMESTAMPTZ;

-- ─── consultation_requests: extend with subject, description, preferred_time ─
ALTER TABLE consultation_requests
  ADD COLUMN IF NOT EXISTS subject        TEXT,
  ADD COLUMN IF NOT EXISTS description    TEXT,
  ADD COLUMN IF NOT EXISTS preferred_time TEXT;

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_articles_member_id ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_member_id ON consultation_requests(member_id);
CREATE INDEX IF NOT EXISTS idx_consultation_requests_requester_id ON consultation_requests(requester_id);

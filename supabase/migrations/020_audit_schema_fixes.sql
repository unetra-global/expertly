-- Migration 020: Audit schema fixes — align with MASTER_TDD.md spec
-- Safe additive changes only (no column renames, no table drops)

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. NEW ENUMS (missing from spec)
-- ─────────────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE auth_provider AS ENUM ('linkedin', 'email');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE member_tier_enum AS ENUM ('budding_entrepreneur', 'seasoned_professional');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE embedding_status AS ENUM ('pending', 'generated', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. NEW ENUM VALUES (add missing values to existing enums)
-- ─────────────────────────────────────────────────────────────────────────────

-- membership_status: add 'pending_payment' and 'expired'
ALTER TYPE membership_status ADD VALUE IF NOT EXISTS 'pending_payment';
ALTER TYPE membership_status ADD VALUE IF NOT EXISTS 'expired';

-- application_status: add 'archived'
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'archived';

-- article_status: verify all spec values exist (submitted/under_review/rejected added in 019)
-- (already done in 019)

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. USERS TABLE — add missing columns from spec
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS auth_provider auth_provider DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS linkedin_id   TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url    TEXT,
  ADD COLUMN IF NOT EXISTS timezone      TEXT DEFAULT 'UTC',
  ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- spec index on auth_id — the column is named supabase_uid in current code
-- add an alias index using supabase_uid (existing column) as auth_id reference
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. MEMBERS TABLE — add missing columns from spec
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE members
  -- Payment tracking (required for 16-step activation)
  ADD COLUMN IF NOT EXISTS payment_received_at  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_received_by  UUID REFERENCES users(id) ON DELETE SET NULL,
  -- AI embedding tracking
  ADD COLUMN IF NOT EXISTS embedding_status     embedding_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMPTZ,
  -- Profile completeness
  ADD COLUMN IF NOT EXISTS firm_name            TEXT,
  ADD COLUMN IF NOT EXISTS firm_size            TEXT,
  -- Engagement history (spec uses plural 'engagements', current has singular 'engagement')
  ADD COLUMN IF NOT EXISTS engagements          JSONB DEFAULT '[]',
  -- Profile view count (spec name; existing view_count column stays)
  ADD COLUMN IF NOT EXISTS profile_view_count   INTEGER DEFAULT 0;

-- Spec: qualifications is TEXT[] not TEXT — add typed array column
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS qualifications_arr   TEXT[] DEFAULT '{}';

-- Migrate existing TEXT qualifications to array form (best-effort)
UPDATE members
SET qualifications_arr = ARRAY[qualifications]
WHERE qualifications IS NOT NULL
  AND qualifications != ''
  AND qualifications_arr = '{}';

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. MEMBER_SERVICES TABLE — add is_primary flag
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE member_services
  ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. ARTICLES TABLE — add missing columns from spec
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE articles
  -- Content fields
  ADD COLUMN IF NOT EXISTS subtitle              TEXT,
  -- spec uses featured_image_url; current uses cover_image_url (keep both)
  ADD COLUMN IF NOT EXISTS featured_image_url    TEXT,
  -- spec uses read_time_minutes; current uses read_time (keep both)
  ADD COLUMN IF NOT EXISTS read_time_minutes     INTEGER DEFAULT 1,
  -- AI fields
  ADD COLUMN IF NOT EXISTS ai_qa_inputs          JSONB,
  ADD COLUMN IF NOT EXISTS regulatory_update_id  UUID,
  ADD COLUMN IF NOT EXISTS embedding_status      embedding_status DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS embedding_error       TEXT,
  ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMPTZ,
  -- Review fields
  ADD COLUMN IF NOT EXISTS reviewed_by           UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rejection_reason      TEXT,
  -- SEO fields
  ADD COLUMN IF NOT EXISTS meta_title            TEXT,
  ADD COLUMN IF NOT EXISTS meta_description      TEXT;

-- Populate featured_image_url from cover_image_url for existing records
UPDATE articles
SET featured_image_url = cover_image_url
WHERE cover_image_url IS NOT NULL
  AND featured_image_url IS NULL;

-- Populate read_time_minutes from read_time for existing records
UPDATE articles
SET read_time_minutes = read_time
WHERE read_time IS NOT NULL
  AND read_time_minutes = 1
  AND read_time != 1;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. EVENTS TABLE — add missing spec columns (non-breaking additions)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS organiser_name TEXT,
  ADD COLUMN IF NOT EXISTS event_type     TEXT, -- conference|webinar|workshop|networking
  ADD COLUMN IF NOT EXISTS event_format   TEXT, -- in_person|virtual|hybrid
  ADD COLUMN IF NOT EXISTS timezone       TEXT,
  ADD COLUMN IF NOT EXISTS country        TEXT,
  ADD COLUMN IF NOT EXISTS city           TEXT,
  ADD COLUMN IF NOT EXISTS venue_name     TEXT,
  ADD COLUMN IF NOT EXISTS online_url     TEXT,
  ADD COLUMN IF NOT EXISTS is_free        BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS source         TEXT DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS is_published   BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_featured    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tags           TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS embedding_status embedding_status DEFAULT 'pending';

-- Populate is_published from status for existing records
UPDATE events SET is_published = TRUE WHERE status = 'published';

-- Populate event_format from is_virtual for existing records
UPDATE events SET event_format = CASE WHEN is_virtual THEN 'virtual' ELSE 'in_person' END
WHERE event_format IS NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. MEMBER_NOTIFICATION_PREFERENCES — add missing preference columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE member_notification_preferences
  -- spec column names
  ADD COLUMN IF NOT EXISTS consultation_requests BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS article_status        BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS membership_reminders  BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS regulatory_nudges     BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS platform_updates      BOOLEAN DEFAULT TRUE;

-- Migrate existing prefs to new column names
UPDATE member_notification_preferences
SET consultation_requests = email_on_consultation,
    article_status        = email_on_article_comment
WHERE consultation_requests IS DISTINCT FROM email_on_consultation
   OR article_status IS DISTINCT FROM email_on_article_comment;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. USER_DIGEST_SUBSCRIPTIONS — add missing spec columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE user_digest_subscriptions
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS frequency   TEXT DEFAULT 'weekly',
  ADD COLUMN IF NOT EXISTS last_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMPTZ DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS idx_digest_subs_user_category
  ON user_digest_subscriptions(user_id, category_id)
  WHERE category_id IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. DIGEST_SEND_LOG — add per-user per-category tracking (spec structure)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE digest_send_log
  ADD COLUMN IF NOT EXISTS user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES service_categories(id),
  ADD COLUMN IF NOT EXISTS week_start  DATE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_digest_log_user_cat_week
  ON digest_send_log(user_id, category_id, week_start)
  WHERE user_id IS NOT NULL AND category_id IS NOT NULL AND week_start IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_digest_log_week ON digest_send_log(week_start);

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. REGULATORY_UPDATES — add missing spec columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE regulatory_updates
  ADD COLUMN IF NOT EXISTS source              TEXT,
  ADD COLUMN IF NOT EXISTS summary             TEXT,
  ADD COLUMN IF NOT EXISTS relevant_categories UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS relevant_regions    TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS published_date      DATE,
  ADD COLUMN IF NOT EXISTS nudges_sent         INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nudges_sent_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_processed        BOOLEAN DEFAULT FALSE;

-- Backfill: map existing is_active → is_processed (inverted)
UPDATE regulatory_updates
SET is_processed = NOT is_active
WHERE is_processed = FALSE AND is_active = FALSE;

CREATE INDEX IF NOT EXISTS idx_regulatory_processed
  ON regulatory_updates(is_processed)
  WHERE is_processed = FALSE;

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. BACKGROUND_JOBS — add missing spec columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE background_jobs
  ADD COLUMN IF NOT EXISTS user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS queue    TEXT,
  ADD COLUMN IF NOT EXISTS job_type TEXT,
  ADD COLUMN IF NOT EXISTS result   JSONB,
  ADD COLUMN IF NOT EXISTS error    TEXT;

-- Backfill: copy 'type' → 'job_type' for existing records
UPDATE background_jobs
SET job_type = type
WHERE job_type IS NULL AND type IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_user ON background_jobs(user_id);

-- Ensure REPLICA IDENTITY FULL for Realtime (should already be set by 013_realtime)
ALTER TABLE background_jobs REPLICA IDENTITY FULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. EMAIL_LOGS — add missing spec columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE email_logs
  ADD COLUMN IF NOT EXISTS user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS template_key    TEXT,
  ADD COLUMN IF NOT EXISTS provider        TEXT DEFAULT 'resend',
  ADD COLUMN IF NOT EXISTS provider_msg_id TEXT,
  ADD COLUMN IF NOT EXISTS error_message   TEXT,
  ADD COLUMN IF NOT EXISTS sent_at         TIMESTAMPTZ DEFAULT NOW();

-- Backfill template → template_key
UPDATE email_logs
SET template_key = template
WHERE template_key IS NULL AND template IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_email_logs_user     ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_template ON email_logs(template_key);
CREATE INDEX IF NOT EXISTS idx_email_logs_status   ON email_logs(status);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. BROADCAST_LOGS — add missing spec columns
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE broadcast_logs
  ADD COLUMN IF NOT EXISTS audience   TEXT,
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS country    TEXT;

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. CONSENT_LOG — add missing spec fields
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE consent_log
  ADD COLUMN IF NOT EXISTS consent_given BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS version       TEXT DEFAULT '1.0';

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. SEAT_ALLOCATIONS — add spec design alongside current per-member design
--     (per-service+country capacity tracking for the ops dashboard)
-- ─────────────────────────────────────────────────────────────────────────────

-- The spec uses seat_allocations as a capacity table (service+country)
-- Current uses it as a per-member reservation table
-- We keep current design intact but add the capacity columns for ops use
ALTER TABLE seat_allocations
  ADD COLUMN IF NOT EXISTS service_id    UUID REFERENCES services(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS country       TEXT,
  ADD COLUMN IF NOT EXISTS max_seats     INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS current_count INTEGER DEFAULT 0;

-- Create the proper spec capacity view as a separate table
CREATE TABLE IF NOT EXISTS seat_capacity (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id    UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  country       TEXT NOT NULL,
  max_seats     INTEGER NOT NULL DEFAULT 5,
  current_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service_id, country),
  CONSTRAINT capacity_non_negative CHECK (current_count >= 0),
  CONSTRAINT capacity_within_max   CHECK (current_count <= max_seats)
);

CREATE TRIGGER set_seat_capacity_updated_at
  BEFORE UPDATE ON seat_capacity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE seat_capacity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seat_capacity: ops read all"
  ON seat_capacity FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));
CREATE POLICY "seat_capacity: ops write"
  ON seat_capacity FOR ALL
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 17. FIX: get_ops_action_counts to match spec
-- ─────────────────────────────────────────────────────────────────────────────

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
       AND membership_expiry_date::DATE <=
         CURRENT_DATE + INTERVAL '30 days'
       AND membership_expiry_date::DATE >= CURRENT_DATE)
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 18. FIX: claim_seat / release_seat — add spec-compliant versions
--     Keep old functions for backward compat; add new spec signatures
-- ─────────────────────────────────────────────────────────────────────────────

-- Spec-compliant claim_seat for seat_capacity table
CREATE OR REPLACE FUNCTION claim_seat_capacity(
  p_service_id UUID,
  p_country    TEXT
) RETURNS BOOLEAN AS $$
DECLARE v_claimed BOOLEAN := FALSE;
BEGIN
  UPDATE seat_capacity
  SET    current_count = current_count + 1,
         updated_at    = NOW()
  WHERE  service_id    = p_service_id
    AND  country       = p_country
    AND  current_count < max_seats
  RETURNING TRUE INTO v_claimed;
  RETURN COALESCE(v_claimed, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Spec-compliant release_seat for seat_capacity table
CREATE OR REPLACE FUNCTION release_seat_capacity(
  p_service_id UUID,
  p_country    TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE seat_capacity
  SET    current_count = GREATEST(current_count - 1, 0),
         updated_at    = NOW()
  WHERE  service_id = p_service_id
    AND  country    = p_country;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- 19. FIX: increment_view_count — spec signature (article_id, increment)
-- ─────────────────────────────────────────────────────────────────────────────

-- Keep old overloaded version for compat; add spec-compliant for articles
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 20. FIX: search_members — full spec-compliant signature and return type
-- ─────────────────────────────────────────────────────────────────────────────

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
  member_tier       TEXT,
  is_verified       BOOLEAN,
  profile_photo_url TEXT,
  primary_service   TEXT,
  similarity        FLOAT
) LANGUAGE sql STABLE AS $$
  SELECT
    m.id, m.slug,
    u.first_name || ' ' || u.last_name AS full_name,
    m.designation, m.headline, m.city, m.country,
    m.member_tier::TEXT, m.is_verified, m.profile_photo_url,
    s.name AS primary_service,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM members m
  JOIN users u ON m.user_id = u.id
  LEFT JOIN services s ON m.primary_service_id = s.id
  WHERE
    m.membership_status = 'active'
    AND m.embedding IS NOT NULL
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

-- ─────────────────────────────────────────────────────────────────────────────
-- 21. FIX: search_articles — full spec-compliant signature
-- ─────────────────────────────────────────────────────────────────────────────

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
    COALESCE(a.featured_image_url, a.cover_image_url) AS featured_image_url,
    COALESCE(a.read_time_minutes, a.read_time, 1)     AS read_time_minutes,
    a.published_at,
    sc.name AS category_name,
    u.first_name || ' ' || u.last_name AS author_name,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM articles a
  JOIN members m ON a.author_id = m.id
  JOIN users u ON m.user_id = u.id
  LEFT JOIN service_categories sc ON a.category_id = sc.id
  WHERE
    a.status = 'published'
    AND a.embedding IS NOT NULL
    AND 1 - (a.embedding <=> query_embedding) > match_threshold
    AND (filter_category_id IS NULL OR a.category_id = filter_category_id)
    AND (filter_service_id IS NULL OR a.service_id = filter_service_id)
    AND (exclude_id IS NULL OR a.id != exclude_id)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 22. FIX: search_events — full spec-compliant signature
-- ─────────────────────────────────────────────────────────────────────────────

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
    e.id, e.slug, e.title,
    e.event_type,
    e.event_format,
    COALESCE(e.start_date) AS start_datetime,
    e.country, e.city, e.is_free,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM events e
  WHERE
    (e.is_published = TRUE OR e.status = 'published')
    AND e.start_date > NOW()
    AND e.embedding IS NOT NULL
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
    AND (filter_country IS NULL OR e.country = filter_country)
    AND (filter_format IS NULL OR e.event_format = filter_format)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 23. FIX: get_digest_data — per-user per-category spec-compliant version
-- ─────────────────────────────────────────────────────────────────────────────

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
      (
        SELECT json_agg(
          json_build_object(
            'id',               a.id,
            'slug',             a.slug,
            'title',            a.title,
            'excerpt',          a.excerpt,
            'read_time_minutes', COALESCE(a.read_time_minutes, a.read_time, 1),
            'author_name',      u2.first_name || ' ' || u2.last_name
          )
          ORDER BY a.published_at DESC
        )
        FROM articles a
        JOIN members m2 ON a.author_id = m2.id
        JOIN users u2 ON m2.user_id = u2.id
        WHERE a.category_id = sc.id
          AND a.status = 'published'
          AND a.published_at >= p_week_start::TIMESTAMPTZ
          AND a.published_at <  (p_week_start + 7)::TIMESTAMPTZ
      ),
      '[]'::JSON
    )::JSONB AS articles
  FROM user_digest_subscriptions uds
  JOIN users u ON uds.user_id = u.id
  JOIN service_categories sc ON uds.category_id = sc.id
  WHERE uds.is_active = TRUE
    AND NOT EXISTS (
      SELECT 1 FROM digest_send_log dsl
      WHERE dsl.user_id = u.id
        AND dsl.category_id = sc.id
        AND dsl.week_start = p_week_start
    )
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 24. ADDITIONAL SPEC INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- Applications actionable (submitted/under_review) — partial index for ops dashboard
CREATE INDEX IF NOT EXISTS idx_applications_actionable
  ON applications(status)
  WHERE status IN ('submitted', 'under_review');

-- Members pending re-verification
CREATE INDEX IF NOT EXISTS idx_members_reverification
  ON members(re_verification_requested_at)
  WHERE is_verified = FALSE
    AND re_verification_requested_at IS NOT NULL;

-- Members expiring soon
CREATE INDEX IF NOT EXISTS idx_members_expiring
  ON members(membership_expiry_date)
  WHERE membership_status = 'active';

-- Articles embedding
CREATE INDEX IF NOT EXISTS idx_articles_embedding
  ON articles USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 15);

-- Members embedding (higher lists for larger dataset)
CREATE INDEX IF NOT EXISTS idx_members_embedding
  ON members USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 20);

-- ─────────────────────────────────────────────────────────────────────────────
-- 25. STORAGE BUCKET FIXES — align size limits with spec
-- ─────────────────────────────────────────────────────────────────────────────

-- Spec: article-images max 5MB (not 10MB); documents max 10MB (not 20MB)
UPDATE storage.buckets
SET file_size_limit = 5242880    -- 5MB
WHERE id = 'article-images';

UPDATE storage.buckets
SET file_size_limit   = 10485760,  -- 10MB
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/png']
WHERE id = 'documents';

-- ─────────────────────────────────────────────────────────────────────────────
-- END OF MIGRATION 020
-- ─────────────────────────────────────────────────────────────────────────────

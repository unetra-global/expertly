-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Switch embedding vectors from OpenAI (1536 dims) to
--            Google text-embedding-004 (768 dims)
--
-- Run this in the Supabase SQL editor BEFORE restarting the API.
-- Safe to run when no embeddings exist yet (embedding columns are all NULL).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Drop old vector indexes (must happen before altering column types)
DROP INDEX IF EXISTS idx_members_embedding;
DROP INDEX IF EXISTS idx_articles_embedding;
DROP INDEX IF EXISTS idx_events_embedding;

-- 2. Change vector column dimensions: 1536 → 768
--    If columns are NULL (never embedded), this is a no-op data-wise.
ALTER TABLE members ALTER COLUMN embedding TYPE vector(768)
  USING embedding::vector(768);

ALTER TABLE articles ALTER COLUMN embedding TYPE vector(768)
  USING embedding::vector(768);

ALTER TABLE events ALTER COLUMN embedding TYPE vector(768)
  USING embedding::vector(768);

-- 3. Recreate IVFFlat indexes for 768-dim cosine similarity
CREATE INDEX idx_members_embedding
  ON members USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 20);

CREATE INDEX idx_articles_embedding
  ON articles USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 15);

CREATE INDEX idx_events_embedding
  ON events USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- 4. Update RPC function signatures: query_embedding vector(1536) → vector(768)

CREATE OR REPLACE FUNCTION search_members(
  query_embedding   vector(768),
  match_threshold   FLOAT DEFAULT 0.3,
  match_count       INT DEFAULT 20,
  filter_country    TEXT DEFAULT NULL,
  filter_service_id UUID DEFAULT NULL,
  filter_min_years  INT  DEFAULT NULL,
  filter_max_years  INT  DEFAULT NULL,
  filter_verified   BOOLEAN DEFAULT NULL
)
RETURNS TABLE (
  id                 UUID,
  slug               TEXT,
  full_name          TEXT,
  designation        TEXT,
  headline           TEXT,
  city               TEXT,
  country            TEXT,
  member_tier        TEXT,
  is_verified        BOOLEAN,
  profile_photo_url  TEXT,
  primary_service    TEXT,
  similarity         FLOAT
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

CREATE OR REPLACE FUNCTION search_articles(
  query_embedding    vector(768),
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
  JOIN members m ON a.author_id = m.id
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

CREATE OR REPLACE FUNCTION search_events(
  query_embedding vector(768),
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
  start_date  DATE,
  country        TEXT,
  city           TEXT,
  is_free        BOOLEAN,
  similarity     FLOAT
) LANGUAGE sql STABLE AS $$
  SELECT
    e.id, e.slug, e.title, e.event_type, e.event_format,
    e.start_date, e.country, e.city, e.is_free,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM events e
  WHERE
    e.is_published = TRUE
    AND e.start_date > NOW()
    AND e.embedding IS NOT NULL
    AND e.embedding_status = 'generated'
    AND 1 - (e.embedding <=> query_embedding) > match_threshold
    AND (filter_country IS NULL OR e.country = filter_country)
    AND (filter_format IS NULL OR e.event_format = filter_format)
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

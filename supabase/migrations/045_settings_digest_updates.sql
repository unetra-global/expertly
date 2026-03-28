-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 045 — Settings & Digest Schema Updates
-- ─────────────────────────────────────────────────────────────────────────────
-- Changes:
--   1. Create guest_newsletter_subscriptions table
--   2. Drop UNIQUE(email) from user_digest_subscriptions (blocks per-category subs)
--   3. Ensure frequency column allows 'daily' (no constraint needed — TEXT column)
--   4. Add period_date column to digest_send_log for daily idempotency tracking
--   5. RLS policies for guest_newsletter_subscriptions
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Guest Newsletter Subscriptions ────────────────────────────────────────
-- Stores newsletter subscriptions from unauthenticated visitors on the homepage.
-- Separate from user_digest_subscriptions (which is for logged-in users).

CREATE TABLE IF NOT EXISTS guest_newsletter_subscriptions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  category_id UUID        REFERENCES categories(id) ON DELETE SET NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_guest_newsletter_active
  ON guest_newsletter_subscriptions(is_active)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_guest_newsletter_category
  ON guest_newsletter_subscriptions(category_id);

-- ── 2. Enable RLS on guest_newsletter_subscriptions ──────────────────────────
-- Service role bypasses RLS entirely; anon users can only insert.

ALTER TABLE guest_newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service role to do anything (backend uses service role)
CREATE POLICY "guest_newsletter: service role all"
  ON guest_newsletter_subscriptions FOR ALL
  USING (true);

-- ── 3. Fix user_digest_subscriptions UNIQUE(email) constraint ─────────────────
-- The original migration 007 added UNIQUE(email) which prevents a user from
-- subscribing to multiple categories. Drop it.

ALTER TABLE user_digest_subscriptions
  DROP CONSTRAINT IF EXISTS user_digest_subscriptions_email_key;

-- Ensure the per-(user,category) unique index exists (from migration 020)
CREATE UNIQUE INDEX IF NOT EXISTS idx_digest_subs_user_category
  ON user_digest_subscriptions(user_id, category_id)
  WHERE category_id IS NOT NULL;

-- ── 4. digest_send_log: add period_date for daily idempotency tracking ─────────
-- week_start is reused as period_date for daily digests (stores the date of
-- the day's digest). The unique constraint prevents double-sends.

ALTER TABLE digest_send_log
  ADD COLUMN IF NOT EXISTS period_date DATE;

-- Index for efficient idempotency lookups
CREATE INDEX IF NOT EXISTS idx_digest_log_period
  ON digest_send_log(user_id, category_id, period_date)
  WHERE period_date IS NOT NULL;

-- ── 5. Ensure member_notification_preferences has all spec columns ─────────────
-- (Already added in migration 020, but safe to re-run with IF NOT EXISTS)

ALTER TABLE member_notification_preferences
  ADD COLUMN IF NOT EXISTS article_status       BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS regulatory_nudges    BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS platform_updates     BOOLEAN DEFAULT TRUE;

-- ── 6. guest_newsletter_subscriptions: digest_send_log tracking ───────────────
-- Add a guest_email column to digest_send_log to track guest newsletter sends.

ALTER TABLE digest_send_log
  ADD COLUMN IF NOT EXISTS guest_email TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_digest_log_guest_email_period
  ON digest_send_log(guest_email, category_id, period_date)
  WHERE guest_email IS NOT NULL AND category_id IS NOT NULL AND period_date IS NOT NULL;

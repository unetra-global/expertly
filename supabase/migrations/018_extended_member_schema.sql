-- Migration 018: Extended member schema for Week 2 features
-- Adds fields referenced in the Week 2 API spec

-- ─── users: add first_name, last_name, last_login_at ─────────────────────────
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name      TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_name       TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_login_at   TIMESTAMPTZ;

-- ─── service_categories: add domain, is_active ───────────────────────────────
ALTER TABLE service_categories
  ADD COLUMN IF NOT EXISTS domain    TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- ─── services: add sort_order, regions ───────────────────────────────────────
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS sort_order INTEGER    NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS regions    TEXT[]     NOT NULL DEFAULT '{}';

-- ─── members: extended profile fields ────────────────────────────────────────
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS designation                  TEXT         NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS profile_photo_url            TEXT,
  ADD COLUMN IF NOT EXISTS city                         TEXT         NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS country                      TEXT         NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS member_tier                  TEXT         NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS is_verified                  BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verified_at                  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_featured                  BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS primary_service_id           UUID         REFERENCES services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS years_of_experience          INTEGER,
  ADD COLUMN IF NOT EXISTS consultation_fee_min_usd     NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS consultation_fee_max_usd     NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS qualifications               TEXT,
  ADD COLUMN IF NOT EXISTS re_verification_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS re_verification_reason       TEXT,
  ADD COLUMN IF NOT EXISTS pending_service_change       UUID         REFERENCES services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS pending_service_change_at    TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_start_date        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS membership_expiry_date       TIMESTAMPTZ;

-- ─── Indexes for new member fields ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_members_is_featured   ON members (is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_members_is_verified   ON members (is_verified);
CREATE INDEX IF NOT EXISTS idx_members_member_tier   ON members (member_tier);
CREATE INDEX IF NOT EXISTS idx_members_country       ON members (country);
CREATE INDEX IF NOT EXISTS idx_members_primary_svc   ON members (primary_service_id);

-- ─── Index for users.last_login_at ───────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users (last_login_at);

-- Migration 052: Add columns required by the member activation flow.
-- These columns are written by activateMember() in ops.service.ts but were
-- never included in any prior migration.

-- ─── members: activation audit columns ──────────────────────────────────────
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS region       TEXT,
  ADD COLUMN IF NOT EXISTS state        TEXT,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS activated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS renewed_at   TIMESTAMPTZ;

-- ─── members: change qualifications from TEXT to TEXT[] ──────────────────────
-- Applications store qualifications as TEXT[]; we need members to match.
-- Safely migrate any existing TEXT values to single-element arrays.
ALTER TABLE members
  ADD COLUMN IF NOT EXISTS qualifications_list TEXT[] NOT NULL DEFAULT '{}';

-- Copy existing TEXT qualifications into the new array column
UPDATE members
SET qualifications_list = ARRAY[qualifications]
WHERE qualifications IS NOT NULL
  AND qualifications != ''
  AND qualifications_list = '{}';

-- Drop old TEXT column and rename array column to take its place
ALTER TABLE members DROP COLUMN IF EXISTS qualifications;
ALTER TABLE members RENAME COLUMN qualifications_list TO qualifications;

-- ─── applications: add activated_at ─────────────────────────────────────────
-- The application status update in activateMember() also writes activated_at.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ;

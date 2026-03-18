-- Migration 029: Add region, phone, contact_email to applications table
-- Also add region to members table (populated when application is approved)

-- ── applications ──────────────────────────────────────────────────────────────

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS region       TEXT,
  ADD COLUMN IF NOT EXISTS phone        TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- ── members ───────────────────────────────────────────────────────────────────

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS region TEXT;

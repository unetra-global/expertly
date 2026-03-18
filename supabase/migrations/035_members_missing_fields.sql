-- Add fields that are collected during onboarding but were missing from members table.
-- These are copied from applications → members during the activation flow.

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS key_engagements    JSONB NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS motivation_why        TEXT,
  ADD COLUMN IF NOT EXISTS motivation_engagement TEXT,
  ADD COLUMN IF NOT EXISTS motivation_unique     TEXT;

-- Migration 027: Add rejection_reason and membership_tier to applications table
-- These columns were missing from the applications table schema

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS membership_tier  TEXT;

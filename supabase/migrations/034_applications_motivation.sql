-- Add motivation questions to applications table (Step 4 of the onboarding form)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS motivation_why        TEXT,
  ADD COLUMN IF NOT EXISTS motivation_engagement TEXT,
  ADD COLUMN IF NOT EXISTS motivation_unique     TEXT;

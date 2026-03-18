-- Add key_engagements to applications table
-- Stores up to 5 free-text bullet points: why the applicant is the best
-- person for their chosen service category.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS key_engagements JSONB NOT NULL DEFAULT '[]';

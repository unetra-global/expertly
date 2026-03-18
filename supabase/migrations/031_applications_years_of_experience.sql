-- Add years_of_experience to applications table
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS years_of_experience INTEGER;

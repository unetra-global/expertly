-- Fix regulatory_updates schema so RSS ingestion can actually write to it
--
-- Problems fixed:
-- 1. relevant_categories was UUID[] but processor inserts text slugs → change to TEXT[]
-- 2. body TEXT NOT NULL had no default → processor never writes body → make nullable
-- 3. Ensure published_date column exists (added in 020 but guard with IF NOT EXISTS)

-- 1. Fix relevant_categories type
ALTER TABLE regulatory_updates
  ALTER COLUMN relevant_categories TYPE TEXT[]
  USING relevant_categories::TEXT[];

-- 2. Make body nullable so inserts without body don't fail
ALTER TABLE regulatory_updates
  ALTER COLUMN body DROP NOT NULL,
  ALTER COLUMN body SET DEFAULT '';

-- 3. Ensure published_date column exists
ALTER TABLE regulatory_updates
  ADD COLUMN IF NOT EXISTS published_date TIMESTAMPTZ;

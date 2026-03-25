-- Convert member_tier column from TEXT to member_tier_enum.
-- member_tier_enum was created in migration 020 with values:
--   'budding_entrepreneur', 'seasoned_professional'

-- Step 1: Normalize existing data — map any non-enum values to 'budding_entrepreneur'
UPDATE members
SET member_tier = 'budding_entrepreneur'
WHERE member_tier IS NULL
   OR member_tier NOT IN ('budding_entrepreneur', 'seasoned_professional');

-- Step 2: Convert column to enum
ALTER TABLE members
  ALTER COLUMN member_tier SET NOT NULL,
  ALTER COLUMN member_tier SET DEFAULT 'budding_entrepreneur',
  ALTER COLUMN member_tier TYPE member_tier_enum USING member_tier::member_tier_enum;

-- Drop legacy columns from the applications table that were part of the original
-- v1 schema (migration 005) and have since been replaced by more granular columns.
--
-- Replacements:
--   full_name           → first_name + last_name
--   email               → contact_email
--   location            → city + state + country + region
--   why_join            → motivation_why
--   value_proposition   → motivation_unique
--   referral_source     → removed (never collected in current onboarding form)
--   primary_category_id → primary_service_id  (services not service_categories)
--   service_ids         → primary_service_id + secondary_service_ids

ALTER TABLE applications
  DROP COLUMN IF EXISTS full_name,
  DROP COLUMN IF EXISTS email,
  DROP COLUMN IF EXISTS location,
  DROP COLUMN IF EXISTS why_join,
  DROP COLUMN IF EXISTS value_proposition,
  DROP COLUMN IF EXISTS referral_source,
  DROP COLUMN IF EXISTS primary_category_id,
  DROP COLUMN IF EXISTS service_ids;

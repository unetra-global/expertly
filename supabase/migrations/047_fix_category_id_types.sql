-- Migration 047: Add category_id (text) to guest_newsletter_subscriptions
-- The CREATE TABLE IF NOT EXISTS in 045 skipped because the table already existed
-- from an earlier migration, so category_id was never added.
-- We add it here as text (not uuid) to accept the version-0 UUIDs used as category IDs.

ALTER TABLE guest_newsletter_subscriptions
  ADD COLUMN IF NOT EXISTS category_id TEXT;

-- Also drop the UNIQUE(email) constraint so multiple rows (one per category)
-- can be inserted for the same email address.
ALTER TABLE guest_newsletter_subscriptions
  DROP CONSTRAINT IF EXISTS guest_newsletter_subscriptions_email_key;

-- Index for efficient lookups by email+category
CREATE INDEX IF NOT EXISTS idx_guest_newsletter_category
  ON guest_newsletter_subscriptions(category_id);

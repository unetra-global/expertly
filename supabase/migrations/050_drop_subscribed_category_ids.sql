-- Migration 050: Drop unused subscribed_category_ids column from guest_newsletter_subscriptions
-- Category subscriptions are now stored as individual rows with category_id (one row per category).
-- The old array column is unused and misleading.

ALTER TABLE guest_newsletter_subscriptions
  DROP COLUMN IF EXISTS subscribed_category_ids;

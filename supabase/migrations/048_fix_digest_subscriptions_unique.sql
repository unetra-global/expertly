-- Migration 048: Fix user_digest_subscriptions unique constraints
-- The table has UNIQUE(email) which prevents a user from subscribing to more
-- than one category. Drop it and replace with UNIQUE(user_id, category_id)
-- so each user can have one row per category.

ALTER TABLE user_digest_subscriptions
  DROP CONSTRAINT IF EXISTS user_digest_subscriptions_email_key;

-- Prevent duplicate rows for the same user+category pair
ALTER TABLE user_digest_subscriptions
  DROP CONSTRAINT IF EXISTS user_digest_subscriptions_user_id_category_id_key;

ALTER TABLE user_digest_subscriptions
  ADD CONSTRAINT user_digest_subscriptions_user_id_category_id_key
  UNIQUE (user_id, category_id);

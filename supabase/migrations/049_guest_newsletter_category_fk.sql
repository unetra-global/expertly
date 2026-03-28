-- Migration 049: Fix guest_newsletter_subscriptions.category_id type and FK
-- Migration 047 added category_id as TEXT due to confusion over version-0 UUIDs.
-- PostgreSQL handles version-0 UUIDs (e.g. 00000000-0000-0000-0000-000000000003)
-- as valid UUID values. Convert the column to UUID and add a proper foreign key.

ALTER TABLE guest_newsletter_subscriptions
  ALTER COLUMN category_id TYPE UUID USING category_id::uuid;

ALTER TABLE guest_newsletter_subscriptions
  ADD CONSTRAINT guest_newsletter_subscriptions_category_id_fkey
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

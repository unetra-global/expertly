-- Replace the old boolean agreed_to_terms with an extensible JSONB consents column.
-- Each consent type is a key; the value records accepted_at and the policy version.
-- Example:
-- {
--   "terms_of_service":        { "accepted_at": "2026-03-19T10:00:00Z", "version": "1.0" },
--   "privacy_policy":          { "accepted_at": "2026-03-19T10:00:00Z", "version": "1.0" },
--   "credential_verification": { "accepted_at": "2026-03-19T10:00:00Z", "version": "1.0" }
-- }

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS consents JSONB NOT NULL DEFAULT '{}';

ALTER TABLE applications
  DROP COLUMN IF EXISTS agreed_to_terms;

-- Migration 025: Add contact_phone to members + seed contact data

ALTER TABLE members
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Seed contact info for existing demo members
UPDATE members SET
  contact_phone = '+44 20 7946 0' || LPAD((FLOOR(RANDOM() * 900 + 100))::TEXT, 3, '0'),
  contact_email = REPLACE(slug, '-', '.') || '@expertly.com'
WHERE slug LIKE 'oliver-bennett' OR slug LIKE 'mei-nakamura' OR slug LIKE 'amara-osei'
   OR slug LIKE 'preethi-rajan' OR membership_status = 'active';

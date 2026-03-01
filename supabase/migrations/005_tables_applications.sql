-- Applications table

CREATE TABLE applications (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Step 1: Personal
  full_name           TEXT NOT NULL DEFAULT '',
  email               TEXT NOT NULL DEFAULT '',
  phone               TEXT,
  location            TEXT NOT NULL DEFAULT '',
  linkedin_url        TEXT,
  website_url         TEXT,
  -- Step 2: Professional
  headline            TEXT NOT NULL DEFAULT '',
  bio                 TEXT NOT NULL DEFAULT '',
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  primary_category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  service_ids         UUID[] NOT NULL DEFAULT '{}',
  -- Step 3: Fit
  why_join            TEXT NOT NULL DEFAULT '',
  value_proposition   TEXT NOT NULL DEFAULT '',
  referral_source     TEXT,
  agreed_to_terms     BOOLEAN NOT NULL DEFAULT false,
  -- Meta
  status              application_status NOT NULL DEFAULT 'draft',
  reviewer_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  review_notes        TEXT,
  reviewed_at         TIMESTAMPTZ,
  submitted_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

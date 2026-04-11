-- All enum types used across the Expertly platform (final consolidated state)

-- ── Core roles & statuses ────────────────────────────────────────────────────

CREATE TYPE user_role AS ENUM ('user', 'member', 'ops', 'backend_admin');

CREATE TYPE membership_status AS ENUM (
  'pending',
  'active',
  'suspended',
  'cancelled',
  'pending_payment',
  'expired'
);

CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected',
  'waitlisted',
  'archived'
);

CREATE TYPE article_status AS ENUM (
  'draft',
  'published',
  'archived',
  'submitted',
  'under_review',
  'rejected'
);

CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

CREATE TYPE consultation_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'completed',
  'cancelled',
  'responded',
  'closed'
);

CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TYPE consent_type AS ENUM ('terms_of_service', 'privacy_policy', 'marketing');

-- ── Extended enums ───────────────────────────────────────────────────────────

CREATE TYPE auth_provider AS ENUM ('linkedin', 'email');

CREATE TYPE member_tier_enum AS ENUM ('budding_entrepreneur', 'seasoned_professional');

CREATE TYPE embedding_status AS ENUM ('pending', 'generated', 'failed');

-- ── Country enum ─────────────────────────────────────────────────────────────

CREATE TYPE country_enum AS ENUM (
  -- Africa
  'Algeria', 'Angola', 'Botswana', 'Cameroon', 'Côte d''Ivoire',
  'Egypt', 'Ethiopia', 'Ghana', 'Kenya', 'Libya',
  'Madagascar', 'Mauritius', 'Morocco', 'Mozambique', 'Namibia',
  'Nigeria', 'Rwanda', 'Senegal', 'South Africa', 'Tanzania',
  'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe',
  -- Asia-Pacific
  'Australia', 'Brunei', 'Cambodia', 'China', 'Fiji',
  'Hong Kong', 'Indonesia', 'Japan', 'Malaysia', 'Mongolia',
  'Myanmar', 'New Zealand', 'Philippines', 'Singapore', 'South Korea',
  'Taiwan', 'Thailand', 'Vietnam',
  -- Central Asia
  'Armenia', 'Azerbaijan', 'Georgia', 'Kazakhstan', 'Kyrgyzstan',
  'Tajikistan', 'Turkmenistan', 'Uzbekistan',
  -- Europe
  'Albania', 'Austria', 'Belgium', 'Bosnia and Herzegovina', 'Bulgaria',
  'Croatia', 'Cyprus', 'Czech Republic', 'Denmark', 'Estonia',
  'Finland', 'France', 'Germany', 'Greece', 'Hungary',
  'Iceland', 'Ireland', 'Italy', 'Latvia', 'Lithuania',
  'Luxembourg', 'Malta', 'Moldova', 'Montenegro', 'Netherlands',
  'North Macedonia', 'Norway', 'Poland', 'Portugal', 'Romania',
  'Russia', 'Serbia', 'Slovakia', 'Slovenia', 'Spain',
  'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'United Kingdom',
  -- Latin America & Caribbean
  'Argentina', 'Bolivia', 'Brazil', 'Chile', 'Colombia',
  'Costa Rica', 'Dominican Republic', 'Ecuador', 'Guatemala', 'Jamaica',
  'Mexico', 'Panama', 'Paraguay', 'Peru', 'Trinidad and Tobago',
  'Uruguay', 'Venezuela',
  -- Middle East
  'Bahrain', 'Iran', 'Iraq', 'Israel', 'Jordan',
  'Kuwait', 'Lebanon', 'Oman', 'Qatar', 'Saudi Arabia',
  'United Arab Emirates',
  -- North America
  'Canada', 'United States',
  -- South Asia
  'Afghanistan', 'Bangladesh', 'India', 'Maldives', 'Nepal',
  'Pakistan', 'Sri Lanka'
);

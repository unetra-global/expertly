-- All enum types used across the Expertly platform

CREATE TYPE user_role AS ENUM ('user', 'member', 'ops', 'backend_admin');

CREATE TYPE membership_status AS ENUM ('pending', 'active', 'suspended', 'cancelled');

CREATE TYPE application_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'approved',
  'rejected'
);

CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');

CREATE TYPE consultation_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'completed',
  'cancelled'
);

CREATE TYPE job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TYPE consent_type AS ENUM ('terms_of_service', 'privacy_policy', 'marketing');

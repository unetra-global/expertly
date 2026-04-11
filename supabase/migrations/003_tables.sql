-- All application tables in final consolidated state.
-- Dependency order: categories → services → users → members → ...

-- ── categories (originally service_categories, renamed in migration 040) ─────

CREATE TABLE categories (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  domain      TEXT,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── services ─────────────────────────────────────────────────────────────────

CREATE TABLE services (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID        NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT true,
  sort_order  INTEGER     NOT NULL DEFAULT 0,
  regions     TEXT[]      NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── users ─────────────────────────────────────────────────────────────────────

CREATE TABLE users (
  id                   UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
  supabase_uid         UUID          NOT NULL UNIQUE,
  email                TEXT          NOT NULL UNIQUE,
  first_name           TEXT          NOT NULL DEFAULT '',
  last_name            TEXT          NOT NULL DEFAULT '',
  role                 user_role     NOT NULL DEFAULT 'user',
  is_active            BOOLEAN       NOT NULL DEFAULT true,
  is_deleted           BOOLEAN       NOT NULL DEFAULT false,
  auth_provider        auth_provider DEFAULT 'email',
  linkedin_id          TEXT,
  avatar_url           TEXT,
  timezone             TEXT          DEFAULT 'UTC',
  deleted_at           TIMESTAMPTZ,
  deletion_reason      TEXT,
  last_login_at        TIMESTAMPTZ,
  profile_photo_base64 TEXT,
  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ── members ───────────────────────────────────────────────────────────────────

CREATE TABLE members (
  id                           UUID              PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                      UUID              NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug                         TEXT              NOT NULL UNIQUE,
  -- Profile
  headline                     TEXT              NOT NULL DEFAULT '',
  bio                          TEXT              NOT NULL DEFAULT '',
  designation                  TEXT              NOT NULL DEFAULT '',
  profile_photo_url            TEXT,
  avatar_url                   TEXT,
  website                      TEXT,
  linkedin_url                 TEXT,
  -- Location
  city                         TEXT              NOT NULL DEFAULT '',
  country                      country_enum,
  region                       TEXT,
  state                        TEXT,
  phone_extension              TEXT,
  contact_phone                TEXT,
  contact_email                TEXT,
  -- Membership
  member_tier                  member_tier_enum  NOT NULL DEFAULT 'budding_entrepreneur',
  membership_status            membership_status NOT NULL DEFAULT 'pending',
  membership_start_date        TIMESTAMPTZ,
  membership_expiry_date       TIMESTAMPTZ,
  is_verified                  BOOLEAN           NOT NULL DEFAULT false,
  verified_at                  TIMESTAMPTZ,
  is_featured                  BOOLEAN           NOT NULL DEFAULT false,
  -- Professional
  primary_service_id           UUID              REFERENCES services(id) ON DELETE SET NULL,
  years_of_experience          INTEGER,
  consultation_fee_min_usd     NUMERIC(10,2),
  consultation_fee_max_usd     NUMERIC(10,2),
  firm_name                    TEXT,
  firm_size                    TEXT,
  qualifications               TEXT[]            NOT NULL DEFAULT '{}',
  credentials                  JSONB             NOT NULL DEFAULT '[]',
  testimonials                 JSONB             NOT NULL DEFAULT '[]',
  work_experience              JSONB             NOT NULL DEFAULT '[]',
  education                    JSONB             NOT NULL DEFAULT '[]',
  key_engagements              JSONB             NOT NULL DEFAULT '[]',
  motivation_why               TEXT,
  motivation_engagement        TEXT,
  motivation_unique            TEXT,
  availability                 JSONB,
  engagement                   JSONB,
  engagements                  JSONB             DEFAULT '[]',
  -- AI / embedding
  embedding                    vector(768),
  embedding_status             embedding_status  DEFAULT 'pending',
  embedding_generated_at       TIMESTAMPTZ,
  -- Analytics
  view_count                   INTEGER           NOT NULL DEFAULT 0,
  profile_view_count           INTEGER           DEFAULT 0,
  -- Payment / activation
  payment_received_at          TIMESTAMPTZ,
  payment_received_by          UUID              REFERENCES users(id) ON DELETE SET NULL,
  activated_at                 TIMESTAMPTZ,
  activated_by                 UUID              REFERENCES users(id) ON DELETE SET NULL,
  renewed_at                   TIMESTAMPTZ,
  -- Re-verification
  re_verification_requested_at TIMESTAMPTZ,
  re_verification_reason       TEXT,
  pending_service_change       UUID              REFERENCES services(id) ON DELETE SET NULL,
  pending_service_change_at    TIMESTAMPTZ,
  -- Timestamps
  created_at                   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

-- ── member_services ───────────────────────────────────────────────────────────

CREATE TABLE member_services (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id    UUID        NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  service_id   UUID        NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  fee_from     NUMERIC(10,2),
  fee_to       NUMERIC(10,2),
  fee_currency TEXT        NOT NULL DEFAULT 'USD',
  description  TEXT,
  is_primary   BOOLEAN     DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, service_id)
);

-- ── applications ─────────────────────────────────────────────────────────────

CREATE TABLE applications (
  id                       UUID               PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- Personal
  first_name               TEXT,
  last_name                TEXT,
  phone                    TEXT,
  phone_extension          TEXT,
  linkedin_url             TEXT,
  website_url              TEXT,
  designation              TEXT,
  profile_photo_url        TEXT,
  -- Professional
  headline                 TEXT               NOT NULL DEFAULT '',
  bio                      TEXT               NOT NULL DEFAULT '',
  years_of_experience      INTEGER            NOT NULL DEFAULT 0,
  firm_name                TEXT,
  firm_size                TEXT,
  qualifications           TEXT,
  -- Location
  country                  country_enum,
  region                   TEXT,
  state                    TEXT,
  city                     TEXT,
  contact_email            TEXT,
  -- Services
  primary_service_id       UUID               REFERENCES services(id) ON DELETE SET NULL,
  secondary_service_ids    UUID[]             NOT NULL DEFAULT '{}',
  -- Experience
  credentials              JSONB              NOT NULL DEFAULT '[]',
  work_experience          JSONB              NOT NULL DEFAULT '[]',
  education                JSONB              NOT NULL DEFAULT '[]',
  key_engagements          JSONB              NOT NULL DEFAULT '[]',
  -- Motivation
  motivation_why           TEXT,
  motivation_engagement    TEXT,
  motivation_unique        TEXT,
  -- Availability / engagement
  engagements              JSONB              NOT NULL DEFAULT '{}',
  availability             JSONB              NOT NULL DEFAULT '{}',
  -- Consents
  consents                 JSONB              NOT NULL DEFAULT '{}',
  -- Workflow
  creation_mode            TEXT               NOT NULL DEFAULT 'manual',
  current_step             INTEGER            NOT NULL DEFAULT 0,
  status                   application_status NOT NULL DEFAULT 'draft',
  rejection_reason         TEXT,
  membership_tier          TEXT,
  reviewer_id              UUID               REFERENCES users(id) ON DELETE SET NULL,
  review_notes             TEXT,
  reviewed_at              TIMESTAMPTZ,
  re_application_eligible_at TIMESTAMPTZ,
  submitted_at             TIMESTAMPTZ,
  activated_at             TIMESTAMPTZ,
  created_at               TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- ── articles ─────────────────────────────────────────────────────────────────

CREATE TABLE articles (
  id                   UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id            UUID             NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title                TEXT             NOT NULL,
  slug                 TEXT             NOT NULL UNIQUE,
  subtitle             TEXT,
  body                 TEXT             NOT NULL DEFAULT '',
  excerpt              TEXT,
  cover_image_url      TEXT,
  featured_image_url   TEXT,
  tags                 TEXT[]           NOT NULL DEFAULT '{}',
  status               article_status   NOT NULL DEFAULT 'draft',
  view_count           INTEGER          NOT NULL DEFAULT 0,
  read_time            INTEGER          NOT NULL DEFAULT 1,
  read_time_minutes    INTEGER          DEFAULT 1,
  word_count           INTEGER,
  published_at         TIMESTAMPTZ,
  submitted_at         TIMESTAMPTZ,
  -- Categorisation
  category_id          UUID             REFERENCES categories(id) ON DELETE SET NULL,
  service_id           UUID             REFERENCES services(id) ON DELETE SET NULL,
  creation_mode        TEXT             NOT NULL DEFAULT 'manual',
  -- AI fields
  ai_qa_inputs         JSONB,
  ai_summary           TEXT,
  regulatory_update_id UUID,
  embedding            vector(768),
  embedding_status     embedding_status DEFAULT 'pending',
  embedding_error      TEXT,
  embedding_generated_at TIMESTAMPTZ,
  -- Review
  reviewed_by          UUID             REFERENCES users(id) ON DELETE SET NULL,
  rejection_reason     TEXT,
  -- SEO
  meta_title           TEXT,
  meta_description     TEXT,
  created_at           TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ── events ────────────────────────────────────────────────────────────────────

CREATE TABLE events (
  id                   UUID             PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id         UUID             REFERENCES members(id) ON DELETE CASCADE,  -- nullable: ops can create events
  title                TEXT             NOT NULL,
  slug                 TEXT             NOT NULL UNIQUE,
  description          TEXT             NOT NULL DEFAULT '',
  short_description    TEXT,
  cover_image_url      TEXT,
  -- Schedule
  start_date           TIMESTAMPTZ      NOT NULL,
  end_date             TIMESTAMPTZ,                                                  -- nullable: single-day or TBD
  timezone             TEXT,
  -- Format
  event_type           TEXT,            -- conference|webinar|workshop|networking
  event_format         TEXT,            -- in_person|virtual|hybrid
  is_virtual           BOOLEAN          NOT NULL DEFAULT false,
  virtual_url          TEXT,
  online_url           TEXT,
  -- Location
  country              country_enum,
  city                 TEXT,
  location             TEXT,
  venue_name           TEXT,
  -- Details
  capacity             INTEGER,
  is_free              BOOLEAN          DEFAULT FALSE,
  registration_url     TEXT,
  speakers             JSONB            NOT NULL DEFAULT '[]',
  tags                 TEXT[]           DEFAULT '{}',
  organiser_name       TEXT,
  -- Publishing
  status               event_status     NOT NULL DEFAULT 'draft',
  is_published         BOOLEAN          DEFAULT FALSE,
  is_featured          BOOLEAN          DEFAULT FALSE,
  source               TEXT             DEFAULT 'manual',
  -- AI / embedding
  embedding            vector(768),
  embedding_status     embedding_status DEFAULT 'pending',
  embedding_generated_at TIMESTAMPTZ,
  embedding_error      TEXT,
  created_at           TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- ── consultation_requests ─────────────────────────────────────────────────────

CREATE TABLE consultation_requests (
  id               UUID                PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id     UUID                NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id        UUID                NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  service_id       UUID                REFERENCES services(id) ON DELETE SET NULL,
  subject          TEXT,
  message          TEXT                NOT NULL,
  description      TEXT,
  preferred_time   TEXT,
  status           consultation_status NOT NULL DEFAULT 'pending',
  scheduled_at     TIMESTAMPTZ,
  response_message TEXT,
  created_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

-- ── user_digest_subscriptions ─────────────────────────────────────────────────

CREATE TABLE user_digest_subscriptions (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID        REFERENCES users(id) ON DELETE CASCADE,
  email        TEXT        NOT NULL,
  is_active    BOOLEAN     NOT NULL DEFAULT true,
  category_id  UUID        REFERENCES categories(id) ON DELETE CASCADE,
  frequency    TEXT        DEFAULT 'weekly',
  last_sent_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- ── digest_send_log ───────────────────────────────────────────────────────────

CREATE TABLE digest_send_log (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_count  INTEGER     NOT NULL DEFAULT 0,
  status           TEXT        NOT NULL DEFAULT 'sent',
  error_message    TEXT,
  user_id          UUID        REFERENCES users(id) ON DELETE CASCADE,
  category_id      UUID        REFERENCES categories(id),
  week_start       DATE,
  period_date      DATE,
  guest_email      TEXT
);

-- ── member_notification_preferences ──────────────────────────────────────────

CREATE TABLE member_notification_preferences (
  id                       UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id                UUID        NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  email_on_consultation    BOOLEAN     NOT NULL DEFAULT true,
  email_on_article_comment BOOLEAN     NOT NULL DEFAULT true,
  email_on_event_rsvp      BOOLEAN     NOT NULL DEFAULT true,
  article_status           BOOLEAN     DEFAULT TRUE,
  regulatory_nudges        BOOLEAN     DEFAULT TRUE,
  platform_updates         BOOLEAN     DEFAULT TRUE,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── regulatory_updates ────────────────────────────────────────────────────────

CREATE TABLE regulatory_updates (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title               TEXT        NOT NULL,
  body                TEXT        DEFAULT '',
  category            TEXT        NOT NULL DEFAULT 'general',
  source              TEXT,
  source_url          TEXT,
  summary             TEXT,
  relevant_categories TEXT[]      DEFAULT '{}',
  relevant_regions    TEXT[]      DEFAULT '{}',
  published_at        TIMESTAMPTZ,
  published_date      DATE,
  is_active           BOOLEAN     NOT NULL DEFAULT true,
  is_processed        BOOLEAN     DEFAULT FALSE,
  nudges_sent         INTEGER     DEFAULT 0,
  nudges_sent_at      TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── background_jobs ───────────────────────────────────────────────────────────

CREATE TABLE background_jobs (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  type         TEXT        NOT NULL,
  payload      JSONB       NOT NULL DEFAULT '{}',
  status       job_status  NOT NULL DEFAULT 'pending',
  attempts     INTEGER     NOT NULL DEFAULT 0,
  last_error   TEXT,
  user_id      UUID        REFERENCES users(id) ON DELETE CASCADE,
  queue        TEXT,
  job_type     TEXT,
  result       JSONB,
  error        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

-- Required for Supabase Realtime on this table
ALTER TABLE background_jobs REPLICA IDENTITY FULL;

-- ── consent_log ───────────────────────────────────────────────────────────────

CREATE TABLE consent_log (
  id             UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID         REFERENCES users(id) ON DELETE SET NULL,
  consent_type   consent_type NOT NULL,
  ip_address     INET,
  user_agent     TEXT,
  consent_given  BOOLEAN      DEFAULT TRUE,
  version        TEXT         DEFAULT '1.0',
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ── email_logs ────────────────────────────────────────────────────────────────

CREATE TABLE email_logs (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email        TEXT        NOT NULL,
  subject         TEXT        NOT NULL,
  template        TEXT        NOT NULL,
  status          TEXT        NOT NULL DEFAULT 'sent',
  resend_id       TEXT,
  error           TEXT,
  user_id         UUID        REFERENCES users(id) ON DELETE SET NULL,
  template_key    TEXT,
  provider        TEXT        DEFAULT 'resend',
  provider_msg_id TEXT,
  error_message   TEXT,
  sent_at         TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── broadcast_logs ────────────────────────────────────────────────────────────

CREATE TABLE broadcast_logs (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  ops_user_id      UUID        REFERENCES users(id) ON DELETE SET NULL,
  subject          TEXT        NOT NULL,
  body             TEXT        NOT NULL,
  recipient_count  INTEGER     NOT NULL DEFAULT 0,
  status           TEXT        NOT NULL DEFAULT 'sent',
  audience         TEXT,
  service_id       UUID        REFERENCES services(id) ON DELETE SET NULL,
  country          TEXT,
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── guest_newsletter_subscriptions ───────────────────────────────────────────

CREATE TABLE guest_newsletter_subscriptions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  category_id UUID        REFERENCES categories(id) ON DELETE SET NULL,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────────────────────────────────────────

-- users
CREATE INDEX idx_users_supabase_uid  ON users(supabase_uid);
CREATE INDEX idx_users_email         ON users(email);
CREATE INDEX idx_users_role          ON users(role);
CREATE INDEX idx_users_last_login    ON users(last_login_at);

-- categories & services
CREATE INDEX idx_services_category_id ON services(category_id);
CREATE INDEX idx_services_slug        ON services(slug);
CREATE INDEX idx_services_is_active   ON services(is_active);

-- members
CREATE INDEX idx_members_user_id           ON members(user_id);
CREATE INDEX idx_members_slug              ON members(slug);
CREATE INDEX idx_members_membership_status ON members(membership_status);
CREATE INDEX idx_members_is_featured       ON members(is_featured) WHERE is_featured = true;
CREATE INDEX idx_members_is_verified       ON members(is_verified);
CREATE INDEX idx_members_member_tier       ON members(member_tier);
CREATE INDEX idx_members_country           ON members(country);
CREATE INDEX idx_members_primary_svc       ON members(primary_service_id);
CREATE INDEX idx_members_reverification    ON members(re_verification_requested_at)
  WHERE is_verified = FALSE AND re_verification_requested_at IS NOT NULL;
CREATE INDEX idx_members_expiring          ON members(membership_expiry_date)
  WHERE membership_status = 'active';
CREATE INDEX idx_members_headline_trgm     ON members USING gin (headline gin_trgm_ops);
CREATE INDEX idx_members_bio_trgm          ON members USING gin (bio gin_trgm_ops);
CREATE INDEX idx_members_embedding         ON members USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 20);

-- member_services
CREATE INDEX idx_member_services_member_id  ON member_services(member_id);
CREATE INDEX idx_member_services_service_id ON member_services(service_id);

-- applications
CREATE INDEX idx_applications_user_id    ON applications(user_id);
CREATE INDEX idx_applications_status     ON applications(status);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_applications_actionable ON applications(status)
  WHERE status IN ('submitted', 'under_review');

-- articles
CREATE INDEX idx_articles_author_id      ON articles(author_id);
CREATE INDEX idx_articles_slug           ON articles(slug);
CREATE INDEX idx_articles_status         ON articles(status);
CREATE INDEX idx_articles_published_at   ON articles(published_at DESC);
CREATE INDEX idx_articles_tags           ON articles USING gin (tags);
CREATE INDEX idx_articles_title_trgm     ON articles USING gin (title gin_trgm_ops);
CREATE INDEX idx_articles_embedding      ON articles USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 15);

-- events
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_slug         ON events(slug);
CREATE INDEX idx_events_status       ON events(status);
CREATE INDEX idx_events_start_date   ON events(start_date ASC);
CREATE INDEX idx_events_embedding    ON events USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);

-- consultation_requests
CREATE INDEX idx_consultation_requester_id ON consultation_requests(requester_id);
CREATE INDEX idx_consultation_member_id    ON consultation_requests(member_id);
CREATE INDEX idx_consultation_status       ON consultation_requests(status);
CREATE INDEX idx_consultation_created_at   ON consultation_requests(created_at DESC);

-- user_digest_subscriptions
CREATE UNIQUE INDEX idx_digest_subs_user_category ON user_digest_subscriptions(user_id, category_id)
  WHERE category_id IS NOT NULL;
CREATE INDEX idx_digest_subs_email     ON user_digest_subscriptions(email);
CREATE INDEX idx_digest_subs_is_active ON user_digest_subscriptions(is_active);

-- digest_send_log
CREATE UNIQUE INDEX idx_digest_log_user_cat_week ON digest_send_log(user_id, category_id, week_start)
  WHERE user_id IS NOT NULL AND category_id IS NOT NULL AND week_start IS NOT NULL;
CREATE UNIQUE INDEX idx_digest_log_guest_email_period ON digest_send_log(guest_email, category_id, period_date)
  WHERE guest_email IS NOT NULL AND category_id IS NOT NULL AND period_date IS NOT NULL;
CREATE INDEX idx_digest_log_week   ON digest_send_log(week_start);
CREATE INDEX idx_digest_log_period ON digest_send_log(user_id, category_id, period_date)
  WHERE period_date IS NOT NULL;

-- background_jobs
CREATE INDEX idx_bg_jobs_status     ON background_jobs(status);
CREATE INDEX idx_bg_jobs_type       ON background_jobs(type);
CREATE INDEX idx_bg_jobs_created_at ON background_jobs(created_at DESC);
CREATE INDEX idx_jobs_user          ON background_jobs(user_id);

-- regulatory_updates
CREATE INDEX idx_regulatory_published_at ON regulatory_updates(published_at DESC);
CREATE INDEX idx_regulatory_is_active    ON regulatory_updates(is_active);
CREATE INDEX idx_regulatory_processed    ON regulatory_updates(is_processed)
  WHERE is_processed = FALSE;

-- consent_log
CREATE INDEX idx_consent_user_id ON consent_log(user_id);
CREATE INDEX idx_consent_type    ON consent_log(consent_type);

-- email_logs
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_email_logs_status     ON email_logs(status);
CREATE INDEX idx_email_logs_user       ON email_logs(user_id);
CREATE INDEX idx_email_logs_template   ON email_logs(template_key);

-- guest_newsletter_subscriptions
CREATE INDEX idx_guest_newsletter_active   ON guest_newsletter_subscriptions(is_active)
  WHERE is_active = TRUE;
CREATE INDEX idx_guest_newsletter_category ON guest_newsletter_subscriptions(category_id);

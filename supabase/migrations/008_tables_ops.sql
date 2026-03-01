-- Ops tables: regulatory_updates, background_jobs, consent_log,
-- email_logs, broadcast_logs

CREATE TABLE regulatory_updates (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'general',
  source_url   TEXT,
  published_at TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE background_jobs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type         TEXT NOT NULL,
  payload      JSONB NOT NULL DEFAULT '{}'::JSONB,
  status       job_status NOT NULL DEFAULT 'pending',
  attempts     INTEGER NOT NULL DEFAULT 0,
  last_error   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE TABLE consent_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  consent_type consent_type NOT NULL,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_logs (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email   TEXT NOT NULL,
  subject    TEXT NOT NULL,
  template   TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'sent',
  resend_id  TEXT,
  error      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE broadcast_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ops_user_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  subject          TEXT NOT NULL,
  body             TEXT NOT NULL,
  recipient_count  INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'sent',
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

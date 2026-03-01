-- Communication tables: consultation_requests, user_digest_subscriptions,
-- digest_send_log, member_notification_preferences

CREATE TABLE consultation_requests (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  member_id        UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  service_id       UUID REFERENCES services(id) ON DELETE SET NULL,
  message          TEXT NOT NULL,
  status           consultation_status NOT NULL DEFAULT 'pending',
  scheduled_at     TIMESTAMPTZ,
  response_message TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_digest_subscriptions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  email      TEXT NOT NULL,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email)
);

CREATE TABLE digest_send_log (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sent_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recipient_count  INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'sent',
  error_message    TEXT
);

CREATE TABLE member_notification_preferences (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id                UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  email_on_consultation    BOOLEAN NOT NULL DEFAULT true,
  email_on_article_comment BOOLEAN NOT NULL DEFAULT true,
  email_on_event_rsvp      BOOLEAN NOT NULL DEFAULT true,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

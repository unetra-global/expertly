-- Members, member_services, seat_allocations

CREATE TABLE members (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  slug              TEXT NOT NULL UNIQUE,
  headline          TEXT NOT NULL DEFAULT '',
  bio               TEXT NOT NULL DEFAULT '',
  avatar_url        TEXT,
  location          TEXT,
  website           TEXT,
  linkedin_url      TEXT,
  twitter_url       TEXT,
  github_url        TEXT,
  membership_status membership_status NOT NULL DEFAULT 'pending',
  seat_id           UUID,
  availability      JSONB,
  engagement        JSONB,
  credentials       JSONB NOT NULL DEFAULT '[]'::JSONB,
  testimonials      JSONB NOT NULL DEFAULT '[]'::JSONB,
  work_experience   JSONB NOT NULL DEFAULT '[]'::JSONB,
  education         JSONB NOT NULL DEFAULT '[]'::JSONB,
  embedding         vector(1536),
  view_count        INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE member_services (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  service_id   UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  fee_from     NUMERIC(10, 2),
  fee_to       NUMERIC(10, 2),
  fee_currency TEXT NOT NULL DEFAULT 'USD',
  description  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(member_id, service_id)
);

CREATE TABLE seat_allocations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id    UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  seat_number  INTEGER NOT NULL UNIQUE,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at  TIMESTAMPTZ,
  is_active    BOOLEAN NOT NULL DEFAULT true
);

-- backfill FK
ALTER TABLE members
  ADD CONSTRAINT members_seat_id_fkey
  FOREIGN KEY (seat_id) REFERENCES seat_allocations(id) ON DELETE SET NULL;

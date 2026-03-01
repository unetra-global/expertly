-- Content tables: articles, events

CREATE TABLE articles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  body            TEXT NOT NULL DEFAULT '',
  excerpt         TEXT,
  cover_image_url TEXT,
  tags            TEXT[] NOT NULL DEFAULT '{}',
  status          article_status NOT NULL DEFAULT 'draft',
  view_count      INTEGER NOT NULL DEFAULT 0,
  read_time       INTEGER NOT NULL DEFAULT 1,
  published_at    TIMESTAMPTZ,
  embedding       vector(1536),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id     UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT NOT NULL DEFAULT '',
  cover_image_url  TEXT,
  start_date       TIMESTAMPTZ NOT NULL,
  end_date         TIMESTAMPTZ NOT NULL,
  location         TEXT,
  is_virtual       BOOLEAN NOT NULL DEFAULT false,
  virtual_url      TEXT,
  capacity         INTEGER,
  status           event_status NOT NULL DEFAULT 'draft',
  speakers         JSONB NOT NULL DEFAULT '[]'::JSONB,
  embedding        vector(1536),
  registration_url TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

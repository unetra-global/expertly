-- Vector similarity search functions for members, articles, events

CREATE OR REPLACE FUNCTION search_members(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  match_count         INTEGER DEFAULT 10
)
RETURNS TABLE (
  id         UUID,
  slug       TEXT,
  headline   TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.slug,
    m.headline,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM members m
  WHERE
    m.membership_status = 'active'
    AND m.embedding IS NOT NULL
    AND 1 - (m.embedding <=> query_embedding) > similarity_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_articles(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  match_count         INTEGER DEFAULT 10
)
RETURNS TABLE (
  id         UUID,
  slug       TEXT,
  title      TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.title,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM articles a
  WHERE
    a.status = 'published'
    AND a.embedding IS NOT NULL
    AND 1 - (a.embedding <=> query_embedding) > similarity_threshold
  ORDER BY a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION search_events(
  query_embedding vector(1536),
  similarity_threshold FLOAT DEFAULT 0.7,
  match_count         INTEGER DEFAULT 10
)
RETURNS TABLE (
  id         UUID,
  slug       TEXT,
  title      TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.slug,
    e.title,
    1 - (e.embedding <=> query_embedding) AS similarity
  FROM events e
  WHERE
    e.status = 'published'
    AND e.embedding IS NOT NULL
    AND 1 - (e.embedding <=> query_embedding) > similarity_threshold
  ORDER BY e.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

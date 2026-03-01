-- Digest function: get_digest_data returns recent content for weekly email

CREATE OR REPLACE FUNCTION get_digest_data(
  since_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days'
)
RETURNS JSON AS $$
DECLARE
  v_members  JSON;
  v_articles JSON;
  v_events   JSON;
BEGIN
  -- New/recently active members
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', m.id,
      'slug', m.slug,
      'headline', m.headline,
      'avatar_url', m.avatar_url,
      'location', m.location
    )
  )
  INTO v_members
  FROM members m
  WHERE m.membership_status = 'active'
    AND m.created_at >= since_date
  LIMIT 5;

  -- Recently published articles
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', a.id,
      'slug', a.slug,
      'title', a.title,
      'excerpt', a.excerpt,
      'read_time', a.read_time,
      'published_at', a.published_at
    )
  )
  INTO v_articles
  FROM articles a
  WHERE a.status = 'published'
    AND a.published_at >= since_date
  ORDER BY a.published_at DESC
  LIMIT 5;

  -- Upcoming events
  SELECT JSON_AGG(
    JSON_BUILD_OBJECT(
      'id', e.id,
      'slug', e.slug,
      'title', e.title,
      'start_date', e.start_date,
      'location', e.location,
      'is_virtual', e.is_virtual
    )
  )
  INTO v_events
  FROM events e
  WHERE e.status = 'published'
    AND e.start_date > NOW()
  ORDER BY e.start_date ASC
  LIMIT 5;

  RETURN JSON_BUILD_OBJECT(
    'new_members', COALESCE(v_members, '[]'::JSON),
    'recent_articles', COALESCE(v_articles, '[]'::JSON),
    'upcoming_events', COALESCE(v_events, '[]'::JSON),
    'generated_at', NOW()
  );
END;
$$ LANGUAGE plpgsql;

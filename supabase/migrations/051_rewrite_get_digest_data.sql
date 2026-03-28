-- Migration 051: Rewrite get_digest_data to match DigestProcessor expectations
--
-- The original function (migration 015) returned a summary JSON blob and accepted
-- `since_date TIMESTAMPTZ`. The DigestProcessor calls it with `p_week_start DATE`
-- and expects one row per (user, category) subscription with articles for that week.
-- This migration replaces the function with the correct signature and return shape.

DROP FUNCTION IF EXISTS get_digest_data(DATE);
DROP FUNCTION IF EXISTS get_digest_data(TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION get_digest_data(p_week_start DATE)
RETURNS TABLE (
  user_id       UUID,
  email         TEXT,
  member_name   TEXT,
  category_id   UUID,
  category_name TEXT,
  frequency     TEXT,
  articles      JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    uds.user_id,
    u.email,
    COALESCE(
      NULLIF(TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')), ''),
      u.email
    ) AS member_name,
    uds.category_id,
    c.name AS category_name,
    uds.frequency,
    COALESCE(
      (
        SELECT JSONB_AGG(
          JSONB_BUILD_OBJECT(
            'id',          a.id,
            'title',       a.title,
            'slug',        a.slug,
            'excerpt',     a.excerpt,
            'author_name', COALESCE(
              (
                SELECT TRIM(COALESCE(au.first_name, '') || ' ' || COALESCE(au.last_name, ''))
                FROM members am
                JOIN users au ON au.id = am.user_id
                WHERE am.id = a.author_id
              ),
              ''
            )
          )
        )
        FROM articles a
        WHERE a.category_id = uds.category_id
          AND a.status      = 'published'
          AND a.published_at >= p_week_start::TIMESTAMPTZ
          AND a.published_at <  (p_week_start + INTERVAL '7 days')::TIMESTAMPTZ
      ),
      '[]'::JSONB
    ) AS articles
  FROM user_digest_subscriptions uds
  JOIN users      u ON u.id = uds.user_id
  JOIN categories c ON c.id = uds.category_id
  WHERE uds.is_active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

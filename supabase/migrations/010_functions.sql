-- DB Functions: claim_seat, release_seat, increment_view_count, get_ops_action_counts

-- Claim the next available seat for a member (atomic)
CREATE OR REPLACE FUNCTION claim_seat(p_member_id UUID)
RETURNS UUID AS $$
DECLARE
  v_seat_id     UUID;
  v_seat_number INTEGER;
BEGIN
  -- Find next seat number
  SELECT COALESCE(MAX(seat_number), 0) + 1
  INTO v_seat_number
  FROM seat_allocations;

  -- Insert new seat
  INSERT INTO seat_allocations (member_id, seat_number, is_active)
  VALUES (p_member_id, v_seat_number, true)
  RETURNING id INTO v_seat_id;

  -- Update member's seat_id
  UPDATE members SET seat_id = v_seat_id WHERE id = p_member_id;

  RETURN v_seat_id;
END;
$$ LANGUAGE plpgsql;

-- Release a member's seat
CREATE OR REPLACE FUNCTION release_seat(p_member_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE seat_allocations
  SET is_active = false, released_at = NOW()
  WHERE member_id = p_member_id AND is_active = true;

  UPDATE members SET seat_id = NULL WHERE id = p_member_id;
END;
$$ LANGUAGE plpgsql;

-- Increment view count atomically
CREATE OR REPLACE FUNCTION increment_view_count(
  p_table TEXT,
  p_id    UUID
)
RETURNS VOID AS $$
BEGIN
  IF p_table = 'members' THEN
    UPDATE members SET view_count = view_count + 1 WHERE id = p_id;
  ELSIF p_table = 'articles' THEN
    UPDATE articles SET view_count = view_count + 1 WHERE id = p_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Get ops dashboard action counts
CREATE OR REPLACE FUNCTION get_ops_action_counts()
RETURNS TABLE (
  pending_applications  BIGINT,
  active_members        BIGINT,
  pending_consultations BIGINT,
  total_articles        BIGINT,
  total_events          BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM applications WHERE status IN ('submitted', 'under_review')) AS pending_applications,
    (SELECT COUNT(*) FROM members WHERE membership_status = 'active') AS active_members,
    (SELECT COUNT(*) FROM consultation_requests WHERE status = 'pending') AS pending_consultations,
    (SELECT COUNT(*) FROM articles WHERE status = 'published') AS total_articles,
    (SELECT COUNT(*) FROM events WHERE status IN ('published', 'completed')) AS total_events;
END;
$$ LANGUAGE plpgsql;

-- Fix get_ops_action_counts to return fields that match the OpsStats frontend interface

CREATE OR REPLACE FUNCTION get_ops_action_counts()
RETURNS TABLE (
  total_applications      BIGINT,
  total_members           BIGINT,
  total_articles          BIGINT,
  total_events            BIGINT,
  pending_applications    BIGINT,
  pending_articles        BIGINT,
  pending_re_verification BIGINT,
  expiring_in_30_days     BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM applications)                                                                         AS total_applications,
    (SELECT COUNT(*) FROM members)                                                                              AS total_members,
    (SELECT COUNT(*) FROM articles)                                                                             AS total_articles,
    (SELECT COUNT(*) FROM events)                                                                               AS total_events,
    (SELECT COUNT(*) FROM applications WHERE status IN ('submitted', 'under_review'))                          AS pending_applications,
    (SELECT COUNT(*) FROM articles WHERE status = 'draft')                                                     AS pending_articles,
    (SELECT COUNT(*) FROM members WHERE re_verification_requested_at IS NOT NULL
       AND membership_status = 'active')                                                                       AS pending_re_verification,
    (SELECT COUNT(*) FROM members WHERE membership_expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
       AND membership_status = 'active')                                                                       AS expiring_in_30_days;
END;
$$ LANGUAGE plpgsql;

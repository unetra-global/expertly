-- All database functions: updated_at triggers, auth trigger, utility functions,
-- ops dashboard function, and digest function.

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER FUNCTION: update_updated_at
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_consultation_requests_updated_at
  BEFORE UPDATE ON consultation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_member_notification_preferences_updated_at
  BEFORE UPDATE ON member_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_regulatory_updates_updated_at
  BEFORE UPDATE ON regulatory_updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_background_jobs_updated_at
  BEFORE UPDATE ON background_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER FUNCTION: handle_new_auth_user
-- Auto-creates a public.users row when a Supabase auth user is created.
-- Handles both email signup (first_name/last_name) and LinkedIn OIDC (given_name/family_name).
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first_name TEXT;
  v_last_name  TEXT;
BEGIN
  v_first_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'given_name'), ''),
    ''
  );
  v_last_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'family_name'), ''),
    ''
  );

  INSERT INTO public.users (supabase_uid, email, first_name, last_name)
  VALUES (NEW.id, NEW.email, v_first_name, v_last_name)
  ON CONFLICT (supabase_uid) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- FUNCTION: get_ops_action_counts
-- Returns dashboard stats for the ops team.
-- ─────────────────────────────────────────────────────────────────────────────

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
    (SELECT COUNT(*) FROM applications)                                                   AS total_applications,
    (SELECT COUNT(*) FROM members)                                                        AS total_members,
    (SELECT COUNT(*) FROM articles)                                                       AS total_articles,
    (SELECT COUNT(*) FROM events)                                                         AS total_events,
    (SELECT COUNT(*) FROM applications WHERE status IN ('submitted', 'under_review'))     AS pending_applications,
    (SELECT COUNT(*) FROM articles WHERE status = 'draft')                                AS pending_articles,
    (SELECT COUNT(*) FROM members WHERE re_verification_requested_at IS NOT NULL
       AND membership_status = 'active')                                                  AS pending_re_verification,
    (SELECT COUNT(*) FROM members
       WHERE membership_expiry_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
         AND membership_status = 'active')                                                AS expiring_in_30_days;
END;
$$ LANGUAGE plpgsql;


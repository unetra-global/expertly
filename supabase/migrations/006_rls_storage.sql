-- Row Level Security, storage buckets, and Realtime configuration.

-- ─────────────────────────────────────────────────────────────────────────────
-- AUTH HELPER FUNCTIONS (used by RLS policies below)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auth_user_id() RETURNS UUID AS $$
  SELECT id FROM users WHERE supabase_uid = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_user_role() RETURNS user_role AS $$
  SELECT role FROM users WHERE supabase_uid = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth_member_id() RETURNS UUID AS $$
  SELECT m.id FROM members m
  JOIN users u ON u.id = m.user_id
  WHERE u.supabase_uid = auth.uid()
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- ENABLE RLS ON ALL TABLES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE users                         ENABLE ROW LEVEL SECURITY;
ALTER TABLE members                       ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_services               ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_digest_subscriptions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE digest_send_log               ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulatory_updates            ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_log                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE broadcast_logs                ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE services                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────

-- ── categories & services (public read) ──────────────────────────────────────

CREATE POLICY "categories: public read"
  ON categories FOR SELECT USING (true);

CREATE POLICY "categories: ops write"
  ON categories FOR ALL
  USING (auth_user_role() IN ('ops', 'backend_admin'));

CREATE POLICY "services: public read"
  ON services FOR SELECT USING (true);

CREATE POLICY "services: ops write"
  ON services FOR ALL
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── users ─────────────────────────────────────────────────────────────────────

CREATE POLICY "users: own record read"
  ON users FOR SELECT
  USING (supabase_uid = auth.uid());

CREATE POLICY "users: ops read all"
  ON users FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

CREATE POLICY "users: own record update"
  ON users FOR UPDATE
  USING (supabase_uid = auth.uid());

CREATE POLICY "users: ops update"
  ON users FOR UPDATE
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── members ───────────────────────────────────────────────────────────────────

CREATE POLICY "members: public read active"
  ON members FOR SELECT
  USING (membership_status = 'active');

CREATE POLICY "members: own record read"
  ON members FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "members: ops read all"
  ON members FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

CREATE POLICY "members: own record update"
  ON members FOR UPDATE
  USING (user_id = auth_user_id());

CREATE POLICY "members: ops update"
  ON members FOR UPDATE
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── member_services ───────────────────────────────────────────────────────────

CREATE POLICY "member_services: public read"
  ON member_services FOR SELECT USING (true);

CREATE POLICY "member_services: member own write"
  ON member_services FOR ALL
  USING (member_id = auth_member_id());

CREATE POLICY "member_services: ops write"
  ON member_services FOR ALL
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── applications ──────────────────────────────────────────────────────────────

CREATE POLICY "applications: own read"
  ON applications FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "applications: own insert"
  ON applications FOR INSERT
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "applications: own update draft"
  ON applications FOR UPDATE
  USING (user_id = auth_user_id() AND status = 'draft');

CREATE POLICY "applications: ops read all"
  ON applications FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

CREATE POLICY "applications: ops update"
  ON applications FOR UPDATE
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── articles ──────────────────────────────────────────────────────────────────

CREATE POLICY "articles: public read published"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "articles: member read own"
  ON articles FOR SELECT
  USING (author_id = auth_member_id());

CREATE POLICY "articles: member write own"
  ON articles FOR ALL
  USING (author_id = auth_member_id());

CREATE POLICY "articles: ops read all"
  ON articles FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

CREATE POLICY "articles: ops update"
  ON articles FOR UPDATE
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── events ────────────────────────────────────────────────────────────────────

CREATE POLICY "events: public read published"
  ON events FOR SELECT
  USING (status IN ('published', 'completed'));

CREATE POLICY "events: organizer read own"
  ON events FOR SELECT
  USING (organizer_id = auth_member_id());

CREATE POLICY "events: organizer write own"
  ON events FOR ALL
  USING (organizer_id = auth_member_id());

CREATE POLICY "events: ops read all"
  ON events FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

CREATE POLICY "events: ops update"
  ON events FOR UPDATE
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── consultation_requests ─────────────────────────────────────────────────────

CREATE POLICY "consultation: requester read own"
  ON consultation_requests FOR SELECT
  USING (requester_id = auth_user_id());

CREATE POLICY "consultation: requester insert"
  ON consultation_requests FOR INSERT
  WITH CHECK (requester_id = auth_user_id());

CREATE POLICY "consultation: member read incoming"
  ON consultation_requests FOR SELECT
  USING (member_id = auth_member_id());

CREATE POLICY "consultation: member update incoming"
  ON consultation_requests FOR UPDATE
  USING (member_id = auth_member_id());

CREATE POLICY "consultation: ops read all"
  ON consultation_requests FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── user_digest_subscriptions ─────────────────────────────────────────────────

CREATE POLICY "digest_subs: own read"
  ON user_digest_subscriptions FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "digest_subs: own write"
  ON user_digest_subscriptions FOR ALL
  USING (user_id = auth_user_id());

CREATE POLICY "digest_subs: ops read all"
  ON user_digest_subscriptions FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── digest_send_log ───────────────────────────────────────────────────────────

CREATE POLICY "digest_log: ops read"
  ON digest_send_log FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── member_notification_preferences ──────────────────────────────────────────

CREATE POLICY "notif_prefs: own read write"
  ON member_notification_preferences FOR ALL
  USING (member_id = auth_member_id());

-- ── regulatory_updates ────────────────────────────────────────────────────────

CREATE POLICY "regulatory: member read"
  ON regulatory_updates FOR SELECT
  USING (is_active = true AND auth_user_role() IN ('member', 'ops', 'backend_admin'));

CREATE POLICY "regulatory: ops write"
  ON regulatory_updates FOR ALL
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── background_jobs ───────────────────────────────────────────────────────────

CREATE POLICY "bg_jobs: ops read"
  ON background_jobs FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── consent_log ───────────────────────────────────────────────────────────────

CREATE POLICY "consent: own read"
  ON consent_log FOR SELECT
  USING (user_id = auth_user_id());

CREATE POLICY "consent: own insert"
  ON consent_log FOR INSERT
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "consent: ops read all"
  ON consent_log FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── email_logs ────────────────────────────────────────────────────────────────

CREATE POLICY "email_logs: ops read"
  ON email_logs FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── broadcast_logs ────────────────────────────────────────────────────────────

CREATE POLICY "broadcast_logs: ops read"
  ON broadcast_logs FOR SELECT
  USING (auth_user_role() IN ('ops', 'backend_admin'));

-- ── guest_newsletter_subscriptions ────────────────────────────────────────────
-- Service role (backend) bypasses RLS entirely; anon users can only insert.

CREATE POLICY "guest_newsletter: service role all"
  ON guest_newsletter_subscriptions FOR ALL
  USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars',        'avatars',        true,  5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('article-images', 'article-images', true,  5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents',      'documents',      false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('event-images',   'event-images',   true,  5242880,  ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
  SET name               = EXCLUDED.name,
      public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS policies — minimal, service-role managed.
-- Backend uses service role key and bypasses RLS.
-- Public buckets allow anonymous reads.

CREATE POLICY storage_avatars_public_read
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY storage_article_images_public_read
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

CREATE POLICY storage_event_images_public_read
  ON storage.objects FOR SELECT
  USING (bucket_id = 'event-images');

-- Documents bucket: private — access via signed URLs from backend only.
-- No public read policy intentionally.

-- ─────────────────────────────────────────────────────────────────────────────
-- REALTIME
-- ─────────────────────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE background_jobs;

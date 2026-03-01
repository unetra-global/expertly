-- Storage buckets: avatars, article-images, documents + RLS

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('article-images', 'article-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 20971520, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- ─── avatars bucket ──────────────────────────────────────────────────────────
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars: member upload own"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars: member update own"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

CREATE POLICY "avatars: member delete own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ─── article-images bucket ───────────────────────────────────────────────────
CREATE POLICY "article-images: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

CREATE POLICY "article-images: member upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'article-images'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM members m
      JOIN users u ON u.id = m.user_id
      WHERE u.supabase_uid = auth.uid()
        AND m.membership_status = 'active'
    )
  );

CREATE POLICY "article-images: member delete own"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'article-images'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ─── documents bucket ────────────────────────────────────────────────────────
CREATE POLICY "documents: ops read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::TEXT
      OR EXISTS (
        SELECT 1 FROM users WHERE supabase_uid = auth.uid()
          AND role IN ('ops', 'backend_admin')
      )
    )
  );

CREATE POLICY "documents: authenticated upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

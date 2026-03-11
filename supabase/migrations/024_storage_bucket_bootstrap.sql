-- Migration 024: Storage bucket bootstrap (S3-style usage via Supabase Storage)
--
-- Goal:
-- - Keep Supabase usage focused on Storage buckets/objects.
-- - Avoid dependencies on application tables for Storage policies.
-- - Keep uploads backend-managed with service role key.
--
-- Notes:
-- - Service role bypasses RLS; backend uploads continue to work.
-- - Public buckets are readable by anyone.
-- - Documents bucket remains private; access should be via signed URLs from backend.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1) Buckets (idempotent upsert)
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('article-images', 'article-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('event-images', 'event-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2) Remove legacy policies (if present)
-- ─────────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "avatars: public read" ON storage.objects;
DROP POLICY IF EXISTS "avatars: member upload own" ON storage.objects;
DROP POLICY IF EXISTS "avatars: member update own" ON storage.objects;
DROP POLICY IF EXISTS "avatars: member delete own" ON storage.objects;

DROP POLICY IF EXISTS "article-images: public read" ON storage.objects;
DROP POLICY IF EXISTS "article-images: member upload" ON storage.objects;
DROP POLICY IF EXISTS "article-images: member delete own" ON storage.objects;

DROP POLICY IF EXISTS "documents: ops read" ON storage.objects;
DROP POLICY IF EXISTS "documents: authenticated upload" ON storage.objects;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3) Minimal storage-only policies
-- ─────────────────────────────────────────────────────────────────────────────

-- Public read policies for public buckets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'storage_avatars_public_read'
  ) THEN
    CREATE POLICY storage_avatars_public_read
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'avatars');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'storage_article_images_public_read'
  ) THEN
    CREATE POLICY storage_article_images_public_read
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'article-images');
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'storage_event_images_public_read'
  ) THEN
    CREATE POLICY storage_event_images_public_read
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'event-images');
  END IF;
END
$$;

-- No direct read policy for documents: private by default.
-- Access should be served through short-lived signed URLs from backend.


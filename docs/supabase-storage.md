# Supabase Storage Setup (S3-Style)

This project uses Supabase primarily as an object store (bucket + files), similar to S3.

## What This Config Creates

- `avatars` (public, 5 MB, image only)
- `article-images` (public, 5 MB, image only)
- `documents` (private, 10 MB, pdf/jpg/png)
- `event-images` (public, 5 MB, image only)

Migration file:
- `supabase/migrations/024_storage_bucket_bootstrap.sql`

## Quick Start

## Option A: Apply with Supabase CLI (preferred)

1. Ensure CLI is installed and authenticated.
2. Link your Supabase project (once per machine):

```bash
supabase link --project-ref <your-project-ref>
```

3. Push migrations:

```bash
supabase db push
```

## Option B: Apply in Supabase SQL Editor

1. Open Supabase Dashboard -> SQL Editor.
2. Paste contents of:
   - `supabase/migrations/024_storage_bucket_bootstrap.sql`
3. Run the query.

## Verify Buckets

Run in SQL editor:

```sql
select id, public, file_size_limit, allowed_mime_types
from storage.buckets
where id in ('avatars', 'article-images', 'documents', 'event-images')
order by id;
```

## Recommended Object Paths

Use stable paths so cleanup and ownership are easy:

- `avatars/{user_id}/profile.webp`
- `article-images/{author_user_id}/{article_id}/featured.webp`
- `article-images/{author_user_id}/{article_id}/inline/{image_id}.webp`
- `documents/{user_id}/credentials/{doc_id}.pdf`
- `documents/{user_id}/testimonials/{doc_id}.pdf`
- `event-images/{organizer_user_id}/{event_id}/cover.webp`

## Access Pattern

- Public buckets (`avatars`, `article-images`, `event-images`):
  - Store and serve public URLs.
- Private bucket (`documents`):
  - Store object path in your DB.
  - Generate short-lived signed URLs from backend when needed.

## Environment Variables (Backend)

Your backend upload/sign endpoints should use:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Service role bypasses RLS and is the safest path for centralized uploads.

## Notes

- This migration intentionally removes legacy storage policies that depended on app tables.
- It keeps storage policies minimal and storage-focused.
- If you later want direct client-side uploads to Storage, add dedicated `INSERT` policies and align folder paths with `auth.uid()`.

## Member Asset Backfill

If you already have seeded members and need to populate missing assets:

```bash
set -a; source apps/api/.env; set +a
pnpm -C apps/api backfill:member-storage
```

To regenerate avatars in higher quality for all members:

```bash
set -a; source apps/api/.env; set +a
FORCE_AVATAR_REGENERATE=true pnpm -C apps/api backfill:member-storage
```

What it does:
- Uploads a stock avatar to `avatars/{user_id}/profile.webp` when member photo is missing.
- Creates credential image files in `documents/{user_id}/credentials/...` when credential URL is missing.
- Updates `members.profile_photo_url`, `members.avatar_url`, and `members.credentials` URLs in DB.

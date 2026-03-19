-- Add base64 profile photo storage to applications and members tables.
-- A 256×256 WebP thumbnail encoded as base64 (~5–20 KB) is stored directly in
-- the row so the UI can display avatars without an external storage request.

alter table applications
  add column if not exists profile_photo_base64 text;

alter table members
  add column if not exists profile_photo_base64 text;

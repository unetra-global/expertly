-- Move profile_photo_base64 to users table as single source of truth.
-- Everyone is always a user first; application and member are just statuses.

alter table users add column if not exists profile_photo_base64 text;

alter table applications drop column if exists profile_photo_base64;
alter table members     drop column if exists profile_photo_base64;

-- Remove unused columns from members table
-- twitter_url and github_url: never displayed or editable in UI
-- location: deprecated, replaced by city + country split

ALTER TABLE members
  DROP COLUMN IF EXISTS twitter_url,
  DROP COLUMN IF EXISTS github_url,
  DROP COLUMN IF EXISTS location;

-- Allow ops team to create events without a member organizer
ALTER TABLE events
  ALTER COLUMN organizer_id DROP NOT NULL;

-- Allow events without an end date (e.g. online or single-day events)
ALTER TABLE events
  ALTER COLUMN end_date DROP NOT NULL;

-- Add short_description for brief event listings
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS short_description TEXT;

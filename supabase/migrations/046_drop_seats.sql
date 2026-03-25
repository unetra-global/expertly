-- Remove the seats / seat capacity system entirely.
-- The ops team manages member capacity manually during the MVP phase.

-- Drop FK from members first so seat_allocations can be dropped
ALTER TABLE members DROP COLUMN IF EXISTS seat_id;

-- Drop capacity tables
DROP TABLE IF EXISTS seat_capacity CASCADE;
DROP TABLE IF EXISTS seat_allocations CASCADE;

-- Drop seat-related DB functions
DROP FUNCTION IF EXISTS claim_seat(UUID);
DROP FUNCTION IF EXISTS release_seat(UUID);
DROP FUNCTION IF EXISTS claim_seat_capacity(UUID, TEXT);
DROP FUNCTION IF EXISTS release_seat_capacity(UUID, TEXT);

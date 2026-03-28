-- Migration 046: Remove deprecated columns from member_notification_preferences
-- Removes: consultation_requests, membership_reminders
-- Keeps:   article_status, regulatory_nudges, platform_updates

ALTER TABLE member_notification_preferences
  DROP COLUMN IF EXISTS consultation_requests,
  DROP COLUMN IF EXISTS membership_reminders;

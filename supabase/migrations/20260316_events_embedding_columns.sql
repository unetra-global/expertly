-- Migration: Add missing embedding tracking columns to events table
-- Brings events in line with members and articles tables

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS embedding_generated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS embedding_error        TEXT;

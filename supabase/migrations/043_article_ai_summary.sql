-- Add ai_summary column to articles table.
-- Populated by the ops approval flow when an article is published.
ALTER TABLE articles ADD COLUMN IF NOT EXISTS ai_summary TEXT;

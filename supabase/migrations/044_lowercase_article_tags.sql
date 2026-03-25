-- Normalize all existing article tags to lowercase.
-- New articles are already stored lowercase (articles.service.ts maps t.toLowerCase()),
-- but seed data (migrations 022, 023) used mixed-case values like 'UAE', 'India', 'M&A'.
-- The tag filter uses contains('tags', [tag.toLowerCase()]) so mixed-case tags never matched.

UPDATE articles
SET tags = ARRAY(SELECT lower(t) FROM unnest(tags) t)
WHERE tags IS NOT NULL AND tags <> '{}';

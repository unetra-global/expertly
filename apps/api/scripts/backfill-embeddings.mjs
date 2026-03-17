/**
 * Backfill embeddings for members, articles, and events.
 *
 * Usage (from apps/api/):
 *   node scripts/backfill-embeddings.mjs [--entity=members|articles|events|all] [--force]
 *
 * Options:
 *   --entity=<type>   Which entity to embed (default: all)
 *   --force           Re-generate even for records with embedding_status='generated'
 *
 * Reads SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GOOGLE_AI_API_KEY from .env
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_API_KEY =
  process.env.GOOGLE_AI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;

const args = process.argv.slice(2);
const entityArg = (args.find((a) => a.startsWith('--entity=')) ?? '--entity=all').split('=')[1];
const force = args.includes('--force');

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env');
  process.exit(1);
}
if (!GOOGLE_API_KEY) {
  console.error('ERROR: GOOGLE_AI_API_KEY must be set in .env');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ── Embedding ─────────────────────────────────────────────────────────────────

async function embed(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_API_KEY}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      outputDimensionality: 768,
    }),
  });
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Google Embedding API ${resp.status}: ${body}`);
  }
  const json = await resp.json();
  if (!json.embedding?.values) throw new Error('Google returned no embedding');
  return json.embedding.values;
}

// ── Per-entity text builders ──────────────────────────────────────────────────

function memberText(m, serviceName) {
  return [
    m.first_name,
    m.last_name,
    m.designation,
    m.headline,
    m.bio,
    serviceName,
    m.country,
    m.city,
    ...(m.qualifications ?? []),
  ]
    .filter(Boolean)
    .join(' ');
}

function articleText(a) {
  return [a.title, a.subtitle, a.excerpt, ...(a.tags ?? [])]
    .filter(Boolean)
    .join(' ');
}

function eventText(e) {
  return [e.title, e.description, e.event_type, e.country, e.city]
    .filter(Boolean)
    .join(' ');
}

// ── Processors ────────────────────────────────────────────────────────────────

async function processEntity(table, records, textFn, label) {
  let ok = 0;
  let fail = 0;

  for (const row of records) {
    const text = textFn(row);
    if (!text.trim()) {
      console.warn(`  [SKIP] ${label} ${row.id} — no text content`);
      continue;
    }

    try {
      const vector = await embed(text);
      await sb.from(table).update({
        embedding: JSON.stringify(vector),
        embedding_status: 'generated',
        embedding_generated_at: new Date().toISOString(),
      }).eq('id', row.id);
      console.log(`  [OK]   ${label} ${row.id}`);
      ok++;
    } catch (err) {
      console.error(`  [FAIL] ${label} ${row.id}: ${err.message}`);
      await sb.from(table).update({
        embedding_status: 'failed',
        embedding_error: err.message,
      }).eq('id', row.id);
      fail++;
    }

    // Rate-limit: ~60 req/min is safe for Gemini free tier
    await new Promise((r) => setTimeout(r, 1050));
  }

  console.log(`\n${label}: ${ok} OK, ${fail} failed, ${records.length - ok - fail} skipped`);
}

async function backfillEvents() {
  console.log('\n── Events ──');
  const query = sb
    .from('events')
    .select('id, title, description, event_type, country, city');

  if (!force) query.neq('embedding_status', 'generated');

  const { data, error } = await query;
  if (error) { console.error('Failed to fetch events:', error); return; }
  if (!data?.length) { console.log('No events to embed.'); return; }

  console.log(`Found ${data.length} event(s) to embed`);
  await processEntity('events', data, eventText, 'event');
}

async function backfillArticles() {
  console.log('\n── Articles ──');
  const query = sb
    .from('articles')
    .select('id, title, subtitle, excerpt, tags');

  if (!force) query.neq('embedding_status', 'generated');

  const { data, error } = await query;
  if (error) { console.error('Failed to fetch articles:', error); return; }
  if (!data?.length) { console.log('No articles to embed.'); return; }

  console.log(`Found ${data.length} article(s) to embed`);
  await processEntity('articles', data, articleText, 'article');
}

async function backfillMembers() {
  console.log('\n── Members ──');
  const query = sb
    .from('members')
    .select('id, designation, headline, bio, country, city, qualifications, users!user_id(first_name, last_name)');

  if (!force) query.neq('embedding_status', 'generated');

  const { data, error } = await query;
  if (error) { console.error('Failed to fetch members:', error); return; }
  if (!data?.length) { console.log('No members to embed.'); return; }

  // Fetch primary service names
  const ids = data.map((m) => m.id);
  const { data: svcs } = await sb
    .from('member_services')
    .select('member_id, services(name)')
    .in('member_id', ids)
    .eq('is_primary', true);

  const svcMap = new Map((svcs ?? []).map((s) => [s.member_id, s.services?.name ?? '']));

  // Flatten user name into member row
  const enriched = data.map((m) => ({
    ...m,
    first_name: m.users?.first_name ?? '',
    last_name: m.users?.last_name ?? '',
  }));

  console.log(`Found ${enriched.length} member(s) to embed`);
  await processEntity('members', enriched, (m) => memberText(m, svcMap.get(m.id) ?? ''), 'member');
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log(`Backfill embeddings — entity=${entityArg}, force=${force}`);

if (entityArg === 'all' || entityArg === 'events') await backfillEvents();
if (entityArg === 'all' || entityArg === 'articles') await backfillArticles();
if (entityArg === 'all' || entityArg === 'members') await backfillMembers();

console.log('\nDone.');

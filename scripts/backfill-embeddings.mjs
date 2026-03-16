/**
 * Backfill embeddings for all pending members, articles, and events.
 * Uses Google text-embedding-004 via direct v1 REST API (768 dims).
 *
 * Run from apps/api/: node backfill-embeddings.mjs
 */

import { createClient } from '@supabase/supabase-js';

// ── Config ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://zdinxksdorsyuzsvmltd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpkaW54a3Nkb3JzeXV6c3ZtbHRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjM1NTM2MiwiZXhwIjoyMDg3OTMxMzYyfQ.pKdq3kYrZMkIqwMm_ouvMPdkugcqnBGDut8YhFaqrxE';
const GOOGLE_KEY = 'AIzaSyAjUG3sxpHs-cnOrzlTlBNHrWeNnJdtO2Y';
const BATCH_SIZE = 5;
const DELAY_MS = 300;

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getEmbedding(text, retries = 3) {
  if (!text || !text.trim()) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${GOOGLE_KEY}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] },
        outputDimensionality: 768,
      }),
    });

    if (resp.ok) {
      const json = await resp.json();
      return json.embedding?.values ?? null;
    }

    if (resp.status === 429 && attempt < retries) {
      // Parse retry delay from the response, default 60s
      let waitMs = 65000;
      try {
        const body = await resp.json();
        const retryDelay = body?.error?.details?.find(d => d.retryDelay)?.retryDelay;
        if (retryDelay) {
          waitMs = (parseInt(retryDelay) + 5) * 1000;
        }
      } catch { /* ignore parse error */ }
      process.stdout.write(`\n[rate limit] waiting ${waitMs / 1000}s before retry ${attempt + 1}/${retries}...`);
      await sleep(waitMs);
      continue;
    }

    const body = await resp.text();
    throw new Error(`Google API ${resp.status}: ${body}`);
  }

  throw new Error('Max retries exceeded');
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── Members ─────────────────────────────────────────────────────────────────

async function backfillMembers() {
  console.log('\n── Members ────────────────────────────────────────────');

  const { data: members, error } = await sb
    .from('members')
    .select('id, designation, headline, bio, country, city, qualifications, user_id')
    .eq('embedding_status', 'pending');

  if (error) { console.error('Failed to fetch members:', error.message); return; }
  console.log(`Found ${members.length} pending members`);

  let ok = 0, fail = 0;

  for (let i = 0; i < members.length; i += BATCH_SIZE) {
    const batch = members.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (m) => {
      try {
        const { data: user } = await sb
          .from('users')
          .select('first_name, last_name')
          .eq('id', m.user_id)
          .single();

        const { data: svc } = await sb
          .from('member_services')
          .select('services(name)')
          .eq('member_id', m.id)
          .eq('is_primary', true)
          .maybeSingle();

        const quals = Array.isArray(m.qualifications) ? m.qualifications.join(' ') : '';
        const serviceName = svc?.services?.name ?? '';

        const text = [
          user?.first_name,
          user?.last_name,
          m.designation,
          m.headline,
          m.bio,
          serviceName,
          m.country,
          m.city,
          quals,
        ].filter(Boolean).join(' ');

        const vector = await getEmbedding(text);
        if (!vector) { fail++; return; }

        const { error: uErr } = await sb
          .from('members')
          .update({
            embedding: JSON.stringify(vector),
            embedding_status: 'generated',
            embedding_generated_at: new Date().toISOString(),
          })
          .eq('id', m.id);

        if (uErr) throw uErr;
        ok++;
        process.stdout.write('.');
      } catch (err) {
        fail++;
        console.error(`\nMember ${m.id} failed: ${err.message}`);
        await sb.from('members').update({ embedding_status: 'failed' }).eq('id', m.id);
      }
    }));

    if (i + BATCH_SIZE < members.length) await sleep(DELAY_MS);
  }

  console.log(`\nMembers: ${ok} ok, ${fail} failed`);
}

// ── Articles ─────────────────────────────────────────────────────────────────

async function backfillArticles() {
  console.log('\n── Articles ───────────────────────────────────────────');

  const { data: articles, error } = await sb
    .from('articles')
    .select('id, title, subtitle, excerpt, tags')
    .eq('embedding_status', 'pending');

  if (error) { console.error('Failed to fetch articles:', error.message); return; }
  console.log(`Found ${articles.length} pending articles`);

  let ok = 0, fail = 0;

  for (let i = 0; i < articles.length; i += BATCH_SIZE) {
    const batch = articles.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (a) => {
      try {
        const tags = Array.isArray(a.tags) ? a.tags.join(' ') : '';
        const text = [a.title, a.subtitle, a.excerpt, tags].filter(Boolean).join(' ');

        const vector = await getEmbedding(text);
        if (!vector) { fail++; return; }

        const { error: uErr } = await sb
          .from('articles')
          .update({
            embedding: JSON.stringify(vector),
            embedding_status: 'generated',
            embedding_generated_at: new Date().toISOString(),
          })
          .eq('id', a.id);

        if (uErr) throw uErr;
        ok++;
        process.stdout.write('.');
      } catch (err) {
        fail++;
        console.error(`\nArticle ${a.id} failed: ${err.message}`);
        await sb.from('articles').update({ embedding_status: 'failed' }).eq('id', a.id);
      }
    }));

    if (i + BATCH_SIZE < articles.length) await sleep(DELAY_MS);
  }

  console.log(`\nArticles: ${ok} ok, ${fail} failed`);
}

// ── Events ──────────────────────────────────────────────────────────────────

async function backfillEvents() {
  console.log('\n── Events ─────────────────────────────────────────────');

  const { data: events, error } = await sb
    .from('events')
    .select('id, title, description, event_type, country, city')
    .eq('embedding_status', 'pending');

  if (error) { console.error('Failed to fetch events:', error.message); return; }
  console.log(`Found ${events.length} pending events`);

  let ok = 0, fail = 0;

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);

    await Promise.all(batch.map(async (e) => {
      try {
        const text = [e.title, e.description, e.event_type, e.country, e.city]
          .filter(Boolean).join(' ');

        const vector = await getEmbedding(text);
        if (!vector) { fail++; return; }

        const { error: uErr } = await sb
          .from('events')
          .update({
            embedding: JSON.stringify(vector),
            embedding_status: 'generated',
            embedding_generated_at: new Date().toISOString(),
          })
          .eq('id', e.id);

        if (uErr) throw uErr;
        ok++;
        process.stdout.write('.');
      } catch (err) {
        fail++;
        console.error(`\nEvent ${e.id} failed: ${err.message}`);
        await sb.from('events').update({ embedding_status: 'failed' }).eq('id', e.id);
      }
    }));

    if (i + BATCH_SIZE < events.length) await sleep(DELAY_MS);
  }

  console.log(`\nEvents: ${ok} ok, ${fail} failed`);
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Backfilling embeddings with Google gemini-embedding-001 (768 dims) via REST API...');

  // Quick smoke test
  console.log('Testing Google API...');
  const test = await getEmbedding('test');
  if (!test) { console.error('Google API test failed — aborting'); process.exit(1); }
  console.log(`Google API OK — vector dims: ${test.length}`);

  const t0 = Date.now();

  await backfillMembers();
  await backfillArticles();
  await backfillEvents();

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\nDone in ${elapsed}s`);
}

main().catch(err => { console.error(err); process.exit(1); });

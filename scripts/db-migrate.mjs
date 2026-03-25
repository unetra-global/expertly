#!/usr/bin/env node
/**
 * Apply all pending Supabase migrations.
 *
 * Reads SUPABASE_DB_URL from apps/api/.env — no setup or `supabase link` required.
 * Usage:  pnpm db:migrate
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, '../apps/api/.env');

let dbUrl;
try {
  const envContent = readFileSync(envPath, 'utf-8');
  const match = envContent.match(/^SUPABASE_DB_URL="?([^"\n]+)"?/m);
  if (!match) throw new Error('SUPABASE_DB_URL not found in apps/api/.env');
  dbUrl = fixDbUrl(match[1]);
} catch (err) {
  console.error(`Error reading env: ${err.message}`);
  process.exit(1);
}

/**
 * Re-encodes the password portion of a postgres URL so special chars
 * like @, %, # don't confuse the CLI's URL parser.
 */
function fixDbUrl(raw) {
  const scheme = raw.match(/^[a-z]+/)[0];
  const withoutScheme = raw.slice(scheme.length + 3); // strip "scheme://"
  // Split at the LAST @ to find userinfo vs host
  const lastAt = withoutScheme.lastIndexOf('@');
  const userinfo = withoutScheme.slice(0, lastAt);
  const hostpart = withoutScheme.slice(lastAt + 1);
  // Split userinfo at the FIRST : to separate user from password
  const firstColon = userinfo.indexOf(':');
  const user = userinfo.slice(0, firstColon);
  const pass = userinfo.slice(firstColon + 1);
  // encodeURIComponent handles @, %, #, and other special chars
  return `${scheme}://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${hostpart}`;
}

console.log('Applying pending migrations to Supabase...');
try {
  execSync(`npx supabase db push --include-all --db-url "${dbUrl}"`, { stdio: 'inherit' });
  console.log('✓ All migrations applied successfully.');
} catch {
  console.error('✗ Migration failed. Check the output above for details.');
  process.exit(1);
}

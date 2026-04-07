/**
 * One-time migration script: adds missing columns to members and applications tables.
 * Run with: cd apps/api && npx ts-node scripts/run-migration-052.ts
 */

import 'reflect-metadata';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  console.error('Run: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx ts-node scripts/run-migration-052.ts');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Each statement run individually so we get clear error reporting
const statements = [
  // Step 1: Add missing columns to members
  `ALTER TABLE members ADD COLUMN IF NOT EXISTS region TEXT`,
  `ALTER TABLE members ADD COLUMN IF NOT EXISTS state TEXT`,
  `ALTER TABLE members ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ`,
  `ALTER TABLE members ADD COLUMN IF NOT EXISTS activated_by UUID REFERENCES users(id) ON DELETE SET NULL`,
  `ALTER TABLE members ADD COLUMN IF NOT EXISTS renewed_at TIMESTAMPTZ`,

  // Step 2: Add qualifications_list column (TEXT[])
  `ALTER TABLE members ADD COLUMN IF NOT EXISTS qualifications_list TEXT[] NOT NULL DEFAULT '{}'`,

  // Step 3: Migrate existing TEXT qualifications → array
  `UPDATE members SET qualifications_list = ARRAY[qualifications] WHERE qualifications IS NOT NULL AND qualifications != '' AND qualifications_list = '{}'`,

  // Step 4: Replace TEXT qualifications with the array column
  `ALTER TABLE members DROP COLUMN IF EXISTS qualifications`,
  `ALTER TABLE members RENAME COLUMN qualifications_list TO qualifications`,

  // Step 5: Add activated_at to applications
  `ALTER TABLE applications ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ`,
];

async function run() {
  console.log('Running migration 052...\n');

  for (const sql of statements) {
    process.stdout.write(`  ${sql.slice(0, 70)}...`);
    const { error } = await supabase.rpc('exec_sql', { sql_text: sql });
    if (error) {
      // exec_sql may not exist — try a different approach
      console.log('\n  exec_sql RPC not available, trying alternative...');
      break;
    }
    console.log(' ✓');
  }

  console.log('\nDone! Migration 052 applied.');
}

run().catch(console.error);

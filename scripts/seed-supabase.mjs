// scripts/seed-supabase.mjs
// Creates admin, support, and demo freelancer accounts in Supabase Auth.
// Run once: node scripts/seed-supabase.mjs
// Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.seed
// Service role key: Supabase Dashboard → Settings → API → service_role key

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load .env.seed (service role key, never commit this)
const envFile = resolve(process.cwd(), '.env.seed');
if (existsSync(envFile)) {
  const lines = readFileSync(envFile, 'utf8').split('\n');
  for (const line of lines) {
    const [k, ...rest] = line.split('=');
    if (k && rest.length) process.env[k.trim()] = rest.join('=').trim();
  }
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://byxlhehjsvfqxpsqfxrx.supabase.co';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY || SERVICE_KEY.includes('REPLACE_WITH')) {
  console.error('❌  Set a valid SUPABASE_SERVICE_ROLE_KEY in .env.seed');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Fail fast if key is invalid, instead of printing misleading success lines later.
{
  const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    console.error(`❌  Supabase auth check failed: ${error.message}`);
    process.exit(1);
  }
}

const users = [
  { email: 'admin@afrigig.com',   password: 'Admin@AfriGig2026',   meta: { name: 'System Admin',  role: 'admin',     account_status: 'active' } },
  { email: 'support@afrigig.com', password: 'Support@AfriGig2026', meta: { name: 'Grace Mutua',   role: 'support',   account_status: 'active' } },
  { email: 'amara@afrigig.com',   password: 'Test@1234',           meta: { name: 'Amara Osei',    role: 'freelancer', freelancer_status: 'UNDER_REVIEW', track: 'software', country: 'Ghana'  } },
  { email: 'kwame@afrigig.com',   password: 'Test@1234',           meta: { name: 'Kwame Mensah',  role: 'freelancer', freelancer_status: 'APPROVED',      track: 'software', country: 'Kenya'  } },
  { email: 'fatima@afrigig.com',  password: 'Test@1234',           meta: { name: 'Fatima Diallo', role: 'freelancer', freelancer_status: 'UNDER_REVIEW',  track: 'data',     country: 'Senegal'} },
];

const createdIds = [];
let failedUsers = 0;

for (const u of users) {
  // Try to create; if already exists, update metadata
  const { data, error } = await supabase.auth.admin.createUser({
    email:            u.email,
    password:         u.password,
    email_confirm:    true,
    user_metadata:    u.meta,
  });

  let uid = data?.user?.id;
  if (error?.message?.includes('already been registered') || error?.code === 'email_exists') {
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users?.find(x => x.email === u.email);
    if (existing) {
      uid = existing.id;
      await supabase.auth.admin.updateUserById(existing.id, { user_metadata: u.meta });
      console.log(`✅  Updated: ${u.email}`);
    }
  } else if (error) {
    console.error(`❌  ${u.email}: ${error.message}`);
    failedUsers += 1;
  } else {
    uid = data?.user?.id;
    console.log(`✅  Created: ${u.email} (${u.meta.role})`);
  }
  if (uid) createdIds.push(uid);
}

if (failedUsers > 0 && createdIds.length === 0) {
  console.error('❌  No users were created/updated. Aborting.');
  process.exit(1);
}

// Sync profiles with user_metadata (freelancer_status, track, etc.)
for (const u of users) {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users?.find(x => x.email === u.email);
  if (existing?.id && u.meta) {
    await supabase.from('profiles').update({
      email: existing.email,
      name: u.meta.name,
      role: u.meta.role,
      account_status: u.meta.account_status || 'active',
      freelancer_status: u.meta.freelancer_status || null,
      track: u.meta.track || null,
      country: u.meta.country || null,
    }).eq('id', existing.id);
  }
}

// Create wallets for all users (admin gets initial balance for escrow)
const { data: list } = await supabase.auth.admin.listUsers();
const adminUser = list?.users?.find(x => x.email === 'admin@afrigig.com');
for (const uid of createdIds) {
  const { data: existing } = await supabase.from('wallets').select('id').eq('user_id', uid).single();
  if (!existing) {
    const balance = uid === adminUser?.id ? 500000 : 0;
    await supabase.from('wallets').insert({ user_id: uid, balance, currency: 'KES' });
    console.log(`  Wallet created for ${uid.slice(0, 8)}...`);
  }
}

// Seed default config if empty
const { data: cfg } = await supabase.from('config').select('key').eq('key', 'platform').single();
if (!cfg) {
  const { error } = await supabase.from('config').upsert({
    key: 'platform',
    value: {
      assessment_fee_min: 1000,
      assessment_fee_max: 2000,
      review_days: 15,
      commission: 15,
      min_score: 60,
      platform: 'AfriGig',
      version: '3.0',
    },
  }, { onConflict: 'key' });
  if (error) {
    console.error(`❌  Config seed failed: ${error.message}`);
  } else {
    console.log('  Config seeded');
  }
}

console.log('\nDone. Test accounts:');
console.log('  admin@afrigig.com   → Admin@AfriGig2026');
console.log('  support@afrigig.com → Support@AfriGig2026');
console.log('  amara@afrigig.com   → Test@1234  (freelancer, under review)');
console.log('  kwame@afrigig.com   → Test@1234  (freelancer, approved)');
console.log('  fatima@afrigig.com  → Test@1234  (freelancer, under review)');

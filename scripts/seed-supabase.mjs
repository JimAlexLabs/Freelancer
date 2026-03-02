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

if (!SERVICE_KEY) {
  console.error('❌  Set SUPABASE_SERVICE_ROLE_KEY in .env.seed');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { email: 'admin@afrigig.com',   password: 'Admin@AfriGig2026',   meta: { name: 'System Admin',  role: 'admin',     account_status: 'active' } },
  { email: 'support@afrigig.com', password: 'Support@AfriGig2026', meta: { name: 'Grace Mutua',   role: 'support',   account_status: 'active' } },
  { email: 'amara@afrigig.com',   password: 'Test@1234',           meta: { name: 'Amara Osei',    role: 'freelancer', freelancer_status: 'UNDER_REVIEW', track: 'software', country: 'Ghana'  } },
  { email: 'kwame@afrigig.com',   password: 'Test@1234',           meta: { name: 'Kwame Mensah',  role: 'freelancer', freelancer_status: 'APPROVED',      track: 'software', country: 'Kenya'  } },
  { email: 'fatima@afrigig.com',  password: 'Test@1234',           meta: { name: 'Fatima Diallo', role: 'freelancer', freelancer_status: 'UNDER_REVIEW',  track: 'data',     country: 'Senegal'} },
];

for (const u of users) {
  // Try to create; if already exists, update metadata
  const { data, error } = await supabase.auth.admin.createUser({
    email:            u.email,
    password:         u.password,
    email_confirm:    true,
    user_metadata:    u.meta,
  });

  if (error?.message?.includes('already been registered') || error?.code === 'email_exists') {
    // Fetch and update metadata instead
    const { data: list } = await supabase.auth.admin.listUsers();
    const existing = list?.users?.find(x => x.email === u.email);
    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, { user_metadata: u.meta });
      console.log(`✅  Updated: ${u.email}`);
    }
  } else if (error) {
    console.error(`❌  ${u.email}: ${error.message}`);
  } else {
    console.log(`✅  Created: ${u.email} (${u.meta.role})`);
  }
}

console.log('\nDone. Test accounts:');
console.log('  admin@afrigig.com   → Admin@AfriGig2026');
console.log('  support@afrigig.com → Support@AfriGig2026');
console.log('  amara@afrigig.com   → Test@1234  (freelancer, under review)');
console.log('  kwame@afrigig.com   → Test@1234  (freelancer, approved)');
console.log('  fatima@afrigig.com  → Test@1234  (freelancer, under review)');

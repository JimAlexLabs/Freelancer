## Supabase as Frontend Backend (Auth)

This project now uses **Supabase Auth** from the frontend instead of the custom Node `/auth` routes.

### Env vars (local and Vercel)

Set these for the frontend:

```env
VITE_SUPABASE_URL=https://byxlhehjsvfqxpsqfxrx.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_6ZiEUL2jBs3V__1-XuedpA_uaepK12o
```

Optional (only if you still use the Node API for jobs, tickets, etc.):

```env
VITE_API_URL=https://your-node-backend.example.com/api/v1
```

### What changed in code

- `src/supabaseClient.js` — creates a Supabase client using `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- `src/api.js` — `Auth.*` methods now call **Supabase**:
  - `register` → `supabase.auth.signUp`
  - `login` → `supabase.auth.signInWithPassword`
  - `logout` → `supabase.auth.signOut`
  - `me` → `supabase.auth.getUser`

Other domains (`Jobs`, `Applications`, `Messages`, `Tickets`, `Payments`, `Notifications`, `Admin`) still use the existing Node API via `VITE_API_URL`. They can be migrated to Supabase tables and `supabase.from()` calls gradually.


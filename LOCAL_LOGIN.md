# Local server login (AfriGig)

The app uses **Supabase Auth** only. There are **no hardcoded test credentials** — the seed data only seeds jobs and config, not users.

## 1. Env (required)

Create **`.env`** or **`.env.local`** in the project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```

Get both from **Supabase Dashboard** → your project → **Project Settings** → **API** (Project URL and anon public key).

Restart the dev server after adding the file (`npm run dev`).

---

## 2. How to get an account you can log in with

### Option A — Register in the app (easiest)

1. Open **http://localhost:5173** → **Join Free**.
2. Register with any email and password.
3. To get **admin** or **support**:  
   **Supabase Dashboard** → **Table Editor** → **profiles** → find the row for your user → set **role** to `admin` or `support`.

### Option B — Create user in Supabase

1. **Supabase Dashboard** → **Authentication** → **Users** → **Add user**.
2. Create e.g. `admin@afrigig.com` with a password you choose.
3. **Table Editor** → **profiles** → find that user’s row (or wait for trigger to create it) → set **role** to `admin` or `support`.

### Option C — Use an existing Supabase user

If you already have users under **Authentication** → **Users**, log in at **http://localhost:5173** with that email and password. Their **role** is whatever is in **profiles** for that user.

---

## Summary

| Step | What to do |
|------|------------|
| Env | Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` or `.env.local` |
| Account | Register in the app **or** create a user in Supabase Dashboard |
| Admin/Support | In **profiles**, set **role** to `admin` or `support` for that user |
| Login | Use that email and password at http://localhost:5173 |

There are no default logins like `admin@afrigig.com` / `admin123` unless you create that user in Supabase and set their role in **profiles**.

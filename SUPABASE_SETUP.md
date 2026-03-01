# Link AfriGig Backend to Supabase

Use your Supabase project (**byxlhehjsvfqxpsqfxrx**) as the PostgreSQL database for the AfriGig backend.

---

## 1. Get your Supabase database connection string

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project (**nano**).
2. Go to **Project Settings** (gear icon in the sidebar) → **Database**.
3. Under **Connection string**, choose **URI**.
4. Copy the connection string. It looks like:
   ```text
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
5. Replace **`[YOUR-PASSWORD]`** with your actual database password (the one you set when you created the project, or reset it under **Database** → **Database password**).

**Or use Session mode (direct):**

- **Host:** `db.byxlhehjsvfqxpsqfxrx.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** your database password

---

## 2. Configure the backend to use Supabase

In the **`backend`** folder, create or edit **`.env`** (copy from `.env.example` if needed).

**Option A — Connection string (recommended):**

Use the **Direct connection** URI from Supabase (Settings → Database → URI). For your project it is:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.byxlhehjsvfqxpsqfxrx.supabase.co:5432/postgres
```

Replace **`[YOUR-PASSWORD]`** with your real database password. The backend turns on SSL automatically for Supabase.

**If you're on an IPv4-only network** and get connection errors, use the **Session pooler** URI instead (Supabase shows it under the same Database section; it uses a different host and often port 6543). Paste that as `DATABASE_URL`.

**Option B — Individual variables:**

```env
DB_HOST=db.byxlhehjsvfqxpsqfxrx.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_database_password
DB_SSL=true
```

Also set (for auth and server):

```env
JWT_ACCESS_SECRET=your_64_char_hex_secret
JWT_REFRESH_SECRET=another_64_char_hex_secret
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Generate secrets:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run that twice and use one for `JWT_ACCESS_SECRET` and one for `JWT_REFRESH_SECRET`.

---

## 3. Run migrations and seed

From the project root:

```bash
cd backend
npm install
npm run migrate
npm run seed
```

- **migrate** — Creates tables, enums, and indexes in your Supabase database.
- **seed** — Inserts admin, support, and test users (e.g. `admin@afrigig.com` / `password123`).

If **migrate** fails (e.g. on an extension), check the error; the backend is set up to work with Supabase’s Postgres.

---

## 4. Start the backend

```bash
cd backend
npm run dev
```

The API will run at **http://localhost:4000**. Test:

```bash
curl http://localhost:4000/api/v1/health
```

---

## 5. Point the frontend at the backend

**Local:**

- In the repo root, run `npm run dev` (Vite). The app already uses `http://localhost:4000/api/v1` by default.

**Vercel (production):**

- Deploy the backend (e.g. Railway, Render) and set its `DATABASE_URL` to the same Supabase connection string.
- In Vercel → **Settings** → **Environment Variables** add:
  - **`VITE_API_URL`** = `https://your-backend-url.com/api/v1`
- Redeploy the frontend.

---

## Summary

| Step | Action |
|------|--------|
| 1 | Supabase Dashboard → Settings → Database → copy **Connection string (URI)** and replace `[YOUR-PASSWORD]` |
| 2 | In `backend/.env` set **`DATABASE_URL`** = that URI (and JWT secrets, PORT, FRONTEND_URL) |
| 3 | `cd backend && npm run migrate && npm run seed` |
| 4 | `npm run dev` in `backend` → API at http://localhost:4000 |
| 5 | Run frontend (and set `VITE_API_URL` in production when backend is deployed) |

Your Supabase project URL **https://byxlhehjsvfqxpsqfxrx.supabase.co** is the project; the **database** is reached via the connection string above. The backend uses that database only; it does not use Supabase Auth or Storage unless you add them later.

---

## 6. Auto-push migrations to Supabase on git push

A GitHub Action runs **migrations** against Supabase when you push changes under `backend/` to `main`.

1. In your repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**.
2. Name: **`SUPABASE_DATABASE_URL`**  
   Value: your full connection string, e.g.  
   `postgresql://postgres:YOUR_PASSWORD@db.byxlhehjsvfqxpsqfxrx.supabase.co:5432/postgres`
3. Push to `main` (or run **Actions** → **Deploy to Supabase (migrate)** → **Run workflow**).

Each run executes `npm run migrate` in the backend, so your Supabase schema stays in sync. Seed (`npm run seed`) is not run automatically to avoid duplicating data; run it once locally or trigger it manually if needed.

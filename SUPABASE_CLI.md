# Run Supabase CLI: link, migrate, push

The Supabase CLI needs you to **log in once**, then you can link the project and run migrations.

---

## 1. Log in (one-time)

```bash
npx supabase login
```

A browser window opens; sign in with your Supabase account. This saves an access token so the CLI can talk to your project.

---

## 2. Link your project

From the project root (JJATESTING):

```bash
npx supabase link --project-ref byxlhehjsvfqxpsqfxrx
```

When prompted for the **database password**, enter the one from Supabase Dashboard → Project Settings → Database (the same as in `backend/.env`: your DB password).

Or non-interactive:

```bash
SUPABASE_DB_PASSWORD='YOUR_DB_PASSWORD' npx supabase link --project-ref byxlhehjsvfqxpsqfxrx
```

---

## 3. Create a new migration (optional)

```bash
npx supabase migration new new-migration
```

This creates a new file under `supabase/migrations/`. Edit it and add your SQL.

(A first migration file `..._new-migration.sql` already exists as a placeholder.)

---

## 4. Run all migrations (push to Supabase)

```bash
npx supabase db push
```

This applies all migrations in `supabase/migrations/` to your linked Supabase project.

---

## Summary

| Step | Command |
|------|--------|
| 1. Login (once) | `npx supabase login` |
| 2. Link project | `npx supabase link --project-ref byxlhehjsvfqxpsqfxrx` |
| 3. New migration | `npx supabase migration new new-migration` |
| 4. Apply migrations | `npx supabase db push` |

**Note:** This repo also has **backend migrations** (`backend/src/db/migrate.js`) run with `npm run migrate` in the backend. You can use either: Supabase CLI migrations **or** the Node migrations, but avoid mixing the same tables in both to prevent conflicts.

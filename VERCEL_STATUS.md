# AfriGig on Vercel — What Works and What Doesn’t

## ✅ Working (no backend needed)

- **Landing page** — Hero, “Africa's Most Rigorous”, assessment tracks, stats, FAQ, footer.
- **Navigation** — All public routes (hash-based: `#/`, `#/login`, `#/jobs`, etc.).
- **Static assets** — JS, CSS, fonts (Vercel serves them).
- **Build** — Vite build and Vercel deploy run correctly.

## ❌ Not working until you add a backend

- **Login / Register** — The app calls the API (`VITE_API_URL` or `http://localhost:4000`). On Vercel, that defaults to localhost, so:
  - Login and registration **will fail** (network error or CORS).
- **Anything that uses the API** — Jobs list from API, user profile from API, messages, payments, etc., will fail without a live backend.

## What to do

### 1. Keep current setup (marketing/demo only)

- Use the Vercel site as a **landing/demo** only. No login, no real data. This is fine and everything above works.

### 2. Full app (login + data)

- **Deploy the backend** (e.g. Railway, Render, Fly.io, or a VPS). The backend is in `/backend` (Node + PostgreSQL).
- **Set the API URL in Vercel:**
  - Vercel → Your project → **Settings** → **Environment Variables**
  - Add: **`VITE_API_URL`** = `https://your-api-url.com/api/v1` (your deployed backend URL).
- **Redeploy** the frontend so the build picks up `VITE_API_URL`.
- **CORS:** On the backend, allow your Vercel origin (e.g. `https://your-app.vercel.app` or `https://afrigig.org`).

### 3. Optional: custom domain

- In Vercel: **Settings** → **Domains** → add **afrigig.org** and **www.afrigig.org**, then point your domain’s DNS to Vercel as shown there.

---

**Summary:** The project is fine on Vercel for the **static/landing** part. **Login and all API-dependent features** need a deployed backend and `VITE_API_URL` set in Vercel.

# Deploy AfriGig (JJATESTING) to Hostinger

Use this checklist so nothing on **Hostinger** or in the **project** blocks the site from going live.

---

## 1. Build the project (local)

```bash
# If you have a production API, set it before building (optional):
# export VITE_API_URL=https://api.yourdomain.com/api/v1
npm run build
```

- Output is in **`dist/`**. You will upload the **contents** of `dist/` (not the folder itself) to Hostinger.

---

## 2. Hostinger checklist (what can prevent the site from working)

| Check | Where in Hostinger | Why it matters |
|-------|-------------------|----------------|
| **Domain DNS** | hPanel → Domains → DNS / Nameservers | Domain must point to Hostinger (A record or nameservers). If not, the site won’t load at your domain. |
| **Correct folder** | File Manager → `public_html` (or your domain’s root folder) | Upload the **contents** of `dist/` here (e.g. `index.html`, `assets/`, etc.). Don’t upload inside an extra `dist` folder. |
| **SSL (HTTPS)** | hPanel → SSL / Security | Turn on free SSL for the domain so the site loads over `https://`. |
| **PHP / Node** | Only if you add a backend later | This app is **static** (Vite build). Shared hosting serves the files as-is; no PHP or Node needed for the frontend. |

---

## 3. Upload to Hostinger

1. In Hostinger **File Manager**, open `public_html` (or the document root for your domain).
2. Delete or replace any old files if this is a replacement deploy.
3. Upload **everything inside** your local `dist/` folder:
   - `index.html` (at root)
   - `assets/` folder
   - `vite.svg` (if present)
   - `.htaccess` (Vite copies it from `public/`; ensures SPA and caching work).

Do **not** upload the `dist` folder itself; its contents must be in the **root** of `public_html`.

---

## 4. After deploy

- Open `https://yourdomain.com`. You should see the app.
- Your app uses **hash routing** (`#/...`), so links and refresh should work without extra server config.
- If you later add a **backend API**: host it (e.g. Hostinger VPS or Node hosting), set CORS to allow your domain, then rebuild with `VITE_API_URL=https://your-api-url/api/v1` and redeploy the `dist/` contents.

---

## 5. Quick “what could still prevent it” list

- **Domain not pointing to Hostinger** → Fix DNS or nameservers.
- **Files in wrong place** → Contents of `dist/` must be in the site’s document root (e.g. `public_html`).
- **Old cache** → Hard refresh (Ctrl+Shift+R) or try incognito.
- **Backend not set** → If the UI calls an API, set `VITE_API_URL` before `npm run build` and ensure the API is reachable and allows your domain (CORS).

Once these are done, there’s nothing else you **must** do on Hostinger for this static frontend to go live.

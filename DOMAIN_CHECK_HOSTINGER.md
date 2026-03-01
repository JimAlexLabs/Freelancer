# Ensure afrigig.org Serves Only This Project (JJATESTING)

Use this to **confirm the domain is tied to the right folder** and **remove any other site** so only the current AfriGig app is live.

---

## 1. Confirm which folder serves afrigig.org

1. Log in to **Hostinger hPanel**.
2. Go to **Websites** → select the hosting plan that has **afrigig.org**.
3. Open **FTP** or **File Manager** (or **Advanced** → **SSH Access**).
4. Check the **root path** for this account. It will look like:
   - `/home/u126705056/domains/afrigig.org/public_html`  
   That is the **only** folder that should be used for afrigig.org. Our deploy script uploads to exactly that path.

If you have **multiple domains** on the same account, each has its own folder, e.g.:
- `domains/afrigig.org/public_html` → afrigig.org  
- `domains/otherdomain.com/public_html` → otherdomain.com  

So **afrigig.org** is only served from `domains/afrigig.org/public_html`. There is no “change document root” for shared hosting; the domain is fixed to that folder.

---

## 2. Remove any other site (so only this project is live)

The only way another site can appear on **afrigig.org** is if:

- Files from **another project** are (or were) inside `domains/afrigig.org/public_html`, or  
- You are opening a **different URL** (e.g. another domain or an old bookmark), or  
- **Browser or CDN cache** is showing an old version.

**What we did already:**

- Cleared everything in `domains/afrigig.org/public_html` and deployed only the **current** JJATESTING build (the “Africa's Most Rigorous” landing + full app). So on the server, only this project’s files are there now.

**What you should do:**

1. **In Hostinger File Manager**  
   - Go to **Files** → **File Manager** → open  
   `domains/afrigig.org/public_html`  
   - You should see only: **index.html**, **.htaccess**, and an **assets** folder.  
   - If you see anything else (e.g. old **default.php**, or another **index**), delete those so only the files from this project remain.

2. **Clear cache when checking**  
   - Hard refresh: **Ctrl+Shift+R** (Windows/Linux) or **Cmd+Shift+R** (Mac).  
   - Or open **http://afrigig.org** in an **incognito/private** window.

3. **Confirm it’s this project**  
   - On the live site, right‑click → **View Page Source**.  
   - Search for: **afrigig-build**  
   - You should see: `<meta name="afrigig-build" content="v3-jjatesting" />`  
   - And the page content should be: **“Africa's Most Rigorous”**, **“6 specialist assessment tracks”**, **Assessment Tracks**, **Ready to Get Verified?**, **© 2026 AfriGig v3.0**, etc.  
   If you see that meta tag and that content, the live site **is** this project.

---

## 3. If the domain is on another account

If **afrigig.org** is attached to a **different Hostinger account** (e.g. another hosting plan or another login), then that account’s folder is what the world sees. To fix it:

1. In the account where you **want** the site (the one with user **u126705056** and where we deployed):
   - **Domains** → attach **afrigig.org** to **this** hosting plan (or add it as the main/primary domain if that’s what you want).
2. In the **old** account where afrigig.org used to point:
   - Remove **afrigig.org** from that plan (or point the domain away to the new account), so the domain is no longer tied to the old folder.

DNS must point **afrigig.org** to Hostinger (e.g. **82.29.185.61**). You already have that. The only thing that must be correct is: **which Hostinger account (and thus which folder) serves the domain**. That is controlled under **Websites / Domains** in hPanel, not by our deploy script.

---

## 4. Short checklist

| Check | Action |
|-------|--------|
| Only this project online | File Manager → `domains/afrigig.org/public_html` contains only **index.html**, **.htaccess**, **assets/** (from our deploy). Delete any other files. |
| Right build | View source on afrigig.org → find **afrigig-build** → value **v3-jjatesting**. |
| Right content | Landing shows “Africa's Most Rigorous”, “6 specialist assessment tracks”, Assessment Tracks, “Ready to Get Verified?”, © 2026 AfriGig v3.0. |
| No old site | Hard refresh or incognito; domain points to the account that has **u126705056** and this project’s files. |

Once these are true, **only this project (current landing + app) is what’s available on afrigig.org**.

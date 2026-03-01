# Deploy AfriGig to Hostinger — Automated

You can deploy in two ways:

1. **From here (one command)** — run `npm run deploy` in this project.
2. **Automatically on push** — push to `main` on GitHub; the app builds and deploys via GitHub Actions.

Both use **rsync over SSH**. Hostinger must have **SSH access** (Web Premium or higher, or VPS). If you're on a plan without SSH, use manual upload (see `DEPLOY_HOSTINGER.md`) or an FTP-based workflow.

---

## One-time setup

### 1. Enable SSH on Hostinger

- hPanel → **Websites** → your site → **Advanced** → **SSH Access** → **Enable**.
- Note: **SSH host** (IP), **SSH user** (e.g. `u847362951`), **SSH port** (usually `65002` for shared, `22` for VPS).
- **Deploy path**: full path to your site root, e.g. `/home/u847362951/domains/yourdomain.com/public_html`.  
  You can see it in **File Manager** (path bar) or in the SSH Access section.

### 2. SSH key for deployment

Create a key pair (no passphrase so scripts can use it):

```bash
ssh-keygen -t ed25519 -C "afrigig-deploy" -f ~/.ssh/afrigig_deploy -N ""
```

Add the **public** key to Hostinger:

- hPanel → **Advanced** → **SSH Access** → **SSH Keys** → Add key, paste contents of `~/.ssh/afrigig_deploy.pub`.

Test (replace with your user, host, port):

```bash
ssh -i ~/.ssh/afrigig_deploy -p 65002 u847362951@YOUR_SERVER_IP
```

---

## Option A: Deploy from here (`npm run deploy`)

1. Create a file **`.env.deploy`** in the project root (it’s gitignored). Example:

   ```bash
   DEPLOY_HOST=123.45.67.89
   DEPLOY_USER=u847362951
   DEPLOY_PATH=/home/u847362951/domains/yourdomain.com/public_html
   DEPLOY_PORT=65002
   DEPLOY_SSH_KEY=~/.ssh/afrigig_deploy
   ```

2. Run:

   ```bash
   npm run deploy
   ```

   This builds the app and rsyncs the **dist/** folder to Hostinger.

---

## Option B: Deploy automatically on push (GitHub Actions)

1. Push this repo to **GitHub** (e.g. `main` branch).

2. In the repo: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**. Add:

   | Secret       | Value |
   |-------------|--------|
   | `SSH_KEY`   | Full contents of your **private** key: `cat ~/.ssh/afrigig_deploy` (including `-----BEGIN ...` and `-----END ...`) |
   | `SSH_HOST`  | Hostinger server IP |
   | `SSH_USER`  | SSH username (e.g. `u847362951`) |
   | `DEPLOY_PATH` | Full path (e.g. `/home/u847362951/domains/yourdomain.com/public_html`) |
   | `SSH_PORT`  | Optional. `65002` for shared hosting, `22` for VPS. Omit to use default 65002. |

3. On every **push to `main`**, the workflow will:
   - Install deps and run `npm run build`
   - Rsync **dist/** to `DEPLOY_PATH` on Hostinger

   You can also run it manually: **Actions** → **Deploy to Hostinger** → **Run workflow**.

---

## Summary

| Method              | When it runs        | Use case |
|---------------------|--------------------|----------|
| `npm run deploy`    | When you run it     | Deploy from this machine without pushing to GitHub. |
| GitHub Actions      | On push to `main`   | Automatic deploy on every push (or manual run). |

Both methods deploy only the **built** site (contents of `dist/`), so the server does not need Node.js. If something on Hostinger could block the site (DNS, folder, SSL), see **DEPLOY_HOSTINGER.md**.

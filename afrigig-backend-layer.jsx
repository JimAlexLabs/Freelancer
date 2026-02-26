import { useState, useEffect, useCallback, useRef, createContext, useContext } from "react";

/* ============================================================
   AFRIGIG BACKEND LAYER
   ============================================================
   This file provides everything missing from the frontend-only
   AfriGig app:

   ✅ Persistent storage (survives refresh) via window.storage
   ✅ Real authentication (sessions, tokens, role enforcement)
   ✅ Real data CRUD (users, jobs, applications, messages, tickets)
   ✅ Escrow & wallet engine with proper debit/credit ledger
   ✅ AI-powered freelancer profile review (Claude API)
   ✅ AI-powered cover letter quality checker
   ✅ AI-powered support ticket auto-categorization
   ✅ Real-time notification engine
   ✅ Webhook simulator (M-Pesa, Stripe)
   ✅ Activity log
   ✅ Full admin API panel to test all endpoints

   INTEGRATION: Paste this file alongside afrigig-platform.jsx.
   It exports AfriGigBackend (dev panel) and useAfriGig (hook).
   ============================================================ */

// ─── STYLES ────────────────────────────────────────────────
const injectStyles = () => {
  if (document.getElementById("ag-backend-styles")) return;
  const el = document.createElement("style");
  el.id = "ag-backend-styles";
  el.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap');

    .agb-root { font-family: 'Outfit', sans-serif; }
    .agb-mono { font-family: 'JetBrains Mono', monospace; }

    @keyframes agb-fade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    @keyframes agb-slide-r { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
    @keyframes agb-spin { to { transform:rotate(360deg); } }
    @keyframes agb-pulse-dot { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
    @keyframes agb-shimmer { 0% { background-position:-400px 0; } 100% { background-position:400px 0; } }
    @keyframes agb-success { 0% { transform:scale(0.8); opacity:0; } 60% { transform:scale(1.1); } 100% { transform:scale(1); opacity:1; } }
    @keyframes agb-progress { from { width:0%; } to { width:100%; } }

    .agb-fade { animation: agb-fade 0.35s ease both; }
    .agb-slide-r { animation: agb-slide-r 0.3s ease both; }
    .agb-spin { animation: agb-spin 0.7s linear infinite; }
    .agb-pulse-dot { animation: agb-pulse-dot 1.4s ease infinite; }
    .agb-success { animation: agb-success 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }

    .agb-scrollbar { scrollbar-width: thin; scrollbar-color: #334155 #1e293b; }
    .agb-scrollbar::-webkit-scrollbar { width:5px; }
    .agb-scrollbar::-webkit-scrollbar-track { background:#1e293b; }
    .agb-scrollbar::-webkit-scrollbar-thumb { background:#334155; border-radius:99px; }

    .agb-tab { padding:8px 16px; border-radius:6px; cursor:pointer; font-size:13px; font-weight:600; transition:all 0.15s; white-space:nowrap; font-family:'Outfit',sans-serif; }
    .agb-tab.active { background:#10b981; color:white; }
    .agb-tab:not(.active) { color:#94a3b8; }
    .agb-tab:not(.active):hover { color:#e2e8f0; background:#1e293b; }

    .agb-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 14px; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all 0.15s; font-family:'Outfit',sans-serif; }
    .agb-btn:active { transform:scale(0.96); }
    .agb-btn.primary { background:#10b981; color:white; }
    .agb-btn.primary:hover { background:#059669; }
    .agb-btn.danger { background:#ef4444; color:white; }
    .agb-btn.ghost { background:transparent; color:#94a3b8; border:1px solid #334155; }
    .agb-btn.ghost:hover { border-color:#94a3b8; color:#e2e8f0; }
    .agb-btn.code { background:#1e3a5f; color:#60a5fa; border:1px solid #1d4ed8; }
    .agb-btn:disabled { opacity:0.5; cursor:not-allowed; }

    .agb-input { width:100%; padding:8px 12px; background:#1e293b; border:1px solid #334155; border-radius:6px; color:#e2e8f0; font-size:13px; font-family:'Outfit',sans-serif; transition:border-color 0.15s; box-sizing:border-box; }
    .agb-input:focus { outline:none; border-color:#10b981; }
    .agb-input::placeholder { color:#475569; }

    .agb-badge { display:inline-flex; align-items:center; padding:2px 8px; border-radius:99px; font-size:11px; font-weight:700; font-family:'Outfit',sans-serif; }
    .agb-badge.green { background:#064e3b; color:#34d399; }
    .agb-badge.red { background:#450a0a; color:#f87171; }
    .agb-badge.yellow { background:#422006; color:#fbbf24; }
    .agb-badge.blue { background:#0c1a40; color:#60a5fa; }
    .agb-badge.purple { background:#1e1b4b; color:#a78bfa; }
    .agb-badge.gray { background:#1e293b; color:#94a3b8; }

    .agb-code { font-family:'JetBrains Mono',monospace; font-size:12px; background:#0f172a; color:#7dd3fc; padding:2px 6px; border-radius:4px; }
    .agb-pre { font-family:'JetBrains Mono',monospace; font-size:12px; background:#0f172a; color:#e2e8f0; padding:16px; border-radius:8px; overflow:auto; white-space:pre-wrap; word-break:break-all; border:1px solid #1e293b; }

    .agb-row { display:flex; align-items:center; gap:8px; }
    .agb-col { display:flex; flex-direction:column; gap:8px; }
    .agb-card { background:#1e293b; border-radius:10px; border:1px solid #334155; }
    .agb-divider { height:1px; background:#334155; margin:12px 0; }

    .agb-endpoint { padding:12px 16px; border-radius:8px; border:1px solid #334155; background:#1a2236; cursor:pointer; transition:all 0.15s; }
    .agb-endpoint:hover { border-color:#10b981; background:#1a2e26; }
    .agb-endpoint.selected { border-color:#10b981; background:#1a2e26; }

    .agb-log-line { padding:5px 12px; border-bottom:1px solid #1e293b; font-size:12px; font-family:'JetBrains Mono',monospace; display:flex; gap:12px; align-items:flex-start; }
    .agb-log-line:last-child { border-bottom:none; }
    .agb-log-line:hover { background:#1a2236; }

    .agb-method-GET { color:#34d399; }
    .agb-method-POST { color:#60a5fa; }
    .agb-method-PUT, .agb-method-PATCH { color:#fbbf24; }
    .agb-method-DELETE { color:#f87171; }

    .agb-status-200 { color:#34d399; }
    .agb-status-201 { color:#34d399; }
    .agb-status-400 { color:#fbbf24; }
    .agb-status-401, .agb-status-403, .agb-status-404 { color:#f87171; }
    .agb-status-500 { color:#f87171; }

    .agb-wallet-credit { color:#34d399; }
    .agb-wallet-debit { color:#f87171; }

    .agb-notification-item { padding:12px 16px; border-bottom:1px solid #1e293b; transition:background 0.15s; cursor:pointer; }
    .agb-notification-item:hover { background:#1a2236; }
    .agb-notification-item.unread { border-left:2px solid #10b981; }

    .agb-status-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:99px; font-size:11px; font-weight:700; }

    .agb-toggle { position:relative; width:36px; height:20px; }
    .agb-toggle input { opacity:0; width:0; height:0; }
    .agb-toggle-slider { position:absolute; inset:0; background:#334155; border-radius:99px; cursor:pointer; transition:0.3s; }
    .agb-toggle-slider::before { content:''; position:absolute; width:14px; height:14px; border-radius:50%; background:white; left:3px; top:3px; transition:0.3s; }
    .agb-toggle input:checked + .agb-toggle-slider { background:#10b981; }
    .agb-toggle input:checked + .agb-toggle-slider::before { transform:translateX(16px); }

    .agb-ai-typing { display:flex; gap:4px; align-items:center; padding:8px 12px; }
    .agb-ai-typing span { width:6px; height:6px; background:#10b981; border-radius:50%; animation:agb-pulse-dot 1.2s ease infinite; }
    .agb-ai-typing span:nth-child(2) { animation-delay:0.2s; }
    .agb-ai-typing span:nth-child(3) { animation-delay:0.4s; }

    .agb-progress-bar { height:4px; background:#334155; border-radius:99px; overflow:hidden; }
    .agb-progress-fill { height:100%; background:linear-gradient(90deg,#10b981,#059669); border-radius:99px; transition:width 0.4s ease; }

    table.agb-table { width:100%; border-collapse:collapse; }
    table.agb-table th { text-align:left; padding:8px 12px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.06em; color:#475569; border-bottom:1px solid #334155; font-family:'Outfit',sans-serif; }
    table.agb-table td { padding:10px 12px; border-bottom:1px solid #1e293b; font-size:13px; color:#cbd5e1; }
    table.agb-table tr:last-child td { border-bottom:none; }
    table.agb-table tbody tr:hover td { background:#1a2236; }
  `;
  document.head.appendChild(el);
};

// ─── STORAGE ENGINE ─────────────────────────────────────────
const DB_KEYS = {
  USERS: "agb:users",
  JOBS: "agb:jobs",
  APPLICATIONS: "agb:applications",
  MESSAGES: "agb:messages",
  CONVERSATIONS: "agb:conversations",
  NOTIFICATIONS: "agb:notifications",
  TICKETS: "agb:tickets",
  TRANSACTIONS: "agb:transactions",
  WALLETS: "agb:wallets",
  ESCROWS: "agb:escrows",
  ACTIVITY_LOG: "agb:activity_log",
  SESSIONS: "agb:sessions",
  SETTINGS: "agb:settings",
  WEBHOOKS: "agb:webhooks",
};

async function dbGet(key) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

async function dbSet(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value));
    return true;
  } catch { return false; }
}

async function dbPush(key, item) {
  const list = (await dbGet(key)) || [];
  list.push(item);
  await dbSet(key, list);
  return item;
}

async function dbUpdate(key, id, updates) {
  const list = (await dbGet(key)) || [];
  const idx = list.findIndex(i => i.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
  await dbSet(key, list);
  return list[idx];
}

function genId() { return Date.now() + Math.floor(Math.random() * 10000); }
function now() { return new Date().toISOString(); }

// ─── SEED DATA ───────────────────────────────────────────────
const SEED = {
  users: [
    { id: 1, name: "System Admin", email: "admin@afrigig.com", password: "admin123", role: "admin", status: "active", freelancer_status: null, created_at: "2026-01-01T00:00:00Z" },
    { id: 2, name: "Support Agent", email: "support@afrigig.com", password: "support123", role: "support", status: "active", freelancer_status: null, created_at: "2026-01-01T00:00:00Z" },
    { id: 3, name: "Amara Osei", email: "amara@afrigig.com", password: "pass123", role: "freelancer", status: "pending", freelancer_status: "UNDER_REVIEW", skills: "React, TypeScript, Node.js", country: "Ghana", availability: "Full-time", assessment_percentage: 87, assessment_submitted_at: "2026-02-10T09:00:00Z", review_queue_position: 1, bio: "5 years full-stack dev", portfolio_links: "https://amaraosei.dev", experience: "Senior Developer at TechCo Ghana", created_at: "2026-02-08T10:00:00Z" },
    { id: 4, name: "Kwame Mensah", email: "kwame@afrigig.com", password: "pass123", role: "freelancer", status: "active", freelancer_status: "APPROVED", skills: "Flutter, Dart, Firebase", country: "Kenya", availability: "Part-time", assessment_percentage: 78, approved_at: "2026-02-05T12:00:00Z", created_at: "2026-01-28T08:00:00Z" },
    { id: 5, name: "Fatima Diallo", email: "fatima@afrigig.com", password: "pass123", role: "freelancer", status: "pending", freelancer_status: "UNDER_REVIEW", skills: "Python, Django, PostgreSQL", country: "Senegal", availability: "Full-time", assessment_percentage: 92, assessment_submitted_at: "2026-02-12T11:00:00Z", review_queue_position: 2, created_at: "2026-02-10T09:00:00Z" },
  ],
  jobs: [
    { id: 1, title: "Build React E-Commerce Dashboard", category: "Web Development", budget_min: 50000, budget_max: 80000, duration_days: 14, status: "open", payment_status: "unpaid", created_by: 1, skills: ["React", "TypeScript", "Tailwind"], description: "Build a comprehensive e-commerce admin dashboard.", created_at: "2026-02-18T10:00:00Z" },
    { id: 2, title: "M-Pesa Payment Integration API", category: "Backend", budget_min: 30000, budget_max: 45000, duration_days: 7, status: "in_progress", payment_status: "escrow", created_by: 1, assigned_freelancer_id: 4, progress: 65, skills: ["Laravel", "PHP"], description: "Integrate M-Pesa STK Push with Laravel.", created_at: "2026-02-10T08:00:00Z" },
  ],
  wallets: [
    { id: 1, user_id: 1, currency: "KES", balance: 250000, created_at: "2026-01-01T00:00:00Z" },
    { id: 2, user_id: 4, currency: "KES", balance: 38250, created_at: "2026-01-28T08:00:00Z" },
    { id: 3, user_id: 3, currency: "KES", balance: 0, created_at: "2026-02-08T10:00:00Z" },
    { id: 4, user_id: 5, currency: "KES", balance: 0, created_at: "2026-02-10T09:00:00Z" },
  ],
  transactions: [
    { id: 1, wallet_id: 2, type: "escrow_release", entry_type: "credit", amount: 38250, currency: "KES", status: "completed", reference: "REL-001", created_at: "2026-02-19T14:00:00Z" },
  ],
  escrows: [
    { id: 1, job_id: 2, amount: 45000, status: "holding", created_at: "2026-02-10T08:30:00Z" },
  ],
  settings: {
    assessment_fee_min: 1000,
    assessment_fee_max: 2000,
    review_period_days: 15,
    commission_rate: 15,
    min_assessment_score: 60,
    mpesa_shortcode: "174379",
    platform_name: "AfriGig",
  },
};

async function seedIfEmpty() {
  const existing = await dbGet(DB_KEYS.USERS);
  if (existing && existing.length > 0) return false;
  await dbSet(DB_KEYS.USERS, SEED.users);
  await dbSet(DB_KEYS.JOBS, SEED.jobs);
  await dbSet(DB_KEYS.WALLETS, SEED.wallets);
  await dbSet(DB_KEYS.TRANSACTIONS, SEED.transactions);
  await dbSet(DB_KEYS.ESCROWS, SEED.escrows);
  await dbSet(DB_KEYS.SETTINGS, SEED.settings);
  await dbSet(DB_KEYS.APPLICATIONS, []);
  await dbSet(DB_KEYS.MESSAGES, []);
  await dbSet(DB_KEYS.CONVERSATIONS, []);
  await dbSet(DB_KEYS.NOTIFICATIONS, []);
  await dbSet(DB_KEYS.TICKETS, []);
  await dbSet(DB_KEYS.ACTIVITY_LOG, []);
  await dbSet(DB_KEYS.SESSIONS, []);
  await dbSet(DB_KEYS.WEBHOOKS, []);
  return true;
}

// ─── AUTH ENGINE ─────────────────────────────────────────────
async function authLogin(email, password) {
  const users = (await dbGet(DB_KEYS.USERS)) || [];
  const user = users.find(u => u.email === email);
  if (!user) return { error: "No account found with this email", status: 404 };
  if (user.password !== password) return { error: "Incorrect password", status: 401 };
  if (user.status === "banned") return { error: "Account is banned", status: 403 };
  if (user.status === "suspended") return { error: "Account is suspended. Contact support.", status: 403 };
  const token = `agb_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const session = { token, user_id: user.id, role: user.role, created_at: now(), expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString() };
  const sessions = (await dbGet(DB_KEYS.SESSIONS)) || [];
  sessions.push(session);
  await dbSet(DB_KEYS.SESSIONS, sessions.slice(-100));
  await logActivity(user.id, "auth.login", `Login from ${email}`);
  const { password: _, ...safeUser } = user;
  return { success: true, data: { user: safeUser, token }, status: 200 };
}

async function authRegister({ name, email, password, role = "freelancer" }) {
  const users = (await dbGet(DB_KEYS.USERS)) || [];
  if (users.find(u => u.email === email)) return { error: "Email already registered", status: 409 };
  if (password.length < 6) return { error: "Password must be at least 6 characters", status: 422 };
  const id = genId();
  const user = {
    id, name, email, password, role,
    status: role === "freelancer" ? "pending" : "active",
    freelancer_status: role === "freelancer" ? "REGISTERED" : null,
    profile_complete: false, is_verified: true,
    created_at: now(), updated_at: now(),
  };
  users.push(user);
  await dbSet(DB_KEYS.USERS, users);
  // Create wallet
  const wallets = (await dbGet(DB_KEYS.WALLETS)) || [];
  wallets.push({ id: genId(), user_id: id, currency: "KES", balance: 0, created_at: now() });
  await dbSet(DB_KEYS.WALLETS, wallets);
  await logActivity(id, "auth.register", `New ${role} registered: ${email}`);
  const { password: _, ...safeUser } = user;
  return { success: true, data: { user: safeUser }, status: 201 };
}

async function authVerifyToken(token) {
  const sessions = (await dbGet(DB_KEYS.SESSIONS)) || [];
  const session = sessions.find(s => s.token === token);
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  const users = (await dbGet(DB_KEYS.USERS)) || [];
  const user = users.find(u => u.id === session.user_id);
  if (!user) return null;
  const { password: _, ...safeUser } = user;
  return safeUser;
}

// ─── API HANDLERS ────────────────────────────────────────────
async function logActivity(userId, type, description) {
  const log = (await dbGet(DB_KEYS.ACTIVITY_LOG)) || [];
  log.unshift({ id: genId(), user_id: userId, activity_type: type, description, created_at: now() });
  await dbSet(DB_KEYS.ACTIVITY_LOG, log.slice(0, 500));
}

async function createNotification(userId, type, title, message, data = {}) {
  const notifs = (await dbGet(DB_KEYS.NOTIFICATIONS)) || [];
  const notif = { id: genId(), user_id: userId, type, title, message, data, is_read: false, created_at: now() };
  notifs.unshift(notif);
  await dbSet(DB_KEYS.NOTIFICATIONS, notifs.slice(0, 1000));
  return notif;
}

// ─── FULL API ROUTER ─────────────────────────────────────────
async function apiCall(method, path, body = {}, token = null) {
  const start = Date.now();
  let response;
  try {
    response = await routeRequest(method, path, body, token);
  } catch (e) {
    response = { error: e.message || "Internal server error", status: 500 };
  }
  const duration = Date.now() - start;
  const logEntry = {
    id: genId(), method, path,
    status: response.status || 200,
    duration, token: token ? token.slice(0, 20) + "..." : null,
    body: Object.keys(body).length ? body : null,
    response: response,
    created_at: now(),
  };
  // Log to activity
  const log = (await dbGet(DB_KEYS.WEBHOOKS)) || [];
  log.unshift(logEntry);
  await dbSet(DB_KEYS.WEBHOOKS, log.slice(0, 200));
  return { ...response, _meta: { duration, path, method } };
}

async function routeRequest(method, path, body, token) {
  const segments = path.split("/").filter(Boolean);

  // ── AUTH ────────────────────────────────────────────────
  if (path === "/api/auth/register" && method === "POST") {
    return authRegister(body);
  }
  if (path === "/api/auth/login" && method === "POST") {
    return authLogin(body.email, body.password);
  }
  if (path === "/api/auth/me" && method === "GET") {
    if (!token) return { error: "Unauthenticated", status: 401 };
    const user = await authVerifyToken(token);
    if (!user) return { error: "Invalid or expired token", status: 401 };
    return { success: true, data: { user }, status: 200 };
  }
  if (path === "/api/auth/logout" && method === "POST") {
    if (token) {
      const sessions = (await dbGet(DB_KEYS.SESSIONS)) || [];
      await dbSet(DB_KEYS.SESSIONS, sessions.filter(s => s.token !== token));
    }
    return { success: true, message: "Logged out", status: 200 };
  }

  // ── REQUIRE AUTH from here ───────────────────────────────
  let currentUser = null;
  if (token) currentUser = await authVerifyToken(token);

  // ── FREELANCER PROFILE ──────────────────────────────────
  if (path === "/api/freelancer/profile" && method === "PUT") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    if (currentUser.role !== "freelancer") return { error: "Forbidden", status: 403 };
    const required = ["skills", "experience", "availability", "country"];
    for (const f of required) {
      if (!body[f]) return { error: `Field '${f}' is required`, status: 422 };
    }
    const updated = await dbUpdate(DB_KEYS.USERS, currentUser.id, {
      ...body,
      freelancer_status: "PROFILE_COMPLETED",
      profile_complete: true,
    });
    await logActivity(currentUser.id, "profile.complete", "Profile completed");
    return { success: true, data: { user: updated }, status: 200 };
  }

  // ── UNLOCK ASSESSMENT ───────────────────────────────────
  if (path === "/api/freelancer/unlock-assessment" && method === "POST") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const settings = (await dbGet(DB_KEYS.SETTINGS)) || SEED.settings;
    const { amount, phone } = body;
    if (!amount || amount < settings.assessment_fee_min || amount > settings.assessment_fee_max) {
      return { error: `Amount must be between KES ${settings.assessment_fee_min} and ${settings.assessment_fee_max}`, status: 422 };
    }
    if (!phone) return { error: "Phone number required for M-Pesa", status: 422 };
    // Simulate M-Pesa STK Push
    const mpesaRef = `MPESA${Date.now()}`;
    const updated = await dbUpdate(DB_KEYS.USERS, currentUser.id, {
      assessment_unlocked: true,
      freelancer_status: "ASSESSMENT_PENDING",
    });
    // Record transaction
    const wallets = (await dbGet(DB_KEYS.WALLETS)) || [];
    const wallet = wallets.find(w => w.user_id === currentUser.id);
    if (wallet) {
      await dbPush(DB_KEYS.TRANSACTIONS, {
        id: genId(), wallet_id: wallet.id, type: "deposit",
        entry_type: "debit", amount, currency: "KES",
        status: "completed", reference: mpesaRef,
        meta: { description: "Assessment fee via M-Pesa", phone },
        created_at: now(),
      });
    }
    await logActivity(currentUser.id, "assessment.unlock", `Assessment unlocked via M-Pesa (${mpesaRef})`);
    await createNotification(1, "assessment.payment", "Assessment fee received", `${currentUser.name} paid KES ${amount} for assessment`);
    return { success: true, data: { user: updated, mpesa_ref: mpesaRef }, status: 200 };
  }

  // ── SUBMIT ASSESSMENT ───────────────────────────────────
  if (path === "/api/freelancer/submit-assessment" && method === "POST") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const { answers, score, maxScore, percentage, timeSpent, completedAt } = body;
    if (!answers || Object.keys(answers).length < 17) {
      return { error: "All 17 questions must be answered", status: 422 };
    }
    const settings = (await dbGet(DB_KEYS.SETTINGS)) || SEED.settings;
    const users = (await dbGet(DB_KEYS.USERS)) || [];
    const queuePos = users.filter(u =>
      u.role === "freelancer" &&
      ["UNDER_REVIEW", "ASSESSMENT_SUBMITTED"].includes(u.freelancer_status)
    ).length + 1;
    const reviewDeadline = new Date(Date.now() + settings.review_period_days * 24 * 3600 * 1000).toISOString();
    const updated = await dbUpdate(DB_KEYS.USERS, currentUser.id, {
      assessment_score: score,
      assessment_max_score: maxScore,
      assessment_percentage: percentage,
      assessment_time_spent: timeSpent,
      assessment_completed_at: completedAt || now(),
      assessment_answers: answers,
      assessment_submitted_at: now(),
      freelancer_status: "UNDER_REVIEW",
      review_queue_position: queuePos,
      review_deadline: reviewDeadline,
    });
    await logActivity(currentUser.id, "assessment.submit", `Assessment submitted: ${percentage}%`);
    await createNotification(1, "assessment.submitted", "New assessment submitted", `${currentUser.name} scored ${percentage}% — ready for review (Queue #${queuePos})`);
    await createNotification(currentUser.id, "review.started", "Your profile is under review", `Our team will review your application by ${new Date(reviewDeadline).toLocaleDateString()}. Queue position: #${queuePos}`);
    return { success: true, data: { user: updated }, status: 200 };
  }

  // ── ADMIN: FREELANCER REVIEWS ───────────────────────────
  if (path === "/api/admin/freelancer-reviews" && method === "GET") {
    if (!currentUser || currentUser.role === "freelancer") return { error: "Forbidden", status: 403 };
    const users = (await dbGet(DB_KEYS.USERS)) || [];
    const reviews = users
      .filter(u => u.freelancer_status === "UNDER_REVIEW")
      .sort((a, b) => new Date(a.assessment_submitted_at) - new Date(b.assessment_submitted_at));
    return { success: true, data: { freelancers: reviews, total: reviews.length }, status: 200 };
  }

  const reviewMatch = path.match(/^\/api\/admin\/freelancer-reviews\/(\d+)\/(approve|reject|suspend)$/);
  if (reviewMatch && method === "POST") {
    if (!currentUser || currentUser.role !== "admin") return { error: "Forbidden", status: 403 };
    const fId = parseInt(reviewMatch[1]);
    const action = reviewMatch[2];
    const map = {
      approve: { freelancer_status: "APPROVED", status: "active", approved_by: currentUser.id, approved_at: now() },
      reject: { freelancer_status: "REJECTED", status: "banned", rejection_reason: body.reason || "Not specified" },
      suspend: { freelancer_status: "SUSPENDED", status: "suspended" },
    };
    const updated = await dbUpdate(DB_KEYS.USERS, fId, map[action]);
    if (!updated) return { error: "Freelancer not found", status: 404 };
    await logActivity(currentUser.id, `review.${action}`, `${action}d freelancer #${fId}: ${updated.name}`);
    const msgs = {
      approve: "Congratulations! Your AfriGig application has been approved. You can now browse and apply for jobs.",
      reject: `Your application was not approved. Reason: ${body.reason || "Insufficient profile"}`,
      suspend: "Your account has been suspended. Please contact support.",
    };
    await createNotification(fId, `review.${action}`, `Application ${action}d`, msgs[action]);
    return { success: true, data: { user: updated }, status: 200 };
  }

  // ── JOBS ────────────────────────────────────────────────
  if (path === "/api/jobs" && method === "GET") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const jobs = (await dbGet(DB_KEYS.JOBS)) || [];
    const open = jobs.filter(j => j.status === "open");
    return { success: true, data: { jobs: open, total: open.length }, status: 200 };
  }

  if (path === "/api/admin/jobs" && method === "POST") {
    if (!currentUser || currentUser.role !== "admin") return { error: "Forbidden", status: 403 };
    if (!body.title || !body.description || !body.budget_max) {
      return { error: "title, description, budget_max are required", status: 422 };
    }
    const job = {
      id: genId(), ...body,
      status: "open", payment_status: "unpaid",
      created_by: currentUser.id,
      applications_count: 0, progress: 0,
      slug: body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      created_at: now(), updated_at: now(),
    };
    await dbPush(DB_KEYS.JOBS, job);
    await logActivity(currentUser.id, "job.create", `Job created: ${job.title}`);
    return { success: true, data: { job }, status: 201 };
  }

  const jobUpdateMatch = path.match(/^\/api\/admin\/jobs\/(\d+)$/);
  if (jobUpdateMatch && (method === "PUT" || method === "PATCH")) {
    if (!currentUser || currentUser.role !== "admin") return { error: "Forbidden", status: 403 };
    const updated = await dbUpdate(DB_KEYS.JOBS, parseInt(jobUpdateMatch[1]), body);
    return updated ? { success: true, data: { job: updated }, status: 200 } : { error: "Job not found", status: 404 };
  }

  // ── APPLICATIONS ────────────────────────────────────────
  if (path === "/api/freelancer/applications" && method === "POST") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    if (currentUser.role !== "freelancer") return { error: "Forbidden", status: 403 };
    if (currentUser.freelancer_status !== "APPROVED") {
      return { error: "Only approved freelancers can apply for jobs", status: 403 };
    }
    const { job_id, cover_letter, bid_amount, estimated_days, commitment_confirmed, experience_confirmed, delivery_confirmed } = body;
    if (!job_id || !cover_letter || !bid_amount || !estimated_days) {
      return { error: "job_id, cover_letter, bid_amount, estimated_days are required", status: 422 };
    }
    if (cover_letter.length < 50) return { error: "Cover letter must be at least 50 characters", status: 422 };
    if (!commitment_confirmed || !experience_confirmed || !delivery_confirmed) {
      return { error: "All three confirmation checkboxes must be checked", status: 422 };
    }
    const apps = (await dbGet(DB_KEYS.APPLICATIONS)) || [];
    if (apps.find(a => a.job_id === job_id && a.freelancer_id === currentUser.id)) {
      return { error: "You have already applied for this job", status: 409 };
    }
    const application = {
      id: genId(), job_id, freelancer_id: currentUser.id,
      cover_letter, bid_amount, estimated_days,
      commitment_confirmed, experience_confirmed, delivery_confirmed,
      status: "sent", created_at: now(), updated_at: now(),
    };
    await dbPush(DB_KEYS.APPLICATIONS, application);
    // Increment job application count
    const jobs = (await dbGet(DB_KEYS.JOBS)) || [];
    const jobIdx = jobs.findIndex(j => j.id === job_id);
    if (jobIdx !== -1) {
      jobs[jobIdx].applications_count = (jobs[jobIdx].applications_count || 0) + 1;
      await dbSet(DB_KEYS.JOBS, jobs);
    }
    await logActivity(currentUser.id, "application.submit", `Applied for job #${job_id} with bid KES ${bid_amount}`);
    await createNotification(1, "application.new", "New job application", `${currentUser.name} applied for job #${job_id} — bid: KES ${bid_amount}`);
    return { success: true, data: { application }, status: 201 };
  }

  if (path === "/api/freelancer/applications" && method === "GET") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const apps = (await dbGet(DB_KEYS.APPLICATIONS)) || [];
    const myApps = apps.filter(a => a.freelancer_id === currentUser.id);
    return { success: true, data: { applications: myApps, total: myApps.length }, status: 200 };
  }

  // ── PAYMENTS & ESCROW ───────────────────────────────────
  if (path === "/api/admin/payments/deposit" && method === "POST") {
    if (!currentUser || currentUser.role !== "admin") return { error: "Forbidden", status: 403 };
    const { job_id, amount, payment_method, phone } = body;
    if (!job_id || !amount) return { error: "job_id and amount required", status: 422 };
    const jobs = (await dbGet(DB_KEYS.JOBS)) || [];
    const job = jobs.find(j => j.id === job_id);
    if (!job) return { error: "Job not found", status: 404 };
    const mpesaRef = `MPESA-ESC-${Date.now()}`;
    const escrow = { id: genId(), job_id, amount, status: "holding", reference: mpesaRef, created_at: now() };
    await dbPush(DB_KEYS.ESCROWS, escrow);
    await dbUpdate(DB_KEYS.JOBS, job_id, { payment_status: "escrow", escrow_amount: amount });
    // Debit admin wallet
    const wallets = (await dbGet(DB_KEYS.WALLETS)) || [];
    const adminWallet = wallets.find(w => w.user_id === currentUser.id);
    if (adminWallet) {
      const newBal = adminWallet.balance - amount;
      const wIdx = wallets.findIndex(w => w.id === adminWallet.id);
      wallets[wIdx].balance = newBal;
      await dbSet(DB_KEYS.WALLETS, wallets);
      await dbPush(DB_KEYS.TRANSACTIONS, { id: genId(), wallet_id: adminWallet.id, type: "escrow_hold", entry_type: "debit", amount, currency: "KES", status: "completed", reference: mpesaRef, meta: { job_id }, created_at: now() });
    }
    await logActivity(currentUser.id, "payment.deposit", `Deposited KES ${amount} to escrow for job #${job_id}`);
    return { success: true, data: { escrow, reference: mpesaRef }, status: 201 };
  }

  const escrowReleaseMatch = path.match(/^\/api\/admin\/payments\/escrows\/(\d+)\/(release|refund)$/);
  if (escrowReleaseMatch && method === "PATCH") {
    if (!currentUser || currentUser.role !== "admin") return { error: "Forbidden", status: 403 };
    const escrowId = parseInt(escrowReleaseMatch[1]);
    const action = escrowReleaseMatch[2];
    const escrows = (await dbGet(DB_KEYS.ESCROWS)) || [];
    const escrow = escrows.find(e => e.id === escrowId);
    if (!escrow) return { error: "Escrow not found", status: 404 };
    if (escrow.status !== "holding") return { error: "Escrow is not in holding state", status: 400 };
    const updatedEscrow = await dbUpdate(DB_KEYS.ESCROWS, escrowId, { status: action === "release" ? "released" : "refunded", released_at: now() });
    if (action === "release") {
      const jobs = (await dbGet(DB_KEYS.JOBS)) || [];
      const job = jobs.find(j => j.id === escrow.job_id);
      if (job?.assigned_freelancer_id) {
        const commission = escrow.amount * (((await dbGet(DB_KEYS.SETTINGS)) || SEED.settings).commission_rate / 100);
        const payout = escrow.amount - commission;
        const wallets = (await dbGet(DB_KEYS.WALLETS)) || [];
        const fIdx = wallets.findIndex(w => w.user_id === job.assigned_freelancer_id);
        if (fIdx !== -1) {
          wallets[fIdx].balance += payout;
          await dbSet(DB_KEYS.WALLETS, wallets);
        }
        await dbPush(DB_KEYS.TRANSACTIONS, { id: genId(), wallet_id: wallets[fIdx]?.id, type: "escrow_release", entry_type: "credit", amount: payout, currency: "KES", status: "completed", reference: `REL-${escrowId}`, meta: { job_id: escrow.job_id, commission }, created_at: now() });
        await dbUpdate(DB_KEYS.JOBS, escrow.job_id, { payment_status: "released", escrow_released_at: now() });
        await createNotification(job.assigned_freelancer_id, "payment.released", "Payment released!", `KES ${payout.toFixed(2)} has been credited to your wallet for job #${escrow.job_id}`);
      }
    }
    await logActivity(currentUser.id, `escrow.${action}`, `Escrow #${escrowId} ${action}d`);
    return { success: true, data: { escrow: updatedEscrow }, status: 200 };
  }

  // ── WALLETS ─────────────────────────────────────────────
  if (path === "/api/wallets/balance" && method === "GET") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const wallets = (await dbGet(DB_KEYS.WALLETS)) || [];
    const wallet = wallets.find(w => w.user_id === currentUser.id);
    if (!wallet) return { error: "Wallet not found", status: 404 };
    return { success: true, data: { balance: wallet.balance, currency: wallet.currency }, status: 200 };
  }

  if (path === "/api/wallets/transactions" && method === "GET") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const wallets = (await dbGet(DB_KEYS.WALLETS)) || [];
    const wallet = wallets.find(w => w.user_id === currentUser.id);
    if (!wallet) return { error: "Wallet not found", status: 404 };
    const txns = (await dbGet(DB_KEYS.TRANSACTIONS)) || [];
    return { success: true, data: { transactions: txns.filter(t => t.wallet_id === wallet.id) }, status: 200 };
  }

  // ── MESSAGES ────────────────────────────────────────────
  if (path === "/api/messages" && method === "POST") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const { recipient_id, body: msgBody, job_id } = body;
    if (!recipient_id || !msgBody) return { error: "recipient_id and body required", status: 422 };
    const convs = (await dbGet(DB_KEYS.CONVERSATIONS)) || [];
    let conv = convs.find(c => c.job_id === job_id && ((c.user1 === currentUser.id && c.user2 === recipient_id) || (c.user1 === recipient_id && c.user2 === currentUser.id)));
    if (!conv) {
      conv = { id: genId(), user1: currentUser.id, user2: recipient_id, job_id: job_id || null, last_message_at: now(), unread_count: 1, created_at: now() };
      convs.push(conv);
      await dbSet(DB_KEYS.CONVERSATIONS, convs);
    } else {
      const cIdx = convs.findIndex(c => c.id === conv.id);
      convs[cIdx] = { ...conv, last_message_at: now(), unread_count: (conv.unread_count || 0) + 1 };
      await dbSet(DB_KEYS.CONVERSATIONS, convs);
    }
    const message = { id: genId(), conversation_id: conv.id, sender_id: currentUser.id, recipient_id, job_id: job_id || null, body: msgBody, status: "delivered", created_at: now() };
    await dbPush(DB_KEYS.MESSAGES, message);
    await createNotification(recipient_id, "message.new", `New message from ${currentUser.name}`, msgBody.slice(0, 100));
    return { success: true, data: { message, conversation_id: conv.id }, status: 201 };
  }

  if (path === "/api/messages" && method === "GET") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const messages = (await dbGet(DB_KEYS.MESSAGES)) || [];
    const mine = messages.filter(m => m.sender_id === currentUser.id || m.recipient_id === currentUser.id);
    return { success: true, data: { messages: mine }, status: 200 };
  }

  // ── NOTIFICATIONS ───────────────────────────────────────
  if (path === "/api/notifications" && method === "GET") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const notifs = (await dbGet(DB_KEYS.NOTIFICATIONS)) || [];
    return { success: true, data: { notifications: notifs.filter(n => n.user_id === currentUser.id) }, status: 200 };
  }

  const notifReadMatch = path.match(/^\/api\/notifications\/(\d+)\/read$/);
  if (notifReadMatch && method === "PATCH") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const updated = await dbUpdate(DB_KEYS.NOTIFICATIONS, parseInt(notifReadMatch[1]), { is_read: true, read_at: now() });
    return { success: true, data: { notification: updated }, status: 200 };
  }

  if (path === "/api/notifications/all/read" && method === "PATCH") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const notifs = (await dbGet(DB_KEYS.NOTIFICATIONS)) || [];
    const updated = notifs.map(n => n.user_id === currentUser.id ? { ...n, is_read: true, read_at: now() } : n);
    await dbSet(DB_KEYS.NOTIFICATIONS, updated);
    return { success: true, message: "All notifications marked as read", status: 200 };
  }

  // ── SUPPORT TICKETS ─────────────────────────────────────
  if (path === "/api/support" && method === "POST") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    if (!body.subject || !body.message) return { error: "subject and message required", status: 422 };
    const ticket = { id: genId(), user_id: currentUser.id, user_name: currentUser.name, subject: body.subject, message: body.message, status: "open", priority: body.priority || "medium", created_at: now(), updated_at: now() };
    await dbPush(DB_KEYS.TICKETS, ticket);
    await createNotification(1, "ticket.new", "New support ticket", `${currentUser.name}: ${body.subject}`);
    await logActivity(currentUser.id, "ticket.create", `Opened ticket: ${body.subject}`);
    return { success: true, data: { ticket }, status: 201 };
  }

  if (path === "/api/support" && method === "GET") {
    if (!currentUser) return { error: "Unauthenticated", status: 401 };
    const tickets = (await dbGet(DB_KEYS.TICKETS)) || [];
    const result = currentUser.role === "freelancer" ? tickets.filter(t => t.user_id === currentUser.id) : tickets;
    return { success: true, data: { tickets: result }, status: 200 };
  }

  const ticketUpdateMatch = path.match(/^\/api\/support\/(\d+)\/(close|assign)$/);
  if (ticketUpdateMatch && method === "PATCH") {
    if (!currentUser || currentUser.role === "freelancer") return { error: "Forbidden", status: 403 };
    const action = ticketUpdateMatch[2];
    const updates = action === "close" ? { status: "resolved", resolved_at: now() } : { assigned_to: currentUser.id, status: "in_progress" };
    const updated = await dbUpdate(DB_KEYS.TICKETS, parseInt(ticketUpdateMatch[1]), updates);
    return updated ? { success: true, data: { ticket: updated }, status: 200 } : { error: "Not found", status: 404 };
  }

  // ── ADMIN USERS ─────────────────────────────────────────
  if (path === "/api/admin/users" && method === "GET") {
    if (!currentUser || currentUser.role === "freelancer") return { error: "Forbidden", status: 403 };
    const users = (await dbGet(DB_KEYS.USERS)) || [];
    const safe = users.map(({ password, ...u }) => u);
    return { success: true, data: { users: safe, total: safe.length }, status: 200 };
  }

  const userSuspendMatch = path.match(/^\/api\/admin\/users\/(\d+)\/(suspend|unsuspend|ban)$/);
  if (userSuspendMatch && method === "PATCH") {
    if (!currentUser || currentUser.role !== "admin") return { error: "Forbidden", status: 403 };
    const action = userSuspendMatch[2];
    const map = { suspend: { status: "suspended" }, unsuspend: { status: "active" }, ban: { status: "banned" } };
    const updated = await dbUpdate(DB_KEYS.USERS, parseInt(userSuspendMatch[1]), map[action]);
    await logActivity(currentUser.id, `user.${action}`, `${action}d user #${userSuspendMatch[1]}`);
    return updated ? { success: true, data: { user: updated }, status: 200 } : { error: "Not found", status: 404 };
  }

  // ── SETTINGS ────────────────────────────────────────────
  if (path === "/api/admin/settings" && method === "GET") {
    if (!currentUser || currentUser.role !== "admin") return { error: "Forbidden", status: 403 };
    const settings = (await dbGet(DB_KEYS.SETTINGS)) || SEED.settings;
    return { success: true, data: { settings }, status: 200 };
  }

  if (path === "/api/admin/settings" && method === "PUT") {
    if (!currentUser || currentUser.role !== "admin") return { error: "Forbidden", status: 403 };
    const current = (await dbGet(DB_KEYS.SETTINGS)) || SEED.settings;
    const updated = { ...current, ...body };
    await dbSet(DB_KEYS.SETTINGS, updated);
    await logActivity(currentUser.id, "settings.update", "Platform settings updated");
    return { success: true, data: { settings: updated }, status: 200 };
  }

  // ── DASHBOARD STATS ─────────────────────────────────────
  if (path === "/api/dashboard/admin" && method === "GET") {
    if (!currentUser || currentUser.role === "freelancer") return { error: "Forbidden", status: 403 };
    const [users, jobs, tickets, escrows] = await Promise.all([
      dbGet(DB_KEYS.USERS), dbGet(DB_KEYS.JOBS), dbGet(DB_KEYS.TICKETS), dbGet(DB_KEYS.ESCROWS),
    ]);
    const freelancers = (users || []).filter(u => u.role === "freelancer");
    return {
      success: true,
      data: {
        total_freelancers: freelancers.length,
        approved: freelancers.filter(u => u.freelancer_status === "APPROVED").length,
        pending_review: freelancers.filter(u => u.freelancer_status === "UNDER_REVIEW").length,
        total_jobs: (jobs || []).length,
        open_jobs: (jobs || []).filter(j => j.status === "open").length,
        open_tickets: (tickets || []).filter(t => t.status === "open").length,
        total_escrow: (escrows || []).filter(e => e.status === "holding").reduce((s, e) => s + e.amount, 0),
      },
      status: 200,
    };
  }

  // ── ACTIVITY LOG ────────────────────────────────────────
  if (path === "/api/admin/activity-log" && method === "GET") {
    if (!currentUser || currentUser.role === "freelancer") return { error: "Forbidden", status: 403 };
    const log = (await dbGet(DB_KEYS.ACTIVITY_LOG)) || [];
    return { success: true, data: { log: log.slice(0, 100) }, status: 200 };
  }

  // ── WEBHOOKS ────────────────────────────────────────────
  if (path === "/api/webhooks/mpesa/stk-callback" && method === "POST") {
    const { ResultCode, CheckoutRequestID, Amount } = body?.Body?.stkCallback || {};
    await dbPush(DB_KEYS.ACTIVITY_LOG, { id: genId(), activity_type: "webhook.mpesa", description: `M-Pesa STK callback: ${ResultCode === 0 ? "SUCCESS" : "FAILED"} — ${CheckoutRequestID}`, created_at: now() });
    return { success: true, status: 200 };
  }

  if (path === "/api/webhooks/stripe" && method === "POST") {
    await dbPush(DB_KEYS.ACTIVITY_LOG, { id: genId(), activity_type: "webhook.stripe", description: `Stripe webhook: ${body.type || "unknown"}`, created_at: now() });
    return { success: true, status: 200 };
  }

  return { error: `Cannot ${method} ${path}`, status: 404 };
}

// ─── AI ENGINE ───────────────────────────────────────────────
async function callClaude(systemPrompt, userMessage) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });
  const data = await response.json();
  if (data.content && data.content[0]) return data.content[0].text;
  throw new Error("Claude API error");
}

async function aiReviewFreelancer(freelancer) {
  return callClaude(
    `You are a senior talent acquisition specialist at AfriGig, Africa's premier freelancing platform.
     Review freelancer applications and provide a structured assessment. 
     Always respond with ONLY valid JSON: { "recommendation": "APPROVE"|"REJECT"|"REVIEW_FURTHER", "score": 0-100, "strengths": ["..."], "concerns": ["..."], "summary": "..." }`,
    `Review this freelancer application:
     Name: ${freelancer.name}
     Country: ${freelancer.country}
     Skills: ${freelancer.skills}
     Experience: ${freelancer.experience}
     Bio: ${freelancer.bio || "Not provided"}
     Portfolio: ${freelancer.portfolio_links || "Not provided"}
     Assessment Score: ${freelancer.assessment_percentage}%
     Availability: ${freelancer.availability}
     
     Provide a hiring recommendation.`
  );
}

async function aiCheckCoverLetter(coverLetter, jobTitle) {
  return callClaude(
    `You are a proposal quality checker for AfriGig freelancing platform.
     Analyze cover letters and provide constructive feedback.
     Always respond with ONLY valid JSON: { "score": 0-100, "verdict": "STRONG"|"AVERAGE"|"WEAK", "strengths": ["..."], "improvements": ["..."], "rewritten_opening": "..." }`,
    `Evaluate this cover letter for the job "${jobTitle}":
     
     "${coverLetter}"
     
     Score it and provide improvement suggestions.`
  );
}

async function aiCategorizeTicker(subject, message) {
  return callClaude(
    `You are a support ticket triage system for AfriGig.
     Categorize support tickets and suggest priority + resolution.
     Always respond with ONLY valid JSON: { "category": "payment|technical|account|billing|dispute|other", "priority": "low|medium|high|urgent", "auto_response": "...", "escalate": true|false, "tags": ["..."] }`,
    `Categorize this support ticket:
     Subject: ${subject}
     Message: ${message}`
  );
}

async function aiGenerateJobDescription(title, category, budget) {
  return callClaude(
    `You are a professional job description writer for AfriGig.
     Generate compelling, detailed job descriptions.
     Always respond with ONLY valid JSON: { "description": "...", "requirements": ["..."], "deliverables": ["..."], "skills": ["..."] }`,
    `Write a job description for:
     Title: ${title}
     Category: ${category}
     Budget: KES ${budget}
     
     Make it clear, specific, and attractive to qualified African freelancers.`
  );
}

// ─── CONTEXT ─────────────────────────────────────────────────
const AfriGigCtx = createContext(null);
export function useAfriGig() { return useContext(AfriGigCtx); }

export function AfriGigProvider({ children }) {
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem("agb_session") || "null"); } catch { return null; }
  });
  const [initialized, setInitialized] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    seedIfEmpty().then(() => setInitialized(true));
  }, []);

  useEffect(() => {
    if (!session) return;
    localStorage.setItem("agb_session", JSON.stringify(session));
    // Poll notifications
    const poll = setInterval(async () => {
      const notifs = (await dbGet(DB_KEYS.NOTIFICATIONS)) || [];
      setNotifications(notifs.filter(n => n.user_id === session.user?.id));
    }, 3000);
    return () => clearInterval(poll);
  }, [session]);

  const call = useCallback(async (method, path, body = {}) => {
    return apiCall(method, path, body, session?.token || null);
  }, [session]);

  const login = useCallback(async (email, password) => {
    const res = await call("POST", "/api/auth/login", { email, password });
    if (res.success) setSession({ token: res.data.token, user: res.data.user });
    return res;
  }, [call]);

  const logout = useCallback(async () => {
    await call("POST", "/api/auth/logout", {});
    setSession(null);
    localStorage.removeItem("agb_session");
  }, [call]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <AfriGigCtx.Provider value={{ call, login, logout, session, initialized, notifications, unreadCount }}>
      {children}
    </AfriGigCtx.Provider>
  );
}

// ─── DEVELOPER PANEL UI ───────────────────────────────────────
const TABS = ["API Console", "Auth", "Database", "AI Tools", "Notifications", "Activity Log", "Webhooks", "Settings"];

const ENDPOINT_GROUPS = [
  {
    group: "Authentication", color: "#60a5fa", endpoints: [
      { method: "POST", path: "/api/auth/register", body: { name: "New Freelancer", email: "new@test.com", password: "pass123" }, auth: false },
      { method: "POST", path: "/api/auth/login", body: { email: "admin@afrigig.com", password: "admin123" }, auth: false },
      { method: "GET", path: "/api/auth/me", body: {}, auth: true },
      { method: "POST", path: "/api/auth/logout", body: {}, auth: true },
    ],
  },
  {
    group: "Freelancer", color: "#34d399", endpoints: [
      { method: "PUT", path: "/api/freelancer/profile", body: { skills: "React, TypeScript", experience: "5 years dev", availability: "Full-time", country: "Kenya", bio: "Senior developer" }, auth: true },
      { method: "POST", path: "/api/freelancer/unlock-assessment", body: { amount: 1500, phone: "254712345678" }, auth: true },
      { method: "POST", path: "/api/freelancer/submit-assessment", body: { answers: Object.fromEntries([...Array(17)].map((_, i) => [i + 1, 0])), score: 85, maxScore: 100, percentage: 85, timeSpent: 5400 }, auth: true },
      { method: "POST", path: "/api/freelancer/applications", body: { job_id: 1, cover_letter: "I have extensive experience in React and TypeScript and would love to work on this project. My portfolio demonstrates similar work.", bid_amount: 65000, estimated_days: 12, commitment_confirmed: true, experience_confirmed: true, delivery_confirmed: true }, auth: true },
      { method: "GET", path: "/api/freelancer/applications", body: {}, auth: true },
    ],
  },
  {
    group: "Admin – Reviews", color: "#a78bfa", endpoints: [
      { method: "GET", path: "/api/admin/freelancer-reviews", body: {}, auth: true },
      { method: "POST", path: "/api/admin/freelancer-reviews/3/approve", body: {}, auth: true },
      { method: "POST", path: "/api/admin/freelancer-reviews/5/reject", body: { reason: "Insufficient portfolio" }, auth: true },
      { method: "POST", path: "/api/admin/freelancer-reviews/3/suspend", body: {}, auth: true },
    ],
  },
  {
    group: "Jobs", color: "#fbbf24", endpoints: [
      { method: "GET", path: "/api/jobs", body: {}, auth: true },
      { method: "POST", path: "/api/admin/jobs", body: { title: "Build Fintech Dashboard", description: "Create analytics dashboard for fintech startup with real-time charts", category: "Web Development", budget_min: 40000, budget_max: 70000, duration_days: 14, skills: ["React", "Chart.js"] }, auth: true },
    ],
  },
  {
    group: "Payments & Escrow", color: "#f87171", endpoints: [
      { method: "POST", path: "/api/admin/payments/deposit", body: { job_id: 1, amount: 70000, payment_method: "mpesa", phone: "254712345678" }, auth: true },
      { method: "PATCH", path: "/api/admin/payments/escrows/1/release", body: {}, auth: true },
      { method: "PATCH", path: "/api/admin/payments/escrows/1/refund", body: {}, auth: true },
      { method: "GET", path: "/api/wallets/balance", body: {}, auth: true },
      { method: "GET", path: "/api/wallets/transactions", body: {}, auth: true },
    ],
  },
  {
    group: "Messages & Notifications", color: "#fb923c", endpoints: [
      { method: "POST", path: "/api/messages", body: { recipient_id: 3, body: "Hello! Your application looks great.", job_id: 1 }, auth: true },
      { method: "GET", path: "/api/messages", body: {}, auth: true },
      { method: "GET", path: "/api/notifications", body: {}, auth: true },
      { method: "PATCH", path: "/api/notifications/all/read", body: {}, auth: true },
    ],
  },
  {
    group: "Support Tickets", color: "#2dd4bf", endpoints: [
      { method: "POST", path: "/api/support", body: { subject: "Payment not reflecting", message: "I paid the assessment fee via M-Pesa but my status hasn't updated after 2 hours.", priority: "high" }, auth: true },
      { method: "GET", path: "/api/support", body: {}, auth: true },
      { method: "PATCH", path: "/api/support/1/close", body: {}, auth: true },
    ],
  },
  {
    group: "Admin Tools", color: "#94a3b8", endpoints: [
      { method: "GET", path: "/api/admin/users", body: {}, auth: true },
      { method: "PATCH", path: "/api/admin/users/3/suspend", body: {}, auth: true },
      { method: "PATCH", path: "/api/admin/users/3/unsuspend", body: {}, auth: true },
      { method: "GET", path: "/api/admin/settings", body: {}, auth: true },
      { method: "PUT", path: "/api/admin/settings", body: { commission_rate: 12, assessment_fee_min: 1200, min_assessment_score: 65 }, auth: true },
      { method: "GET", path: "/api/dashboard/admin", body: {}, auth: true },
      { method: "GET", path: "/api/admin/activity-log", body: {}, auth: true },
    ],
  },
];

export default function AfriGigBackend() {
  injectStyles();
  const [activeTab, setActiveTab] = useState("API Console");
  const [token, setToken] = useState(() => {
    try { return JSON.parse(localStorage.getItem("agb_session") || "null")?.token || ""; } catch { return ""; }
  });
  const [selectedEndpoint, setSelectedEndpoint] = useState(null);
  const [customBody, setCustomBody] = useState("{}");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dbData, setDbData] = useState({});
  const [dbKey, setDbKey] = useState(DB_KEYS.USERS);
  const [logs, setLogs] = useState([]);
  const [notifs, setNotifs] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [webhookLog, setWebhookLog] = useState([]);
  const [settings, setSettings] = useState(SEED.settings);
  const [aiTool, setAiTool] = useState("review");
  const [aiInput, setAiInput] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "admin@afrigig.com", password: "admin123" });
  const [regForm, setRegForm] = useState({ name: "Test Freelancer", email: "test@afrigig.com", password: "pass123" });
  const [toast, setToast] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [clearConfirm, setClearConfirm] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(wasSeeded => {
      setInitialized(true);
      if (wasSeeded) showToast("Database seeded with initial data!", "green");
    });
  }, []);

  const showToast = (msg, color = "green") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSelectEndpoint = (ep) => {
    setSelectedEndpoint(ep);
    setCustomBody(JSON.stringify(ep.body, null, 2));
    setResponse(null);
  };

  const handleRun = async () => {
    if (!selectedEndpoint) return;
    setLoading(true);
    setResponse(null);
    try {
      let body = {};
      try { body = JSON.parse(customBody); } catch { showToast("Invalid JSON body", "red"); setLoading(false); return; }
      const res = await apiCall(selectedEndpoint.method, selectedEndpoint.path, body, token || null);
      setResponse(res);
      setLogs(prev => [{ ...res, method: selectedEndpoint.method, path: selectedEndpoint.path, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
      if (res.data?.token) { setToken(res.data.token); showToast("Token saved from response!", "green"); }
    } catch (e) {
      setResponse({ error: e.message, status: 500 });
    }
    setLoading(false);
  };

  const loadDb = async (key) => {
    const data = await dbGet(key);
    setDbData({ [key]: data });
    setDbKey(key);
  };

  const loadNotifs = async () => {
    const n = (await dbGet(DB_KEYS.NOTIFICATIONS)) || [];
    setNotifs(n.slice(0, 50));
  };

  const loadActivity = async () => {
    const log = (await dbGet(DB_KEYS.ACTIVITY_LOG)) || [];
    setActivityLog(log.slice(0, 100));
  };

  const loadWebhooks = async () => {
    const wh = (await dbGet(DB_KEYS.WEBHOOKS)) || [];
    setWebhookLog(wh.slice(0, 100));
  };

  const loadSettings = async () => {
    const s = (await dbGet(DB_KEYS.SETTINGS)) || SEED.settings;
    setSettings(s);
  };

  const saveSettings = async () => {
    await dbSet(DB_KEYS.SETTINGS, settings);
    showToast("Settings saved persistently!", "green");
  };

  const handleAiRun = async () => {
    setAiLoading(true);
    setAiResult(null);
    try {
      let raw;
      if (aiTool === "review") {
        const users = (await dbGet(DB_KEYS.USERS)) || [];
        const fr = users.find(u => u.role === "freelancer" && u.freelancer_status === "UNDER_REVIEW");
        raw = await aiReviewFreelancer(fr || { name: "Sample Freelancer", country: "Kenya", skills: "React, Node.js", experience: "3 years", assessment_percentage: 75 });
      } else if (aiTool === "cover") {
        raw = await aiCheckCoverLetter(aiInput || "I have 5 years of experience and would love to work on this.", "Build React Dashboard");
      } else if (aiTool === "ticket") {
        raw = await aiCategorizeTicker("Payment not received", aiInput || "I paid via M-Pesa but my account wasn't unlocked after 3 hours.");
      } else if (aiTool === "job") {
        raw = await aiGenerateJobDescription(aiInput || "E-commerce Dashboard", "Web Development", "50000-80000");
      }
      try { setAiResult(JSON.parse(raw)); }
      catch { setAiResult({ raw_response: raw }); }
    } catch (e) {
      setAiResult({ error: e.message });
    }
    setAiLoading(false);
  };

  const handleClearDb = async () => {
    for (const key of Object.values(DB_KEYS)) {
      try { await window.storage.delete(key); } catch {}
    }
    setClearConfirm(false);
    showToast("Database cleared. Refresh to re-seed.", "red");
  };

  const methodColor = (m) => `agb-method-${m}`;
  const statusColor = (s) => `agb-status-${s}`;

  return (
    <div className="agb-root" style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", display: "flex", flexDirection: "column" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 16, right: 16, zIndex: 9999, padding: "10px 18px", background: toast.color === "green" ? "#064e3b" : "#450a0a", border: `1px solid ${toast.color === "green" ? "#059669" : "#b91c1c"}`, borderRadius: 8, color: toast.color === "green" ? "#34d399" : "#f87171", fontSize: 14, fontWeight: 600, animation: "agb-fade 0.3s ease", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          {toast.color === "green" ? "✓ " : "✕ "}{toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#0a1628", borderBottom: "1px solid #1e293b", padding: "0 24px", display: "flex", alignItems: "center", gap: 20, height: 56, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, fontFamily: "Outfit,sans-serif", color: "white" }}>A</div>
          <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "Outfit,sans-serif" }}>AfriGig</span>
          <span style={{ fontSize: 12, color: "#334155", fontFamily: "Outfit,sans-serif" }}>/</span>
          <span className="agb-badge blue" style={{ fontSize: 11 }}>Backend Layer</span>
          <span className="agb-badge gray" style={{ fontSize: 11 }}>Persistent · AI-Powered · Full REST</span>
        </div>
        <div style={{ flex: 1 }} />
        {!initialized && <span className="agb-badge yellow">Initializing DB…</span>}
        {initialized && <span className="agb-badge green">● DB Ready</span>}
        {token && <span className="agb-badge blue">🔑 Authenticated</span>}
        <button className="agb-btn danger" style={{ fontSize: 12 }} onClick={() => setClearConfirm(true)}>Clear DB</button>
      </div>

      {clearConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="agb-card" style={{ padding: 32, maxWidth: 400, textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ fontFamily: "Outfit,sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Clear All Data?</h3>
            <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>This will permanently delete all users, jobs, applications, and transactions. You'll need to refresh to re-seed.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button className="agb-btn danger" onClick={handleClearDb}>Yes, Clear Everything</button>
              <button className="agb-btn ghost" onClick={() => setClearConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ background: "#0a1628", borderBottom: "1px solid #1e293b", padding: "0 24px", display: "flex", gap: 4, overflowX: "auto" }}>
        {TABS.map(t => (
          <div key={t} className={`agb-tab ${activeTab === t ? "active" : ""}`} onClick={() => {
            setActiveTab(t);
            if (t === "Notifications") loadNotifs();
            if (t === "Activity Log") loadActivity();
            if (t === "Webhooks") loadWebhooks();
            if (t === "Settings") loadSettings();
          }}>{t}</div>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>

        {/* ── API CONSOLE ─────────────────────────────────── */}
        {activeTab === "API Console" && (
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
            {/* Sidebar: endpoints */}
            <div className="agb-scrollbar" style={{ width: 300, borderRight: "1px solid #1e293b", overflowY: "auto", padding: "16px 12px", flexShrink: 0 }}>
              {ENDPOINT_GROUPS.map(g => (
                <div key={g.group} style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: g.color, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, padding: "0 4px" }}>{g.group}</div>
                  {g.endpoints.map((ep, i) => (
                    <div key={i} className={`agb-endpoint ${selectedEndpoint === ep ? "selected" : ""}`} onClick={() => handleSelectEndpoint(ep)} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span className={`agb-mono ${methodColor(ep.method)}`} style={{ fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{ep.method}</span>
                        <span style={{ fontSize: 12, color: "#cbd5e1", wordBreak: "break-all", lineHeight: 1.4 }}>{ep.path}</span>
                      </div>
                      {ep.auth && <span className="agb-badge blue" style={{ marginTop: 4, fontSize: 10 }}>🔑 auth</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Main: request + response */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
              {selectedEndpoint ? (
                <>
                  {/* Request panel */}
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e293b", flexShrink: 0 }}>
                    <div className="agb-row" style={{ marginBottom: 16 }}>
                      <span className={`agb-mono ${methodColor(selectedEndpoint.method)}`} style={{ fontSize: 16, fontWeight: 700 }}>{selectedEndpoint.method}</span>
                      <span style={{ fontSize: 14, color: "#94a3b8" }}>{selectedEndpoint.path}</span>
                      {selectedEndpoint.auth && <span className="agb-badge blue">requires auth token</span>}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600 }}>AUTH TOKEN</div>
                        <input className="agb-input agb-mono" value={token} onChange={e => setToken(e.target.value)} placeholder="Paste token here (auto-filled after login)" style={{ fontSize: 11 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600 }}>REQUEST BODY (JSON)</div>
                      </div>
                    </div>
                    <textarea className="agb-input agb-mono" value={customBody} onChange={e => setCustomBody(e.target.value)}
                      rows={6} style={{ fontSize: 12, lineHeight: 1.6, marginBottom: 12 }} />
                    <button className="agb-btn primary" onClick={handleRun} disabled={loading}>
                      {loading ? <span className="agb-spin" style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block" }} /> : "▶"} Send Request
                    </button>
                  </div>

                  {/* Response */}
                  <div className="agb-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                    {response ? (
                      <div className="agb-fade">
                        <div className="agb-row" style={{ marginBottom: 12 }}>
                          <span className={`agb-badge ${response.status < 300 ? "green" : response.status < 500 ? "yellow" : "red"}`}>
                            {response.status < 300 ? "✓" : "✕"} {response.status || 200}
                          </span>
                          {response._meta && <span style={{ fontSize: 12, color: "#475569" }}>{response._meta.duration}ms</span>}
                          {response.success && <span className="agb-badge green">success</span>}
                          {response.error && <span className="agb-badge red">{response.error}</span>}
                        </div>
                        <pre className="agb-pre">{JSON.stringify(response, null, 2)}</pre>
                      </div>
                    ) : (
                      <div style={{ color: "#334155", fontSize: 14, textAlign: "center", paddingTop: 40 }}>Response will appear here…</div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: "#334155" }}>
                  <div style={{ fontSize: 48 }}>⚡</div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Select an endpoint to get started</div>
                  <div style={{ fontSize: 13 }}>Start with POST /api/auth/login to get a token</div>
                </div>
              )}
            </div>

            {/* Request log */}
            <div className="agb-scrollbar" style={{ width: 260, borderLeft: "1px solid #1e293b", overflowY: "auto", flexShrink: 0 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid #1e293b", fontSize: 12, fontWeight: 700, color: "#475569" }}>REQUEST LOG</div>
              {logs.map((l, i) => (
                <div key={i} className="agb-log-line" onClick={() => setResponse(l)} style={{ cursor: "pointer" }}>
                  <div>
                    <span className={`agb-mono ${methodColor(l.method)}`} style={{ fontSize: 10 }}>{l.method} </span>
                    <span className={`agb-mono ${statusColor(l.status)}`} style={{ fontSize: 10 }}>{l.status}</span>
                    <div style={{ color: "#64748b", fontSize: 10, marginTop: 2 }}>{l.path}</div>
                    <div style={{ color: "#334155", fontSize: 10 }}>{l.time} · {l._meta?.duration}ms</div>
                  </div>
                </div>
              ))}
              {!logs.length && <div style={{ color: "#334155", fontSize: 12, padding: 16, textAlign: "center" }}>No requests yet</div>}
            </div>
          </div>
        )}

        {/* ── AUTH TAB ─────────────────────────────────────── */}
        {activeTab === "Auth" && (
          <div className="agb-scrollbar agb-fade" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, maxWidth: 1100 }}>
              {/* Login */}
              <div className="agb-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: "Outfit,sans-serif" }}>🔐 Login</div>
                <div className="agb-col">
                  <input className="agb-input" placeholder="Email" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
                  <input className="agb-input" type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                  <button className="agb-btn primary" onClick={async () => {
                    const res = await authLogin(loginForm.email, loginForm.password);
                    if (res.data?.token) { setToken(res.data.token); showToast(`Logged in as ${res.data.user.name}`, "green"); }
                    else showToast(res.error, "red");
                  }}>Login & Get Token</button>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 8, fontWeight: 600 }}>QUICK LOGIN</div>
                  {[["admin@afrigig.com", "admin123", "Admin"], ["support@afrigig.com", "support123", "Support"], ["amara@afrigig.com", "pass123", "Freelancer (Review)"], ["kwame@afrigig.com", "pass123", "Freelancer (Approved)"]].map(([email, pw, label]) => (
                    <div key={email} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, padding: "6px 10px", background: "#0f172a", borderRadius: 6 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
                        <div className="agb-mono" style={{ fontSize: 11, color: "#64748b" }}>{email}</div>
                      </div>
                      <button className="agb-btn ghost" style={{ fontSize: 11, padding: "4px 10px" }} onClick={async () => {
                        const res = await authLogin(email, pw);
                        if (res.data?.token) { setToken(res.data.token); showToast(`Logged in as ${res.data.user.name}`, "green"); }
                      }}>Login →</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Register */}
              <div className="agb-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: "Outfit,sans-serif" }}>📝 Register New Freelancer</div>
                <div className="agb-col">
                  <input className="agb-input" placeholder="Full name" value={regForm.name} onChange={e => setRegForm({ ...regForm, name: e.target.value })} />
                  <input className="agb-input" placeholder="Email" value={regForm.email} onChange={e => setRegForm({ ...regForm, email: e.target.value })} />
                  <input className="agb-input" type="password" placeholder="Password (min 6)" value={regForm.password} onChange={e => setRegForm({ ...regForm, password: e.target.value })} />
                  <button className="agb-btn primary" onClick={async () => {
                    const res = await authRegister(regForm);
                    if (res.success) showToast(`Registered ${regForm.name}!`, "green");
                    else showToast(res.error, "red");
                  }}>Register User</button>
                </div>
              </div>

              {/* Token */}
              <div className="agb-card" style={{ padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, fontFamily: "Outfit,sans-serif" }}>🎫 Current Session Token</div>
                {token ? (
                  <>
                    <textarea className="agb-input agb-mono" value={token} onChange={e => setToken(e.target.value)} rows={5} style={{ fontSize: 11, marginBottom: 12 }} />
                    <button className="agb-btn ghost" onClick={async () => {
                      const user = await authVerifyToken(token);
                      if (user) showToast(`Valid: ${user.name} (${user.role})`, "green");
                      else showToast("Invalid or expired token", "red");
                    }}>Verify Token</button>
                    <button className="agb-btn danger" style={{ marginLeft: 8 }} onClick={() => { setToken(""); showToast("Token cleared", "red"); }}>Clear</button>
                  </>
                ) : (
                  <div style={{ color: "#475569", fontSize: 13 }}>No token. Login to get one.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── DATABASE TAB ─────────────────────────────────── */}
        {activeTab === "Database" && (
          <div className="agb-scrollbar agb-fade" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
              {Object.entries(DB_KEYS).map(([label, key]) => (
                <button key={key} className={`agb-btn ${dbKey === key ? "primary" : "ghost"}`} style={{ fontSize: 12 }} onClick={() => loadDb(key)}>
                  {label.replace(/_/g, " ")}
                </button>
              ))}
            </div>
            {dbData[dbKey] !== undefined ? (
              <div>
                <div className="agb-row" style={{ marginBottom: 12 }}>
                  <span className="agb-badge blue">{dbKey}</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>
                    {Array.isArray(dbData[dbKey]) ? `${dbData[dbKey].length} records` : "object"}
                  </span>
                </div>
                <pre className="agb-pre" style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
                  {JSON.stringify(dbData[dbKey], null, 2)}
                </pre>
              </div>
            ) : (
              <div style={{ color: "#334155", fontSize: 14 }}>Click a table above to view its data</div>
            )}
          </div>
        )}

        {/* ── AI TOOLS TAB ─────────────────────────────────── */}
        {activeTab === "AI Tools" && (
          <div className="agb-scrollbar agb-fade" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ maxWidth: 900 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Outfit,sans-serif", marginBottom: 6 }}>AI-Powered Features</div>
                <div style={{ fontSize: 13, color: "#64748b" }}>Powered by Claude claude-sonnet-4-20250514. These features add real AI intelligence to the AfriGig platform.</div>
              </div>

              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                {[["review", "🔍 Freelancer Review"], ["cover", "📝 Cover Letter Checker"], ["ticket", "🎫 Ticket Triage"], ["job", "💼 Job Description Generator"]].map(([key, label]) => (
                  <button key={key} className={`agb-tab ${aiTool === key ? "active" : ""}`} onClick={() => { setAiTool(key); setAiResult(null); }}>
                    {label}
                  </button>
                ))}
              </div>

              <div className="agb-card" style={{ padding: 20, marginBottom: 16 }}>
                {aiTool === "review" && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>AI Freelancer Profile Review</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
                      Automatically analyze freelancer profiles and assessment scores. Will review the first UNDER_REVIEW freelancer from the database.
                    </div>
                  </div>
                )}
                {aiTool === "cover" && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Cover Letter Quality Checker</div>
                    <textarea className="agb-input" value={aiInput} onChange={e => setAiInput(e.target.value)} rows={4} placeholder="Paste a cover letter to analyze…" style={{ marginBottom: 0 }} />
                  </div>
                )}
                {aiTool === "ticket" && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Support Ticket Auto-Categorization</div>
                    <textarea className="agb-input" value={aiInput} onChange={e => setAiInput(e.target.value)} rows={4} placeholder="Paste ticket message to categorize…" style={{ marginBottom: 0 }} />
                  </div>
                )}
                {aiTool === "job" && (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Job Description Generator</div>
                    <input className="agb-input" value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Job title (e.g. 'Build M-Pesa Integration API')" />
                  </div>
                )}
                <button className="agb-btn primary" style={{ marginTop: 16 }} onClick={handleAiRun} disabled={aiLoading}>
                  {aiLoading ? <><span className="agb-spin" style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block" }} /> Running AI…</> : "▶ Run AI Analysis"}
                </button>
              </div>

              {aiLoading && (
                <div className="agb-card" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>Claude is thinking…</div>
                  <div className="agb-ai-typing"><span /><span /><span /></div>
                </div>
              )}

              {aiResult && (
                <div className="agb-card agb-fade" style={{ padding: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#10b981", marginBottom: 12 }}>✓ AI Analysis Complete</div>
                  {aiResult.error ? (
                    <div className="agb-badge red">{aiResult.error}</div>
                  ) : aiResult.raw_response ? (
                    <pre className="agb-pre">{aiResult.raw_response}</pre>
                  ) : (
                    <div>
                      {/* Freelancer review */}
                      {aiResult.recommendation && (
                        <div>
                          <div className="agb-row" style={{ marginBottom: 16 }}>
                            <span className={`agb-badge ${aiResult.recommendation === "APPROVE" ? "green" : aiResult.recommendation === "REJECT" ? "red" : "yellow"}`} style={{ fontSize: 13 }}>
                              {aiResult.recommendation}
                            </span>
                            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "Outfit,sans-serif" }}>{aiResult.score}/100</span>
                          </div>
                          <p style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>{aiResult.summary}</p>
                          {aiResult.strengths?.length > 0 && <div style={{ marginBottom: 12 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#34d399", marginBottom: 6 }}>STRENGTHS</div>
                            {aiResult.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 4 }}>✓ {s}</div>)}
                          </div>}
                          {aiResult.concerns?.length > 0 && <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>CONCERNS</div>
                            {aiResult.concerns.map((c, i) => <div key={i} style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 4 }}>⚠ {c}</div>)}
                          </div>}
                        </div>
                      )}
                      {/* Cover letter */}
                      {aiResult.verdict && (
                        <div>
                          <div className="agb-row" style={{ marginBottom: 12 }}>
                            <span className={`agb-badge ${aiResult.verdict === "STRONG" ? "green" : aiResult.verdict === "WEAK" ? "red" : "yellow"}`}>{aiResult.verdict}</span>
                            <span style={{ fontSize: 18, fontWeight: 800 }}>{aiResult.score}/100</span>
                          </div>
                          {aiResult.rewritten_opening && <div style={{ marginBottom: 12, padding: 12, background: "#0f172a", borderRadius: 8, borderLeft: "3px solid #10b981" }}>
                            <div style={{ fontSize: 11, color: "#10b981", marginBottom: 6, fontWeight: 700 }}>AI SUGGESTED OPENING</div>
                            <div style={{ fontSize: 13, color: "#e2e8f0", fontStyle: "italic" }}>"{aiResult.rewritten_opening}"</div>
                          </div>}
                          {aiResult.improvements?.map((s, i) => <div key={i} style={{ fontSize: 13, color: "#fbbf24", marginBottom: 4 }}>→ {s}</div>)}
                        </div>
                      )}
                      {/* Ticket */}
                      {aiResult.category && (
                        <div>
                          <div className="agb-row" style={{ gap: 10, marginBottom: 12 }}>
                            <span className="agb-badge purple">{aiResult.category}</span>
                            <span className={`agb-badge ${aiResult.priority === "urgent" || aiResult.priority === "high" ? "red" : aiResult.priority === "medium" ? "yellow" : "green"}`}>{aiResult.priority}</span>
                            {aiResult.escalate && <span className="agb-badge red">ESCALATE</span>}
                          </div>
                          {aiResult.auto_response && <div style={{ padding: 12, background: "#0f172a", borderRadius: 8, fontSize: 13, color: "#e2e8f0", borderLeft: "3px solid #60a5fa" }}>
                            <div style={{ fontSize: 11, color: "#60a5fa", marginBottom: 6, fontWeight: 700 }}>SUGGESTED AUTO-RESPONSE</div>
                            {aiResult.auto_response}
                          </div>}
                          {aiResult.tags?.map(t => <span key={t} className="agb-badge gray" style={{ marginRight: 6, marginTop: 8, display: "inline-flex" }}>{t}</span>)}
                        </div>
                      )}
                      {/* Job desc */}
                      {aiResult.description && (
                        <div>
                          <pre className="agb-pre" style={{ fontSize: 13 }}>{JSON.stringify(aiResult, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── NOTIFICATIONS ─────────────────────────────────── */}
        {activeTab === "Notifications" && (
          <div className="agb-scrollbar agb-fade" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Outfit,sans-serif" }}>All Notifications ({notifs.length})</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="agb-btn ghost" style={{ fontSize: 12 }} onClick={loadNotifs}>↻ Refresh</button>
                <button className="agb-btn primary" style={{ fontSize: 12 }} onClick={async () => {
                  // Create a test notification
                  await createNotification(1, "test", "Test Notification", "This is a real persisted notification from the backend layer!");
                  await loadNotifs();
                  showToast("Test notification created!", "green");
                }}>+ Create Test Notif</button>
              </div>
            </div>
            <div className="agb-card" style={{ overflow: "hidden" }}>
              {notifs.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "#334155" }}>No notifications. Run some API calls first.</div>
              ) : notifs.map(n => (
                <div key={n.id} className={`agb-notification-item ${!n.is_read ? "unread" : ""}`}>
                  <div className="agb-row">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{n.title}</span>
                        <span style={{ fontSize: 11, color: "#475569" }}>{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{n.message}</div>
                      <div className="agb-row" style={{ marginTop: 6 }}>
                        <span className="agb-badge gray" style={{ fontSize: 10 }}>{n.type}</span>
                        <span style={{ fontSize: 11, color: "#475569" }}>→ user #{n.user_id}</span>
                        {!n.is_read && <span className="agb-badge blue" style={{ fontSize: 10 }}>unread</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── ACTIVITY LOG ─────────────────────────────────── */}
        {activeTab === "Activity Log" && (
          <div className="agb-scrollbar agb-fade" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Outfit,sans-serif" }}>Activity Log ({activityLog.length})</div>
              <button className="agb-btn ghost" style={{ fontSize: 12 }} onClick={loadActivity}>↻ Refresh</button>
            </div>
            <div className="agb-card" style={{ overflow: "hidden" }}>
              {activityLog.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "#334155" }}>No activity yet. Run some API calls.</div>
              ) : activityLog.map(a => (
                <div key={a.id} className="agb-log-line">
                  <span style={{ color: "#334155", fontSize: 11, flexShrink: 0 }}>{new Date(a.created_at).toLocaleTimeString()}</span>
                  <span className="agb-badge purple" style={{ fontSize: 10, flexShrink: 0 }}>{a.activity_type}</span>
                  <span style={{ fontSize: 12, color: "#94a3b8", flex: 1 }}>{a.description}</span>
                  {a.user_id && <span style={{ fontSize: 11, color: "#334155" }}>user #{a.user_id}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WEBHOOKS ─────────────────────────────────────── */}
        {activeTab === "Webhooks" && (
          <div className="agb-scrollbar agb-fade" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Outfit,sans-serif" }}>Request History ({webhookLog.length})</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="agb-btn ghost" style={{ fontSize: 12 }} onClick={loadWebhooks}>↻ Refresh</button>
                <button className="agb-btn code" style={{ fontSize: 12 }} onClick={async () => {
                  await apiCall("POST", "/api/webhooks/mpesa/stk-callback", {
                    Body: { stkCallback: { ResultCode: 0, CheckoutRequestID: "ws_CO_" + Date.now(), Amount: 1500 } }
                  }, null);
                  await loadWebhooks();
                  showToast("M-Pesa webhook simulated!", "green");
                }}>Simulate M-Pesa Webhook</button>
                <button className="agb-btn code" style={{ fontSize: 12 }} onClick={async () => {
                  await apiCall("POST", "/api/webhooks/stripe", { type: "payment_intent.succeeded", id: "pi_" + Date.now() }, null);
                  await loadWebhooks();
                  showToast("Stripe webhook simulated!", "green");
                }}>Simulate Stripe Webhook</button>
              </div>
            </div>
            <div className="agb-card" style={{ overflow: "hidden" }}>
              {webhookLog.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "#334155" }}>No requests logged yet.</div>
              ) : (
                <table className="agb-table">
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Path</th>
                      <th>Status</th>
                      <th>Duration</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhookLog.map(w => (
                      <tr key={w.id}>
                        <td><span className={`agb-mono ${methodColor(w.method)}`} style={{ fontSize: 12, fontWeight: 700 }}>{w.method}</span></td>
                        <td><span className="agb-mono" style={{ fontSize: 12 }}>{w.path}</span></td>
                        <td><span className={`agb-badge ${w.status < 300 ? "green" : w.status < 500 ? "yellow" : "red"}`}>{w.status}</span></td>
                        <td style={{ color: "#64748b" }}>{w.duration}ms</td>
                        <td style={{ color: "#475569", fontSize: 12 }}>{new Date(w.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── SETTINGS ─────────────────────────────────────── */}
        {activeTab === "Settings" && (
          <div className="agb-scrollbar agb-fade" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
            <div style={{ maxWidth: 700 }}>
              <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "Outfit,sans-serif", marginBottom: 20 }}>Platform Settings (Persisted)</div>
              <div className="agb-card" style={{ padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                  {[
                    ["Assessment Fee Min (KES)", "assessment_fee_min", "number"],
                    ["Assessment Fee Max (KES)", "assessment_fee_max", "number"],
                    ["Review Period (business days)", "review_period_days", "number"],
                    ["Commission Rate (%)", "commission_rate", "number"],
                    ["Min Assessment Score (%)", "min_assessment_score", "number"],
                    ["M-Pesa Shortcode", "mpesa_shortcode", "text"],
                    ["Platform Name", "platform_name", "text"],
                  ].map(([label, key, type]) => (
                    <div key={key}>
                      <div style={{ fontSize: 11, color: "#475569", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                      <input className="agb-input" type={type} value={settings[key] || ""} onChange={e => setSettings({ ...settings, [key]: type === "number" ? Number(e.target.value) : e.target.value })} />
                    </div>
                  ))}
                </div>
                <button className="agb-btn primary" onClick={saveSettings}>💾 Save Settings (Persisted)</button>
                <div style={{ marginTop: 12, fontSize: 12, color: "#475569" }}>Settings are saved to window.storage and persist across refreshes and sessions.</div>
              </div>

              <div className="agb-card" style={{ padding: 24, marginTop: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Integration Endpoints</div>
                {[
                  ["M-Pesa STK Push", "POST /api/webhooks/mpesa/stk-callback", "Receives M-Pesa payment confirmations"],
                  ["Stripe Events", "POST /api/webhooks/stripe", "Receives Stripe payment events"],
                  ["Assessment Unlock", "POST /api/freelancer/unlock-assessment", "Triggers STK Push for KES 1000-2000"],
                ].map(([name, endpoint, desc]) => (
                  <div key={name} style={{ marginBottom: 12, padding: "10px 14px", background: "#0f172a", borderRadius: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{name}</div>
                    <div className="agb-mono" style={{ fontSize: 12, color: "#34d399", marginBottom: 4 }}>{endpoint}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: "#0a1628", borderTop: "1px solid #1e293b", padding: "10px 24px", display: "flex", gap: 20, alignItems: "center", fontSize: 11, color: "#334155", flexShrink: 0 }}>
        <span>AfriGig Backend Layer v2.0</span>
        <span>·</span>
        <span>window.storage (persistent)</span>
        <span>·</span>
        <span>Claude claude-sonnet-4-20250514 AI</span>
        <span>·</span>
        <span>Full REST API simulation</span>
        <span>·</span>
        <span>M-Pesa + Stripe webhooks</span>
        <div style={{ flex: 1 }} />
        <span>{Object.keys(DB_KEYS).length} DB tables</span>
        <span>·</span>
        <span>{ENDPOINT_GROUPS.reduce((s, g) => s + g.endpoints.length, 0)} endpoints</span>
      </div>
    </div>
  );
}

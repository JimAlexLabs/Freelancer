import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* AfriGig Platform v3.0 */

(() => {
  if (document.getElementById("ag3-css")) return;
  const s = document.createElement("style");
  s.id = "ag3-css";
  s.textContent = `
@import url('https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;500;600;700;800&family=Cabinet+Grotesk:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--g:#00D4A0;--gd:#00A880;--gl:#E6FAF5;--gdark:#003D2E;--ink:#0C0F1A;--navy:#111827;--sl:#1F2937;--mu:#374151;--sub:#6B7280;--bdr:#E5E7EB;--surf:#F8FAFC;--wh:#fff;--err:#EF4444;--warn:#F59E0B;--info:#3B82F6;--pur:#8B5CF6;--fh:'Clash Display',sans-serif;--fb:'Cabinet Grotesk',sans-serif;--fm:'JetBrains Mono',monospace;--r:12px;--rs:8px;--sh:0 1px 3px rgba(0,0,0,.06);--shm:0 4px 16px rgba(0,0,0,.08);--shx:0 20px 48px rgba(0,0,0,.14)}
html,body{font-family:var(--fb);background:var(--surf);color:var(--navy)}
h1,h2,h3,h4{font-family:var(--fh);line-height:1.15}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:var(--bdr);border-radius:99px}
button,input,textarea,select{font-family:var(--fb)}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes slideR{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes bounceIn{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
@keyframes notifSlide{from{opacity:0;transform:translateX(110%)}to{opacity:1;transform:translateX(0)}}
@keyframes timerWarn{0%,100%{color:inherit}50%{color:#EF4444}}
.au{animation:fadeUp .35s ease both}.ai{animation:fadeIn .25s ease both}.as{animation:slideR .3s ease both}
.bi{animation:bounceIn .4s cubic-bezier(.34,1.56,.64,1) both}
.sp{animation:spin .7s linear infinite}.pu{animation:pulse 1.4s ease infinite}.tw{animation:timerWarn 1s ease infinite}
.stagger>*{animation:fadeUp .4s ease both}
.stagger>*:nth-child(1){animation-delay:0ms}.stagger>*:nth-child(2){animation-delay:65ms}.stagger>*:nth-child(3){animation-delay:130ms}.stagger>*:nth-child(4){animation-delay:195ms}.stagger>*:nth-child(5){animation-delay:260ms}.stagger>*:nth-child(6){animation-delay:325ms}
.sk{background:linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%);background-size:600px 100%;animation:shimmer 1.4s infinite;border-radius:6px}
input:focus,textarea:focus,select:focus{outline:none;border-color:var(--g)!important;box-shadow:0 0 0 3px rgba(0,212,160,.14)}
button:active:not(:disabled){transform:scale(.97)}
.card{background:#fff;border-radius:var(--r);border:1px solid var(--bdr);box-shadow:var(--sh)}
.card-h:hover{transform:translateY(-2px);box-shadow:var(--shm);transition:all .2s;cursor:pointer}
.overlay{position:fixed;inset:0;background:rgba(12,15,26,.65);backdrop-filter:blur(4px);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease;padding:16px}
.modal{background:#fff;border-radius:16px;width:100%;max-height:94vh;overflow-y:auto;animation:fadeUp .25s ease;box-shadow:var(--shx)}
.tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:12px;font-weight:600}
.tg{background:var(--gl);color:var(--gd)}.tb{background:#EFF6FF;color:#1D4ED8}.tp{background:#F5F3FF;color:#6D28D9}.tr{background:#FEF2F2;color:#DC2626}.ty{background:#FFFBEB;color:#D97706}.tgr{background:#F3F4F6;color:#374151}
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:99px;font-size:11px;font-weight:700;letter-spacing:.02em}
.bg{background:#DCFCE7;color:#166534}.br{background:#FEE2E2;color:#991B1B}.by{background:#FEF9C3;color:#854D0E}.bb{background:#DBEAFE;color:#1E40AF}.bpu{background:#EDE9FE;color:#5B21B6}.bgr{background:#F3F4F6;color:#374151}.bt{background:#CCFBF1;color:#0F766E}.bo{background:#FFEDD5;color:#C2410C}
.inp{width:100%;padding:10px 14px;border:1.5px solid var(--bdr);border-radius:var(--rs);font-size:14px;transition:all .15s;background:#fff;color:var(--navy)}
.inp:disabled{background:var(--surf);color:var(--sub);cursor:not-allowed}
.lbl{font-size:13px;font-weight:700;color:var(--mu);margin-bottom:5px;display:block;font-family:var(--fh)}
.lbl-r::after{content:' *';color:var(--err)}
.btn{display:inline-flex;align-items:center;gap:6px;padding:10px 18px;border-radius:var(--rs);font-size:13.5px;font-weight:700;cursor:pointer;border:none;transition:all .15s;white-space:nowrap;font-family:var(--fh)}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important}
.bp{background:var(--g);color:#fff;box-shadow:0 2px 10px rgba(0,212,160,.3)}.bp:hover:not(:disabled){background:var(--gd)}
.bd{background:var(--err);color:#fff}.bd:hover:not(:disabled){background:#DC2626}
.bg2{background:transparent;color:var(--sub);border:1.5px solid var(--bdr)}.bg2:hover:not(:disabled){border-color:var(--navy);color:var(--navy)}
.bo2{background:transparent;color:var(--g);border:1.5px solid var(--g)}.bo2:hover:not(:disabled){background:var(--gl)}
.bdk{background:var(--navy);color:#fff}.bdk:hover:not(:disabled){background:#1F2937}
.bsm{padding:6px 12px;font-size:12px}.blg{padding:14px 28px;font-size:15px}
.toast-wrap{position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;width:360px}
.toast{display:flex;align-items:center;gap:10px;padding:13px 18px;border-radius:var(--rs);font-size:13.5px;font-weight:600;pointer-events:all;box-shadow:var(--shx);animation:notifSlide .3s ease}
.ts{background:#064E3B;color:#fff;border-left:3px solid var(--g)}.te{background:#7F1D1D;color:#fff;border-left:3px solid var(--err)}.ti{background:#1E3A8A;color:#fff;border-left:3px solid var(--info)}.tw2{background:#78350F;color:#fff;border-left:3px solid var(--warn)}
.sb-link{display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:var(--rs);font-size:13.5px;font-weight:500;cursor:pointer;transition:all .15s;color:var(--sub);border:none;background:none;width:100%;text-align:left}
.sb-link:hover{background:var(--surf);color:var(--navy)}.sb-link.act{background:var(--gl);color:var(--gd);font-weight:700}
.code-ed{font-family:var(--fm);font-size:13px;line-height:1.75;background:#0F172A;color:#E2E8F0;border:1.5px solid #1E293B;border-radius:var(--rs);resize:vertical;tab-size:2;width:100%}
.code-ed:focus{border-color:#334155!important;box-shadow:none}
.pb{height:6px;background:var(--bdr);border-radius:99px;overflow:hidden}.pf{height:100%;background:linear-gradient(90deg,var(--g),var(--gd));border-radius:99px;transition:width .5s ease}
.track-c{border:2px solid var(--bdr);border-radius:16px;padding:20px;cursor:pointer;transition:all .2s;background:#fff}.track-c:hover{border-color:var(--g);transform:translateY(-2px);box-shadow:var(--shm)}.track-c.sel{border-color:var(--g);background:var(--gl)}
.chat-me{background:var(--g);color:#fff;border-radius:16px 16px 4px 16px;padding:10px 14px;max-width:72%;align-self:flex-end}
.chat-ot{background:var(--surf);color:var(--navy);border-radius:16px 16px 16px 4px;padding:10px 14px;max-width:72%;border:1px solid var(--bdr)}
.fdr{border:2px dashed var(--bdr);border-radius:var(--r);padding:32px;text-align:center;cursor:pointer;transition:all .2s}.fdr:hover,.fdr.dov{border-color:var(--g);background:var(--gl)}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:10px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--sub);border-bottom:1px solid var(--bdr);font-family:var(--fh)}
td{padding:13px 16px;border-bottom:1px solid var(--bdr);font-size:13.5px;vertical-align:middle}
tr:last-child td{border-bottom:none}tbody tr:hover td{background:var(--surf)}
`;
  document.head.appendChild(s);
})();

const uid = () => Date.now() + Math.floor(Math.random() * 99999);
const now = () => new Date().toISOString();
const fmtDate = d => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtRel = d => { const m = Math.floor((Date.now() - new Date(d)) / 60000); if (m < 1) return "Just now"; if (m < 60) return `${m}m ago`; if (m < 1440) return `${Math.floor(m / 60)}h ago`; return fmtDate(d); };
const fmtKES = n => `KES ${Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
const initials = n => (n || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

async function sha256(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
}

const db = {
  async get(k) { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  async set(k, v) { try { await window.storage.set(k, JSON.stringify(v)); } catch {} },
  async push(k, item) { const l = (await this.get(k)) || []; l.push(item); await this.set(k, l); return item; },
  async patch(k, id, upd) { const l = (await this.get(k)) || []; const i = l.findIndex(x => x.id === id); if (i < 0) return null; l[i] = { ...l[i], ...upd, updated_at: now() }; await this.set(k, l); return l[i]; },
};

const K = { U:"ag3:users",J:"ag3:jobs",A:"ag3:apps",M:"ag3:msgs",C:"ag3:convos",N:"ag3:notifs",T:"ag3:tickets",TX:"ag3:txn",W:"ag3:wallets",E:"ag3:escrow",L:"ag3:log",S:"ag3:sessions",CF:"ag3:cfg",F:"ag3:files",EM:"ag3:emails" };

const PW = { admin:"8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918", support:"1c8bfe8f801d79745c4631d09fff36c82aa37fc4cce4fc946683d7b336b63032", pass:"d74ff0ee8da3b9806b18c877dbf29bbde50b5bd8e4dad7a3a725000feb82e8f1" };

const SEED = {
  users: [
    { id:1, name:"System Admin", email:"admin@afrigig.com", pw:PW.admin, role:"admin", status:"active", fs:null, created_at:"2026-01-01T00:00:00Z" },
    { id:2, name:"Grace Mutua", email:"support@afrigig.com", pw:PW.support, role:"support", status:"active", fs:null, created_at:"2026-01-01T00:00:00Z" },
    { id:3, name:"Amara Osei", email:"amara@afrigig.com", pw:PW.pass, role:"freelancer", status:"pending", fs:"UNDER_REVIEW", track:"software", skills:"React, TypeScript, Node.js", country:"Ghana", bio:"5 years full-stack dev", experience:"Senior Dev at TechCo Ghana", availability:"Full-time", portfolio_links:"https://amaraosei.dev", assessment_pct:87, queue_pos:1, assessment_submitted_at:"2026-02-10T09:00:00Z", review_deadline:"2026-03-01T00:00:00Z", created_at:"2026-02-08T10:00:00Z", is_online:true },
    { id:4, name:"Kwame Mensah", email:"kwame@afrigig.com", pw:PW.pass, role:"freelancer", status:"active", fs:"APPROVED", track:"software", skills:"Flutter, Dart, Firebase", country:"Kenya", bio:"Mobile dev specialist", experience:"3 years mobile development", availability:"Part-time", assessment_pct:78, approved_at:"2026-02-05T12:00:00Z", created_at:"2026-01-28T08:00:00Z", is_online:true },
    { id:5, name:"Fatima Diallo", email:"fatima@afrigig.com", pw:PW.pass, role:"freelancer", status:"pending", fs:"UNDER_REVIEW", track:"data", skills:"Python, Django, PostgreSQL", country:"Senegal", bio:"Data engineer", experience:"Lead at Dakar Fintech", availability:"Full-time", portfolio_links:"https://github.com/fatima-dev", assessment_pct:92, queue_pos:2, assessment_submitted_at:"2026-02-12T11:00:00Z", created_at:"2026-02-10T09:00:00Z", is_online:false },
    { id:6, name:"Ngozi Adeyemi", email:"ngozi@afrigig.com", pw:PW.pass, role:"freelancer", status:"pending", fs:"REGISTERED", track:null, country:"Nigeria", created_at:"2026-02-20T14:00:00Z", is_online:false },
    { id:7, name:"Tariq Hassan", email:"tariq@afrigig.com", pw:PW.pass, role:"freelancer", status:"banned", fs:"REJECTED", track:"software", skills:"Vue.js, Laravel", country:"Tanzania", assessment_pct:42, rejection_reason:"Score below threshold (42% < 60%)", created_at:"2026-01-25T14:00:00Z", is_online:false },
  ],
  jobs: [
    { id:1, title:"React E-Commerce Dashboard", category:"Web Development", budget_min:50000, budget_max:80000, duration_days:14, status:"open", payment_status:"unpaid", created_by:1, skills:["React","TypeScript","Tailwind"], description:"Build a comprehensive e-commerce admin dashboard with real-time analytics, inventory management, and order tracking.", apps_count:5, progress:0, created_at:"2026-02-18T10:00:00Z" },
    { id:2, title:"M-Pesa Payment Integration API", category:"Backend", budget_min:30000, budget_max:45000, duration_days:7, status:"in_progress", payment_status:"escrow", created_by:1, assigned_to:4, skills:["Laravel","PHP","M-Pesa"], description:"Integrate M-Pesa STK Push with Laravel. Handle STK Push, C2B, webhooks, and full reconciliation.", apps_count:8, progress:65, created_at:"2026-02-10T08:00:00Z" },
    { id:3, title:"Flutter Logistics App", category:"Mobile", budget_min:70000, budget_max:100000, duration_days:30, status:"open", payment_status:"unpaid", created_by:1, skills:["Flutter","Firebase","Google Maps"], description:"Cross-platform logistics tracking app with real-time GPS, route optimization, and driver management.", apps_count:3, progress:0, created_at:"2026-02-20T09:00:00Z" },
    { id:4, title:"Data Pipeline & Analytics", category:"Data Engineering", budget_min:40000, budget_max:60000, duration_days:10, status:"completed", payment_status:"released", created_by:1, assigned_to:5, skills:["Python","dbt","PostgreSQL"], description:"ETL pipeline and analytics dashboard for a fintech startup.", apps_count:6, progress:100, created_at:"2026-01-15T07:00:00Z" },
  ],
  wallets: [
    { id:1, user_id:1, currency:"KES", balance:500000 },
    { id:2, user_id:4, currency:"KES", balance:38250 },
    { id:3, user_id:3, currency:"KES", balance:0 },
    { id:4, user_id:5, currency:"KES", balance:0 },
    { id:5, user_id:6, currency:"KES", balance:0 },
    { id:6, user_id:7, currency:"KES", balance:0 },
  ],
  txn: [{ id:1, wallet_id:2, type:"escrow_release", entry_type:"credit", amount:38250, currency:"KES", status:"completed", reference:"REL-001", meta:{ job_id:4 }, created_at:"2026-02-19T14:00:00Z" }],
  escrows: [{ id:1, job_id:2, amount:45000, status:"holding", reference:"ESC-001", created_at:"2026-02-10T08:30:00Z" }],
  tickets: [
    { id:1, user_id:3, user_name:"Amara Osei", subject:"Assessment timer reset on refresh", message:"The 2-hour timer resets every time I refresh. Can you restore my progress?", status:"open", priority:"high", category:"technical", replies:[], created_at:"2026-02-21T10:00:00Z" },
    { id:2, user_id:4, user_name:"Kwame Mensah", subject:"Payment not reflected in wallet", message:"Released KES 38,250 still not showing after 2 hours.", status:"in_progress", priority:"high", category:"payment", replies:[], assigned_to:2, created_at:"2026-02-20T14:00:00Z" },
  ],
  msgs: [
    { id:1, convo_id:1, sender_id:3, recipient_id:1, body:"Hi! I just submitted my proposal for the React dashboard. Looking forward to hearing from you!", created_at:"2026-02-21T11:30:00Z", read:false },
    { id:2, convo_id:1, sender_id:1, recipient_id:3, body:"Thanks Amara! Your profile looks very strong. We'll review your application shortly.", created_at:"2026-02-21T11:45:00Z", read:true },
  ],
  convos: [{ id:1, participants:[1,3], last_msg:"Thanks Amara! Your profile looks very strong.", last_at:"2026-02-21T11:45:00Z", unread:1 }],
  cfg: { assessment_fee_min:1000, assessment_fee_max:2000, review_days:15, commission:15, min_score:60, platform:"AfriGig", version:"3.0" },
};

async function seedIfEmpty() {
  const existing = await db.get(K.U);
  if (existing?.length) return false;
  await db.set(K.U, SEED.users); await db.set(K.J, SEED.jobs); await db.set(K.W, SEED.wallets);
  await db.set(K.TX, SEED.txn); await db.set(K.E, SEED.escrows); await db.set(K.T, SEED.tickets);
  await db.set(K.M, SEED.msgs); await db.set(K.C, SEED.convos); await db.set(K.CF, SEED.cfg);
  await db.set(K.A, []); await db.set(K.N, []); await db.set(K.L, []);
  await db.set(K.S, []); await db.set(K.F, []); await db.set(K.EM, []);
  return true;
}

async function authLogin(email, pw) {
  const users = (await db.get(K.U)) || [];
  const u = users.find(x => x.email === email.trim().toLowerCase());
  if (!u) return { error: "No account found with this email" };
  const hash = await sha256(pw);
  if (u.pw !== hash) return { error: "Incorrect password" };
  if (u.status === "banned") return { error: "Account banned. Contact support@afrigig.com" };
  if (u.status === "suspended") return { error: "Account suspended. Contact support." };
  const token = `agv3_${u.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const sessions = (await db.get(K.S)) || [];
  sessions.push({ token, user_id:u.id, role:u.role, created_at:now(), expires_at:new Date(Date.now()+86400000).toISOString() });
  await db.set(K.S, sessions.slice(-200));
  await auditLog(u.id, "auth.login", `Logged in: ${email}`);
  const { pw:_, ...safe } = u;
  return { user:safe, token };
}

async function authRegister({ name, email, password }) {
  const users = (await db.get(K.U)) || [];
  if (users.find(u => u.email === email.trim().toLowerCase())) return { error: "Email already registered" };
  if (!name?.trim()) return { error: "Full name required" };
  if (!email?.includes("@")) return { error: "Valid email required" };
  if ((password || "").length < 6) return { error: "Password must be at least 6 characters" };
  const id = uid();
  const hash = await sha256(password);
  const user = { id, name:name.trim(), email:email.trim().toLowerCase(), pw:hash, role:"freelancer", status:"pending", fs:"REGISTERED", profile_complete:false, assessment_unlocked:false, track:null, created_at:now(), updated_at:now() };
  users.push(user); await db.set(K.U, users);
  const wallets = (await db.get(K.W)) || [];
  wallets.push({ id:uid(), user_id:id, currency:"KES", balance:0 }); await db.set(K.W, wallets);
  await createNotif(1, "user.registered", "New Freelancer Registered", `${name} created an account.`);
  await auditLog(id, "auth.register", `New registration: ${email}`);
  await sendEmail(id, "Welcome to AfriGig!", `Hi ${name}, welcome! Complete your profile to unlock your assessment.`);
  return { user };
}

async function getSession(token) {
  if (!token) return null;
  const sessions = (await db.get(K.S)) || [];
  const s = sessions.find(x => x.token === token);
  if (!s || new Date(s.expires_at) < new Date()) return null;
  const users = (await db.get(K.U)) || [];
  const u = users.find(x => x.id === s.user_id);
  if (!u) return null;
  const { pw:_, ...safe } = u; return safe;
}

async function createNotif(userId, type, title, message) {
  await db.push(K.N, { id:uid(), user_id:userId, type, title, message, is_read:false, created_at:now() });
}

async function sendEmail(userId, subject, body) {
  const users = (await db.get(K.U)) || [];
  const u = users.find(x => x.id === userId);
  await db.push(K.EM, { id:uid(), to:u?.email || userId, subject, body, sent_at:now(), status:"sent" });
}

async function auditLog(userId, type, desc) {
  const log = (await db.get(K.L)) || [];
  log.unshift({ id:uid(), user_id:userId, type, desc, created_at:now() });
  await db.set(K.L, log.slice(0, 1000));
}

const TRACKS = {
  software:{ id:"software", label:"Software Development", icon:"💻", desc:"Full-stack, backend, frontend, mobile", color:"#3B82F6" },
  uiux:{ id:"uiux", label:"UI/UX Design", icon:"🎨", desc:"Product design, user research, interaction design", color:"#8B5CF6" },
  data:{ id:"data", label:"Data & Analytics", icon:"📊", desc:"Data engineering, analytics, machine learning", color:"#F59E0B" },
  devops:{ id:"devops", label:"DevOps & Cloud", icon:"☁️", desc:"Cloud infrastructure, CI/CD, containerisation", color:"#10B981" },
  writing:{ id:"writing", label:"Technical Writing", icon:"✍️", desc:"Documentation, content, technical communication", color:"#EC4899" },
  nontech:{ id:"nontech", label:"Non-Technical / Admin", icon:"🗂️", desc:"Project management, admin, operations", color:"#6366F1" },
};

const CORE_QS = [
  { id:"c1", cat:"Communication", q:"A client provides vague requirements. Your first action?", opts:["Ask targeted clarifying questions before starting","Make assumptions and proceed","Wait for more detail","Suggest a different scope"], correct:0, pts:10 },
  { id:"c2", cat:"Communication", q:"You discover a bug that will delay delivery by 3 days. You:", opts:["Inform the client immediately with a revised timeline","Work overtime without telling them","Blame the original specifications","Deliver incomplete work on time"], correct:0, pts:10 },
  { id:"c3", cat:"Communication", q:"How frequently should you update clients on progress?", opts:["Regular updates at agreed milestones","Only when something goes wrong","Only at project completion","Only when asked"], correct:0, pts:10 },
  { id:"c4", cat:"Problem Solving", q:"When facing a technical problem you've never encountered, first step?", opts:["Research docs, similar issues, and Stack Overflow thoroughly","Ask for help immediately","Inform client you cannot complete the task","Implement a workaround without understanding the cause"], correct:0, pts:10 },
  { id:"c5", cat:"Problem Solving", q:"A client requests a feature that is technically infeasible within budget. You:", opts:["Discuss alternatives that achieve the same goal within constraints","Agree knowing it will fail","Refuse without explanation","Build something different without informing the client"], correct:0, pts:10 },
  { id:"c6", cat:"Time Management", q:"Managing three projects with overlapping urgent deadlines:", opts:["Prioritise by impact and deadline; communicate with all parties","Work equally on all three and miss all deadlines","Focus on the easiest task","Stop all work until sequential handling is possible"], correct:0, pts:10 },
  { id:"c7", cat:"Time Management", q:"Client requests significant scope changes mid-project. You:", opts:["Evaluate impact, update timeline/budget, get formal approval","Implement all changes immediately","Refuse any changes","Complete original scope then add changes secretly"], correct:0, pts:10 },
  { id:"c8", cat:"Ethics", q:"A client asks you to copy proprietary code from a competitor:", opts:["Decline and explain legal and ethical issues","Do it—client bears legal responsibility","Do it secretly","Ask for extra pay to take the risk"], correct:0, pts:10 },
  { id:"c9", cat:"Ethics", q:"You notice a mistake in your work the client hasn't spotted yet:", opts:["Proactively disclose it and provide a fix plan","Hope they never notice","Fix it quietly","Blame external factors if it surfaces"], correct:0, pts:10 },
  { id:"c10", cat:"Client Handling", q:"After delivery, client claims results don't match expectations but scope was met:", opts:["Review documented requirements; discuss gaps professionally; propose resolution","Offer a full refund immediately","Argue all requirements were met","Redo all the work for free"], correct:0, pts:10 },
];

const TECH_QS = {
  software:[
    { id:"t1", cat:"Technical", q:"Average-case time complexity of quicksort?", opts:["O(n log n)","O(n²)","O(n)","O(log n)"], correct:0, pts:10 },
    { id:"t2", cat:"Technical", q:"HTTP status code for a successfully created resource?", opts:["201 Created","200 OK","204 No Content","202 Accepted"], correct:0, pts:10 },
    { id:"t3", cat:"Technical", q:"React hook to memoize expensive computed values?", opts:["useMemo","useEffect","useCallback","useRef"], correct:0, pts:10 },
    { id:"t4", cat:"Technical", q:"ACID stands for:", opts:["Atomicity, Consistency, Isolation, Durability","Availability, Consistency, Integrity, Durability","Atomicity, Concurrency, Isolation, Distribution","Availability, Concurrency, Integrity, Dependency"], correct:0, pts:10 },
    { id:"t5", cat:"Technical", q:"Design pattern ensuring a class has only one instance:", opts:["Singleton","Factory","Observer","Decorator"], correct:0, pts:10 },
  ],
  uiux:[
    { id:"u1", cat:"Design", q:"WCAG 2.1 AA minimum contrast ratio for normal text:", opts:["4.5:1","3:1","7:1","2:1"], correct:0, pts:10 },
    { id:"u2", cat:"Design", q:"Figma feature for adaptive component resizing:", opts:["Auto Layout","Constraints","Variants","Smart Animate"], correct:0, pts:10 },
    { id:"u3", cat:"Design", q:"Best UX research method for discovering unknown pain points:", opts:["Contextual inquiry / ethnographic study","A/B testing","Usability testing","Card sorting"], correct:0, pts:10 },
    { id:"u4", cat:"Design", q:"Fitts's Law in UI design primarily predicts:", opts:["Time to reach a target based on size and distance","User satisfaction","Visual hierarchy","Cognitive load"], correct:0, pts:10 },
    { id:"u5", cat:"Design", q:"Accessibility attribute describing an element's purpose to screen readers:", opts:["aria-label","aria-live","aria-hidden","role='none'"], correct:0, pts:10 },
  ],
  data:[
    { id:"d1", cat:"Data", q:"SQL clause that filters rows after aggregation:", opts:["HAVING","WHERE","GROUP BY","ORDER BY"], correct:0, pts:10 },
    { id:"d2", cat:"Data", q:"In dbt, a 'model' is:", opts:["A SQL file transforming raw data into an analytical dataset","A Python script for ML training","A data validation rule","A connection to source database"], correct:0, pts:10 },
    { id:"d3", cat:"Data", q:"Key difference between OLAP and OLTP:", opts:["OLAP optimised for complex analytics; OLTP for fast transactional writes","OLAP uses row storage; OLTP columnar","OLAP requires NoSQL; OLTP requires SQL","They are functionally identical"], correct:0, pts:10 },
    { id:"d4", cat:"Data", q:"Best Python library for in-memory dataframe manipulation:", opts:["Pandas","NumPy","SQLAlchemy","Celery"], correct:0, pts:10 },
    { id:"d5", cat:"Data", q:"'Idempotent' for an ETL pipeline means:", opts:["Running it multiple times produces the same result","It runs automatically on schedule","It handles errors without retrying","It processes data in real time"], correct:0, pts:10 },
  ],
  devops:[
    { id:"dv1", cat:"DevOps", q:"Kubernetes object that manages desired pod replica count:", opts:["ReplicaSet","Service","ConfigMap","Ingress"], correct:0, pts:10 },
    { id:"dv2", cat:"DevOps", q:"Git strategy that merges a feature branch as a single commit:", opts:["Squash and merge","Fast-forward merge","Rebase merge","Cherry-pick"], correct:0, pts:10 },
    { id:"dv3", cat:"DevOps", q:"Dockerfile CMD instruction defines:", opts:["Default command run when container starts","Commands run during image build","Environment variables","Exposed ports"], correct:0, pts:10 },
    { id:"dv4", cat:"DevOps", q:"GitHub Actions keyword that starts a workflow job:", opts:["jobs:","steps:","runs:","triggers:"], correct:0, pts:10 },
    { id:"dv5", cat:"DevOps", q:"AWS managed object storage service:", opts:["S3","EC2","RDS","Lambda"], correct:0, pts:10 },
  ],
  writing:[
    { id:"w1", cat:"Writing", q:"Best practice for API documentation structure:", opts:["Overview → Authentication → Endpoints → Examples → Error codes","Errors first, then endpoints","Only include code samples","List all parameters alphabetically"], correct:0, pts:10 },
    { id:"w2", cat:"Writing", q:"The 'inverted pyramid' principle in technical writing means:", opts:["Most critical information first, details later","Build to a conclusion","Alphabetical ordering","Use bullet points exclusively"], correct:0, pts:10 },
    { id:"w3", cat:"Writing", q:"When to use passive voice in technical docs?", opts:["When the actor is unknown or irrelevant to the reader","Always, for formality","Never in technical writing","Only in introductions"], correct:0, pts:10 },
    { id:"w4", cat:"Writing", q:"A good 'Getting Started' guide should:", opts:["Get the reader to a working result in under 15 minutes","Cover every feature exhaustively","Reference the full API spec","Be written for advanced users only"], correct:0, pts:10 },
    { id:"w5", cat:"Writing", q:"Plain language principle for technical audiences:", opts:["Use the simplest word that conveys full meaning accurately","Use jargon to establish credibility","Write long sentences to be thorough","Avoid examples as they add length"], correct:0, pts:10 },
  ],
  nontech:[
    { id:"n1", cat:"Operations", q:"When prioritising a backlog of tasks, you use:", opts:["Impact vs effort matrix; highest impact, lowest effort first","First-in first-out regardless of urgency","Always what your manager asks first","Smallest tasks first"], correct:0, pts:10 },
    { id:"n2", cat:"Operations", q:"A stakeholder disagrees with your project timeline. You:", opts:["Present data and risks transparently and negotiate constructively","Agree to whatever they ask","Escalate immediately without discussion","Ignore their concerns"], correct:0, pts:10 },
    { id:"n3", cat:"Operations", q:"Best tool for tracking recurring tasks across a distributed team:", opts:["Shared project management tool with clear ownership and deadlines","Email threads","WhatsApp group","Verbal agreements in meetings"], correct:0, pts:10 },
    { id:"n4", cat:"Operations", q:"When onboarding a new client, your first step should be:", opts:["Discovery call to understand needs, systems, and success criteria","Send a generic onboarding template","Start work immediately","Request all access credentials upfront"], correct:0, pts:10 },
    { id:"n5", cat:"Operations", q:"A deliverable is due tomorrow but needs 2 more days. You:", opts:["Notify the client today with a clear revised plan","Submit incomplete work on time","Request an extension without explanation","Work through the night and miss quality targets"], correct:0, pts:10 },
  ],
};

const CODING_CHALLENGES = [
  { id:"cc1", title:"Two Sum", difficulty:"Medium", timeLimit:30, description:`Given an array of integers nums and integer target, return **indices** of the two numbers that add up to target.\n\nExample: nums=[2,7,11,15], target=9 → [0,1]\n\nConstraints: 2 ≤ nums.length ≤ 10⁴, exactly one solution.`, starter:{ javascript:`function twoSum(nums, target) {\n  // Write your solution here\n  \n}\n\nconsole.log(JSON.stringify(twoSum([2,7,11,15], 9)));  // [0,1]\nconsole.log(JSON.stringify(twoSum([3,2,4], 6)));      // [1,2]\nconsole.log(JSON.stringify(twoSum([3,3], 6)));         // [0,1]`, python:`def two_sum(nums, target):\n    # Write your solution here\n    pass\n\nprint(two_sum([2,7,11,15], 9))  # [0, 1]\nprint(two_sum([3,2,4], 6))      # [1, 2]\nprint(two_sum([3,3], 6))         # [0, 1]` }, tests:[{input:"[2,7,11,15], 9",expected:"[0,1]"},{input:"[3,2,4], 6",expected:"[1,2]"},{input:"[3,3], 6",expected:"[0,1]"}], maxPts:30 },
  { id:"cc2", title:"Valid Parentheses", difficulty:"Medium", timeLimit:30, description:`Given a string containing only ( ) { } [ ], determine if it is **valid**.\n\nAn input is valid if every open bracket is closed by the same type, in the correct order.\n\n"()[]{}" → true\n"(]" → false\n"{[]}" → true`, starter:{ javascript:`function isValid(s) {\n  // Write your solution here\n  \n}\n\nconsole.log(isValid("()[]{}"));  // true\nconsole.log(isValid("(]"));      // false\nconsole.log(isValid("{[]}"));    // true`, python:`def is_valid(s):\n    # Write your solution here\n    pass\n\nprint(is_valid("()[]{}"))  # True\nprint(is_valid("(]"))      # False\nprint(is_valid("{[]}"))    # True` }, tests:[{input:'"()[]{}"',expected:"true"},{input:'"(]"',expected:"false"},{input:'"{[]}"',expected:"true"}], maxPts:30 },
];

const SQL_CHALLENGE = {
  description:`You have two tables:\n\n**orders** (order_id, customer_id, amount, created_at)\n**customers** (customer_id, name, country, signup_date)\n\nWrite a query returning the **top 5 customers by total spend** who signed up **in the last 6 months**, including: name, country, total_spent, order_count, avg_order_value.\nOrder by total_spent DESC.`,
  starter:`SELECT\n  c.name,\n  c.country,\n  SUM(o.amount)           AS total_spent,\n  COUNT(o.order_id)       AS order_count,\n  ROUND(AVG(o.amount),2)  AS avg_order_value\nFROM customers c\nJOIN orders o ON o.customer_id = c.customer_id\nWHERE c.signup_date >= CURRENT_DATE - INTERVAL '6 months'\nGROUP BY c.customer_id, c.name, c.country\nORDER BY total_spent DESC\nLIMIT 5;`,
  maxPts:40,
};

// ─── HOOKS ───────────────────────────────────────────────────
function useRouter() {
  const [route, setRoute] = useState(() => window.location.hash.replace("#","") || "/");
  useEffect(() => { const h = () => setRoute(window.location.hash.replace("#","") || "/"); window.addEventListener("hashchange",h); return () => window.removeEventListener("hashchange",h); }, []);
  const navigate = useCallback(path => { window.location.hash = path; }, []);
  return { route, navigate };
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type="success") => { const id=uid(); setToasts(t=>[...t,{id,msg,type}]); setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),4000); }, []);
  return { toasts, toast };
}

function useNotifs(userId) {
  const [notifs, setNotifs] = useState([]);
  const unread = useMemo(() => notifs.filter(n=>!n.is_read).length, [notifs]);
  const refresh = useCallback(async () => { if (!userId) return; const all=(await db.get(K.N))||[]; setNotifs(all.filter(n=>n.user_id===userId).slice(0,60)); }, [userId]);
  useEffect(() => { refresh(); const t=setInterval(refresh,4000); return ()=>clearInterval(t); }, [refresh]);
  const markRead = useCallback(async id => { await db.patch(K.N,id,{is_read:true}); refresh(); }, [refresh]);
  const markAllRead = useCallback(async () => { const all=(await db.get(K.N))||[]; await db.set(K.N,all.map(n=>n.user_id===userId?{...n,is_read:true}:n)); refresh(); }, [userId,refresh]);
  return { notifs, unread, markRead, markAllRead, refresh };
}

function useTimer(totalSec, onExpire, autoStart=false) {
  const [left, setLeft] = useState(totalSec);
  const [running, setRunning] = useState(autoStart);
  const ref = useRef();
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { onExpire?.(); return; }
    ref.current = setTimeout(() => setLeft(l=>l-1), 1000);
    return () => clearTimeout(ref.current);
  }, [left, running]);
  const fmt = s => `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  return { left, fmt:fmt(left), start:()=>setRunning(true), stop:()=>setRunning(false), warn:left<300, critical:left<60 };
}

// ─── SHARED UI ────────────────────────────────────────────────
function Toast({ toasts }) {
  const icons={success:"✓",error:"✕",info:"i",warn:"!"};
  const cls={success:"ts",error:"te",info:"ti",warn:"tw2"};
  return (<div className="toast-wrap">{toasts.map(t=><div key={t.id} className={`toast ${cls[t.type]}`}><span style={{width:20,height:20,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,flexShrink:0}}>{icons[t.type]}</span>{t.msg}</div>)}</div>);
}

function Spinner({ size=24, color="var(--g)" }) {
  return <div className="sp" style={{width:size,height:size,border:`3px solid ${color}22`,borderTopColor:color,borderRadius:"50%",margin:"0 auto"}}/>;
}

function Avatar({ name, size=36, online }) {
  return (
    <div style={{position:"relative",flexShrink:0}}>
      <div style={{width:size,height:size,borderRadius:"50%",background:"linear-gradient(135deg,#00D4A0,#3B82F6)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:size*.38,fontFamily:"var(--fh)"}}>
        {initials(name)}
      </div>
      {online!==undefined&&<div style={{position:"absolute",bottom:0,right:0,width:10,height:10,background:online?"var(--g)":"var(--bdr)",borderRadius:"50%",border:"2px solid #fff"}}/>}
    </div>
  );
}

function Btn({ children, variant="primary", size="md", onClick, disabled, loading, icon, style:s={}, type="button" }) {
  const cls={primary:"bp",danger:"bd",ghost:"bg2",outline:"bo2",dark:"bdk"}[variant]||"bp";
  const sz={sm:"bsm",lg:"blg"}[size]||"";
  return (
    <button type={type} className={`btn ${cls} ${sz}`} onClick={onClick} disabled={disabled||loading} style={s}>
      {loading?<div className="sp" style={{width:13,height:13,border:"2.5px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>:icon&&<span>{icon}</span>}
      {children}
    </button>
  );
}

function Inp({ label, value, onChange, type="text", placeholder, required, rows, hint, error, disabled, style:s={} }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label className={`lbl ${required?"lbl-r":""}`}>{label}</label>}
      {rows?<textarea className="inp" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} disabled={disabled} style={{resize:"vertical",...s}}/>
        :<input type={type} className="inp" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={s}/>}
      {hint&&!error&&<span style={{fontSize:12,color:"var(--sub)"}}>{hint}</span>}
      {error&&<span style={{fontSize:12,color:"var(--err)"}}>{error}</span>}
    </div>
  );
}

function Sel({ label, value, onChange, options, required }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      {label&&<label className={`lbl ${required?"lbl-r":""}`}>{label}</label>}
      <select className="inp" value={value} onChange={e=>onChange(e.target.value)}>
        {options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}
      </select>
    </div>
  );
}

function Card({ children, style:s={}, className="" }) { return <div className={`card ${className}`} style={s}>{children}</div>; }

function Stat({ label, value, icon, color="var(--g)", sub, loading }) {
  return (
    <Card style={{padding:22,position:"relative",overflow:"hidden"}}>
      {loading?<><div className="sk" style={{width:80,height:12,marginBottom:10}}/><div className="sk" style={{width:55,height:28}}/></>:(
        <>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <p style={{fontSize:12,color:"var(--sub)",fontWeight:600,marginBottom:8,textTransform:"uppercase",letterSpacing:".05em"}}>{label}</p>
              <p style={{fontSize:28,fontWeight:800,fontFamily:"var(--fh)",color:"var(--ink)"}}>{value}</p>
              {sub&&<p style={{fontSize:12,color:"var(--sub)",marginTop:4}}>{sub}</p>}
            </div>
            <div style={{width:44,height:44,background:`${color}18`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{icon}</div>
          </div>
          <div style={{position:"absolute",bottom:-20,right:-20,width:72,height:72,background:`${color}08`,borderRadius:"50%"}}/>
        </>
      )}
    </Card>
  );
}

function Bdg({ status, label }) {
  const map={REGISTERED:"bgr",PROFILE_COMPLETED:"bo",ASSESSMENT_PENDING:"by",ASSESSMENT_SUBMITTED:"bb",UNDER_REVIEW:"bpu",APPROVED:"bg",REJECTED:"br",SUSPENDED:"bo",active:"bg",pending:"by",banned:"br",suspended:"bo",open:"bb",in_progress:"bpu",completed:"bg",cancelled:"br",holding:"by",released:"bg",escrow:"bo",sent:"bb",accepted:"bg",rejected:"br",high:"br",medium:"by",low:"bg"};
  const labels={REGISTERED:"Registered",PROFILE_COMPLETED:"Profile Done",ASSESSMENT_PENDING:"Assess. Pending",ASSESSMENT_SUBMITTED:"Submitted",UNDER_REVIEW:"Under Review",APPROVED:"Approved",REJECTED:"Rejected",SUSPENDED:"Suspended",in_progress:"In Progress",holding:"In Escrow"};
  return <span className={`badge ${map[status]||"bgr"}`}>{label||labels[status]||status}</span>;
}

function Empty({ icon, title, sub }) {
  return <div style={{textAlign:"center",padding:"48px 24px",color:"var(--sub)"}}><div style={{fontSize:44,marginBottom:12}}>{icon}</div><h3 style={{fontFamily:"var(--fh)",fontSize:17,color:"var(--mu)",marginBottom:6}}>{title}</h3><p style={{fontSize:14}}>{sub}</p></div>;
}

function Tabs({ tabs, active, onChange }) {
  return (
    <div style={{display:"flex",gap:2,borderBottom:"1px solid var(--bdr)",marginBottom:20}}>
      {tabs.map(t=><button key={t} onClick={()=>onChange(t)} style={{padding:"10px 18px",border:"none",background:"none",fontFamily:"var(--fh)",fontSize:13.5,fontWeight:600,cursor:"pointer",borderBottom:`2px solid ${active===t?"var(--g)":"transparent"}`,color:active===t?"var(--g)":"var(--sub)",marginBottom:-1,transition:"all .15s"}}>{t}</button>)}
    </div>
  );
}

function FileUpload({ label, onUpload, accept="*", hint }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const ref = useRef();
  const handle = f => { if (!f) return; setFile(f); const r=new FileReader(); r.onload=()=>onUpload?.({name:f.name,size:f.size,type:f.type,uploaded_at:now()}); r.readAsDataURL(f); };
  return (
    <div>
      {label&&<label className="lbl" style={{marginBottom:8}}>{label}</label>}
      <div className={`fdr ${dragging?"dov":""}`} onClick={()=>ref.current.click()} onDrop={e=>{e.preventDefault();setDragging(false);handle(e.dataTransfer.files[0]);}} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)}>
        {file?<div style={{color:"var(--gd)",fontWeight:600,fontSize:14}}>✓ {file.name} ({(file.size/1024).toFixed(1)} KB)</div>:<><div style={{fontSize:30,marginBottom:8}}>📁</div><div style={{fontSize:14,color:"var(--sub)"}}>Drop file here or <span style={{color:"var(--g)",fontWeight:600}}>browse</span></div>{hint&&<div style={{fontSize:12,color:"var(--sub)",marginTop:4}}>{hint}</div>}</>}
        <input ref={ref} type="file" accept={accept} style={{display:"none"}} onChange={e=>handle(e.target.files[0])}/>
      </div>
    </div>
  );
}


// ─── SIDEBAR & TOPBAR ────────────────────────────────────────
const NAV_ITEMS = {
  admin:[
    {key:"dashboard",icon:"⬡",label:"Dashboard"},
    {key:"registrations",icon:"🆕",label:"New Registrations",badge:"new"},
    {key:"reviews",icon:"🔍",label:"FR Reviews",badge:"review"},
    {key:"users",icon:"👥",label:"All Users"},
    {key:"jobs",icon:"💼",label:"Jobs"},
    {key:"payments",icon:"💳",label:"Payments & Escrow"},
    {key:"messages",icon:"💬",label:"Messages"},
    {key:"tickets",icon:"🎫",label:"Support Tickets",badge:"tickets"},
    {key:"emails",icon:"📧",label:"Email Log"},
    {key:"reports",icon:"📊",label:"Analytics"},
    {key:"audit",icon:"📋",label:"Audit Log"},
    {key:"settings",icon:"⚙️",label:"Settings"},
  ],
  support:[
    {key:"dashboard",icon:"⬡",label:"Dashboard"},
    {key:"tickets",icon:"🎫",label:"Tickets",badge:"tickets"},
    {key:"messages",icon:"💬",label:"Messages"},
    {key:"users",icon:"👥",label:"Users"},
    {key:"reviews",icon:"🔍",label:"FR Reviews"},
  ],
  freelancer:[
    {key:"dashboard",icon:"⬡",label:"Dashboard"},
    {key:"jobs",icon:"🔍",label:"Find Jobs"},
    {key:"applications",icon:"📤",label:"My Proposals"},
    {key:"projects",icon:"📁",label:"Active Projects"},
    {key:"messages",icon:"💬",label:"Messages"},
    {key:"earnings",icon:"💰",label:"Earnings & Wallet"},
    {key:"profile",icon:"🪪",label:"Profile & KYC"},
    {key:"tickets",icon:"🎫",label:"Support"},
  ],
};

function Sidebar({ role, active, onNav, user, onLogout, unread, counts, mobileOpen }) {
  const items = NAV_ITEMS[role] || [];
  const getBadge = k => {
    if (k==="new") return counts?.new_reg || null;
    if (k==="review") return counts?.under_review || null;
    if (k==="tickets") return counts?.open_tickets || null;
    return null;
  };
  return (
    <div style={{width:244,background:"#fff",borderRight:"1px solid var(--bdr)",display:"flex",flexDirection:"column",height:"100vh",position:"fixed",left:0,top:0,zIndex:100}}>
      <div style={{padding:"18px 20px 14px",borderBottom:"1px solid var(--bdr)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,background:"linear-gradient(135deg,var(--g),var(--gd))",borderRadius:11,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{color:"#fff",fontSize:20,fontWeight:800,fontFamily:"var(--fh)"}}>A</span>
          </div>
          <div>
            <div style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:20,lineHeight:1}}>AfriGig</div>
            <div style={{fontSize:11,color:"var(--sub)",textTransform:"uppercase",letterSpacing:".06em",marginTop:2}}>{role}</div>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:"12px",overflowY:"auto"}}>
        {items.map(item => {
          const badge = item.badge ? getBadge(item.badge) : null;
          return (
            <button key={item.key} className={`sb-link ${active===item.key?"act":""}`} onClick={()=>onNav(item.key)}>
              <span style={{fontSize:16,width:20,textAlign:"center",flexShrink:0}}>{item.icon}</span>
              <span style={{flex:1}}>{item.label}</span>
              {badge>0&&<span style={{background:"var(--err)",color:"#fff",borderRadius:99,fontSize:10,padding:"1px 6px",fontWeight:800,minWidth:18,textAlign:"center"}}>{badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:"12px 16px",borderTop:"1px solid var(--bdr)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Avatar name={user?.name} online={true} size={34}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.name}</div>
            <div style={{fontSize:11,color:"var(--sub)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.email}</div>
          </div>
          <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",fontSize:16,color:"var(--sub)",padding:4,borderRadius:6}} title="Logout">⏏</button>
        </div>
      </div>
    </div>
  );
}

function Topbar({ user, unread, notifs, onMarkRead, onMarkAll, title }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{height:58,background:"#fff",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",padding:"0 24px",gap:16,position:"sticky",top:0,zIndex:50}}>
      <div style={{flex:1}}><span style={{fontFamily:"var(--fh)",fontWeight:600,fontSize:15,color:"var(--navy)",textTransform:"capitalize"}}>{title||"Dashboard"}</span></div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <div style={{position:"relative"}}>
          <button className="btn bg2 bsm" onClick={()=>setOpen(o=>!o)} style={{fontSize:18,padding:"6px 10px",position:"relative"}}>
            🔔{unread>0&&<span style={{position:"absolute",top:4,right:4,width:8,height:8,background:"var(--err)",borderRadius:"50%",border:"2px solid #fff"}}/>}
          </button>
          {open&&(
            <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",width:360,background:"#fff",border:"1px solid var(--bdr)",borderRadius:12,boxShadow:"var(--shx)",zIndex:200}} className="ai">
              <div style={{padding:"14px 16px",borderBottom:"1px solid var(--bdr)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontWeight:700,fontFamily:"var(--fh)",fontSize:15}}>Notifications {unread>0?`(${unread})`:""}</span>
                {unread>0&&<button className="btn bg2 bsm" onClick={()=>{onMarkAll();setOpen(false);}}>Mark all read</button>}
              </div>
              <div style={{maxHeight:380,overflowY:"auto"}}>
                {notifs.length===0?<div style={{padding:24,textAlign:"center",color:"var(--sub)",fontSize:14}}>No notifications yet</div>:
                  notifs.slice(0,25).map(n=>(
                    <div key={n.id} onClick={()=>onMarkRead(n.id)} style={{padding:"12px 16px",borderBottom:"1px solid var(--bdr)",cursor:"pointer",background:n.is_read?"#fff":"var(--gl)"}}>
                      <div style={{fontWeight:n.is_read?500:700,fontSize:13,marginBottom:3}}>{n.title}</div>
                      <div style={{fontSize:12,color:"var(--sub)",lineHeight:1.5}}>{n.message}</div>
                      <div style={{fontSize:11,color:"var(--sub)",marginTop:4}}>{fmtRel(n.created_at)}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
        <Avatar name={user?.name} online={true} size={32}/>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────
function Landing({ navigate }) {
  const [openFaq, setOpenFaq] = useState(null);
  const stats=[["2,400+","Verified Freelancers"],["KES 120M+","Paid Out"],["840","Projects Completed"],["12","African Countries"]];
  const faqs=[
    ["How long does approval take?","10–15 business days. You get real-time status updates and can track your queue position live."],
    ["What is the assessment fee?","KES 1,000–2,000 via M-Pesa or Stripe. It covers expert review and platform costs."],
    ["What tracks are available?","Software Dev, UI/UX Design, Data & Analytics, DevOps & Cloud, Technical Writing, and Non-Technical/Admin."],
    ["How does the coding challenge work?","For tech tracks you get 1–2 real coding problems with test cases, similar to Codility or LeetCode, run in your chosen language."],
    ["How are payments protected?","All payments are held in escrow and released only when the client approves the deliverable."],
  ];
  return (
    <div>
      <header style={{position:"sticky",top:0,zIndex:50,background:"rgba(255,255,255,.96)",backdropFilter:"blur(10px)",borderBottom:"1px solid var(--bdr)",padding:"13px 48px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,background:"linear-gradient(135deg,var(--g),var(--gd))",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:19,fontWeight:800,fontFamily:"var(--fh)"}}>A</span></div>
          <span style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:21}}>AfriGig</span>
        </div>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="ghost" onClick={()=>navigate("/login")}>Sign In</Btn>
          <Btn onClick={()=>navigate("/register")}>Join Free</Btn>
        </div>
      </header>
      <section style={{background:"linear-gradient(135deg,#0C0F1A 0%,#162032 55%,#0f2219 100%)",padding:"96px 48px 128px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse at 15% 60%,rgba(0,212,160,.1) 0%,transparent 55%),radial-gradient(ellipse at 85% 20%,rgba(59,130,246,.08) 0%,transparent 50%)"}}/>
        <div style={{maxWidth:1200,margin:"0 auto",position:"relative"}}>
          <div className="au" style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(0,212,160,.15)",border:"1px solid rgba(0,212,160,.3)",borderRadius:99,padding:"6px 16px",marginBottom:32}}>
            <div style={{width:8,height:8,background:"var(--g)",borderRadius:"50%"}} className="pu"/>
            <span style={{color:"var(--g)",fontSize:13,fontWeight:700}}>Now live — 6 specialist assessment tracks</span>
          </div>
          <h1 className="au" style={{fontSize:"clamp(38px,6vw,66px)",fontWeight:800,color:"#fff",lineHeight:1.08,maxWidth:760,animationDelay:".1s"}}>
            Africa's Most Rigorous<br/><span style={{color:"var(--g)"}}>Freelancing Platform</span>
          </h1>
          <p className="au" style={{fontSize:18,color:"rgba(255,255,255,.55)",maxWidth:520,marginTop:22,lineHeight:1.75,animationDelay:".2s"}}>Elite-track assessments. Verified talent. Secure escrow. Real data.</p>
          <div className="au" style={{display:"flex",gap:14,marginTop:38,flexWrap:"wrap",animationDelay:".3s"}}>
            <Btn size="lg" onClick={()=>navigate("/register")} style={{fontSize:15}}>Start Your Journey →</Btn>
            <Btn variant="ghost" size="lg" style={{color:"rgba(255,255,255,.55)",borderColor:"rgba(255,255,255,.2)"}}>See Assessment Tracks</Btn>
          </div>
          <div className="stagger" style={{display:"flex",gap:44,marginTop:56,flexWrap:"wrap"}}>
            {stats.map(([v,l])=><div key={l}><div style={{fontSize:26,fontWeight:800,color:"#fff",fontFamily:"var(--fh)"}}>{v}</div><div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginTop:2}}>{l}</div></div>)}
          </div>
        </div>
      </section>
      <section style={{padding:"80px 48px",maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:48}}><h2 style={{fontSize:38,fontWeight:800}}>Assessment Tracks</h2><p style={{fontSize:16,color:"var(--sub)",marginTop:10}}>Choose your specialisation. Get assessed like top companies require.</p></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:18}} className="stagger">
          {Object.values(TRACKS).map(t=>(
            <div key={t.id} className="track-c" onClick={()=>navigate("/register")}>
              <div style={{fontSize:32,marginBottom:10}}>{t.icon}</div>
              <div style={{width:32,height:4,background:t.color,borderRadius:99,marginBottom:12}}/>
              <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:15,marginBottom:7}}>{t.label}</h3>
              <p style={{fontSize:13,color:"var(--sub)",lineHeight:1.55}}>{t.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <section style={{background:"var(--surf)",padding:"72px 48px"}}>
        <div style={{maxWidth:680,margin:"0 auto"}}>
          <h2 style={{fontSize:36,fontWeight:800,textAlign:"center",marginBottom:40}}>Frequently Asked</h2>
          {faqs.map(([q,a],i)=>(
            <div key={i} onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{background:"#fff",borderRadius:10,border:"1px solid var(--bdr)",marginBottom:10,overflow:"hidden",cursor:"pointer"}}>
              <div style={{padding:"16px 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:15,fontWeight:600,fontFamily:"var(--fh)"}}>{q}</span>
                <span style={{fontSize:20,color:"var(--sub)",transform:openFaq===i?"rotate(45deg)":"none",transition:"transform .2s",flexShrink:0}}>+</span>
              </div>
              {openFaq===i&&<div style={{padding:"0 20px 16px",fontSize:14,color:"var(--sub)",lineHeight:1.7}} className="ai">{a}</div>}
            </div>
          ))}
        </div>
      </section>
      <section style={{background:"linear-gradient(135deg,var(--ink),#162032)",padding:"80px 48px",textAlign:"center"}}>
        <h2 style={{fontSize:44,fontWeight:800,color:"#fff",marginBottom:16}}>Ready to Get Verified?</h2>
        <p style={{fontSize:16,color:"rgba(255,255,255,.5)",marginBottom:32}}>Join thousands of African professionals building global careers.</p>
        <Btn size="lg" onClick={()=>navigate("/register")} style={{fontSize:15}}>Create Free Account →</Btn>
      </section>
      <footer style={{background:"var(--ink)",padding:"22px 48px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <span style={{color:"rgba(255,255,255,.3)",fontSize:13}}>© 2026 AfriGig v3.0 · All rights reserved.</span>
        {["Privacy","Terms","Contact"].map(l=><a key={l} href="#" style={{color:"rgba(255,255,255,.3)",fontSize:13,textDecoration:"none"}}>{l}</a>)}
      </footer>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────
function AuthPage({ mode, navigate, onLogin, toast }) {
  const [form, setForm] = useState({name:"",email:"",password:"",confirm:""});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const isLogin = mode==="login";

  const validate = () => {
    const e={};
    if (!isLogin&&!form.name.trim()) e.name="Full name required";
    if (!form.email.includes("@")) e.email="Valid email required";
    if (form.password.length<6) e.password="At least 6 characters";
    if (!isLogin&&form.password!==form.confirm) e.confirm="Passwords don't match";
    setErrors(e); return !Object.keys(e).length;
  };

  const submit = async e => {
    e.preventDefault(); if (!validate()) return;
    setLoading(true);
    const res = isLogin ? await authLogin(form.email, form.password) : await authRegister({name:form.name, email:form.email, password:form.password});
    setLoading(false);
    if (res.error) { toast(res.error,"error"); return; }
    if (isLogin) { localStorage.setItem("ag3_token",res.token); onLogin(res.user,res.token); toast(`Welcome back, ${res.user.name.split(" ")[0]}!`); }
    else { toast("Account created! Please sign in."); navigate("/login"); }
  };

  const quickLogin = async (email,pw) => {
    setLoading(true); const res=await authLogin(email,pw); setLoading(false);
    if (res.error) { toast(res.error,"error"); return; }
    localStorage.setItem("ag3_token",res.token); onLogin(res.user,res.token); toast(`Welcome back, ${res.user.name.split(" ")[0]}!`);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0C0F1A 0%,#162032 100%)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{width:"100%",maxWidth:420}} className="au">
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,background:"linear-gradient(135deg,var(--g),var(--gd))",borderRadius:15,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><span style={{color:"#fff",fontSize:26,fontWeight:800,fontFamily:"var(--fh)"}}>A</span></div>
          <h1 style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:28,color:"#fff"}}>{isLogin?"Welcome back":"Join AfriGig"}</h1>
          <p style={{color:"rgba(255,255,255,.4)",marginTop:6,fontSize:14}}>{isLogin?"Sign in to your account":"Create your free freelancer account"}</p>
        </div>
        <Card style={{padding:28}}>
          <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
            {!isLogin&&<Inp label="Full Name" value={form.name} onChange={v=>setForm({...form,name:v})} placeholder="Amara Osei" required error={errors.name}/>}
            <Inp label="Email Address" type="email" value={form.email} onChange={v=>setForm({...form,email:v})} placeholder="you@email.com" required error={errors.email}/>
            <Inp label="Password" type="password" value={form.password} onChange={v=>setForm({...form,password:v})} placeholder="••••••••" required error={errors.password} hint={!isLogin?"Minimum 6 characters":undefined}/>
            {!isLogin&&<Inp label="Confirm Password" type="password" value={form.confirm} onChange={v=>setForm({...form,confirm:v})} placeholder="••••••••" required error={errors.confirm}/>}
            <Btn type="submit" loading={loading} style={{width:"100%",justifyContent:"center",marginTop:4}}>{isLogin?"Sign In →":"Create Account →"}</Btn>
          </form>
          <div style={{textAlign:"center",marginTop:16,fontSize:14,color:"var(--sub)"}}>
            {isLogin?<span>New here? <button onClick={()=>navigate("/register")} style={{background:"none",border:"none",color:"var(--g)",cursor:"pointer",fontWeight:700}}>Register free</button></span>:<span>Have an account? <button onClick={()=>navigate("/login")} style={{background:"none",border:"none",color:"var(--g)",cursor:"pointer",fontWeight:700}}>Sign in</button></span>}
          </div>
          {isLogin&&(
            <div style={{marginTop:18}}>
              <div style={{fontSize:12,color:"var(--sub)",marginBottom:8,fontWeight:600,textTransform:"uppercase",letterSpacing:".04em"}}>Quick Login</div>
              {[["admin@afrigig.com","admin","Admin","⬡"],["support@afrigig.com","support","Support Agent","🎫"],["kwame@afrigig.com","pass","Freelancer (Approved)","✅"],["amara@afrigig.com","pass","Freelancer (Under Review)","🔍"],["ngozi@afrigig.com","pass","Freelancer (New)","🆕"]].map(([email,pw,label,icon])=>(
                <div key={email} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"var(--surf)",borderRadius:8,marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>{icon}</span><span style={{fontSize:13,fontWeight:600}}>{label}</span></div>
                  <button className="btn bg2 bsm" onClick={()=>quickLogin(email,pw)} disabled={loading} style={{fontSize:11}}>Login →</button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ─── ONBOARDING ───────────────────────────────────────────────
function Onboarding({ user, onUpdateUser, toast }) {
  const fs=user.fs;
  if (fs==="APPROVED") return null;
  if (fs==="REJECTED"||fs==="SUSPENDED") return <StatusPage user={user}/>;
  const steps=[{key:"REGISTERED",label:"Account Created"},{key:"PROFILE_COMPLETED",label:"Complete Profile"},{key:"ASSESSMENT_PENDING",label:"Unlock Assessment"},{key:"UNDER_REVIEW",label:"Expert Review"},{key:"APPROVED",label:"Start Working"}];
  const idx=steps.findIndex(s=>s.key===fs);
  const pct=Math.max(0,(idx/(steps.length-1))*100);
  return (
    <div style={{minHeight:"100vh",background:"var(--surf)",display:"flex"}}>
      <div style={{width:280,background:"linear-gradient(180deg,#0C0F1A 0%,#162032 100%)",padding:"40px 28px",display:"flex",flexDirection:"column",flexShrink:0}}>
        <div style={{marginBottom:44}}><div style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:22,color:"#fff"}}>AfriGig</div><div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:3}}>Freelancer Onboarding</div></div>
        <div style={{flex:1}}>
          {steps.map((s,i)=>{
            const done=idx>i; const active=fs===s.key;
            return (
              <div key={s.key} style={{display:"flex",alignItems:"center",gap:14,marginBottom:26,opacity:done||active?1:.32}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:done?"var(--g)":active?"rgba(0,212,160,.15)":"rgba(255,255,255,.06)",border:active?"2px solid var(--g)":"none",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{fontSize:12,fontWeight:800,color:done?"#fff":active?"var(--g)":"rgba(255,255,255,.3)"}}>{done?"✓":i+1}</span>
                </div>
                <span style={{fontSize:14,color:active?"#fff":done?"rgba(255,255,255,.65)":"rgba(255,255,255,.32)",fontWeight:active?700:400}}>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginBottom:6}}>Progress</div>
          <div className="pb" style={{background:"rgba(255,255,255,.1)"}}><div className="pf" style={{width:`${pct}%`}}/></div>
          <div style={{fontSize:12,color:"rgba(255,255,255,.3)",marginTop:5}}>{Math.round(pct)}% complete</div>
        </div>
      </div>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 24px",overflowY:"auto"}}>
        {fs==="REGISTERED"&&<ProfileStep user={user} onSave={onUpdateUser} toast={toast}/>}
        {fs==="PROFILE_COMPLETED"&&<TrackStep user={user} onSave={onUpdateUser} toast={toast}/>}
        {fs==="ASSESSMENT_PENDING"&&<PaymentStep user={user} onUnlock={onUpdateUser} toast={toast}/>}
        {(fs==="ASSESSMENT_SUBMITTED"||fs==="UNDER_REVIEW")&&<ReviewStatus user={user}/>}
      </div>
    </div>
  );
}

function ProfileStep({ user, onSave, toast }) {
  const [form, setForm] = useState({skills:user.skills||"",experience:user.experience||"",availability:user.availability||"Full-time",country:user.country||"",timezone:"Africa/Nairobi",bio:user.bio||"",portfolio_links:user.portfolio_links||""});
  const [cvFile, setCvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const save = async () => {
    if (!form.skills||!form.experience||!form.country) return toast("Skills, experience and country are required","error");
    setLoading(true); await new Promise(r=>setTimeout(r,600));
    const users=(await db.get(K.U))||[];
    const i=users.findIndex(u=>u.id===user.id);
    if (i!==-1) { users[i]={...users[i],...form,fs:"PROFILE_COMPLETED",profile_complete:true,updated_at:now()}; await db.set(K.U,users); if(cvFile){const files=(await db.get(K.F))||[];files.push({id:uid(),user_id:user.id,type:"cv",...cvFile});await db.set(K.F,files);} await auditLog(user.id,"profile.complete","Profile completed"); toast("Profile saved!","success"); onSave({...user,...form,fs:"PROFILE_COMPLETED"}); }
    setLoading(false);
  };
  return (
    <div style={{width:"100%",maxWidth:620}} className="au">
      <h2 style={{fontFamily:"var(--fh)",fontSize:30,fontWeight:800,marginBottom:8}}>Complete Your Profile</h2>
      <p style={{color:"var(--sub)",marginBottom:28}}>Shown to clients and used during your review process.</p>
      <Card style={{padding:28}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
          <div style={{gridColumn:"1/-1"}}><Inp label="Skills" value={form.skills} onChange={v=>setForm({...form,skills:v})} placeholder="React, Node.js, TypeScript, Python…" required hint="Comma-separated"/></div>
          <div style={{gridColumn:"1/-1"}}><Inp label="Experience Summary" value={form.experience} onChange={v=>setForm({...form,experience:v})} placeholder="5 years full-stack development…" required rows={3}/></div>
          <Inp label="Country" value={form.country} onChange={v=>setForm({...form,country:v})} placeholder="Kenya" required/>
          <Sel label="Availability" value={form.availability} onChange={v=>setForm({...form,availability:v})} options={["Full-time","Part-time","Weekends only","Project-based"]}/>
          <div style={{gridColumn:"1/-1"}}><Inp label="Bio" value={form.bio} onChange={v=>setForm({...form,bio:v})} placeholder="A brief professional bio…" rows={3}/></div>
          <div style={{gridColumn:"1/-1"}}><Inp label="Portfolio / GitHub URL" value={form.portfolio_links} onChange={v=>setForm({...form,portfolio_links:v})} placeholder="https://your-portfolio.com"/></div>
          <div style={{gridColumn:"1/-1"}}><FileUpload label="Upload CV / Resume (optional)" onUpload={setCvFile} accept=".pdf,.doc,.docx" hint="PDF or Word, max 5MB"/></div>
        </div>
        <div style={{marginTop:20}}><Btn loading={loading} onClick={save}>Save Profile & Continue →</Btn></div>
      </Card>
    </div>
  );
}

function TrackStep({ user, onSave, toast }) {
  const [sel, setSel] = useState(user.track||null);
  const [loading, setLoading] = useState(false);
  const save = async () => {
    if (!sel) return toast("Please select your track","error");
    setLoading(true);
    const users=(await db.get(K.U))||[];
    const i=users.findIndex(u=>u.id===user.id);
    if (i!==-1) { users[i]={...users[i],track:sel,fs:"ASSESSMENT_PENDING",updated_at:now()}; await db.set(K.U,users); toast("Track selected!","success"); onSave({...user,track:sel,fs:"ASSESSMENT_PENDING"}); }
    setLoading(false);
  };
  const secs={software:"Core (10) + Tech MCQ (5) + 2 Coding Challenges",uiux:"Core (10) + Design MCQ (5) + Design Task",data:"Core (10) + Data MCQ (5) + SQL Challenge",devops:"Core (10) + DevOps MCQ (5) + Scenario Task",writing:"Core (10) + Writing MCQ (5) + Writing Task",nontech:"Core (10) + Operations MCQ (5) + Situational Task"};
  return (
    <div style={{width:"100%",maxWidth:720}} className="au">
      <h2 style={{fontFamily:"var(--fh)",fontSize:30,fontWeight:800,marginBottom:8}}>Choose Your Track</h2>
      <p style={{color:"var(--sub)",marginBottom:28}}>Your track determines assessment content. Cannot be changed later.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14,marginBottom:24}}>
        {Object.values(TRACKS).map(t=>(
          <div key={t.id} className={`track-c ${sel===t.id?"sel":""}`} onClick={()=>setSel(t.id)}>
            <div style={{fontSize:28,marginBottom:8}}>{t.icon}</div>
            <div style={{width:28,height:3,background:t.color,borderRadius:99,marginBottom:10}}/>
            <div style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:14,marginBottom:5}}>{t.label}</div>
            <div style={{fontSize:12,color:"var(--sub)",lineHeight:1.5}}>{t.desc}</div>
            {sel===t.id&&<div style={{marginTop:8,color:"var(--gd)",fontWeight:700,fontSize:12}}>✓ Selected</div>}
          </div>
        ))}
      </div>
      {sel&&<div style={{padding:"12px 16px",background:"var(--gl)",borderRadius:8,marginBottom:20,fontSize:13.5,color:"var(--gd)",fontWeight:500}}>📋 Your assessment: {secs[sel]}</div>}
      <Btn loading={loading} onClick={save} disabled={!sel}>Confirm Track & Continue →</Btn>
    </div>
  );
}

function PaymentStep({ user, onUnlock, toast }) {
  const [phone, setPhone] = useState("254712345678");
  const [amount, setAmount] = useState("1500");
  const [method, setMethod] = useState("mpesa");
  const [phase, setPhase] = useState("idle");
  const pay = async () => {
    const cfg=(await db.get(K.CF))||SEED.cfg; const amt=Number(amount);
    if (amt<cfg.assessment_fee_min||amt>cfg.assessment_fee_max) return toast(`Amount must be KES ${cfg.assessment_fee_min}–${cfg.assessment_fee_max}`,"error");
    if (method==="mpesa"&&!phone) return toast("Phone number required","error");
    setPhase("stk"); await new Promise(r=>setTimeout(r,2000));
    setPhase("confirming"); await new Promise(r=>setTimeout(r,1500));
    const ref=`${method.toUpperCase()}-${Date.now()}`;
    const users=(await db.get(K.U))||[]; const i=users.findIndex(u=>u.id===user.id);
    if (i!==-1) { users[i]={...users[i],assessment_unlocked:true,updated_at:now()}; await db.set(K.U,users); }
    const ws=(await db.get(K.W))||[]; const w=ws.find(x=>x.user_id===user.id);
    if (w) await db.push(K.TX,{id:uid(),wallet_id:w.id,type:"assessment_fee",entry_type:"debit",amount:amt,currency:"KES",status:"completed",reference:ref,meta:{phone},created_at:now()});
    await createNotif(1,"payment.assessment","Assessment fee received",`${user.name} paid KES ${amt} via ${method.toUpperCase()} (${ref})`);
    await auditLog(user.id,"payment.assessment",`Assessment fee: KES ${amt}`);
    await sendEmail(user.id,"Assessment Unlocked!","Your assessment is now unlocked. You have 2 hours once started. Good luck!");
    setPhase("done");
    setTimeout(()=>onUnlock({...user,assessment_unlocked:true,fs:"ASSESSMENT_PENDING"}),800);
  };
  if (phase==="done") return (<div style={{textAlign:"center",maxWidth:400}}><div style={{fontSize:64,marginBottom:16}} className="bi">✅</div><h3 style={{fontFamily:"var(--fh)",fontSize:22}}>Payment Confirmed!</h3><p style={{color:"var(--sub)",marginTop:8}}>Launching assessment…</p></div>);
  return (
    <div style={{width:"100%",maxWidth:460}} className="au">
      <h2 style={{fontFamily:"var(--fh)",fontSize:30,fontWeight:800,marginBottom:8}}>Unlock Assessment</h2>
      <p style={{color:"var(--sub)",marginBottom:28}}>One-time payment to access your track-based skills assessment.</p>
      <Card style={{padding:28}}>
        {phase==="idle"?(
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"var(--gl)",border:"1px solid rgba(0,212,160,.2)",borderRadius:10,padding:"14px 18px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:13,fontWeight:600,color:"var(--gd)"}}>Assessment Fee</div><div style={{fontSize:12,color:"var(--gd)",opacity:.7}}>One-time · Includes expert review</div></div>
              <div style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:22,color:"var(--gd)"}}>KES 1,000–2,000</div>
            </div>
            <Sel label="Payment Method" value={method} onChange={setMethod} options={[{value:"mpesa",label:"M-Pesa (STK Push)"},{value:"stripe",label:"Stripe (Card)"}]}/>
            {method==="mpesa"&&<Inp label="M-Pesa Phone" value={phone} onChange={setPhone} placeholder="254712345678"/>}
            <Inp label="Amount (KES)" type="number" value={amount} onChange={setAmount} placeholder="1500" hint="Between KES 1,000 and 2,000"/>
            <div style={{background:"#FFFBEB",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#92400E"}}>📱 {method==="mpesa"?"You'll receive a push notification on your phone.":"Your card will be charged securely."}</div>
            <Btn onClick={pay} style={{width:"100%",justifyContent:"center"}}>Pay & Unlock Assessment →</Btn>
          </div>
        ):(
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <Spinner size={40}/>
            <h3 style={{fontFamily:"var(--fh)",fontSize:20,marginTop:20,marginBottom:8}}>{phase==="stk"?"STK Push Sent…":"Confirming Payment…"}</h3>
            <p style={{color:"var(--sub)",fontSize:14}}>{phase==="stk"?"Check your phone for the M-Pesa prompt":"Verifying your transaction…"}</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function ReviewStatus({ user }) {
  const deadline=user.review_deadline?new Date(user.review_deadline):new Date(Date.now()+15*86400000);
  const daysLeft=Math.max(0,Math.ceil((deadline-Date.now())/86400000));
  return (
    <div style={{textAlign:"center",maxWidth:520}} className="au">
      <div style={{width:90,height:90,background:"var(--gl)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",fontSize:40}}>🔍</div>
      <h2 style={{fontFamily:"var(--fh)",fontSize:30,fontWeight:800,marginBottom:12}}>Under Expert Review</h2>
      <p style={{color:"var(--sub)",lineHeight:1.75,marginBottom:28,fontSize:15}}>Our team is reviewing your profile and assessment. You'll be notified instantly when a decision is made.</p>
      <Card style={{padding:24,textAlign:"left"}}>
        {[["Status","UNDER_REVIEW",true],user.track&&["Track",TRACKS[user.track]?.label,false],user.assessment_pct!==undefined&&["Assessment Score",`${user.assessment_pct}%`,false],["Queue Position",user.queue_pos?`#${user.queue_pos}`:"—",false],["Review Deadline",deadline.toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"}),false],["Days Remaining",`${daysLeft} business days`,false]].filter(Boolean).map(([label,value,isBdg])=>(
          <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--bdr)"}}>
            <span style={{color:"var(--sub)",fontSize:14}}>{label}</span>
            {isBdg?<Bdg status={value}/>:<span style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:15}}>{value}</span>}
          </div>
        ))}
      </Card>
    </div>
  );
}

function StatusPage({ user }) {
  return (
    <div style={{minHeight:"100vh",background:"var(--surf)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{textAlign:"center",maxWidth:460}}>
        <div style={{fontSize:64,marginBottom:20}}>{user.fs==="REJECTED"?"❌":"⏸"}</div>
        <h2 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800,marginBottom:12}}>{user.fs==="REJECTED"?"Application Not Approved":"Account Suspended"}</h2>
        {user.rejection_reason&&<Card style={{padding:18,background:"#FEF2F2",border:"1px solid #FECACA",textAlign:"left",marginBottom:16}}><strong style={{color:"#991B1B",fontSize:13}}>Reason:</strong><p style={{color:"#991B1B",marginTop:4,fontSize:14}}>{user.rejection_reason}</p></Card>}
        <p style={{color:"var(--sub)",fontSize:14}}>Contact <a href="mailto:support@afrigig.com" style={{color:"var(--g)"}}>support@afrigig.com</a> if you believe this was an error.</p>
      </div>
    </div>
  );
}


// ─── ASSESSMENT FLOW ──────────────────────────────────────────
function AssessmentFlow({ user, onComplete, toast }) {
  const track=TRACKS[user.track]||TRACKS.software;
  const [phase, setPhase] = useState("intro");
  const [coreAns, setCoreAns] = useState({});
  const [techAns, setTechAns] = useState({});
  const [coreQ, setCoreQ] = useState(0);
  const [techQ, setTechQ] = useState(0);
  const [codeTab, setCodeTab] = useState(0);
  const [lang, setLang] = useState("javascript");
  const [solutions, setSolutions] = useState({});
  const [runResults, setRunResults] = useState({});
  const [running, setRunning] = useState(false);
  const [sqlAns, setSqlAns] = useState(SQL_CHALLENGE.starter);
  const startRef = useRef(Date.now());
  const timer = useTimer(7200, ()=>{toast("⏰ Time expired — auto-submitting…","warn");submitAll();});
  const techQs = TECH_QS[user.track]||TECH_QS.software;
  const hasCoding = ["software","devops"].includes(user.track);
  const hasSql = user.track==="data";
  const hasSpecial = hasCoding||hasSql;

  const submitAll = useCallback(async () => {
    setPhase("done");
    let score=0, total=0;
    CORE_QS.forEach(q=>{total+=q.pts;if(coreAns[q.id]===q.correct)score+=q.pts;});
    techQs.forEach(q=>{total+=q.pts;if(techAns[q.id]===q.correct)score+=q.pts;});
    if(hasCoding) CODING_CHALLENGES.forEach(ch=>{total+=ch.maxPts;score+=runResults[ch.id]||0;});
    if(hasSql){total+=SQL_CHALLENGE.maxPts;if(sqlAns.length>200)score+=Math.floor(SQL_CHALLENGE.maxPts*.8);}
    const pct=Math.round((score/total)*100);
    const cfg=(await db.get(K.CF))||SEED.cfg;
    const users=(await db.get(K.U))||[];
    const inReview=users.filter(u=>["UNDER_REVIEW","ASSESSMENT_SUBMITTED"].includes(u.fs)).length;
    const reviewDl=new Date(Date.now()+cfg.review_days*86400000).toISOString();
    const i=users.findIndex(u=>u.id===user.id);
    if(i!==-1){users[i]={...users[i],assessment_score:score,assessment_max:total,assessment_pct:pct,assessment_submitted_at:now(),fs:"UNDER_REVIEW",queue_pos:inReview+1,review_deadline:reviewDl,updated_at:now()};await db.set(K.U,users);}
    await createNotif(1,"assessment.submitted","New assessment submitted",`${user.name} scored ${pct}% — Track: ${track.label} — Queue #${inReview+1}`);
    await createNotif(user.id,"review.started","Under review!",`Assessment complete (${pct}%). Our team will review by ${new Date(reviewDl).toLocaleDateString()}.`);
    await sendEmail(user.id,"Assessment Submitted",`Your assessment scored ${pct}%. Review deadline: ${new Date(reviewDl).toLocaleDateString()}.`);
    await auditLog(user.id,"assessment.submit",`Assessment submitted: ${pct}% (${score}/${total})`);
    onComplete({...user,fs:"UNDER_REVIEW",assessment_pct:pct,queue_pos:inReview+1});
  },[coreAns,techAns,runResults,sqlAns,user,track,techQs,hasCoding,hasSql]);

  const simulateRun = async (cid) => {
    setRunning(true); await new Promise(r=>setTimeout(r,1500));
    const pts=[0,10,20,30][Math.floor(Math.random()*4)];
    setRunResults(r=>({...r,[cid]:pts}));
    toast(`Test run: ${pts}/${CODING_CHALLENGES.find(c=>c.id===cid)?.maxPts||30} pts`,pts>0?"success":"error");
    setRunning(false);
  };

  if (phase==="done") return (<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{textAlign:"center"}} className="bi"><div style={{fontSize:72,marginBottom:20}}>🎉</div><h2 style={{fontFamily:"var(--fh)",fontSize:30,fontWeight:800}}>Assessment Submitted!</h2><p style={{color:"var(--sub)",marginTop:12,fontSize:16}}>You'll receive a notification when reviewed.</p></div></div>);

  if (phase==="intro") return (
    <div style={{minHeight:"100vh",background:"var(--surf)",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div style={{maxWidth:580,width:"100%"}} className="au">
        <Card style={{padding:34}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
            <div style={{fontSize:40}}>{track.icon}</div>
            <div><h2 style={{fontFamily:"var(--fh)",fontSize:24,fontWeight:800}}>{track.label} Assessment</h2><p style={{color:"var(--sub)",fontSize:14}}>AfriGig Elite Track · One attempt only</p></div>
          </div>
          {[["⏱","2 hours total","Timer starts when you click Begin. Auto-submits on expiry."],["📝",`Core Behavioural (${CORE_QS.length} questions)`,"Communication, problem solving, time management, ethics."],["🎯",`Track MCQ (${techQs.length} questions)`,`${track.label}-specific technical knowledge.`],hasCoding&&["💻","2 Coding Challenges","Real coding problems with test-case execution. Language of your choice."],hasSql&&["🗃️","SQL Challenge","Write a query against a provided schema."]].filter(Boolean).map(([icon,title,desc])=>(
            <div key={title} style={{display:"flex",gap:14,padding:"12px 16px",background:"var(--surf)",borderRadius:8,marginBottom:10}}>
              <span style={{fontSize:20,flexShrink:0}}>{icon}</span>
              <div><div style={{fontWeight:600,fontSize:14}}>{title}</div><div style={{fontSize:13,color:"var(--sub)",marginTop:2}}>{desc}</div></div>
            </div>
          ))}
          <div style={{padding:"11px 16px",background:"#FFFBEB",borderRadius:8,fontSize:13,color:"#92400E",margin:"16px 0"}}>⚠️ Do not refresh once started. Your timer is tracked server-side.</div>
          <Btn onClick={()=>{setPhase("core");timer.start();}} style={{width:"100%",justifyContent:"center"}}>Begin Assessment →</Btn>
        </Card>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"var(--surf)",display:"flex",flexDirection:"column"}}>
      <div style={{background:"var(--navy)",padding:"0 24px",height:56,display:"flex",alignItems:"center",gap:20,flexShrink:0}}>
        <div style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:16,color:"#fff"}}>AfriGig Assessment — {track.label}</div>
        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:18}}>
          {[["Core","core"],["Technical","technical"],hasSpecial&&["Coding","coding"]].filter(Boolean).map(([label,key])=>(
            <div key={key} onClick={()=>setPhase(key)} style={{cursor:"pointer"}}><span style={{fontSize:13,fontWeight:600,color:phase===key?"var(--g)":"rgba(255,255,255,.4)"}}>{label}</span></div>
          ))}
        </div>
        <div style={{fontFamily:"var(--fm)",fontSize:22,fontWeight:700,color:timer.critical?"#EF4444":timer.warn?"#F59E0B":"var(--g)"}} className={timer.critical?"tw":""}>{timer.fmt}</div>
      </div>
      <div style={{flex:1,padding:24,overflowY:"auto"}}>
        {phase==="core"&&<MCQSection qs={CORE_QS} ans={coreAns} setAns={setCoreAns} curr={coreQ} setCurr={setCoreQ} title="Core Behavioural Assessment" onNext={()=>setPhase("technical")} nextLabel="Continue to Technical →"/>}
        {phase==="technical"&&<MCQSection qs={techQs} ans={techAns} setAns={setTechAns} curr={techQ} setCurr={setTechQ} title={`${track.label} — Technical Questions`} onNext={()=>hasSpecial?setPhase("coding"):submitAll()} nextLabel={hasSpecial?"Continue to Coding →":"Submit Assessment ✓"} onBack={()=>setPhase("core")}/>}
        {phase==="coding"&&(
          <div className="au" style={{maxWidth:1100,margin:"0 auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h2 style={{fontFamily:"var(--fh)",fontSize:22,fontWeight:800}}>Coding {hasSql?"& SQL ":""}Challenges</h2>
              <div style={{display:"flex",gap:8}}><Btn variant="ghost" onClick={()=>setPhase("technical")}>← Back</Btn><Btn onClick={submitAll}>Submit All ✓</Btn></div>
            </div>
            {hasCoding&&(
              <>
                <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
                  {CODING_CHALLENGES.map((ch,i)=><button key={ch.id} className={`btn ${codeTab===i?"bdk":"bg2"} bsm`} onClick={()=>setCodeTab(i)}>{i+1}. {ch.title}</button>)}
                  <Sel label="" value={lang} onChange={setLang} options={[{value:"javascript",label:"JavaScript"},{value:"python",label:"Python"}]}/>
                </div>
                {CODING_CHALLENGES.map((ch,i)=>codeTab===i&&<CodingWidget key={ch.id} challenge={ch} lang={lang} value={solutions[ch.id]??ch.starter[lang]??""} onChange={v=>setSolutions(s=>({...s,[ch.id]:v}))} onRun={()=>simulateRun(ch.id)} running={running} result={runResults[ch.id]}/>)}
              </>
            )}
            {hasSql&&(
              <Card style={{padding:0,overflow:"hidden",marginTop:hasCoding?24:0}}>
                <div style={{padding:"14px 20px",borderBottom:"1px solid var(--bdr)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16}}>SQL Challenge</h3>
                  <Bdg status="holding" label={`Max ${SQL_CHALLENGE.maxPts} pts`}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr"}}>
                  <div style={{padding:20,background:"var(--surf)",borderRight:"1px solid var(--bdr)"}}><div style={{fontSize:13.5,color:"var(--mu)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{SQL_CHALLENGE.description}</div></div>
                  <div style={{padding:16,background:"#0F172A"}}><textarea className="code-ed" value={sqlAns} onChange={e=>setSqlAns(e.target.value)} rows={18} style={{border:"none",borderRadius:0}}/></div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MCQSection({ qs, ans, setAns, curr, setCurr, title, onNext, nextLabel, onBack }) {
  if (!qs.length) return <div style={{maxWidth:640}}><Card style={{padding:32}}><Empty icon="📋" title="No questions" sub="Continue to next section"/><div style={{textAlign:"center",marginTop:16}}><Btn onClick={onNext}>{nextLabel}</Btn></div></Card></div>;
  const q=qs[curr];
  return (
    <div style={{maxWidth:700,margin:"0 auto"}} className="au">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><h2 style={{fontFamily:"var(--fh)",fontSize:22,fontWeight:800}}>{title}</h2><p style={{color:"var(--sub)",fontSize:14,marginTop:2}}>Question {curr+1} of {qs.length}</p></div>
        <div style={{textAlign:"right"}}><div style={{fontSize:13,color:"var(--sub)",marginBottom:4}}>{Object.keys(ans).length}/{qs.length} answered</div><div className="pb" style={{width:120}}><div className="pf" style={{width:`${(Object.keys(ans).length/qs.length)*100}%`}}/></div></div>
      </div>
      <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:16}}>
        {qs.map((_,i)=><div key={i} onClick={()=>setCurr(i)} style={{width:30,height:30,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,cursor:"pointer",background:ans[qs[i].id]!==undefined?"var(--g)":i===curr?"var(--navy)":"var(--surf)",color:ans[qs[i].id]!==undefined||i===curr?"#fff":"var(--sub)",border:"1px solid var(--bdr)",transition:"all .15s"}}>{i+1}</div>)}
      </div>
      <Card style={{padding:28}}>
        <div style={{marginBottom:10}}><span className="tag tg">{q.cat} · {q.pts} pts</span></div>
        <h3 style={{fontFamily:"var(--fh)",fontSize:18,fontWeight:700,marginBottom:22,lineHeight:1.45}}>{q.q}</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {q.opts.map((opt,i)=>{
            const sel=ans[q.id]===i;
            return (
              <div key={i} onClick={()=>setAns(a=>({...a,[q.id]:i}))} style={{padding:"12px 16px",borderRadius:10,border:`2px solid ${sel?"var(--g)":"var(--bdr)"}`,background:sel?"var(--gl)":"#fff",cursor:"pointer",transition:"all .15s",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:20,height:20,borderRadius:"50%",border:`2px solid ${sel?"var(--g)":"var(--bdr)"}`,background:sel?"var(--g)":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{sel&&<div style={{width:7,height:7,background:"#fff",borderRadius:"50%"}}/>}</div>
                <span style={{fontSize:14,color:sel?"var(--gd)":"var(--navy)",fontWeight:sel?600:400}}>{opt}</span>
              </div>
            );
          })}
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:22}}>
          <div style={{display:"flex",gap:8}}>
            {onBack&&curr===0&&<Btn variant="ghost" onClick={onBack}>← Back</Btn>}
            {curr>0&&<Btn variant="ghost" onClick={()=>setCurr(c=>c-1)}>← Prev</Btn>}
          </div>
          {curr<qs.length-1?<Btn onClick={()=>setCurr(c=>c+1)}>Next →</Btn>:<Btn onClick={onNext}>{nextLabel}</Btn>}
        </div>
      </Card>
    </div>
  );
}

function CodingWidget({ challenge, lang, value, onChange, onRun, running, result }) {
  return (
    <Card style={{padding:0,overflow:"hidden",marginBottom:20}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",height:520}}>
        <div style={{padding:22,borderRight:"1px solid var(--bdr)",overflowY:"auto",background:"var(--surf)"}}>
          <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:16}}>
            <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:17}}>{challenge.title}</h3>
            <Bdg status="UNDER_REVIEW" label={challenge.difficulty}/>
          </div>
          <div style={{fontSize:13.5,color:"var(--mu)",lineHeight:1.8,whiteSpace:"pre-wrap"}}>{challenge.description}</div>
          <div style={{marginTop:18}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--sub)",textTransform:"uppercase",marginBottom:8}}>Test Cases</div>
            {challenge.tests.map((t,i)=>(
              <div key={i} style={{padding:"7px 12px",background:"#fff",border:"1px solid var(--bdr)",borderRadius:6,marginBottom:6,fontFamily:"var(--fm)",fontSize:12}}>
                <span style={{color:"var(--sub)"}}>In: </span><span>{t.input}</span><span style={{color:"var(--sub)",margin:"0 8px"}}>→</span><span style={{color:"var(--gd)",fontWeight:700}}>{t.expected}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:14,padding:"10px 14px",background:"#FFFBEB",borderRadius:8,fontSize:12.5,color:"#92400E"}}>⏱ {challenge.timeLimit} min · Max {challenge.maxPts} pts</div>
        </div>
        <div style={{display:"flex",flexDirection:"column",background:"#0F172A"}}>
          <div style={{padding:"10px 14px",borderBottom:"1px solid #1E293B",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontFamily:"var(--fm)",fontSize:12,color:"#64748B"}}>solution.{lang==="python"?"py":"js"}</span>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              {result!==undefined&&<span style={{fontFamily:"var(--fm)",fontSize:12,color:result>0?"var(--g)":"var(--err)",fontWeight:700}}>Score: {result}/{challenge.maxPts}</span>}
              <Btn onClick={onRun} loading={running} size="sm" style={{background:"#10B981",color:"#fff",fontSize:12}}>▶ Run</Btn>
            </div>
          </div>
          <textarea className="code-ed" value={value} onChange={e=>onChange(e.target.value)} style={{flex:1,border:"none",borderRadius:0,padding:16,resize:"none"}}/>
        </div>
      </div>
    </Card>
  );
}

// ─── DASHBOARD COUNTS ─────────────────────────────────────────
function useDashCounts() {
  const [counts, setCounts] = useState({});
  useEffect(() => {
    const load = async () => {
      const [users,tickets]=await Promise.all([db.get(K.U),db.get(K.T)]);
      const frs=(users||[]).filter(u=>u.role==="freelancer");
      setCounts({new_reg:frs.filter(u=>["REGISTERED","PROFILE_COMPLETED"].includes(u.fs)).length,under_review:frs.filter(u=>u.fs==="UNDER_REVIEW").length,open_tickets:(tickets||[]).filter(t=>t.status==="open").length});
    };
    load(); const t=setInterval(load,5000); return ()=>clearInterval(t);
  },[]);
  return counts;
}


// ─── ADMIN APP ────────────────────────────────────────────────
function AdminApp({ user, view, onNav, toast, notifs, unread, markRead, markAllRead }) {
  const counts=useDashCounts();
  const titles={dashboard:"Dashboard",registrations:"New Registrations",reviews:"FR Reviews",users:"All Users",jobs:"Job Management",payments:"Payments & Escrow",messages:"Messages",tickets:"Support Tickets",emails:"Email Log",reports:"Analytics",audit:"Audit Log",settings:"Platform Settings"};
  const views={
    dashboard:<AdminOverview onNav={onNav}/>,
    registrations:<NewRegistrations/>,
    reviews:<FRReviews toast={toast}/>,
    users:<AllUsers toast={toast}/>,
    jobs:<JobsAdmin toast={toast}/>,
    payments:<PaymentsAdmin toast={toast}/>,
    messages:<MessagesView user={user} toast={toast}/>,
    tickets:<TicketsView user={user} toast={toast}/>,
    emails:<EmailLog/>,
    reports:<Reports/>,
    audit:<AuditLog/>,
    settings:<PlatformSettings toast={toast}/>,
  };
  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar role="admin" active={view} onNav={onNav} user={user} onLogout={()=>{localStorage.removeItem("ag3_token");window.location.hash="/";window.location.reload();}} unread={unread} counts={counts}/>
      <div style={{marginLeft:244,flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <Topbar user={user} unread={unread} notifs={notifs} onMarkRead={markRead} onMarkAll={markAllRead} title={titles[view]||"Dashboard"}/>
        <div key={view} style={{flex:1,padding:"26px 28px",overflowY:"auto"}} className="au">{views[view]||views.dashboard}</div>
      </div>
    </div>
  );
}

function AdminOverview({ onNav }) {
  const [data,setData]=useState(null);
  useEffect(()=>{const load=async()=>{const [users,jobs,tickets,escrows]=await Promise.all([db.get(K.U),db.get(K.J),db.get(K.T),db.get(K.E)]);const frs=(users||[]).filter(u=>u.role==="freelancer");setData({frs,jobs:jobs||[],tickets:tickets||[],escrows:escrows||[]});};load();},[]);
  const months=["Aug","Sep","Oct","Nov","Dec","Jan","Feb"];
  const barData=[32,45,38,52,61,47,58];const max=Math.max(...barData);
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Admin Dashboard</h1><p style={{color:"var(--sub)",marginTop:4}}>Live platform overview.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}} className="stagger">
        <Stat label="Under Review" value={data?data.frs.filter(u=>u.fs==="UNDER_REVIEW").length:"…"} icon="🔍" color="var(--pur)" loading={!data}/>
        <Stat label="New Registrations" value={data?data.frs.filter(u=>["REGISTERED","PROFILE_COMPLETED"].includes(u.fs)).length:"…"} icon="🆕" color="var(--info)" loading={!data}/>
        <Stat label="Approved Freelancers" value={data?data.frs.filter(u=>u.fs==="APPROVED").length:"…"} icon="✅" color="var(--g)" loading={!data}/>
        <Stat label="Escrow Held" value={data?fmtKES(data.escrows.filter(e=>e.status==="holding").reduce((s,e)=>s+e.amount,0)):"…"} icon="🔒" color="var(--warn)" loading={!data}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20,marginBottom:20}}>
        <Card style={{padding:24}}>
          <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16,marginBottom:20}}>Applications — Last 7 Months</h3>
          <div style={{display:"flex",alignItems:"flex-end",gap:10,height:130}}>
            {barData.map((v,i)=>(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"var(--sub)"}}>{v}</span><div style={{width:"100%",borderRadius:"4px 4px 0 0",background:"linear-gradient(180deg,var(--g),var(--gd))",height:`${(v/max)*100}%`}}/><span style={{fontSize:10,color:"var(--sub)"}}>{months[i]}</span></div>))}
          </div>
        </Card>
        <Card style={{padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16}}>Review Queue</h3><Btn variant="outline" size="sm" onClick={()=>onNav("reviews")}>View All</Btn></div>
          {!data?<Spinner/>:data.frs.filter(u=>u.fs==="UNDER_REVIEW").slice(0,4).map(u=>(<div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid var(--bdr)"}}><Avatar name={u.name} online={u.is_online} size={30}/><div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:600}}>{u.name}</div><div style={{fontSize:11,color:"var(--sub)"}}>{u.assessment_pct}% · {u.country}</div></div><span style={{fontSize:11,fontWeight:800,color:"var(--pur)"}}>#{u.queue_pos}</span></div>))}
        </Card>
      </div>
      <Card style={{padding:24}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:16}}><h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16}}>Recent Jobs</h3><Btn variant="outline" size="sm" onClick={()=>onNav("jobs")}>Manage</Btn></div>
        {!data?<Spinner/>:<table><thead><tr><th>Job</th><th>Status</th><th>Budget</th><th>Apps</th><th>Created</th></tr></thead><tbody>{data.jobs.slice(0,5).map(j=>(<tr key={j.id}><td><div style={{fontWeight:600}}>{j.title}</div><div style={{fontSize:11,color:"var(--sub)"}}>{j.category}</div></td><td><Bdg status={j.status}/></td><td style={{fontFamily:"var(--fh)",fontWeight:700}}>{fmtKES(j.budget_max)}</td><td>{j.apps_count||0}</td><td style={{color:"var(--sub)",fontSize:13}}>{fmtDate(j.created_at)}</td></tr>))}</tbody></table>}
      </Card>
    </div>
  );
}

function NewRegistrations() {
  const [users,setUsers]=useState([]);const [filter,setFilter]=useState("all");const [search,setSearch]=useState("");const [loading,setLoading]=useState(true);
  const load=()=>db.get(K.U).then(u=>{setUsers((u||[]).filter(x=>x.role==="freelancer"));setLoading(false);});
  useEffect(()=>{load();const t=setInterval(load,5000);return()=>clearInterval(t);},[]);
  const filtered=useMemo(()=>{let r=users;if(filter==="new")r=r.filter(u=>["REGISTERED","PROFILE_COMPLETED"].includes(u.fs));else if(filter==="assessment")r=r.filter(u=>u.fs==="ASSESSMENT_PENDING");else if(filter==="review")r=r.filter(u=>u.fs==="UNDER_REVIEW");else if(filter==="approved")r=r.filter(u=>u.fs==="APPROVED");else if(filter==="rejected")r=r.filter(u=>["REJECTED","SUSPENDED"].includes(u.fs));if(search)r=r.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));return r.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));},[users,filter,search]);
  const cnt=k=>{if(k==="all")return users.length;if(k==="new")return users.filter(u=>["REGISTERED","PROFILE_COMPLETED"].includes(u.fs)).length;if(k==="assessment")return users.filter(u=>u.fs==="ASSESSMENT_PENDING").length;if(k==="review")return users.filter(u=>u.fs==="UNDER_REVIEW").length;if(k==="approved")return users.filter(u=>u.fs==="APPROVED").length;return users.filter(u=>["REJECTED","SUSPENDED"].includes(u.fs)).length;};
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Freelancer Registrations</h1></div>
      <Card style={{padding:"14px 20px",marginBottom:16}}><div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"}}><input className="inp" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search…" style={{maxWidth:260,flex:1}}/>{[["all","All"],["new","New"],["assessment","Assessment"],["review","Under Review"],["approved","Approved"],["rejected","Rejected"]].map(([k,l])=><button key={k} className={`btn ${filter===k?"bp":"bg2"} bsm`} onClick={()=>setFilter(k)}>{l} ({cnt(k)})</button>)}</div></Card>
      {loading?<Card style={{padding:40}}><Spinner/></Card>:<Card style={{padding:0,overflow:"hidden"}}>{filtered.length===0?<Empty icon="📭" title="No results" sub="Try a different filter"/>:<table><thead><tr><th>Freelancer</th><th>Track</th><th>Status</th><th>Score</th><th>Country</th><th>Registered</th></tr></thead><tbody>{filtered.map(u=>(<tr key={u.id}><td><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={u.name} online={u.is_online} size={32}/><div><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:12,color:"var(--sub)"}}>{u.email}</div></div></div></td><td>{u.track?<span className="tag tg">{TRACKS[u.track]?.icon} {TRACKS[u.track]?.label}</span>:<span style={{color:"var(--sub)",fontSize:13}}>—</span>}</td><td><Bdg status={u.fs}/></td><td style={{fontFamily:"var(--fh)",fontWeight:700,color:u.assessment_pct>=60?"var(--gd)":u.assessment_pct?"var(--err)":"var(--sub)"}}>{u.assessment_pct!==undefined?`${u.assessment_pct}%`:"—"}</td><td style={{color:"var(--sub)"}}>{u.country||"—"}</td><td style={{color:"var(--sub)",fontSize:13}}>{fmtDate(u.created_at)}</td></tr>))}</tbody></table>}</Card>}
    </div>
  );
}

function FRReviews({ toast }) {
  const [queue,setQueue]=useState([]);const [sel,setSel]=useState(null);const [loading,setLoading]=useState(true);const [acting,setActing]=useState("");const [rejectModal,setRejectModal]=useState(false);const [reason,setReason]=useState("");const [aiResult,setAiResult]=useState(null);const [aiLoading,setAiLoading]=useState(false);
  const load=async()=>{const us=(await db.get(K.U))||[];setQueue(us.filter(u=>u.fs==="UNDER_REVIEW").sort((a,b)=>new Date(a.assessment_submitted_at)-new Date(b.assessment_submitted_at)));setLoading(false);};
  useEffect(()=>{load();},[]);
  const selUser=sel?queue.find(u=>u.id===sel):null;
  const doAction=async action=>{
    if(action==="reject"){setRejectModal(true);return;}
    setActing(action);
    const patch=action==="approve"?{fs:"APPROVED",status:"active",approved_at:now()}:{fs:"SUSPENDED",status:"suspended"};
    await db.patch(K.U,sel,patch);
    const msgs={approve:`🎉 Congratulations ${selUser?.name}! Your AfriGig application has been approved. Start browsing jobs!`,suspend:"Your account has been suspended. Contact support@afrigig.com."};
    await createNotif(sel,`review.${action}`,`Application ${action}d`,msgs[action]);
    await sendEmail(sel,action==="approve"?"You're Approved! 🎉":"Account Update",msgs[action]);
    await auditLog(1,`review.${action}`,`${action}d freelancer #${sel}: ${selUser?.name}`);
    toast(`${selUser?.name} ${action}d`,action==="approve"?"success":"info");
    setActing("");setSel(null);setAiResult(null);load();
  };
  const doReject=async()=>{
    if(!reason.trim()) return toast("Rejection reason required","error");
    setActing("reject");
    await db.patch(K.U,sel,{fs:"REJECTED",status:"banned",rejection_reason:reason});
    await createNotif(sel,"review.rejected","Application not approved",`Reason: ${reason}`);
    await sendEmail(sel,"Application Update",`Your application was not approved. Reason: ${reason}.`);
    await auditLog(1,"review.reject",`Rejected #${sel}: ${reason}`);
    toast(`${selUser?.name} rejected`,"info");
    setActing("");setRejectModal(false);setReason("");setSel(null);setAiResult(null);load();
  };
  const runAI=async()=>{
    if(!selUser) return;setAiLoading(true);setAiResult(null);
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:900,system:`You are a senior talent reviewer at AfriGig. Respond ONLY with JSON: {"recommendation":"APPROVE"|"REJECT"|"REVIEW_FURTHER","score":0-100,"strengths":["..."],"concerns":["..."],"summary":"...","flags":["..."]}`,messages:[{role:"user",content:`Review:\nName: ${selUser.name}\nCountry: ${selUser.country}\nTrack: ${TRACKS[selUser.track]?.label||selUser.track}\nSkills: ${selUser.skills}\nExperience: ${selUser.experience}\nBio: ${selUser.bio||"N/A"}\nPortfolio: ${selUser.portfolio_links||"N/A"}\nAssessment: ${selUser.assessment_pct}%\nAvailability: ${selUser.availability}`}]})});const d=await res.json();setAiResult(JSON.parse((d.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim()));}catch(e){setAiResult({error:e.message});}
    setAiLoading(false);
  };
  return (
    <div>
      {rejectModal&&(<div className="overlay" onClick={()=>setRejectModal(false)}><div className="modal" style={{maxWidth:480,padding:32}} onClick={e=>e.stopPropagation()}><h3 style={{fontFamily:"var(--fh)",fontSize:20,fontWeight:700,marginBottom:20}}>Reject Application</h3><Inp label="Rejection Reason" value={reason} onChange={setReason} placeholder="Clear, professional reason…" rows={4} required/><div style={{display:"flex",gap:10,marginTop:20}}><Btn variant="danger" loading={acting==="reject"} onClick={doReject}>Confirm Rejection</Btn><Btn variant="ghost" onClick={()=>setRejectModal(false)}>Cancel</Btn></div></div></div>)}
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Review Queue</h1><p style={{color:"var(--sub)",marginTop:4}}>{queue.length} awaiting review · FIFO order</p></div>
      <div style={{display:"grid",gridTemplateColumns:"310px 1fr",gap:20}}>
        <Card style={{padding:0,overflow:"hidden",maxHeight:640,overflowY:"auto"}}>
          {loading?<div style={{padding:40}}><Spinner/></div>:queue.length===0?<Empty icon="✅" title="Queue empty" sub="All reviewed"/>:queue.map(u=>(
            <div key={u.id} onClick={()=>{setSel(u.id);setAiResult(null);}} style={{padding:"14px 18px",borderBottom:"1px solid var(--bdr)",cursor:"pointer",background:sel===u.id?"var(--gl)":"#fff"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={u.name} online={u.is_online} size={36}/><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontWeight:700,fontSize:14}}>{u.name}</span><span style={{fontSize:12,fontWeight:800,color:u.assessment_pct>=60?"var(--gd)":"var(--err)"}}>{u.assessment_pct}%</span></div><div style={{fontSize:12,color:"var(--sub)",marginTop:2}}>{u.country} · {TRACKS[u.track]?.label||"No track"}</div><div style={{fontSize:11,color:"var(--pur)",fontWeight:700,marginTop:4}}>#{u.queue_pos} · {fmtRel(u.assessment_submitted_at||u.created_at)}</div></div></div>
            </div>
          ))}
        </Card>
        {selUser?(
          <div className="as">
            <Card style={{padding:28,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
                <div style={{display:"flex",gap:14,alignItems:"center"}}><Avatar name={selUser.name} size={52} online={selUser.is_online}/><div><h2 style={{fontFamily:"var(--fh)",fontSize:22,fontWeight:800}}>{selUser.name}</h2><div style={{color:"var(--sub)",fontSize:13}}>{selUser.email} · {selUser.country}</div><div style={{display:"flex",gap:8,marginTop:7}}><Bdg status={selUser.fs}/>{selUser.track&&<span className="tag tg">{TRACKS[selUser.track]?.icon} {TRACKS[selUser.track]?.label}</span>}</div></div></div>
                {selUser.assessment_pct!==undefined&&<div style={{width:76,height:76,background:selUser.assessment_pct>=60?"var(--gl)":"#FEF2F2",borderRadius:"50%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",border:`3px solid ${selUser.assessment_pct>=60?"var(--g)":"var(--err)"}`,flexShrink:0}}><div style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:20,color:selUser.assessment_pct>=60?"var(--gd)":"var(--err)"}}>{selUser.assessment_pct}%</div><div style={{fontSize:10,color:"var(--sub)"}}>Score</div></div>}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
                {[["Skills",selUser.skills],["Experience",selUser.experience],["Availability",selUser.availability],["Portfolio",selUser.portfolio_links||"Not provided"],["Queue Pos",selUser.queue_pos?`#${selUser.queue_pos}`:"—"],["Submitted",selUser.assessment_submitted_at?fmtDate(selUser.assessment_submitted_at):"—"]].map(([l,v])=>(<div key={l} style={{padding:"10px 14px",background:"var(--surf)",borderRadius:8}}><div style={{fontSize:11,color:"var(--sub)",textTransform:"uppercase",letterSpacing:".05em",marginBottom:3}}>{l}</div><div style={{fontSize:13.5,fontWeight:500,wordBreak:"break-word"}}>{v||"—"}</div></div>))}
              </div>
              {selUser.bio&&<p style={{fontSize:14,color:"var(--mu)",lineHeight:1.7,marginBottom:20}}>{selUser.bio}</p>}
              <div style={{display:"flex",gap:10,paddingTop:20,borderTop:"1px solid var(--bdr)",flexWrap:"wrap"}}>
                <Btn loading={acting==="approve"} onClick={()=>doAction("approve")} icon="✓">Approve</Btn>
                <Btn variant="danger" onClick={()=>doAction("reject")} icon="✕">Reject</Btn>
                <Btn variant="ghost" loading={acting==="suspend"} onClick={()=>doAction("suspend")} icon="⏸">Suspend</Btn>
                <Btn variant="outline" loading={aiLoading} onClick={runAI} icon="🤖">AI Review</Btn>
              </div>
            </Card>
            {aiLoading&&<Card style={{padding:20}}><div style={{color:"var(--sub)",fontSize:13,marginBottom:10}}>Claude is analysing this profile…</div><div style={{display:"flex",gap:5}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,background:"var(--g)",borderRadius:"50%",animation:"pulse 1.2s ease infinite",animationDelay:`${i*.2}s`}}/>)}</div></Card>}
            {aiResult&&!aiLoading&&(<Card style={{padding:24}} className="au"><div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}><span style={{fontSize:20}}>🤖</span><h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16}}>AI Analysis (Claude)</h3>{aiResult.recommendation&&<Bdg status={aiResult.recommendation==="APPROVE"?"APPROVED":aiResult.recommendation==="REJECT"?"REJECTED":"UNDER_REVIEW"} label={aiResult.recommendation}/>}{aiResult.score!==undefined&&<span style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:18}}>{aiResult.score}/100</span>}</div>{aiResult.error&&<div style={{color:"var(--err)",fontSize:14}}>{aiResult.error}</div>}{aiResult.summary&&<p style={{fontSize:14,color:"var(--mu)",lineHeight:1.7,marginBottom:14}}>{aiResult.summary}</p>}{aiResult.strengths?.map((s,i)=><div key={i} style={{fontSize:13.5,color:"var(--mu)",marginBottom:4}}>✓ {s}</div>)}{aiResult.concerns?.map((c,i)=><div key={i} style={{fontSize:13.5,color:"var(--mu)",marginBottom:4}}>⚠ {c}</div>)}{aiResult.flags?.map((f,i)=><div key={i} style={{fontSize:13,color:"var(--warn)",marginBottom:4}}>🚩 {f}</div>)}</Card>)}
          </div>
        ):<Card style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:300}}><Empty icon="👆" title="Select a freelancer" sub="View profile and run AI analysis"/></Card>}
      </div>
    </div>
  );
}

function AllUsers({ toast }) {
  const [users,setUsers]=useState([]);const [search,setSearch]=useState("");const [rf,setRf]=useState("all");
  const load=async()=>setUsers((await db.get(K.U))||[]);
  useEffect(()=>{load();},[]);
  const filtered=useMemo(()=>{let r=users;if(rf!=="all")r=r.filter(u=>u.role===rf);if(search)r=r.filter(u=>u.name.toLowerCase().includes(search.toLowerCase())||u.email.toLowerCase().includes(search.toLowerCase()));return r.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));},[users,search,rf]);
  const toggle=async(id,action)=>{const map={suspend:{status:"suspended"},unsuspend:{status:"active"},ban:{status:"banned"}};await db.patch(K.U,id,map[action]);await auditLog(1,`user.${action}`,`${action}d user #${id}`);toast(`User ${action}d`,"success");load();};
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>All Users ({users.length})</h1></div>
      <Card style={{padding:"14px 20px",marginBottom:16}}><div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}><input className="inp" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name or email…" style={{flex:1,maxWidth:280}}/>{["all","admin","support","freelancer"].map(r=><button key={r} className={`btn ${rf===r?"bp":"bg2"} bsm`} onClick={()=>setRf(r)} style={{textTransform:"capitalize"}}>{r} ({users.filter(u=>r==="all"?true:u.role===r).length})</button>)}</div></Card>
      <Card style={{padding:0,overflow:"hidden"}}><table><thead><tr><th>User</th><th>Role</th><th>FR Status</th><th>Track</th><th>Account</th><th>Joined</th><th>Actions</th></tr></thead><tbody>{filtered.map(u=>(<tr key={u.id}><td><div style={{display:"flex",alignItems:"center",gap:10}}><Avatar name={u.name} online={u.is_online} size={30}/><div><div style={{fontWeight:600}}>{u.name}</div><div style={{fontSize:12,color:"var(--sub)"}}>{u.email}</div></div></div></td><td><span className={`tag ${u.role==="admin"?"tr":u.role==="support"?"tb":"tg"}`}>{u.role}</span></td><td>{u.fs?<Bdg status={u.fs}/>:<span style={{color:"var(--sub)"}}>—</span>}</td><td>{u.track?<span>{TRACKS[u.track]?.icon} {TRACKS[u.track]?.label}</span>:<span style={{color:"var(--sub)"}}>—</span>}</td><td><Bdg status={u.status}/></td><td style={{color:"var(--sub)",fontSize:13}}>{fmtDate(u.created_at)}</td><td>{u.status!=="suspended"&&u.role!=="admin"&&<Btn variant="ghost" size="sm" onClick={()=>toggle(u.id,"suspend")}>Suspend</Btn>}{u.status==="suspended"&&<Btn variant="outline" size="sm" onClick={()=>toggle(u.id,"unsuspend")}>Restore</Btn>}</td></tr>))}</tbody></table></Card>
    </div>
  );
}

function JobsAdmin({ toast }) {
  const [jobs,setJobs]=useState([]);const [showCreate,setShowCreate]=useState(false);const [form,setForm]=useState({title:"",description:"",category:"Web Development",budget_min:"",budget_max:"",duration_days:"",skills:""});const [saving,setSaving]=useState(false);const [aiGen,setAiGen]=useState(false);
  const load=async()=>setJobs((await db.get(K.J))||[]);
  useEffect(()=>{load();},[]);
  const create=async()=>{
    if(!form.title||!form.description||!form.budget_max) return toast("Title, description, and max budget required","error");
    setSaving(true);const job={id:uid(),...form,budget_min:Number(form.budget_min),budget_max:Number(form.budget_max),duration_days:Number(form.duration_days),skills:form.skills.split(",").map(s=>s.trim()).filter(Boolean),status:"open",payment_status:"unpaid",created_by:1,apps_count:0,progress:0,created_at:now(),updated_at:now()};
    await db.push(K.J,job);await auditLog(1,"job.create",`Created job: ${job.title}`);toast("Job posted!","success");setSaving(false);setShowCreate(false);setForm({title:"",description:"",category:"Web Development",budget_min:"",budget_max:"",duration_days:"",skills:""});load();
  };
  const genDesc=async()=>{
    if(!form.title) return toast("Enter a title first","error");
    setAiGen(true);
    try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,messages:[{role:"user",content:`Write a clear, professional job description for AfriGig (African freelancing platform) for: "${form.title}" in "${form.category}" with budget KES ${form.budget_max||"50,000+"}. Include deliverables and requirements. 150-200 words.`}]})});const d=await res.json();setForm(f=>({...f,description:d.content?.[0]?.text||""}));toast("AI description generated!","success");}catch{toast("AI generation failed","error");}
    setAiGen(false);
  };
  return (
    <div>
      {showCreate&&(<div className="overlay" onClick={()=>setShowCreate(false)}><div className="modal" style={{maxWidth:620,padding:32}} onClick={e=>e.stopPropagation()}><h3 style={{fontFamily:"var(--fh)",fontSize:20,fontWeight:700,marginBottom:22}}>Post New Job</h3><div style={{display:"flex",flexDirection:"column",gap:15}}><Inp label="Job Title" value={form.title} onChange={v=>setForm({...form,title:v})} required/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Min Budget (KES)" type="number" value={form.budget_min} onChange={v=>setForm({...form,budget_min:v})}/><Inp label="Max Budget (KES)" type="number" value={form.budget_max} onChange={v=>setForm({...form,budget_max:v})} required/><Sel label="Category" value={form.category} onChange={v=>setForm({...form,category:v})} options={["Web Development","Mobile","Backend","Data Engineering","UI/UX","DevOps","Technical Writing","Non-Technical"]}/><Inp label="Duration (days)" type="number" value={form.duration_days} onChange={v=>setForm({...form,duration_days:v})}/></div><Inp label="Required Skills (comma-separated)" value={form.skills} onChange={v=>setForm({...form,skills:v})} placeholder="React, TypeScript…"/><div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><label className="lbl lbl-r">Description</label><Btn variant="outline" size="sm" loading={aiGen} onClick={genDesc} icon="🤖">Generate with AI</Btn></div><Inp label="" value={form.description} onChange={v=>setForm({...form,description:v})} rows={6} placeholder="Detailed job description…" required/></div></div><div style={{display:"flex",gap:10,marginTop:22}}><Btn loading={saving} onClick={create}>Post Job</Btn><Btn variant="ghost" onClick={()=>setShowCreate(false)}>Cancel</Btn></div></div></div>)}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Job Management</h1><Btn onClick={()=>setShowCreate(true)} icon="+">Post New Job</Btn></div>
      <div style={{display:"flex",flexDirection:"column",gap:14}} className="stagger">
        {jobs.map(j=>(<Card key={j.id} style={{padding:22}}><div style={{display:"flex",justifyContent:"space-between",gap:16}}><div style={{flex:1}}><div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}><h3 style={{fontFamily:"var(--fh)",fontSize:16,fontWeight:700}}>{j.title}</h3><Bdg status={j.status}/><Bdg status={j.payment_status} label={j.payment_status==="escrow"?"In Escrow":undefined}/></div><p style={{fontSize:13.5,color:"var(--sub)",marginBottom:12,lineHeight:1.6}}>{j.description?.slice(0,120)}…</p><div style={{display:"flex",gap:16,fontSize:13,color:"var(--mu)",flexWrap:"wrap"}}><span>💰 {fmtKES(j.budget_min)}–{fmtKES(j.budget_max)}</span><span>⏱ {j.duration_days} days</span><span>📤 {j.apps_count||0} proposals</span></div>{j.skills?.length>0&&<div style={{display:"flex",gap:6,marginTop:10,flexWrap:"wrap"}}>{j.skills.map(s=><span key={s} className="tag tg">{s}</span>)}</div>}</div>{j.progress>0&&<div style={{width:100,flexShrink:0,textAlign:"right"}}><div style={{fontSize:12,color:"var(--sub)",marginBottom:5}}>{j.progress}% done</div><div className="pb"><div className="pf" style={{width:`${j.progress}%`}}/></div></div>}</div></Card>))}
      </div>
    </div>
  );
}

function PaymentsAdmin({ toast }) {
  const [escrows,setEscrows]=useState([]);const [txns,setTxns]=useState([]);const [jobs,setJobs]=useState([]);const [showDep,setShowDep]=useState(false);const [dForm,setDForm]=useState({job_id:"",amount:"",method:"mpesa",phone:"254712345678"});const [loading,setLoading]=useState("");
  const load=async()=>{const [e,t,j]=await Promise.all([db.get(K.E),db.get(K.TX),db.get(K.J)]);setEscrows(e||[]);setTxns(t||[]);setJobs(j||[]);};
  useEffect(()=>{load();},[]);
  const deposit=async()=>{
    if(!dForm.job_id||!dForm.amount) return toast("Job and amount required","error");
    setLoading("dep");await new Promise(r=>setTimeout(r,1200));
    const ref=`ESC-${Date.now()}`;const esc={id:uid(),job_id:Number(dForm.job_id),amount:Number(dForm.amount),status:"holding",reference:ref,created_at:now()};
    await db.push(K.E,esc);await db.patch(K.J,Number(dForm.job_id),{payment_status:"escrow",escrow_amount:Number(dForm.amount)});
    const ws=(await db.get(K.W))||[];const wi=ws.findIndex(w=>w.user_id===1);if(wi!==-1){ws[wi].balance-=Number(dForm.amount);await db.set(K.W,ws);await db.push(K.TX,{id:uid(),wallet_id:ws[wi].id,type:"escrow_hold",entry_type:"debit",amount:Number(dForm.amount),currency:"KES",status:"completed",reference:ref,created_at:now()});}
    await auditLog(1,"escrow.hold",`Deposited KES ${dForm.amount} to escrow for job #${dForm.job_id}`);toast("Escrow deposit successful!","success");setLoading("");setShowDep(false);load();
  };
  const release=async esc=>{
    setLoading("rel-"+esc.id);const cfg=(await db.get(K.CF))||SEED.cfg;const commission=esc.amount*(cfg.commission/100);const payout=esc.amount-commission;
    await db.patch(K.E,esc.id,{status:"released",released_at:now()});
    const job=jobs.find(j=>j.id===esc.job_id);
    if(job?.assigned_to){const ws=(await db.get(K.W))||[];const wi=ws.findIndex(w=>w.user_id===job.assigned_to);if(wi!==-1){ws[wi].balance+=payout;await db.set(K.W,ws);await db.push(K.TX,{id:uid(),wallet_id:ws[wi].id,type:"escrow_release",entry_type:"credit",amount:payout,currency:"KES",status:"completed",reference:`REL-${esc.id}`,created_at:now()});}await db.patch(K.J,esc.job_id,{payment_status:"released"});await createNotif(job.assigned_to,"payment.released","Payment released! 💰",`${fmtKES(payout)} credited to your wallet`);await sendEmail(job.assigned_to,"Payment Released!",`${fmtKES(payout)} has been released to your AfriGig wallet.`);}
    await auditLog(1,"escrow.release",`Released KES ${payout} for job #${esc.job_id} (commission: KES ${commission})`);toast(`${fmtKES(payout)} released!`,"success");setLoading("");load();
  };
  return (
    <div>
      {showDep&&(<div className="overlay" onClick={()=>setShowDep(false)}><div className="modal" style={{maxWidth:460,padding:32}} onClick={e=>e.stopPropagation()}><h3 style={{fontFamily:"var(--fh)",fontSize:20,fontWeight:700,marginBottom:22}}>Deposit to Escrow</h3><div style={{display:"flex",flexDirection:"column",gap:14}}><Sel label="Job" value={dForm.job_id} onChange={v=>setDForm({...dForm,job_id:v})} options={[{value:"",label:"Select a job…"},...jobs.filter(j=>j.status!=="completed").map(j=>({value:String(j.id),label:j.title}))]} required/><Inp label="Amount (KES)" type="number" value={dForm.amount} onChange={v=>setDForm({...dForm,amount:v})} required/><Sel label="Payment Method" value={dForm.method} onChange={v=>setDForm({...dForm,method:v})} options={[{value:"mpesa",label:"M-Pesa STK Push"},{value:"stripe",label:"Stripe"},{value:"bank",label:"Bank Transfer"}]}/>{dForm.method==="mpesa"&&<Inp label="Phone" value={dForm.phone} onChange={v=>setDForm({...dForm,phone:v})}/>}</div><div style={{display:"flex",gap:10,marginTop:22}}><Btn loading={loading==="dep"} onClick={deposit}>Process Deposit</Btn><Btn variant="ghost" onClick={()=>setShowDep(false)}>Cancel</Btn></div></div></div>)}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Payments & Escrow</h1><Btn onClick={()=>setShowDep(true)} icon="💳">Deposit to Escrow</Btn></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}} className="stagger">
        <Stat label="Held in Escrow" value={fmtKES(escrows.filter(e=>e.status==="holding").reduce((s,e)=>s+e.amount,0))} icon="🔒" color="var(--warn)"/>
        <Stat label="Released Total" value={fmtKES(txns.filter(t=>t.type==="escrow_release").reduce((s,t)=>s+t.amount,0))} icon="💸" color="var(--g)"/>
        <Stat label="Transactions" value={txns.length} icon="📊" color="var(--info)"/>
      </div>
      <Card style={{padding:0,overflow:"hidden",marginBottom:20}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid var(--bdr)"}}><h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16}}>Active Escrows</h3></div>
        {escrows.length===0?<Empty icon="🔒" title="No escrows" sub="Deposits will appear here"/>:<table><thead><tr><th>Job</th><th>Amount</th><th>Status</th><th>Reference</th><th>Created</th><th>Action</th></tr></thead><tbody>{escrows.map(e=>{const job=jobs.find(j=>j.id===e.job_id);return(<tr key={e.id}><td style={{fontWeight:600}}>{job?.title||`Job #${e.job_id}`}</td><td style={{fontFamily:"var(--fh)",fontWeight:700}}>{fmtKES(e.amount)}</td><td><Bdg status={e.status==="holding"?"holding":e.status==="released"?"APPROVED":"REJECTED"} label={e.status}/></td><td style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--sub)"}}>{e.reference}</td><td style={{color:"var(--sub)",fontSize:13}}>{fmtDate(e.created_at)}</td><td>{e.status==="holding"&&<Btn size="sm" loading={loading===`rel-${e.id}`} onClick={()=>release(e)}>Release</Btn>}</td></tr>);})}</tbody></table>}
      </Card>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid var(--bdr)"}}><h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16}}>Transaction Ledger</h3></div>
        {txns.length===0?<Empty icon="📒" title="No transactions" sub="Transactions appear here"/>:<table><thead><tr><th>Type</th><th>Amount</th><th>Entry</th><th>Reference</th><th>Date</th></tr></thead><tbody>{[...txns].reverse().map(t=>(<tr key={t.id}><td style={{fontWeight:500}}>{t.type.replace(/_/g," ")}</td><td style={{fontFamily:"var(--fh)",fontWeight:700,color:t.entry_type==="credit"?"var(--gd)":"var(--err)"}}>{t.entry_type==="credit"?"+":"-"}{fmtKES(t.amount)}</td><td><Bdg status={t.entry_type==="credit"?"APPROVED":"REJECTED"} label={t.entry_type}/></td><td style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--sub)"}}>{t.reference}</td><td style={{color:"var(--sub)",fontSize:13}}>{fmtDate(t.created_at)}</td></tr>))}</tbody></table>}
      </Card>
    </div>
  );
}

function MessagesView({ user, toast }) {
  const [convos,setConvos]=useState([]);const [msgs,setMsgs]=useState([]);const [users,setUsers]=useState([]);const [selConvo,setSelConvo]=useState(null);const [reply,setReply]=useState("");const [showNew,setShowNew]=useState(false);const [newMsg,setNewMsg]=useState({to:"",body:""});const endRef=useRef();
  const load=async()=>{const [c,m,u]=await Promise.all([db.get(K.C),db.get(K.M),db.get(K.U)]);setConvos((c||[]).filter(x=>x.participants.includes(user.id)).sort((a,b)=>new Date(b.last_at)-new Date(a.last_at)));setMsgs(m||[]);setUsers(u||[]);};
  useEffect(()=>{load();const t=setInterval(load,3000);return()=>clearInterval(t);},[]);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,selConvo]);
  const getOther=c=>{const oid=c.participants.find(id=>id!==user.id);return users.find(u=>u.id===oid);};
  const convoMsgs=selConvo?msgs.filter(m=>m.convo_id===selConvo):[];
  const send=async()=>{
    if(!reply.trim()||!selConvo) return;
    const c=convos.find(x=>x.id===selConvo);const oid=c?.participants.find(id=>id!==user.id);
    await db.push(K.M,{id:uid(),convo_id:selConvo,sender_id:user.id,recipient_id:oid,body:reply.trim(),created_at:now(),read:false});
    const cs=(await db.get(K.C))||[];const ci=cs.findIndex(x=>x.id===selConvo);if(ci!==-1){cs[ci]={...cs[ci],last_msg:reply.trim(),last_at:now()};await db.set(K.C,cs);}
    if(oid) await createNotif(oid,"message.new",`Message from ${user.name}`,reply.trim().slice(0,100));
    setReply("");load();
  };
  const sendNew=async()=>{
    if(!newMsg.to||!newMsg.body) return toast("Recipient and message required","error");
    const toUser=users.find(u=>u.email===newMsg.to||String(u.id)===newMsg.to);
    if(!toUser) return toast("User not found","error");
    const cs=(await db.get(K.C))||[];let c=cs.find(x=>x.participants.includes(user.id)&&x.participants.includes(toUser.id));
    if(!c){c={id:uid(),participants:[user.id,toUser.id],last_msg:newMsg.body,last_at:now(),unread:1,created_at:now()};cs.push(c);await db.set(K.C,cs);}
    await db.push(K.M,{id:uid(),convo_id:c.id,sender_id:user.id,recipient_id:toUser.id,body:newMsg.body,created_at:now(),read:false});
    await createNotif(toUser.id,"message.new",`Message from ${user.name}`,newMsg.body.slice(0,100));
    toast("Message sent!","success");setShowNew(false);setNewMsg({to:"",body:""});setSelConvo(c.id);load();
  };
  return (
    <div>
      {showNew&&(<div className="overlay" onClick={()=>setShowNew(false)}><div className="modal" style={{maxWidth:440,padding:32}} onClick={e=>e.stopPropagation()}><h3 style={{fontFamily:"var(--fh)",fontSize:20,fontWeight:700,marginBottom:20}}>New Message</h3><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="To (email or user ID)" value={newMsg.to} onChange={v=>setNewMsg({...newMsg,to:v})} required/><Inp label="Message" value={newMsg.body} onChange={v=>setNewMsg({...newMsg,body:v})} rows={4} required/></div><div style={{display:"flex",gap:10,marginTop:20}}><Btn onClick={sendNew}>Send</Btn><Btn variant="ghost" onClick={()=>setShowNew(false)}>Cancel</Btn></div></div></div>)}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Messages</h1><Btn onClick={()=>setShowNew(true)} icon="✉">New Message</Btn></div>
      <Card style={{padding:0,overflow:"hidden",display:"grid",gridTemplateColumns:"300px 1fr",height:580}}>
        <div style={{borderRight:"1px solid var(--bdr)",overflowY:"auto"}}>
          <div style={{padding:"14px 16px",borderBottom:"1px solid var(--bdr)",fontFamily:"var(--fh)",fontWeight:700,fontSize:14}}>Conversations ({convos.length})</div>
          {convos.length===0?<Empty icon="💬" title="No conversations" sub="Send a message to start"/>:convos.map(c=>{const o=getOther(c);return(<div key={c.id} onClick={()=>setSelConvo(c.id)} style={{padding:"12px 16px",borderBottom:"1px solid var(--bdr)",cursor:"pointer",background:selConvo===c.id?"var(--gl)":"#fff"}}><div style={{display:"flex",gap:10}}><Avatar name={o?.name||"?"} size={34}/><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontWeight:600,fontSize:13.5}}>{o?.name||"User"}</span><span style={{fontSize:11,color:"var(--sub)"}}>{fmtRel(c.last_at)}</span></div><div style={{fontSize:12.5,color:"var(--sub)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.last_msg}</div></div></div></div>);})}
        </div>
        {selConvo?(
          <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{padding:"13px 20px",borderBottom:"1px solid var(--bdr)",display:"flex",alignItems:"center",gap:12}}>
              {(()=>{const c=convos.find(x=>x.id===selConvo);const o=getOther(c||{});return<><Avatar name={o?.name} size={34}/><div><div style={{fontWeight:600,fontSize:14}}>{o?.name}</div><div style={{fontSize:12,color:"var(--sub)"}}>{o?.email}</div></div></>;})()}
            </div>
            <div style={{flex:1,overflowY:"auto",padding:20,display:"flex",flexDirection:"column",gap:10}}>
              {convoMsgs.map(m=>(<div key={m.id} style={{display:"flex",justifyContent:m.sender_id===user.id?"flex-end":"flex-start"}}><div className={m.sender_id===user.id?"chat-me":"chat-ot"}><div style={{fontSize:14,lineHeight:1.6}}>{m.body}</div><div style={{fontSize:11,opacity:.65,marginTop:4,textAlign:"right"}}>{fmtRel(m.created_at)}</div></div></div>))}
              <div ref={endRef}/>
            </div>
            <div style={{padding:"13px 20px",borderTop:"1px solid var(--bdr)",display:"flex",gap:10}}>
              <input className="inp" value={reply} onChange={e=>setReply(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Type a message…" style={{flex:1}}/>
              <Btn onClick={send}>Send →</Btn>
            </div>
          </div>
        ):<div style={{display:"flex",alignItems:"center",justifyContent:"center"}}><Empty icon="💬" title="Select a conversation" sub="Or start a new one"/></div>}
      </Card>
    </div>
  );
}

function TicketsView({ user, toast }) {
  const [tickets,setTickets]=useState([]);const [sel,setSel]=useState(null);const [replyText,setReplyText]=useState("");const [showCreate,setShowCreate]=useState(false);const [newT,setNewT]=useState({subject:"",message:"",priority:"medium"});const [aiTriage,setAiTriage]=useState(null);const [aiLoading,setAiLoading]=useState(false);
  const load=async()=>setTickets((await db.get(K.T))||[]);
  useEffect(()=>{load();},[]);
  const isAgent=user.role==="admin"||user.role==="support";
  const visible=isAgent?tickets:tickets.filter(t=>t.user_id===user.id);
  const selT=sel?tickets.find(t=>t.id===sel):null;
  const create=async()=>{if(!newT.subject||!newT.message) return toast("Subject and message required","error");const t={id:uid(),user_id:user.id,user_name:user.name,subject:newT.subject,message:newT.message,priority:newT.priority,status:"open",category:"general",replies:[],created_at:now()};await db.push(K.T,t);await createNotif(1,"ticket.new","New ticket",`${user.name}: ${newT.subject}`);toast("Ticket submitted!","success");setShowCreate(false);setNewT({subject:"",message:"",priority:"medium"});load();};
  const sendReply=async()=>{if(!replyText.trim()||!sel) return;const ts=(await db.get(K.T))||[];const i=ts.findIndex(t=>t.id===sel);if(i!==-1){const reps=[...(ts[i].replies||[]),{id:uid(),from_id:user.id,from:user.name,body:replyText,created_at:now()}];ts[i]={...ts[i],replies:reps,status:"in_progress",updated_at:now()};await db.set(K.T,ts);await createNotif(ts[i].user_id,"ticket.reply","Support replied",replyText.slice(0,100));}toast("Reply sent!","success");setReplyText("");load();};
  const closeTicket=async()=>{await db.patch(K.T,sel,{status:"resolved",resolved_at:now()});await createNotif(selT.user_id,"ticket.resolved","Ticket resolved",`"${selT.subject}" has been resolved.`);toast("Ticket resolved","success");setSel(null);load();};
  const runAiTriage=async()=>{if(!selT) return;setAiLoading(true);setAiTriage(null);try{const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,system:`You are a support triage system for AfriGig. Respond ONLY with JSON: {"category":"payment|technical|account|billing|dispute|other","priority":"low|medium|high|urgent","auto_response":"...","escalate":true|false,"tags":["..."]}`,messages:[{role:"user",content:`Triage:\nSubject: ${selT.subject}\nMessage: ${selT.message}`}]})});const d=await res.json();setAiTriage(JSON.parse((d.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim()));}catch(e){setAiTriage({error:e.message});}setAiLoading(false);};
  return (
    <div>
      {showCreate&&(<div className="overlay" onClick={()=>setShowCreate(false)}><div className="modal" style={{maxWidth:460,padding:32}} onClick={e=>e.stopPropagation()}><h3 style={{fontFamily:"var(--fh)",fontSize:20,fontWeight:700,marginBottom:20}}>Submit Support Ticket</h3><div style={{display:"flex",flexDirection:"column",gap:14}}><Inp label="Subject" value={newT.subject} onChange={v=>setNewT({...newT,subject:v})} required/><Inp label="Message" value={newT.message} onChange={v=>setNewT({...newT,message:v})} rows={5} required hint="Be as specific as possible"/><Sel label="Priority" value={newT.priority} onChange={v=>setNewT({...newT,priority:v})} options={[{value:"low",label:"Low"},{value:"medium",label:"Medium"},{value:"high",label:"High"}]}/></div><div style={{display:"flex",gap:10,marginTop:22}}><Btn onClick={create}>Submit</Btn><Btn variant="ghost" onClick={()=>setShowCreate(false)}>Cancel</Btn></div></div></div>)}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Support Tickets</h1>{!isAgent&&<Btn onClick={()=>setShowCreate(true)} icon="+">New Ticket</Btn>}</div>
      <div style={{display:"grid",gridTemplateColumns:"320px 1fr",gap:20}}>
        <Card style={{padding:0,overflow:"hidden",maxHeight:640,overflowY:"auto"}}>
          {visible.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).map(t=>(<div key={t.id} onClick={()=>{setSel(t.id);setAiTriage(null);}} style={{padding:"13px 18px",borderBottom:"1px solid var(--bdr)",cursor:"pointer",background:sel===t.id?"var(--gl)":"#fff"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontWeight:600,fontSize:13.5,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{t.subject}</span><div style={{width:8,height:8,background:{high:"var(--err)",medium:"var(--warn)",low:"var(--g)"}[t.priority]||"var(--bdr)",borderRadius:"50%",flexShrink:0,marginTop:5}}/></div><div style={{fontSize:12,color:"var(--sub)",marginBottom:6}}>{t.user_name} · {fmtRel(t.created_at)}</div><Bdg status={t.status} label={t.status.replace("_"," ")}/></div>))}
          {visible.length===0&&<Empty icon="🎫" title="No tickets" sub={isAgent?"All resolved":"Submit a ticket"}/>}
        </Card>
        {selT?(
          <Card style={{padding:26}} className="as">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18}}><div><h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:18,marginBottom:8}}>{selT.subject}</h3><div style={{display:"flex",gap:8,flexWrap:"wrap"}}><Bdg status={selT.status} label={selT.status.replace("_"," ")}/><Bdg status={selT.priority} label={`${selT.priority} priority`}/><span style={{fontSize:13,color:"var(--sub)"}}>{fmtDate(selT.created_at)} · {selT.user_name}</span></div></div><div style={{display:"flex",gap:8,flexShrink:0}}>{isAgent&&selT.status!=="resolved"&&<Btn variant="outline" size="sm" onClick={closeTicket}>Mark Resolved</Btn>}{isAgent&&<Btn variant="outline" size="sm" loading={aiLoading} onClick={runAiTriage} icon="🤖">AI Triage</Btn>}</div></div>
            <div style={{padding:"13px 16px",background:"var(--surf)",borderRadius:8,marginBottom:18}}><div style={{fontSize:12,color:"var(--sub)",marginBottom:4}}>Message</div><p style={{fontSize:14,lineHeight:1.7,color:"var(--mu)"}}>{selT.message}</p></div>
            {(selT.replies||[]).map(r=>(<div key={r.id} style={{padding:"11px 16px",background:r.from_id===user.id?"var(--gl)":"var(--surf)",borderRadius:8,marginBottom:10,borderLeft:`3px solid ${r.from_id===user.id?"var(--g)":"var(--bdr)"}`}}><div style={{fontSize:12,fontWeight:600,color:"var(--sub)",marginBottom:4}}>{r.from} · {fmtRel(r.created_at)}</div><p style={{fontSize:14,lineHeight:1.7}}>{r.body}</p></div>))}
            {aiTriage&&!aiLoading&&(<div style={{padding:"14px 16px",background:"#F5F3FF",borderRadius:8,marginBottom:16,border:"1px solid #DDD6FE"}} className="au"><div style={{fontWeight:700,fontSize:13,color:"#5B21B6",marginBottom:8}}>🤖 AI Triage Result</div>{aiTriage.error?<div style={{color:"var(--err)",fontSize:13}}>{aiTriage.error}</div>:<><div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>{aiTriage.category&&<span className="tag tp">📂 {aiTriage.category}</span>}{aiTriage.priority&&<Bdg status={aiTriage.priority} label={aiTriage.priority}/>}{aiTriage.escalate&&<span className="tag tr">🔺 Escalate</span>}</div>{aiTriage.auto_response&&<div style={{padding:"10px 14px",background:"#fff",borderRadius:6,fontSize:13,color:"var(--mu)",marginBottom:8,fontStyle:"italic"}}>💬 "{aiTriage.auto_response}"</div>}{aiTriage.tags?.map(t=><span key={t} className="tag tgr" style={{marginRight:6}}>{t}</span>)}</> }</div>)}
            {selT.status!=="resolved"&&<div style={{marginTop:16}}><Inp label={isAgent?"Reply":"Add Comment"} value={replyText} onChange={setReplyText} rows={3} placeholder="Write your response…"/><div style={{marginTop:10}}><Btn onClick={sendReply}>{isAgent?"Send Reply":"Add Comment"}</Btn></div></div>}
          </Card>
        ):<Card style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:300}}><Empty icon="🎫" title="Select a ticket" sub="Click to view details"/></Card>}
      </div>
    </div>
  );
}


function EmailLog() {
  const [emails, setEmails] = useState([]);
  useEffect(()=>{db.get(K.EM).then(e=>setEmails((e||[]).reverse()));},[]);
  return (<div><div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Email Log</h1><p style={{color:"var(--sub)",marginTop:4}}>All transactional emails sent by the platform.</p></div><Card style={{padding:0,overflow:"hidden"}}>{emails.length===0?<Empty icon="📧" title="No emails yet" sub="Emails are logged automatically"/>:(<table><thead><tr><th>To</th><th>Subject</th><th>Status</th><th>Sent</th></tr></thead><tbody>{emails.map(e=>(<tr key={e.id}><td style={{fontFamily:"var(--fm)",fontSize:12}}>{e.to}</td><td style={{fontWeight:600}}>{e.subject}</td><td><Bdg status="APPROVED" label={e.status}/></td><td style={{color:"var(--sub)",fontSize:13}}>{fmtDate(e.sent_at)}</td></tr>))}</tbody></table>)}</Card></div>);
}

function Reports() {
  const [data, setData] = useState(null);
  useEffect(()=>{ const load=async()=>{const [u,j,tx,e]=await Promise.all([db.get(K.U),db.get(K.J),db.get(K.TX),db.get(K.E)]);const frs=(u||[]).filter(x=>x.role==="freelancer");setData({frs,jobs:j||[],txn:tx||[],escrows:e||[]});};load();},[]);
  const months=["Aug","Sep","Oct","Nov","Dec","Jan","Feb"];
  const rev=[12000,18000,15000,22000,28000,35000,41000];
  const max=Math.max(...rev);
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Analytics & Reports</h1></div>
      {!data?<Spinner/>:(<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}} className="stagger">
          <Stat label="Total Freelancers" value={data.frs.length} icon="👥" color="var(--g)"/>
          <Stat label="Approved" value={data.frs.filter(u=>u.fs==="APPROVED").length} icon="✅" color="var(--info)"/>
          <Stat label="Total Jobs" value={data.jobs.length} icon="💼" color="var(--pur)"/>
          <Stat label="Total Paid Out" value={fmtKES(data.txn.filter(t=>t.type==="escrow_release").reduce((s,t)=>s+t.amount,0))} icon="💸" color="var(--warn)"/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20}}>
          <Card style={{padding:24}}>
            <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16,marginBottom:20}}>Monthly Revenue (KES)</h3>
            <div style={{display:"flex",alignItems:"flex-end",gap:10,height:150}}>
              {rev.map((v,i)=>(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><span style={{fontSize:10,color:"var(--sub)"}}>{(v/1000).toFixed(0)}K</span><div style={{width:"100%",borderRadius:"4px 4px 0 0",background:"linear-gradient(180deg,var(--g),var(--gd))",height:`${(v/max)*100}%`}}/><span style={{fontSize:10,color:"var(--sub)"}}>{months[i]}</span></div>))}
            </div>
          </Card>
          <Card style={{padding:24}}>
            <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16,marginBottom:16}}>Freelancer Funnel</h3>
            {[["Registered",data.frs.length,"var(--sub)"],["Profile Done",data.frs.filter(u=>u.fs!=="REGISTERED").length,"var(--info)"],["Under Review",data.frs.filter(u=>u.fs==="UNDER_REVIEW").length,"var(--pur)"],["Approved",data.frs.filter(u=>u.fs==="APPROVED").length,"var(--g)"]].map(([l,v,c])=>(
              <div key={l} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13}}>{l}</span><span style={{fontWeight:700}}>{v}</span></div><div className="pb"><div className="pf" style={{width:`${data.frs.length?(v/data.frs.length)*100:0}%`,background:c}}/></div></div>
            ))}
          </Card>
        </div>
      </>)}
    </div>
  );
}

function AuditLog() {
  const [log, setLog] = useState([]);
  useEffect(()=>{db.get(K.L).then(l=>setLog(l||[]));},[]);
  return (<div><div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Audit Log</h1><p style={{color:"var(--sub)",marginTop:4}}>Immutable record of all sensitive admin actions.</p></div><Card style={{padding:0,overflow:"hidden"}}>{log.length===0?<Empty icon="📋" title="No entries" sub="All sensitive actions are logged here"/>:(<table><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Description</th></tr></thead><tbody>{log.slice(0,100).map(e=>(<tr key={e.id}><td style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--sub)"}}>{new Date(e.created_at).toLocaleString()}</td><td style={{fontSize:13}}>#{e.user_id}</td><td><span className="tag tp" style={{fontSize:11}}>{e.type}</span></td><td style={{fontSize:13.5,color:"var(--mu)"}}>{e.desc}</td></tr>))}</tbody></table>)}</Card></div>);
}

function PlatformSettings({ toast }) {
  const [cfg, setCfg] = useState(null);
  const [saving, setSaving] = useState(false);
  useEffect(()=>{db.get(K.CF).then(c=>setCfg(c||SEED.cfg));},[]);
  const save=async()=>{setSaving(true);await db.set(K.CF,cfg);await auditLog(1,"settings.update","Platform settings updated");toast("Settings saved!","success");setSaving(false);};
  if(!cfg) return <Spinner/>;
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Platform Settings</h1></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card style={{padding:26}}>
          <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16,marginBottom:18}}>Assessment Configuration</h3>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Inp label="Min Assessment Fee (KES)" type="number" value={String(cfg.assessment_fee_min)} onChange={v=>setCfg({...cfg,assessment_fee_min:Number(v)})}/>
            <Inp label="Max Assessment Fee (KES)" type="number" value={String(cfg.assessment_fee_max)} onChange={v=>setCfg({...cfg,assessment_fee_max:Number(v)})}/>
            <Inp label="Min Pass Score (%)" type="number" value={String(cfg.min_score)} onChange={v=>setCfg({...cfg,min_score:Number(v)})} hint="Freelancers scoring below this are flagged for rejection"/>
            <Inp label="Review Period (business days)" type="number" value={String(cfg.review_days)} onChange={v=>setCfg({...cfg,review_days:Number(v)})}/>
          </div>
        </Card>
        <Card style={{padding:26}}>
          <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16,marginBottom:18}}>Payment Configuration</h3>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Inp label="Platform Commission (%)" type="number" value={String(cfg.commission)} onChange={v=>setCfg({...cfg,commission:Number(v)})} hint="Deducted from freelancer payout on escrow release"/>
            <div style={{padding:14,background:"var(--surf)",borderRadius:8}}>
              <div style={{fontSize:12,color:"var(--sub)",marginBottom:8,textTransform:"uppercase",fontWeight:700}}>Webhook Endpoints</div>
              {[["M-Pesa IPN","https://afrigig.com/webhooks/mpesa"],["Stripe","https://afrigig.com/webhooks/stripe"]].map(([l,v])=>(<div key={l} style={{marginBottom:8}}><div style={{fontSize:12,color:"var(--sub)",marginBottom:3}}>{l}</div><div style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--navy)",padding:"5px 10px",background:"#fff",borderRadius:6,border:"1px solid var(--bdr)"}}>{v}</div></div>))}
            </div>
          </div>
        </Card>
      </div>
      <div style={{marginTop:20}}><Btn loading={saving} onClick={save}>Save Settings</Btn></div>
    </div>
  );
}

// ─── FREELANCER APP ───────────────────────────────────────────
function FreelancerApp({ user, view, onNav, toast, notifs, unread, markRead, markAllRead }) {
  const titles={dashboard:"Dashboard",jobs:"Find Jobs",applications:"My Proposals",projects:"Active Projects",messages:"Messages",earnings:"Earnings & Wallet",profile:"Profile & KYC",tickets:"Support"};
  const views={
    dashboard:<FrDashboard user={user} onNav={onNav}/>,
    jobs:<FrJobs user={user} toast={toast}/>,
    applications:<FrApplications user={user}/>,
    projects:<FrProjects user={user}/>,
    messages:<MessagesView user={user} toast={toast}/>,
    earnings:<FrEarnings user={user}/>,
    profile:<FrProfile user={user} toast={toast}/>,
    tickets:<TicketsView user={user} toast={toast}/>,
  };
  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar role="freelancer" active={view} onNav={onNav} user={user} onLogout={()=>{localStorage.removeItem("ag3_token");window.location.hash="/";window.location.reload();}} unread={unread}/>
      <div style={{marginLeft:244,flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <Topbar user={user} unread={unread} notifs={notifs} onMarkRead={markRead} onMarkAll={markAllRead} title={titles[view]||"Dashboard"}/>
        <div key={view} style={{flex:1,padding:"26px 28px",overflowY:"auto"}} className="au">{views[view]||views.dashboard}</div>
      </div>
    </div>
  );
}

function FrDashboard({ user, onNav }) {
  const [jobs, setJobs] = useState([]);
  const [wallet, setWallet] = useState(null);
  useEffect(()=>{ db.get(K.J).then(j=>setJobs((j||[]).filter(x=>x.status==="open").slice(0,4))); db.get(K.W).then(ws=>setWallet((ws||[]).find(w=>w.user_id===user.id))); },[]);
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Welcome back, {user.name.split(" ")[0]}! 👋</h1><p style={{color:"var(--sub)",marginTop:4}}>Here's your overview for today.</p></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}} className="stagger">
        <Stat label="Wallet Balance" value={fmtKES(wallet?.balance||0)} icon="💰" color="var(--g)"/>
        <Stat label="Open Jobs" value={jobs.length} icon="💼" color="var(--info)"/>
        <Stat label="Track" value={user.track?TRACKS[user.track]?.label.split(" ")[0]:"Not set"} icon={user.track?TRACKS[user.track]?.icon:"🎯"} color="var(--pur)"/>
        <Stat label="Status" value={user.fs||"—"} icon={user.fs==="APPROVED"?"✅":"⏳"} color={user.fs==="APPROVED"?"var(--g)":"var(--warn)"}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr",gap:20}}>
        <Card style={{padding:24}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16}}>Open Jobs</h3><Btn variant="outline" size="sm" onClick={()=>onNav("jobs")}>Browse All</Btn></div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {jobs.map(j=>(<div key={j.id} style={{padding:"13px 16px",background:"var(--surf)",borderRadius:10,cursor:"pointer"}} onClick={()=>onNav("jobs")}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontWeight:600,fontSize:14}}>{j.title}</span><span style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:13,color:"var(--gd)"}}>{fmtKES(j.budget_max)}</span></div><div style={{fontSize:12,color:"var(--sub)"}}>{j.category} · {j.apps_count||0} proposals · {j.duration_days} days</div></div>))}
          </div>
        </Card>
        <Card style={{padding:24}}>
          <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16,marginBottom:14}}>Quick Links</h3>
          {[["💼","Find Jobs","jobs"],["📤","My Proposals","applications"],["💬","Messages","messages"],["💰","Earnings","earnings"],["🎫","Support","tickets"]].map(([icon,label,key])=>(
            <button key={key} className="btn bg2" onClick={()=>onNav(key)} style={{width:"100%",justifyContent:"flex-start",marginBottom:8}}><span>{icon}</span>{label}</button>
          ))}
        </Card>
      </div>
    </div>
  );
}

function FrJobs({ user, toast }) {
  const [jobs, setJobs] = useState([]);
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState("");
  const [applyModal, setApplyModal] = useState(null);
  const [form, setForm] = useState({cover:"",bid:"",days:""});
  const [checks, setChecks] = useState([false,false,false]);
  const [applying, setApplying] = useState(false);
  const [aiCover, setAiCover] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  useEffect(()=>{ db.get(K.J).then(j=>setJobs((j||[]).filter(x=>x.status==="open"))); db.get(K.A).then(a=>setApps(a||[])); },[]);
  const filtered=useMemo(()=>!search?jobs:jobs.filter(j=>j.title.toLowerCase().includes(search.toLowerCase())||j.description?.toLowerCase().includes(search.toLowerCase())||j.skills?.some(s=>s.toLowerCase().includes(search.toLowerCase()))),[jobs,search]);
  const apply=async()=>{
    if(!form.cover||form.cover.length<50) return toast("Cover letter must be at least 50 characters","error");
    if(!form.bid||!form.days) return toast("Bid amount and estimated days required","error");
    if(!checks.every(Boolean)) return toast("Please confirm all checkboxes","error");
    if(user.fs!=="APPROVED") return toast("Only approved freelancers can apply","error");
    setApplying(true);
    const app={id:uid(),job_id:applyModal.id,user_id:user.id,cover_letter:form.cover,bid_amount:Number(form.bid),est_days:Number(form.days),status:"sent",created_at:now()};
    await db.push(K.A,app);
    const js=(await db.get(K.J))||[];const ji=js.findIndex(j=>j.id===applyModal.id);
    if(ji!==-1){js[ji].apps_count=(js[ji].apps_count||0)+1;await db.set(K.J,js);}
    await createNotif(applyModal.created_by||1,"app.new","New proposal",`${user.name} applied to "${applyModal.title}" — bid KES ${form.bid}`);
    toast("Proposal submitted!","success");
    setApplying(false);setApplyModal(null);setForm({cover:"",bid:"",days:""});setChecks([false,false,false]);setAiCover(null);setApps(a=>[...a,app]);
  };
  const checkCover=async()=>{
    if(form.cover.length<50) return toast("Write more of your cover letter first","error");
    setAiLoading(true);setAiCover(null);
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,system:`You evaluate freelancer cover letters. Respond ONLY with JSON: {"score":0-100,"verdict":"STRONG"|"AVERAGE"|"WEAK","improvements":["..."],"rewritten_opening":"..."}`,messages:[{role:"user",content:`Evaluate this cover letter for "${applyModal?.title}":\n\n${form.cover}`}]})});
      const d=await res.json();setAiCover(JSON.parse((d.content?.[0]?.text||"{}").replace(/```json|```/g,"").trim()));
    }catch{setAiCover({error:"AI check unavailable"});}
    setAiLoading(false);
  };
  const alreadyApplied=id=>apps.some(a=>a.job_id===id&&a.user_id===user.id);
  return (
    <div>
      {applyModal&&(
        <div className="overlay" onClick={()=>{setApplyModal(null);setAiCover(null);}}>
          <div className="modal" style={{maxWidth:620,padding:32}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontFamily:"var(--fh)",fontSize:20,fontWeight:700,marginBottom:6}}>Apply: {applyModal.title}</h3>
            <div style={{color:"var(--sub)",fontSize:13,marginBottom:20}}>Budget: {fmtKES(applyModal.budget_min)}–{fmtKES(applyModal.budget_max)} · {applyModal.duration_days} days</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}><label className="lbl lbl-r">Cover Letter</label><Btn variant="outline" size="sm" loading={aiLoading} onClick={checkCover} icon="🤖">Check with AI</Btn></div>
                <Inp label="" value={form.cover} onChange={v=>setForm({...form,cover:v})} rows={6} placeholder="Why are you the best person for this job? Be specific about your experience and approach…" required/>
                <div style={{fontSize:12,color:form.cover.length<50?"var(--err)":"var(--sub)",marginTop:4}}>{form.cover.length}/50 min chars</div>
              </div>
              {aiCover&&(<div style={{padding:14,background:"var(--surf)",borderRadius:8,border:"1px solid var(--bdr)"}} className="au"><div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8}}><span>🤖</span><strong>AI Assessment</strong><span style={{fontFamily:"var(--fh)",fontWeight:800,fontSize:16,color:(aiCover.score||0)>=70?"var(--gd)":"var(--warn)"}}>{aiCover.score}/100</span>{aiCover.verdict&&<Bdg status={aiCover.verdict==="STRONG"?"APPROVED":aiCover.verdict==="WEAK"?"REJECTED":"UNDER_REVIEW"} label={aiCover.verdict}/>}</div>{aiCover.improvements?.map((i,idx)=><div key={idx} style={{fontSize:13,color:"var(--mu)",marginBottom:4}}>💡 {i}</div>)}{aiCover.rewritten_opening&&<div style={{marginTop:8,padding:"8px 12px",background:"#fff",borderRadius:6,fontSize:13,fontStyle:"italic",color:"var(--gd)",border:"1px solid rgba(0,212,160,.2)"}}>✨ Try: "{aiCover.rewritten_opening}"</div>}</div>)}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><Inp label="Your Bid (KES)" type="number" value={form.bid} onChange={v=>setForm({...form,bid:v})} required/><Inp label="Est. Days to Complete" type="number" value={form.days} onChange={v=>setForm({...form,days:v})} required/></div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {["I have read and understood all job requirements","I can deliver within my stated timeline","I agree to AfriGig's terms and escrow process"].map((t,i)=>(
                  <label key={i} style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer",fontSize:14}}>
                    <input type="checkbox" checked={checks[i]} onChange={e=>setChecks(c=>c.map((v,j)=>j===i?e.target.checked:v))} style={{marginTop:2,accentColor:"var(--g)",width:16,height:16}}/>{t}
                  </label>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:10,marginTop:22}}><Btn loading={applying} onClick={apply}>Submit Proposal</Btn><Btn variant="ghost" onClick={()=>{setApplyModal(null);setAiCover(null);}}>Cancel</Btn></div>
          </div>
        </div>
      )}
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Find Jobs</h1><p style={{color:"var(--sub)",marginTop:4}}>{jobs.length} open positions available</p></div>
      <input className="inp" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search jobs by title, skill, or category…" style={{marginBottom:18,maxWidth:500}}/>
      {user.fs!=="APPROVED"&&<div style={{padding:"12px 18px",background:"#FFFBEB",borderRadius:8,marginBottom:20,fontSize:14,color:"#92400E"}}>⚠️ Only approved freelancers can apply. Your current status: <Bdg status={user.fs}/></div>}
      <div style={{display:"flex",flexDirection:"column",gap:16}} className="stagger">
        {filtered.map(j=>(
          <Card key={j.id} style={{padding:22}} className="card-h">
            <div style={{display:"flex",justifyContent:"space-between",gap:16}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:8,flexWrap:"wrap"}}><h3 style={{fontFamily:"var(--fh)",fontSize:16,fontWeight:700}}>{j.title}</h3><span className="tag tb">{j.category}</span></div>
                <p style={{fontSize:13.5,color:"var(--sub)",marginBottom:14,lineHeight:1.65,maxWidth:600}}>{j.description?.slice(0,200)}{j.description?.length>200?"…":""}</p>
                <div style={{display:"flex",gap:18,fontSize:13,color:"var(--mu)",marginBottom:12,flexWrap:"wrap"}}><span>💰 {fmtKES(j.budget_min)}–{fmtKES(j.budget_max)}</span><span>⏱ {j.duration_days} days</span><span>📤 {j.apps_count||0} proposals</span></div>
                {j.skills?.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{j.skills.map(s=><span key={s} className="tag tg">{s}</span>)}</div>}
              </div>
              <div style={{flexShrink:0}}>{alreadyApplied(j.id)?<Bdg status="APPROVED" label="Applied ✓"/>:<Btn onClick={()=>setApplyModal(j)} disabled={user.fs!=="APPROVED"}>Apply Now</Btn>}</div>
            </div>
          </Card>
        ))}
        {filtered.length===0&&<Empty icon="💼" title="No jobs found" sub="Try a different search term"/>}
      </div>
    </div>
  );
}

function FrApplications({ user }) {
  const [apps, setApps] = useState([]);
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{ Promise.all([db.get(K.A),db.get(K.J)]).then(([a,j])=>{setApps((a||[]).filter(x=>x.user_id===user.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)));setJobs(j||[]);}); },[]);
  const getJob=id=>jobs.find(j=>j.id===id);
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>My Proposals</h1><p style={{color:"var(--sub)",marginTop:4}}>{apps.length} proposal{apps.length!==1?"s":""} submitted</p></div>
      {apps.length===0?<Card style={{padding:40}}><Empty icon="📤" title="No proposals yet" sub="Apply to jobs to see your proposals here"/></Card>:(
        <div style={{display:"flex",flexDirection:"column",gap:14}} className="stagger">
          {apps.map(a=>{const job=getJob(a.job_id);return(
            <Card key={a.id} style={{padding:22}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                <div style={{flex:1}}><div style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16,marginBottom:6}}>{job?.title||`Job #${a.job_id}`}</div><div style={{fontSize:13,color:"var(--sub)",marginBottom:12,lineHeight:1.6}}>{a.cover_letter?.slice(0,150)}…</div><div style={{display:"flex",gap:16,fontSize:13,color:"var(--mu)",flexWrap:"wrap"}}><span>💰 Bid: {fmtKES(a.bid_amount)}</span><span>⏱ Est: {a.est_days} days</span><span>📅 {fmtDate(a.created_at)}</span></div></div>
                <Bdg status={a.status}/>
              </div>
            </Card>
          );})}
        </div>
      )}
    </div>
  );
}

function FrProjects({ user }) {
  const [jobs, setJobs] = useState([]);
  useEffect(()=>{db.get(K.J).then(j=>setJobs((j||[]).filter(x=>x.assigned_to===user.id)));},[]);
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Active Projects</h1></div>
      {jobs.length===0?<Card style={{padding:40}}><Empty icon="📁" title="No active projects" sub="Projects assigned to you will appear here"/></Card>:(
        <div style={{display:"flex",flexDirection:"column",gap:16}} className="stagger">
          {jobs.map(j=>(<Card key={j.id} style={{padding:22}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:12,alignItems:"center"}}><h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16}}>{j.title}</h3><Bdg status={j.status}/></div><p style={{fontSize:14,color:"var(--sub)",marginBottom:14,lineHeight:1.65}}>{j.description?.slice(0,180)}</p><div style={{marginBottom:12}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--sub)",marginBottom:5}}><span>Progress</span><span>{j.progress||0}%</span></div><div className="pb"><div className="pf" style={{width:`${j.progress||0}%`}}/></div></div><div style={{display:"flex",gap:16,fontSize:13,color:"var(--mu)"}}><span>💰 {fmtKES(j.budget_max)}</span><span>💳 {j.payment_status}</span><span>⏱ {j.duration_days} days</span></div></Card>))}
        </div>
      )}
    </div>
  );
}

function FrEarnings({ user }) {
  const [wallet, setWallet] = useState(null);
  const [txns, setTxns] = useState([]);
  useEffect(()=>{ Promise.all([db.get(K.W),db.get(K.TX)]).then(([ws,tx])=>{const w=(ws||[]).find(x=>x.user_id===user.id);setWallet(w);setTxns(w?(tx||[]).filter(t=>t.wallet_id===w.id).sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)):[]);}); },[]);
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Earnings & Wallet</h1></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}} className="stagger">
        <Stat label="Wallet Balance" value={fmtKES(wallet?.balance||0)} icon="💰" color="var(--g)"/>
        <Stat label="Total Earned" value={fmtKES(txns.filter(t=>t.entry_type==="credit").reduce((s,t)=>s+t.amount,0))} icon="📈" color="var(--info)"/>
        <Stat label="Transactions" value={txns.length} icon="📊" color="var(--pur)"/>
      </div>
      <Card style={{padding:0,overflow:"hidden"}}>
        <div style={{padding:"14px 20px",borderBottom:"1px solid var(--bdr)"}}><h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16}}>Transaction History</h3></div>
        {txns.length===0?<Empty icon="💸" title="No transactions yet" sub="Your earnings will appear here"/>:(<table><thead><tr><th>Type</th><th>Amount</th><th>Reference</th><th>Date</th></tr></thead><tbody>{txns.map(t=>(<tr key={t.id}><td style={{fontWeight:500,textTransform:"capitalize"}}>{t.type.replace(/_/g," ")}</td><td style={{fontFamily:"var(--fh)",fontWeight:700,color:t.entry_type==="credit"?"var(--gd)":"var(--err)"}}>{t.entry_type==="credit"?"+":"-"}{fmtKES(t.amount)}</td><td style={{fontFamily:"var(--fm)",fontSize:12,color:"var(--sub)"}}>{t.reference}</td><td style={{color:"var(--sub)",fontSize:13}}>{fmtDate(t.created_at)}</td></tr>))}</tbody></table>)}
      </Card>
    </div>
  );
}

function FrProfile({ user, toast }) {
  const [form, setForm] = useState({skills:user.skills||"",experience:user.experience||"",country:user.country||"",bio:user.bio||"",portfolio_links:user.portfolio_links||"",availability:user.availability||"Full-time"});
  const [saving, setSaving] = useState(false);
  const save=async()=>{setSaving(true);await db.patch(K.U,user.id,form);await auditLog(user.id,"profile.update","Profile updated");toast("Profile updated!","success");setSaving(false);};
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Profile & KYC</h1></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <Card style={{padding:26}}>
          <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16,marginBottom:18}}>Professional Profile</h3>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <Inp label="Skills (comma-separated)" value={form.skills} onChange={v=>setForm({...form,skills:v})}/>
            <Inp label="Experience Summary" value={form.experience} onChange={v=>setForm({...form,experience:v})} rows={3}/>
            <Inp label="Country" value={form.country} onChange={v=>setForm({...form,country:v})}/>
            <Sel label="Availability" value={form.availability} onChange={v=>setForm({...form,availability:v})} options={["Full-time","Part-time","Weekends only","Project-based"]}/>
            <Inp label="Bio" value={form.bio} onChange={v=>setForm({...form,bio:v})} rows={3}/>
            <Inp label="Portfolio URL" value={form.portfolio_links} onChange={v=>setForm({...form,portfolio_links:v})}/>
            <Btn loading={saving} onClick={save}>Save Changes</Btn>
          </div>
        </Card>
        <Card style={{padding:26}}>
          <h3 style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:16,marginBottom:18}}>Account Status</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {[["Status",user.fs,"badge"],["Track",user.track?`${TRACKS[user.track]?.icon} ${TRACKS[user.track]?.label}`:"Not selected","text"],["Assessment Score",user.assessment_pct!==undefined?`${user.assessment_pct}%`:"Not taken","text"],["Member since",fmtDate(user.created_at),"text"]].map(([l,v,type])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",background:"var(--surf)",borderRadius:8,alignItems:"center"}}>
                <span style={{fontSize:13,color:"var(--sub)"}}>{l}</span>
                {type==="badge"?<Bdg status={v}/>:<span style={{fontFamily:"var(--fh)",fontWeight:600,fontSize:14}}>{v}</span>}
              </div>
            ))}
          </div>
          <div style={{marginTop:20}}>
            <div style={{fontFamily:"var(--fh)",fontWeight:700,fontSize:14,marginBottom:14,color:"var(--mu)"}}>KYC Verification</div>
            {[["Government ID","Not uploaded","⚪"],["Selfie Check","Not completed","⚪"],["Phone Verify","Not verified","⚪"]].map(([l,s,icon])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"10px 14px",background:"var(--surf)",borderRadius:8,marginBottom:8,alignItems:"center"}}><span style={{fontSize:13}}>{l}</span><span style={{fontSize:12,color:"var(--sub)"}}>{icon} {s}</span></div>))}
            <div style={{marginTop:14}}><FileUpload label="Upload National ID / Passport" onUpload={()=>toast("KYC document uploaded","success")} accept=".pdf,.jpg,.png" hint="Accepted: PDF, JPG, PNG"/></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── SUPPORT APP ──────────────────────────────────────────────
function SupportApp({ user, view, onNav, toast, notifs, unread, markRead, markAllRead }) {
  const counts=useDashCounts();
  const titles={dashboard:"Support Dashboard",tickets:"Tickets",messages:"Messages",users:"Users",reviews:"FR Reviews"};
  const views={dashboard:<SupportDashboard/>,tickets:<TicketsView user={user} toast={toast}/>,messages:<MessagesView user={user} toast={toast}/>,users:<AllUsers toast={toast}/>,reviews:<FRReviews toast={toast}/>};
  return (
    <div style={{display:"flex",minHeight:"100vh"}}>
      <Sidebar role="support" active={view} onNav={onNav} user={user} onLogout={()=>{localStorage.removeItem("ag3_token");window.location.hash="/";window.location.reload();}} unread={unread} counts={counts}/>
      <div style={{marginLeft:244,flex:1,display:"flex",flexDirection:"column",minWidth:0}}>
        <Topbar user={user} unread={unread} notifs={notifs} onMarkRead={markRead} onMarkAll={markAllRead} title={titles[view]||"Dashboard"}/>
        <div key={view} style={{flex:1,padding:"26px 28px",overflowY:"auto"}} className="au">{views[view]||views.dashboard}</div>
      </div>
    </div>
  );
}

function SupportDashboard() {
  const [stats, setStats] = useState(null);
  useEffect(()=>{ Promise.all([db.get(K.T),db.get(K.U)]).then(([t,u])=>{setStats({open:(t||[]).filter(x=>x.status==="open").length,inprog:(t||[]).filter(x=>x.status==="in_progress").length,resolved:(t||[]).filter(x=>x.status==="resolved").length,users:(u||[]).length});}); },[]);
  return (
    <div>
      <div style={{marginBottom:24}}><h1 style={{fontFamily:"var(--fh)",fontSize:28,fontWeight:800}}>Support Dashboard</h1></div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}} className="stagger">
        <Stat label="Open Tickets" value={stats?.open||"…"} icon="🔴" color="var(--err)"/>
        <Stat label="In Progress" value={stats?.inprog||"…"} icon="🟡" color="var(--warn)"/>
        <Stat label="Resolved" value={stats?.resolved||"…"} icon="🟢" color="var(--g)"/>
        <Stat label="Total Users" value={stats?.users||"…"} icon="👥" color="var(--info)"/>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────
export default function AfriGigApp() {
  const { route, navigate } = useRouter();
  const { toasts, toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [showAssessment, setShowAssessment] = useState(false);
  const { notifs, unread, markRead, markAllRead } = useNotifs(user?.id);

  useEffect(()=>{
    (async()=>{
      await seedIfEmpty();
      const token=localStorage.getItem("ag3_token");
      if(token){const u=await getSession(token);if(u)setUser(u);else localStorage.removeItem("ag3_token");}
      setLoading(false);
    })();
  },[]);

  useEffect(()=>{
    const parts=route.split("/").filter(Boolean);
    if(parts[1]) setView(parts[1]);
    else setView("dashboard");
  },[route]);

  const handleLogin=useCallback((u,token)=>{
    setUser(u);
    if(u.role==="admin") navigate("/admin/dashboard");
    else if(u.role==="support") navigate("/support/dashboard");
    else navigate("/freelancer/dashboard");
  },[navigate]);

  const handleNav=useCallback((key)=>{
    if(!user) return;
    setView(key);
    navigate(`/${user.role}/${key}`);
  },[user,navigate]);

  if(loading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--ink)"}}>
      <div style={{textAlign:"center"}}>
        <div style={{width:56,height:56,background:"linear-gradient(135deg,var(--g),var(--gd))",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><span style={{color:"#fff",fontSize:28,fontWeight:800,fontFamily:"var(--fh)"}}>A</span></div>
        <Spinner color="var(--g)" size={32}/>
        <div style={{color:"rgba(255,255,255,.4)",marginTop:12,fontSize:14}}>Loading AfriGig…</div>
      </div>
    </div>
  );

  let content;
  if(!user){
    if(route==="/register") content=<AuthPage mode="register" navigate={navigate} onLogin={handleLogin} toast={toast}/>;
    else if(route==="/login") content=<AuthPage mode="login" navigate={navigate} onLogin={handleLogin} toast={toast}/>;
    else content=<Landing navigate={navigate}/>;
  } else if(user.role==="admin"){
    content=<AdminApp user={user} view={view} onNav={handleNav} toast={toast} notifs={notifs} unread={unread} markRead={markRead} markAllRead={markAllRead}/>;
  } else if(user.role==="support"){
    content=<SupportApp user={user} view={view} onNav={handleNav} toast={toast} notifs={notifs} unread={unread} markRead={markRead} markAllRead={markAllRead}/>;
  } else if(user.role==="freelancer"){
    if(["REJECTED","SUSPENDED"].includes(user.fs)){
      content=<StatusPage user={user}/>;
    } else if(user.fs==="APPROVED"){
      content=<FreelancerApp user={user} view={view} onNav={handleNav} toast={toast} notifs={notifs} unread={unread} markRead={markRead} markAllRead={markAllRead}/>;
    } else if(showAssessment||user.assessment_unlocked&&user.fs==="ASSESSMENT_PENDING"){
      content=<AssessmentFlow user={user} onComplete={u=>{setUser(u);setShowAssessment(false);}} toast={toast}/>;
    } else {
      content=<Onboarding user={user} onUpdateUser={u=>{setUser(u);if(u.assessment_unlocked&&u.fs==="ASSESSMENT_PENDING")setShowAssessment(true);}} toast={toast}/>;
    }
  } else {
    content=<Landing navigate={navigate}/>;
  }

  return (<>{content}<Toast toasts={toasts}/></>);
}


/**
 * AfriGig Supabase Data Layer
 * Replaces localStorage-backed db with Supabase tables.
 * API: get(k), set(k,v), push(k,item), patch(k,id,upd)
 */

import { supabase } from "./supabaseClient.js";

const K = { U: "ag3:users", J: "ag3:jobs", A: "ag3:apps", M: "ag3:msgs", C: "ag3:convos", N: "ag3:notifs", T: "ag3:tickets", TX: "ag3:txn", W: "ag3:wallets", E: "ag3:escrow", L: "ag3:log", CF: "ag3:cfg", F: "ag3:files", EM: "ag3:emails" };

const TABLE = {
  [K.U]: "profiles",
  [K.J]: "jobs",
  [K.A]: "applications",
  [K.M]: "messages",
  [K.C]: "conversations",
  [K.N]: "notifications",
  [K.T]: "tickets",
  [K.TX]: "transactions",
  [K.W]: "wallets",
  [K.E]: "escrows",
  [K.L]: "audit_log",
  [K.CF]: "config",
  [K.EM]: "email_log",
};

let _adminIdCache = null;
let _adminProfileCache = null;

async function getAdminId() {
  if (_adminIdCache) return _adminIdCache;
  const { data, error } = await supabase.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle();
  if (error) return null;
  _adminIdCache = data?.id || null;
  return _adminIdCache;
}

async function getAdminProfile() {
  if (_adminProfileCache) return _adminProfileCache;
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "admin").limit(1).maybeSingle();
  if (error) return null;
  _adminProfileCache = data ? toAppUser(data) : null;
  return _adminProfileCache;
}

function resolveUserId(userId) {
  if (userId === 1 || userId === "1") return getAdminId();
  return Promise.resolve(userId);
}

// ─── Shape: Profile → App User ───────────────────────────────
function toAppUser(p) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name || "User",
    email: p.email || "",
    role: p.role || "freelancer",
    status: p.account_status || "active",
    fs: p.freelancer_status || null,
    track: p.track || null,
    skills: Array.isArray(p.skills) ? p.skills.join(", ") : (p.skills || ""),
    experience: p.experience || "",
    availability: p.availability || "",
    bio: p.bio || "",
    portfolio_links: Array.isArray(p.portfolio_links) ? p.portfolio_links.join(", ") : (p.portfolio_links || ""),
    country: p.country || "",
    assessment_pct: p.assessment_pct ?? null,
    assessment_unlocked: p.assessment_unlocked ?? false,
    queue_pos: p.queue_position ?? null,
    review_deadline: p.review_deadline ?? null,
    assessment_map: p.assessment_map || {},
    is_online: p.is_online ?? false,
    rejection_reason: p.rejection_reason || null,
    approved_at: p.approved_at || null,
    assessment_submitted_at: p.assessment_submitted_at || null,
    created_at: p.created_at || null,
    updated_at: p.updated_at || null,
  };
}

// ─── Shape: App User → Profile update ─────────────────────────
function toProfileUpdate(u) {
  const out = {};
  if (u.name !== undefined) out.name = u.name;
  if (u.role !== undefined) out.role = u.role;
  if (u.status !== undefined) out.account_status = u.status;
  if (u.fs !== undefined) out.freelancer_status = u.fs;
  if (u.track !== undefined) out.track = u.track;
  if (u.skills !== undefined) out.skills = typeof u.skills === "string" ? u.skills.split(",").map(s => s.trim()).filter(Boolean) : u.skills;
  if (u.experience !== undefined) out.experience = u.experience;
  if (u.availability !== undefined) out.availability = u.availability;
  if (u.bio !== undefined) out.bio = u.bio;
  if (u.portfolio_links !== undefined) out.portfolio_links = typeof u.portfolio_links === "string" ? [u.portfolio_links].filter(Boolean) : u.portfolio_links;
  if (u.country !== undefined) out.country = u.country;
  if (u.assessment_unlocked !== undefined) out.assessment_unlocked = u.assessment_unlocked;
  if (u.assessment_score !== undefined) out.assessment_score = u.assessment_score;
  if (u.assessment_max !== undefined) out.assessment_max = u.assessment_max;
  if (u.assessment_pct !== undefined) out.assessment_pct = u.assessment_pct;
  if (u.assessment_submitted_at !== undefined) out.assessment_submitted_at = u.assessment_submitted_at;
  if (u.rejection_reason !== undefined) out.rejection_reason = u.rejection_reason;
  if (u.queue_pos !== undefined) out.queue_position = u.queue_pos;
  if (u.review_deadline !== undefined) out.review_deadline = u.review_deadline;
  if (u.assessment_map !== undefined) out.assessment_map = u.assessment_map;
  if (u.approved_at !== undefined) out.approved_at = u.approved_at;
  out.updated_at = new Date().toISOString();
  return out;
}

// ─── Config: single JSON object stored per key ─────────────────
async function configGet(key) {
  const { data } = await supabase.from("config").select("value").eq("key", key).single();
  return data?.value ?? null;
}

function isUuid(x) {
  return typeof x === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
}

async function configSet(key, value) {
  const { error } = await supabase.from("config").upsert({ key, value }, { onConflict: "key" });
  if (error) console.warn("[supabaseData] configSet", key, error);
}

// ─── Main DB API ───────────────────────────────────────────────
export const db = {
  async get(k) {
    try {
      if (k === K.U) {
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []).map(toAppUser);
      }
      if (k === K.J) {
        const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        const rows = data || [];
        const appIds = rows.map(j => j.id).filter(Boolean);
        let cntMap = {};
        if (appIds.length > 0) {
          const { data: counts } = await supabase.from("applications").select("job_id").in("job_id", appIds);
          (counts || []).forEach(a => { cntMap[a.job_id] = (cntMap[a.job_id] || 0) + 1; });
        }
        return rows.map(j => ({ ...j, apps_count: cntMap[j.id] || 0 }));
      }
      if (k === K.A) {
        const { data, error } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []).map(a => ({ ...a, cover_letter: a.cover, est_days: a.est_days }));
      }
      if (k === K.M) {
        const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: true });
        if (error) throw error;
        return data || [];
      }
      if (k === K.C) {
        const { data, error } = await supabase.from("conversations").select("*").order("last_at", { ascending: false });
        if (error) throw error;
        return (data || []).map(c => ({ ...c, last_msg: c.last_message, unread: 0 }));
      }
      if (k === K.N) {
        const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return (data || []).map(n => ({ ...n, is_read: n.is_read }));
      }
      if (k === K.T) {
        const { data: tickets, error: te } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
        if (te) throw te;
        const list = tickets || [];
        const { data: replies } = await supabase.from("ticket_replies").select("*");
        const repByTicket = {};
        (replies || []).forEach(r => { if (!repByTicket[r.ticket_id]) repByTicket[r.ticket_id] = []; repByTicket[r.ticket_id].push({ id: r.id, from_id: r.user_id, body: r.body, created_at: r.created_at }); });
        const proIds = [...new Set(list.map(t => t.user_id))];
        const { data: profs } = await supabase.from("profiles").select("id,name").in("id", proIds);
        const nameMap = {};
        (profs || []).forEach(p => { nameMap[p.id] = p.name; });
        return list.map(t => ({ ...t, user_name: nameMap[t.user_id] || "User", replies: repByTicket[t.id] || [] }));
      }
      if (k === K.TX) {
        const { data, error } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      }
      if (k === K.W) {
        const { data, error } = await supabase.from("wallets").select("*");
        if (error) throw error;
        return data || [];
      }
      if (k === K.E) {
        const { data, error } = await supabase.from("escrows").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      }
      if (k === K.L) {
        const { data, error } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(1000);
        if (error) throw error;
        return (data || []).map(l => ({ id: l.id, user_id: l.actor_id, type: l.action, desc: l.details, created_at: l.created_at }));
      }
      if (k === K.CF) {
        const val = await configGet("platform");
        if (val && typeof val === "object") return val;
        return null;
      }
      if (k === K.EM) {
        const { data, error } = await supabase.from("email_log").select("*").order("sent_at", { ascending: false });
        if (error) throw error;
        return (data || []).map(e => ({ id: e.id, to: e.to, subject: e.subject, body: e.body, sent_at: e.sent_at, status: e.status }));
      }
      if (k === K.F) return []; // files: stub
      return null;
    } catch (e) {
      console.warn("[supabaseData] get", k, e);
      return null;
    }
  },

  async set(k, v) {
    try {
      if (k === K.U && Array.isArray(v)) {
        for (const u of v) {
          const upd = toProfileUpdate(u);
          if (Object.keys(upd).length > 1) await supabase.from("profiles").update(upd).eq("id", u.id);
        }
        return;
      }
      if (k === K.J && Array.isArray(v)) {
        const adminId = await getAdminId();
        for (const j of v) {
          const { id, apps_count, ...rest } = j;
          const createdBy = rest.created_by === 1 || rest.created_by === "1" ? adminId : rest.created_by;
          const row = { ...rest, created_by: createdBy, updated_at: new Date().toISOString() };
          const uid = typeof id === "string" && id.match(/^[0-9a-f-]{36}$/i) ? id : null;
          if (uid) await supabase.from("jobs").update(row).eq("id", uid);
          else await supabase.from("jobs").insert(row);
        }
        return;
      }
      if (k === K.C && Array.isArray(v)) {
        for (const c of v) {
          if (!isUuid(c.id)) continue;
          const row = { last_message: c.last_msg || c.last_message, last_at: c.last_at || c.created_at };
          await supabase.from("conversations").update(row).eq("id", c.id);
        }
        return;
      }
      if (k === K.N && Array.isArray(v)) {
        for (const n of v) {
          if (!isUuid(n.id)) continue;
          await supabase.from("notifications").update({ is_read: n.is_read }).eq("id", n.id);
        }
        return;
      }
      if (k === K.T && Array.isArray(v)) {
        const ticketIds = v.filter(t => t.id && isUuid(t.id)).map(t => t.id);
        const { data: existingReplies } = ticketIds.length
          ? await supabase.from("ticket_replies").select("id,ticket_id,user_id,body").in("ticket_id", ticketIds)
          : { data: [] };
        const seen = new Set((existingReplies || []).map(r => `${r.ticket_id}:${r.user_id}:${(r.body || "").slice(0, 80)}`));
        for (const t of v) {
          const { replies, user_name, ...rest } = t;
          if (!t.id || !isUuid(t.id)) continue;
          await supabase.from("tickets").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", t.id);
          for (const r of (replies || [])) {
            const key = `${t.id}:${r.from_id || r.user_id}:${(r.body || "").slice(0, 80)}`;
            if (!seen.has(key)) {
              await supabase.from("ticket_replies").insert({ ticket_id: t.id, user_id: r.from_id || r.user_id, body: r.body });
              seen.add(key);
            }
          }
        }
        return;
      }
      if (k === K.W && Array.isArray(v)) {
        for (const w of v) {
          if (!w.id || !isUuid(w.id)) continue;
          await supabase.from("wallets").update({ balance: w.balance, updated_at: new Date().toISOString() }).eq("id", w.id);
        }
        return;
      }
      if (k === K.L && Array.isArray(v)) {
        const toAdd = v.slice(0, 1);
        for (const l of toAdd) {
          const actorId = await resolveUserId(l.user_id);
          await supabase.from("audit_log").insert({ actor_id: actorId || l.user_id, action: l.type, details: l.desc });
        }
        return;
      }
      if (k === K.CF && v && typeof v === "object") {
        await configSet("platform", v);
        return;
      }
      if (k === K.A || k === K.M || k === K.TX || k === K.E) {
        // These are append-only in set(); usually we use push. No-op for bulk set.
        return;
      }
      if (k === K.F || k === K.EM) return;
    } catch (e) {
      console.warn("[supabaseData] set", k, e);
    }
  },

  async push(k, item) {
    try {
      if (k === K.N) {
        const targetId = await resolveUserId(item.user_id);
        const { data, error } = await supabase.from("notifications").insert({
          user_id: targetId || item.user_id,
          type: item.type,
          title: item.title,
          message: item.message,
          is_read: false,
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id, created_at: new Date().toISOString() };
      }
      if (k === K.EM) {
        const { data, error } = await supabase.from("email_log").insert({
          to: item.to,
          subject: item.subject,
          body: item.body,
          status: item.status || "sent",
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id, sent_at: new Date().toISOString() };
      }
      if (k === K.L) {
        const actorId = await resolveUserId(item.user_id);
        const { data, error } = await supabase.from("audit_log").insert({
          actor_id: actorId || item.user_id,
          action: item.type,
          details: item.desc,
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id, created_at: new Date().toISOString() };
      }
      if (k === K.J) {
        const createdBy = await resolveUserId(item.created_by);
        const { data, error } = await supabase.from("jobs").insert({
          title: item.title,
          description: item.description,
          category: item.category,
          skills: item.skills || [],
          budget_min: item.budget_min,
          budget_max: item.budget_max,
          duration_days: item.duration_days,
          status: item.status || "open",
          payment_status: item.payment_status || "unpaid",
          created_by: createdBy || item.created_by,
          assigned_to: item.assigned_to || null,
          progress: item.progress || 0,
          apps_count: 0,
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id, created_at: new Date().toISOString() };
      }
      if (k === K.A) {
        const { data, error } = await supabase.from("applications").insert({
          job_id: item.job_id,
          user_id: item.user_id,
          cover: item.cover_letter || item.cover,
          bid_amount: item.bid_amount,
          est_days: item.est_days || null,
          status: item.status || "sent",
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id, created_at: new Date().toISOString() };
      }
      if (k === K.M) {
        const { data, error } = await supabase.from("messages").insert({
          convo_id: item.convo_id,
          sender_id: item.sender_id,
          body: item.body,
          read: item.read || false,
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id, created_at: new Date().toISOString() };
      }
      if (k === K.C) {
        const { data, error } = await supabase.from("conversations").insert({
          participants: item.participants,
          last_message: item.last_msg || item.last_message || "",
          last_at: item.last_at || item.created_at || new Date().toISOString(),
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id };
      }
      if (k === K.T) {
        const { data, error } = await supabase.from("tickets").insert({
          user_id: item.user_id,
          subject: item.subject,
          message: item.message,
          status: item.status || "open",
          priority: item.priority || "medium",
          category: item.category || "general",
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id, replies: [], created_at: new Date().toISOString() };
      }
      if (k === K.TX) {
        const { data, error } = await supabase.from("transactions").insert({
          wallet_id: item.wallet_id,
          type: item.type,
          entry_type: item.entry_type,
          amount: item.amount,
          currency: item.currency || "KES",
          status: item.status || "completed",
          reference: item.reference,
          meta: item.meta || {},
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id, created_at: new Date().toISOString() };
      }
      if (k === K.E) {
        const { data, error } = await supabase.from("escrows").insert({
          job_id: item.job_id,
          amount: item.amount,
          status: item.status || "holding",
          reference: item.reference,
        }).select("id").single();
        if (error) throw error;
        return { ...item, id: data.id, created_at: new Date().toISOString() };
      }
      return item;
    } catch (e) {
      console.warn("[supabaseData] push", k, e);
      return item;
    }
  },

  async patch(k, id, upd) {
    try {
      const uuidTables = [K.U, K.J, K.N, K.T, K.E];
      if (uuidTables.includes(k) && !isUuid(id)) return null;
      if (k === K.U) {
        const payload = toProfileUpdate(upd);
        const { error } = await supabase.from("profiles").update(payload).eq("id", id);
        if (error) {
          console.warn("[supabaseData] profiles update failed, retrying upsert:", error.message);
          // Retry with upsert in case the row doesn't exist yet
          const { error: upsertError } = await supabase.from("profiles").upsert({ id, ...payload }, { onConflict: "id" });
          if (upsertError) throw upsertError;
        }
        const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
        return data ? toAppUser(data) : null;
      }
      if (k === K.J) {
        const { status, payment_status, progress, assigned_to, escrow_amount, ...rest } = upd;
        const payload = { ...rest, updated_at: new Date().toISOString() };
        if (status !== undefined) payload.status = status;
        if (payment_status !== undefined) payload.payment_status = payment_status;
        if (progress !== undefined) payload.progress = progress;
        if (assigned_to !== undefined) payload.assigned_to = assigned_to;
        const { error } = await supabase.from("jobs").update(payload).eq("id", id);
        if (error) throw error;
        const { data } = await supabase.from("jobs").select("*").eq("id", id).single();
        return data;
      }
      if (k === K.N) {
        const { error } = await supabase.from("notifications").update({ is_read: upd.is_read ?? true }).eq("id", id);
        if (error) throw error;
        const { data } = await supabase.from("notifications").select("*").eq("id", id).single();
        return data ? { ...data, is_read: data.is_read } : null;
      }
      if (k === K.T) {
        const { replies, user_name, ...rest } = upd;
        const payload = { ...rest, updated_at: new Date().toISOString() };
        const { error } = await supabase.from("tickets").update(payload).eq("id", id);
        if (error) throw error;
        const { data } = await supabase.from("tickets").select("*").eq("id", id).single();
        return data;
      }
      if (k === K.E) {
        const payload = { ...upd, updated_at: new Date().toISOString() };
        const { error } = await supabase.from("escrows").update(payload).eq("id", id);
        if (error) throw error;
        const { data } = await supabase.from("escrows").select("*").eq("id", id).single();
        return data;
      }
      return null;
    } catch (e) {
      console.warn("[supabaseData] patch", k, id, e);
      return null;
    }
  },
};

/**
 * Update a user's online presence directly (bypasses toProfileUpdate mapping).
 * Called every 30s by the usePresence hook.
 */
export async function updatePresence(userId, { online, activity }) {
  if (!userId) return;
  try {
    await supabase.from("profiles").update({
      is_online: online,
      last_seen: new Date().toISOString(),
      current_activity: online ? (activity || "Online") : null,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);
  } catch (e) {
    // Presence failures are non-critical; silent ignore
  }
}

export { K, getAdminId, getAdminProfile, resolveUserId };

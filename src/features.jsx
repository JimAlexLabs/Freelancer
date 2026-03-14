/**
 * AfriGig Features Module
 * All P1–P3 feature components: Milestones, Reviews, KYC, Withdrawals,
 * Public Profile, Subscriptions, Advanced Bidding, Dark Mode,
 * Referrals, Export Reports, Revenue Dashboard, Announcements,
 * Earnings Chart, Calendar, Support SLA, Promo Codes.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { supabase } from "./supabaseClient.js";
import { db, K } from "./supabaseData.js";
import { uploadFile } from "./storage.js";

// ─── Shared helpers ────────────────────────────────────────────
const uid = () => crypto.randomUUID ? crypto.randomUUID() : (Date.now() + Math.random()).toString(36);
const now = () => new Date().toISOString();
const fmtDate = d => { const dt = d ? new Date(d) : null; if (!dt || isNaN(dt)) return "—"; return dt.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}); };
const fmtKES = n => `KES ${Number(n||0).toLocaleString("en-KE",{minimumFractionDigits:2})}`;
const fmtRel = d => { const m = Math.floor((Date.now()-new Date(d))/60000); if(m<1)return"Just now";if(m<60)return`${m}m ago`;if(m<1440)return`${Math.floor(m/60)}h ago`;return fmtDate(d); };

// ─── Mini shared UI (self-contained) ──────────────────────────
const Card = ({children,style:s={},className=""}) => <div className={`card ${className}`} style={s}>{children}</div>;
const Btn = ({children,variant="primary",size="md",onClick,disabled,loading,style:s={},type="button"}) => {
  const cls={primary:"bp",danger:"bd",ghost:"bg2",outline:"bo2",dark:"bdk"}[variant]||"bp";
  const sz={sm:"bsm",lg:"blg"}[size]||"";
  return <button type={type} className={`btn ${cls} ${sz}`} onClick={onClick} disabled={disabled||loading} style={s}>{loading?<span className="sp" style={{width:13,height:13,border:"2.5px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block"}}/>:null}{children}</button>;
};
const Inp = ({label,value,onChange,type="text",placeholder,required,rows,hint,error,disabled,style:s={}}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label className={`lbl${required?" lbl-r":""}`}>{label}</label>}
    {rows?<textarea className="inp" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} disabled={disabled} style={{resize:"vertical",...s}}/>
      :<input type={type} className="inp" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} disabled={disabled} style={s}/>}
    {hint&&!error&&<span style={{fontSize:12,color:"var(--sub)"}}>{hint}</span>}
    {error&&<span style={{fontSize:12,color:"var(--err)"}}>{error}</span>}
  </div>
);
const Sel = ({label,value,onChange,options,required}) => (
  <div style={{display:"flex",flexDirection:"column",gap:5}}>
    {label&&<label className={`lbl${required?" lbl-r":""}`}>{label}</label>}
    <select className="inp" value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o.value??o} value={o.value??o}>{o.label??o}</option>)}</select>
  </div>
);
const Empty = ({icon,title,sub}) => <div style={{textAlign:"center",padding:"48px 24px",color:"var(--sub)"}}><div style={{fontSize:44,marginBottom:12}}>{icon}</div><h3 style={{fontFamily:"var(--fh)",fontSize:17,color:"var(--mu)",marginBottom:6}}>{title}</h3><p style={{fontSize:14}}>{sub}</p></div>;
const Bdg = ({status,label}) => { const map={APPROVED:"bg",REJECTED:"br",pending:"by",active:"bg",completed:"bg",in_progress:"bpu",failed:"br",processing:"bb",cancelled:"br",approved:"bg",disputed:"br",submitted:"bb",none:"bgr",kyc_approved:"bg",kyc_pending:"by"}; return <span className={`badge ${map[status]||"bgr"}`}>{label||status}</span>; };
const Stars = ({value=0,max=5,onChange,size=18}) => (
  <div style={{display:"flex",gap:3}}>
    {Array.from({length:max},(_,i)=>(
      <span key={i} onClick={()=>onChange&&onChange(i+1)} style={{fontSize:size,cursor:onChange?"pointer":"default",color:i<value?"#F59E0B":"var(--bdr)",transition:"color .1s"}}>★</span>
    ))}
  </div>
);
const Spinner = ({size=24}) => <div className="sp" style={{width:size,height:size,border:"3px solid var(--bdr)",borderTopColor:"var(--g)",borderRadius:"50%",margin:"0 auto"}}/>;

// ─── CSV export helper ─────────────────────────────────────────
export function exportCSV(rows, filename = "export.csv") {
  if (!rows?.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map(r => headers.map(h => {
      const v = r[h] ?? "";
      const s = String(v).replace(/"/g, '""');
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
    }).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// =============================================================
// P0-2: WITHDRAWAL UI (Freelancer Earnings extension)
// =============================================================
export function WithdrawalModal({ user, wallet, onClose, onSuccess, toast }) {
  const [form, setForm] = useState({ amount: "", phone: user?.phone_number || "" });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const feePercent = 2;
  const feeMin = 50;
  const amount = Number(form.amount) || 0;
  const fee = Math.max(feeMin, Math.round(amount * feePercent / 100));
  const net = Math.max(0, amount - fee);
  const canWithdraw = wallet?.balance >= 500;

  const submit = async () => {
    if (amount < 500) return toast("Minimum withdrawal is KES 500", "error");
    if (amount > (wallet?.balance || 0)) return toast("Insufficient wallet balance", "error");
    if (!form.phone.match(/^254[0-9]{9}$/)) return toast("Enter valid M-Pesa number (254XXXXXXXXX)", "error");
    if (!agreed) return toast("Please agree to the withdrawal terms", "error");
    setLoading(true);

    const ref = `WDR-${Date.now()}`;
    try {
      // 1. Create withdrawal record
      const { data: wd, error: wdErr } = await supabase.from("withdrawals").insert({
        user_id: user.id,
        amount,
        fee,
        net_amount: net,
        phone: form.phone,
        status: amount > 10000 ? "pending" : "processing",
        method: "mpesa_b2c",
        reference: ref,
      }).select("id").single();
      if (wdErr) throw wdErr;

      // 2. Deduct from wallet
      const { data: wallets } = await supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle();
      if (wallets) {
        await supabase.from("wallets").update({ balance: wallets.balance - amount, updated_at: now() }).eq("id", wallets.id);
        await supabase.from("transactions").insert({
          wallet_id: wallets.id, type: "withdrawal", entry_type: "debit",
          amount, currency: "KES", status: "processing", reference: ref,
          meta: { phone: form.phone, fee, withdrawal_id: wd.id },
        });
      }

      // 3. If auto-approve (≤10k), trigger B2C
      if (amount <= 10000) {
        fetch("/api/b2c?action=payout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: form.phone, amount: net, reference: ref, remarks: "AfriGig Freelancer Payout" }),
        }).then(async r => {
          const d = await r.json();
          if (d.success) {
            await supabase.from("withdrawals").update({ status: "processing", conversation_id: d.conversationId, updated_at: now() }).eq("reference", ref);
          }
        }).catch(() => {});
      }

      // 4. Email notification
      fetch("/api/email", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: user.email, templateId: "withdrawal_initiated", templateData: { name: user.name, amount: fmtKES(net), phone: form.phone, reference: ref } }),
      }).catch(() => {});

      toast(amount > 10000
        ? "Withdrawal request submitted — awaiting admin approval (withdrawals above KES 10,000 require review)"
        : `Withdrawal of ${fmtKES(net)} initiated via M-Pesa!`, "success");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast(err.message || "Withdrawal failed", "error");
    }
    setLoading(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440, padding: 32 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 22, marginBottom: 4 }}>Withdraw Funds</h3>
        <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 22 }}>Minimum KES 500 · 2% processing fee (min KES 50)</p>

        {!canWithdraw && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#991B1B" }}>
            ⚠️ Minimum withdrawal is KES 500. Your balance is {fmtKES(wallet?.balance || 0)}.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Inp label="Amount (KES)" type="number" value={form.amount} onChange={v => setForm({ ...form, amount: v })} placeholder="500" hint={`Available: ${fmtKES(wallet?.balance || 0)}`} />
          <Inp label="M-Pesa Number" value={form.phone} onChange={v => setForm({ ...form, phone: v })} placeholder="254712345678" />

          {amount >= 500 && (
            <div style={{ background: "var(--gl)", borderRadius: 8, padding: "12px 16px", fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "var(--sub)" }}>Withdrawal amount</span>
                <span style={{ fontWeight: 700 }}>{fmtKES(amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ color: "var(--sub)" }}>Processing fee (2%, min KES 50)</span>
                <span style={{ color: "var(--err)", fontWeight: 700 }}>–{fmtKES(fee)}</span>
              </div>
              <div style={{ borderTop: "1px solid var(--bdr)", paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, color: "var(--gd)" }}>You receive</span>
                <span style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 16, color: "var(--gd)" }}>{fmtKES(net)}</span>
              </div>
              {amount > 10000 && <p style={{ marginTop: 8, fontSize: 11, color: "var(--warn)" }}>⏳ Withdrawals above KES 10,000 require admin approval (1–2 business days)</p>}
            </div>
          )}

          <label style={{ display: "flex", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--mu)", userSelect: "none" }}>
            <input type="checkbox" checked={agreed} onChange={() => setAgreed(v => !v)} style={{ width: 15, height: 15, marginTop: 2, accentColor: "var(--g)", flexShrink: 0 }} />
            I agree that the 2% processing fee is non-refundable. Payouts take 24–72 hours.
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn loading={loading} onClick={submit} disabled={!canWithdraw || !agreed}>Withdraw →</Btn>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// P1-1: MILESTONE SYSTEM
// =============================================================
export function MilestonesView({ job, user, toast, isAdmin = false }) {
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", amount: "", due_date: "" });
  const [saving, setSaving] = useState(false);
  const [deliverableModal, setDeliverableModal] = useState(null);
  const [deliverableNote, setDeliverableNote] = useState("");
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("milestones").select("*").eq("job_id", job.id).order("order_index");
    setMilestones(data || []);
    setLoading(false);
  }, [job.id]);

  useEffect(() => { load(); }, [load]);

  const addMilestone = async () => {
    if (!form.title || !form.amount) return toast("Title and amount required", "error");
    setSaving(true);
    const { error } = await supabase.from("milestones").insert({
      job_id: job.id, freelancer_id: job.assigned_to || user.id,
      title: form.title, description: form.description,
      amount: Number(form.amount), due_date: form.due_date || null,
      order_index: milestones.length, status: "pending",
    });
    if (!error) { toast("Milestone added", "success"); setShowAdd(false); setForm({ title: "", description: "", amount: "", due_date: "" }); load(); }
    else toast(error.message, "error");
    setSaving(false);
  };

  const submitDeliverable = async (milestone) => {
    if (!deliverableNote.trim()) return toast("Please describe what you delivered", "error");
    setUploading(true);
    await supabase.from("milestones").update({
      status: "submitted", deliverable_note: deliverableNote, submitted_at: now(), updated_at: now(),
    }).eq("id", milestone.id);
    // Notify admin
    await supabase.from("notifications").insert({
      user_id: (await supabase.from("profiles").select("id").eq("role","admin").limit(1).maybeSingle()).data?.id,
      type: "milestone.submitted", title: "Milestone Submitted",
      message: `${user.name} submitted: "${milestone.title}" on job ${job.title}`, is_read: false,
    });
    toast("Deliverable submitted! Admin will review.", "success");
    setDeliverableModal(null); setDeliverableNote(""); load();
    setUploading(false);
  };

  const approveMilestone = async (m) => {
    await supabase.from("milestones").update({ status: "approved", approved_at: now(), updated_at: now() }).eq("id", m.id);
    // TODO: trigger partial escrow release
    toast(`Milestone "${m.title}" approved!`, "success"); load();
  };

  const rejectMilestone = async (m, reason) => {
    await supabase.from("milestones").update({ status: "rejected", rejected_reason: reason, updated_at: now() }).eq("id", m.id);
    toast("Milestone rejected", "info"); load();
  };

  const totalBudget = milestones.reduce((s, m) => s + (m.amount || 0), 0);
  const approved = milestones.filter(m => m.status === "approved");

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 17 }}>Milestones</h3>
          <p style={{ fontSize: 13, color: "var(--sub)" }}>{approved.length}/{milestones.length} approved · {fmtKES(totalBudget)} total</p>
        </div>
        {isAdmin && <Btn size="sm" onClick={() => setShowAdd(true)}>+ Add Milestone</Btn>}
      </div>

      {showAdd && (
        <Card style={{ padding: 20, marginBottom: 16, background: "var(--surf)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: "1/-1" }}><Inp label="Milestone Title" value={form.title} onChange={v => setForm({ ...form, title: v })} required /></div>
            <Inp label="Amount (KES)" type="number" value={form.amount} onChange={v => setForm({ ...form, amount: v })} required />
            <Inp label="Due Date" type="date" value={form.due_date} onChange={v => setForm({ ...form, due_date: v })} />
            <div style={{ gridColumn: "1/-1" }}><Inp label="Description" value={form.description} onChange={v => setForm({ ...form, description: v })} rows={2} /></div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" loading={saving} onClick={addMilestone}>Save Milestone</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {milestones.length === 0
        ? <Empty icon="🏁" title="No milestones yet" sub={isAdmin ? "Add milestones to break this project into steps" : "Admin will add milestones for this project"} />
        : milestones.map((m, i) => (
          <Card key={m.id} style={{ padding: 18, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--g)", color: "#fff", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 15 }}>{m.title}</span>
                  <Bdg status={m.status} label={m.status.replace("_"," ")} />
                </div>
                {m.description && <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 6, marginLeft: 30 }}>{m.description}</p>}
                {m.deliverable_note && (
                  <div style={{ marginLeft: 30, background: "#EFF6FF", borderRadius: 6, padding: "8px 12px", fontSize: 13, color: "#1D4ED8" }}>
                    <strong>Deliverable:</strong> {m.deliverable_note}
                  </div>
                )}
                {m.due_date && <p style={{ fontSize: 12, color: "var(--sub)", marginTop: 4, marginLeft: 30 }}>Due: {fmtDate(m.due_date)}</p>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 16, color: "var(--gd)" }}>{fmtKES(m.amount)}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, justifyContent: "flex-end" }}>
                  {!isAdmin && m.status === "in_progress" && (
                    <Btn size="sm" onClick={() => setDeliverableModal(m)}>Submit Deliverable</Btn>
                  )}
                  {isAdmin && m.status === "submitted" && (
                    <>
                      <Btn size="sm" onClick={() => approveMilestone(m)}>Approve ✓</Btn>
                      <Btn size="sm" variant="danger" onClick={() => { const r = prompt("Rejection reason:"); if(r) rejectMilestone(m, r); }}>Reject</Btn>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))
      }

      {/* Deliverable submission modal */}
      {deliverableModal && (
        <div className="overlay" onClick={() => setDeliverableModal(null)}>
          <div className="modal" style={{ maxWidth: 460, padding: 28 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Submit: {deliverableModal.title}</h3>
            <Inp label="Describe your deliverable" value={deliverableNote} onChange={setDeliverableNote} rows={4} placeholder="What did you deliver? Include links, notes, or file references." required />
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Btn loading={uploading} onClick={() => submitDeliverable(deliverableModal)}>Submit →</Btn>
              <Btn variant="ghost" onClick={() => setDeliverableModal(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// P1-2: RATINGS & REVIEWS
// =============================================================
export function ReviewModal({ job, freelancer, reviewerId, onClose, onSaved, toast }) {
  const [form, setForm] = useState({ rating: 5, quality_score: 5, communication_score: 5, timeliness_score: 5, comment: "" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("reviews").upsert({
      job_id: job.id, reviewer_id: reviewerId, freelancer_id: freelancer.id,
      ...form, is_public: true,
    }, { onConflict: "job_id,freelancer_id" });
    if (!error) { toast("Review submitted!", "success"); onSaved?.(); onClose(); }
    else toast(error.message, "error");
    setSaving(false);
  };

  const avg = Math.round((form.quality_score + form.communication_score + form.timeliness_score) / 3);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 480, padding: 28 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Rate {freelancer.name}</h3>
        <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 20 }}>Job: {job.title}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[["Overall Rating", "rating"], ["Quality of Work", "quality_score"], ["Communication", "communication_score"], ["Timeliness", "timeliness_score"]].map(([label, key]) => (
            <div key={key}>
              <label style={{ fontSize: 13, fontWeight: 700, color: "var(--mu)", marginBottom: 6, display: "block" }}>{label}</label>
              <Stars value={form[key]} max={5} onChange={v => setForm({ ...form, [key]: v })} size={24} />
            </div>
          ))}
          <Inp label="Comment (optional)" value={form.comment} onChange={v => setForm({ ...form, comment: v })} rows={3} placeholder="Describe the freelancer's work and professionalism…" />
          <div style={{ background: "var(--gl)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--gd)" }}>
            Average score: <strong>{avg}/5 stars</strong>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <Btn loading={saving} onClick={save}>Submit Review</Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

export function FreelancerReviews({ freelancerId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("reviews").select("*, reviewer:reviewer_id(name,role)").eq("freelancer_id", freelancerId).eq("is_public", true).order("created_at", { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false); });
  }, [freelancerId]);

  if (loading) return <Spinner />;
  if (!reviews.length) return <Empty icon="⭐" title="No reviews yet" sub="Reviews appear after completed projects" />;

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 36, color: "var(--navy)" }}>{avgRating}</div>
          <Stars value={Math.round(avgRating)} />
          <div style={{ fontSize: 12, color: "var(--sub)", marginTop: 4 }}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</div>
        </div>
        <div style={{ flex: 1 }}>
          {["quality_score", "communication_score", "timeliness_score"].map(k => {
            const avg = reviews.reduce((s, r) => s + (r[k] || 0), 0) / reviews.length;
            const label = { quality_score: "Quality", communication_score: "Communication", timeliness_score: "Timeliness" }[k];
            return (
              <div key={k} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--sub)", width: 120, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 6, background: "var(--bdr)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${avg * 20}%`, background: "linear-gradient(90deg,var(--g),var(--gd))", borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, width: 24, textAlign: "right" }}>{avg.toFixed(1)}</span>
              </div>
            );
          })}
        </div>
      </div>
      {reviews.map(r => (
        <Card key={r.id} style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg,var(--g),var(--info))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13 }}>{(r.reviewer?.name || "A")[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{r.reviewer?.name || "AfriGig Admin"}</div>
                <div style={{ fontSize: 12, color: "var(--sub)" }}>{fmtDate(r.created_at)}</div>
              </div>
            </div>
            <Stars value={r.rating} size={16} />
          </div>
          {r.comment && <p style={{ fontSize: 13, color: "var(--mu)", lineHeight: 1.65 }}>{r.comment}</p>}
        </Card>
      ))}
    </div>
  );
}

// =============================================================
// P1-3: KYC VERIFICATION FLOW
// =============================================================
export function KYCFlow({ user, onUpdate, toast }) {
  const [step, setStep] = useState(() => {
    if (user.kyc_status === "approved") return "done";
    if (user.kyc_id_uploaded && user.kyc_selfie_done) return "review";
    if (user.kyc_id_uploaded) return "selfie";
    return "id";
  });
  const [uploading, setUploading] = useState(false);
  const [idFile, setIdFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      toast("Camera access denied. Please upload a selfie instead.", "warn");
    }
  };

  const captureSelfie = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setSelfieFile(file);
      streamRef.current?.getTracks().forEach(t => t.stop());
    }, "image/jpeg", 0.85);
  };

  const uploadId = async () => {
    if (!idFile) return toast("Select your ID document", "error");
    setUploading(true);
    const result = await uploadFile(idFile, "kyc", user.id, { kycType: "id_front" });
    if (result.error) { toast(result.error, "error"); setUploading(false); return; }
    await supabase.from("profiles").update({ kyc_id_uploaded: true, kyc_id_url: result.url, kyc_status: "pending", updated_at: now() }).eq("id", user.id);
    await supabase.from("file_records").insert({ user_id: user.id, type: "kyc_id", bucket: result.bucket, path: result.path, url: result.url, original_name: idFile.name, size_bytes: idFile.size, mime_type: idFile.type });
    onUpdate?.({ ...user, kyc_id_uploaded: true, kyc_status: "pending" });
    toast("ID uploaded!", "success");
    setStep("selfie");
    setUploading(false);
  };

  const uploadSelfie = async () => {
    const file = selfieFile;
    if (!file) return toast("Capture or upload a selfie", "error");
    setUploading(true);
    const result = await uploadFile(file, "kyc", user.id, { kycType: "selfie" });
    if (result.error) { toast(result.error, "error"); setUploading(false); return; }
    await supabase.from("profiles").update({ kyc_selfie_done: true, kyc_selfie_url: result.url, kyc_status: "pending", updated_at: now() }).eq("id", user.id);
    await supabase.from("file_records").insert({ user_id: user.id, type: "kyc_selfie", bucket: result.bucket, path: result.path, url: result.url, original_name: "selfie.jpg", size_bytes: file.size, mime_type: file.type });
    // Notify admin
    const { data: admin } = await supabase.from("profiles").select("id").eq("role","admin").limit(1).maybeSingle();
    if (admin) await supabase.from("notifications").insert({ user_id: admin.id, type: "kyc.submitted", title: "KYC Submitted", message: `${user.name} submitted KYC documents for review`, is_read: false });
    onUpdate?.({ ...user, kyc_selfie_done: true, kyc_status: "pending" });
    toast("Selfie uploaded! KYC under review.", "success");
    setStep("review");
    setUploading(false);
  };

  if (step === "done") return (
    <Card style={{ padding: 24, background: "#ECFDF5", border: "1px solid #A7F3D0" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 32 }}>✅</span>
        <div>
          <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 16, color: "#065F46" }}>KYC Verified</div>
          <p style={{ fontSize: 13, color: "#047857", marginTop: 2 }}>Your identity is verified. Withdrawal limit: KES 50,000.</p>
        </div>
      </div>
    </Card>
  );

  if (step === "review") return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span style={{ fontSize: 32 }}>⏳</span>
        <div>
          <div style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 16 }}>KYC Under Review</div>
          <p style={{ fontSize: 13, color: "var(--sub)", marginTop: 2 }}>Our team is reviewing your documents. Typically 1–2 business days. You'll be notified via email and notification.</p>
        </div>
      </div>
    </Card>
  );

  return (
    <Card style={{ padding: 24 }}>
      <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Identity Verification (KYC)</h3>
      <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 20 }}>Required to unlock higher withdrawal limits and earn a Verified badge.</p>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 0, marginBottom: 24 }}>
        {[["📄", "ID Document"], ["🤳", "Selfie"], ["✅", "Review"]].map(([icon, label], i) => {
          const stepIdx = { id: 0, selfie: 1, review: 2 }[step] || 0;
          const done = stepIdx > i;
          const active = stepIdx === i;
          return (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", margin: "0 auto 6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: done ? "var(--g)" : active ? "var(--gl)" : "var(--surf)", border: `2px solid ${done || active ? "var(--g)" : "var(--bdr)"}` }}>{done ? "✓" : icon}</div>
              <div style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? "var(--gd)" : "var(--sub)" }}>{label}</div>
            </div>
          );
        })}
      </div>

      {step === "id" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "var(--surf)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "var(--mu)" }}>
            Upload a clear photo of your <strong>Kenya National ID</strong> (front side). Must be readable and unobstructed.
          </div>
          <div className="fdr" onClick={() => document.getElementById("kyc-id-input").click()}>
            {idFile ? <div style={{ color: "var(--gd)", fontWeight: 600, fontSize: 14 }}>✓ {idFile.name}</div> : <><div style={{ fontSize: 28, marginBottom: 8 }}>📄</div><div style={{ fontSize: 14, color: "var(--sub)" }}>Click to select your ID photo</div><div style={{ fontSize: 12, color: "var(--sub)", marginTop: 4 }}>JPG or PNG, max 5MB</div></>}
            <input id="kyc-id-input" type="file" accept="image/jpeg,image/png" style={{ display: "none" }} onChange={e => setIdFile(e.target.files[0])} />
          </div>
          <Btn loading={uploading} onClick={uploadId} disabled={!idFile}>Upload ID & Continue →</Btn>
        </div>
      )}

      {step === "selfie" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: "var(--surf)", borderRadius: 8, padding: "12px 16px", fontSize: 13, color: "var(--mu)" }}>
            Take a selfie or upload a clear photo of your face. Must match your ID photo.
          </div>
          {!selfieFile && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", borderRadius: 10, background: "#000", display: "block" }} />
              <canvas ref={canvasRef} style={{ display: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <Btn onClick={startCamera} variant="outline">Open Camera</Btn>
                <Btn onClick={captureSelfie}>Capture Selfie</Btn>
                <span style={{ fontSize: 13, color: "var(--sub)", alignSelf: "center" }}>or</span>
                <label style={{ padding: "9px 16px", border: "1.5px solid var(--bdr)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>
                  Upload Photo<input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setSelfieFile(e.target.files[0])} />
                </label>
              </div>
            </div>
          )}
          {selfieFile && <div style={{ background: "var(--gl)", borderRadius: 8, padding: "12px 14px", fontSize: 13, color: "var(--gd)", fontWeight: 600 }}>✓ Selfie ready: {selfieFile.name || "selfie.jpg"}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <Btn loading={uploading} onClick={uploadSelfie} disabled={!selfieFile}>Submit for Review →</Btn>
            {selfieFile && <Btn variant="ghost" onClick={() => setSelfieFile(null)}>Retake</Btn>}
          </div>
        </div>
      )}
    </Card>
  );
}

// =============================================================
// P1-3: KYC ADMIN REVIEW QUEUE
// =============================================================
export function KYCReviewQueue({ toast }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("profiles").select("*").eq("kyc_status", "pending").order("updated_at");
    setPending(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const decide = async (profile, approved) => {
    const { data: admin } = await supabase.from("profiles").select("id").eq("role","admin").limit(1).maybeSingle();
    await supabase.from("profiles").update({
      kyc_status: approved ? "approved" : "rejected",
      kyc_reviewed_at: now(),
      kyc_reviewed_by: admin?.id,
      withdrawal_limit: approved ? 50000 : 1000,
      updated_at: now(),
    }).eq("id", profile.id);
    // Notify freelancer
    await supabase.from("notifications").insert({ user_id: profile.id, type: approved ? "kyc.approved" : "kyc.rejected", title: approved ? "KYC Approved! ✅" : "KYC Not Approved", message: approved ? "Your identity is verified. Withdrawal limit increased to KES 50,000." : "Your KYC documents could not be verified. Contact support.", is_read: false });
    fetch("/api/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to: profile.email, templateId: approved ? "kyc_approved" : "generic", templateData: { name: profile.name, subject: approved ? "KYC Verified" : "KYC Not Approved", body: approved ? "Your identity has been verified on AfriGig." : "Your KYC could not be verified. Please contact support." } }) }).catch(() => {});
    toast(`KYC ${approved ? "approved" : "rejected"} for ${profile.name}`, "success");
    setSelected(null); load();
  };

  if (loading) return <Spinner />;
  if (!pending.length) return <Empty icon="🔍" title="No KYC pending" sub="All submissions have been reviewed" />;

  return (
    <div>
      <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>KYC Review Queue ({pending.length})</h3>
      {pending.map(p => (
        <Card key={p.id} style={{ padding: 18, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,var(--g),var(--info))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>{(p.name||"?")[0]}</div>
              <div>
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "var(--sub)" }}>{p.email} · {p.track || "—"}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {p.kyc_id_url && <a href={p.kyc_id_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--g)", fontWeight: 700 }}>View ID ↗</a>}
              {p.kyc_selfie_url && <a href={p.kyc_selfie_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--g)", fontWeight: 700 }}>View Selfie ↗</a>}
              <Btn size="sm" onClick={() => decide(p, true)}>Approve</Btn>
              <Btn size="sm" variant="danger" onClick={() => decide(p, false)}>Reject</Btn>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// =============================================================
// P1-5: FREELANCER PUBLIC PROFILE PAGE
// =============================================================
export function PublicProfile({ userId, onClose, onMessage }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("*").eq("id", userId).single()
      .then(({ data }) => { setProfile(data); setLoading(false); });
  }, [userId]);

  if (loading) return <div className="overlay"><Spinner /></div>;
  if (!profile) return null;

  const avgRating = profile.average_rating || 0;
  const trackInfo = { software:"💻",uiux:"🎨",data:"📊",devops:"☁️",writing:"✍️",nontech:"🗂️" };
  const badgeColors = { Elite:"#8B5CF6",Gold:"#D97706",Silver:"#6B7280",Bronze:"#92400E" };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 600, padding: 0, maxHeight: "90vh" }} onClick={e => e.stopPropagation()}>
        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg,#0C0F1A,#162032)", padding: "28px 28px 0", borderRadius: "16px 16px 0 0" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,var(--g),var(--info))", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 28, flexShrink: 0 }}>{(profile.name||"?")[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <h2 style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 22, color: "#fff" }}>{profile.name}</h2>
                {profile.kyc_status === "approved" && <span style={{ background: "var(--g)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 99 }}>✓ VERIFIED</span>}
              </div>
              <div style={{ color: "rgba(255,255,255,.55)", fontSize: 14, marginTop: 2 }}>
                {trackInfo[profile.track] || "🎯"} {profile.track ? profile.track.charAt(0).toUpperCase() + profile.track.slice(1) : "Freelancer"} · {profile.country || "Africa"}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                {avgRating > 0 && <div style={{ display: "flex", gap: 4, alignItems: "center" }}><Stars value={Math.round(avgRating)} size={14} /><span style={{ fontSize: 13, color: "rgba(255,255,255,.7)", fontWeight: 700 }}>{avgRating.toFixed(1)} ({profile.total_reviews || 0})</span></div>}
                {profile.jobs_completed > 0 && <span style={{ fontSize: 13, color: "rgba(255,255,255,.55)" }}>✅ {profile.jobs_completed} jobs completed</span>}
                <span style={{ fontSize: 13, color: profile.is_online ? "var(--g)" : "rgba(255,255,255,.3)", fontWeight: 700 }}>{profile.is_online ? "● Online" : "○ Offline"}</span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.1)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 18, flexShrink: 0 }}>×</button>
          </div>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0, borderTop: "1px solid rgba(255,255,255,.1)" }}>
            {["About","Skills","Reviews"].map(tab => (
              <button key={tab} style={{ padding: "10px 18px", background: "none", border: "none", color: "rgba(255,255,255,.55)", cursor: "pointer", fontSize: 13, fontWeight: 600, borderBottom: "2px solid transparent" }}>{tab}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: 28, overflowY: "auto", maxHeight: 460 }}>
          {profile.bio && <p style={{ fontSize: 14, color: "var(--mu)", lineHeight: 1.75, marginBottom: 20 }}>{profile.bio}</p>}

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
            {[["Assessment", profile.assessment_pct != null ? `${profile.assessment_pct}%` : "—", "📋"], ["Experience", profile.experience?.split(" ").slice(0,3).join(" ")+"…" || "—", "💼"], ["Availability", profile.availability || "—", "📅"]].map(([label, value, icon]) => (
              <div key={label} style={{ background: "var(--surf)", borderRadius: 8, padding: "12px 14px", textAlign: "center", border: "1px solid var(--bdr)" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 15 }}>{value}</div>
                <div style={{ fontSize: 11, color: "var(--sub)" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Skills */}
          {profile.skills?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 13, color: "var(--sub)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Skills</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(Array.isArray(profile.skills) ? profile.skills : profile.skills.split(",")).map(s => (
                  <span key={s} className="tag tg">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          {/* Portfolio links */}
          {profile.portfolio_links?.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 13, color: "var(--sub)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>Portfolio</h4>
              {(Array.isArray(profile.portfolio_links) ? profile.portfolio_links : [profile.portfolio_links]).filter(Boolean).map((link, i) => (
                <a key={i} href={link} target="_blank" rel="noopener noreferrer" style={{ display: "block", color: "var(--g)", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>🔗 {link}</a>
              ))}
            </div>
          )}

          {/* Reviews */}
          <FreelancerReviews freelancerId={userId} />
        </div>

        {/* Footer CTA */}
        <div style={{ padding: "16px 28px", borderTop: "1px solid var(--bdr)", display: "flex", gap: 10 }}>
          <Btn onClick={() => onMessage?.(profile)}>Send Message</Btn>
          <Btn variant="ghost" onClick={onClose}>Close</Btn>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// P2-1: PREMIUM SUBSCRIPTION TIERS
// =============================================================
const SUBSCRIPTION_PLANS = {
  free:  { label: "Free",  price: 0,    bids: 5,   color: "var(--sub)",   features: ["5 bids/month","Standard listing","Basic support"] },
  pro:   { label: "Pro",   price: 999,  bids: 20,  color: "var(--info)",  features: ["20 bids/month","Highlighted profile","Priority applications","Faster payout"] },
  elite: { label: "Elite", price: 2499, bids: 999, color: "var(--pur)",   features: ["Unlimited bids","Top Rated badge","Elite commission (8%)","Priority review queue","Dedicated support"] },
};

export function SubscriptionPlans({ user, toast, onUpgrade }) {
  const [loading, setLoading] = useState(null);
  const [phone, setPhone] = useState(user?.phone_number || "");
  const currentTier = user?.subscription_tier || "free";
  const [showPayment, setShowPayment] = useState(null);

  const subscribe = async (tier) => {
    if (!phone.match(/^254[0-9]{9}$/)) return toast("Enter valid M-Pesa number", "error");
    setLoading(tier);
    const plan = SUBSCRIPTION_PLANS[tier];
    try {
      const r = await fetch("/api/mpesa?action=stk", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount: plan.price, reference: "AfriGigPro", desc: `${plan.label} Sub` }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.errorMessage || "Payment failed");

      // Record subscription
      const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
      await supabase.from("subscriptions").insert({ user_id: user.id, tier, amount_kes: plan.price, status: "active", expires_at: expiresAt, payment_ref: d.CheckoutRequestID });
      await supabase.from("profiles").update({ subscription_tier: tier, subscription_expires_at: expiresAt, updated_at: now() }).eq("id", user.id);
      toast(`${plan.label} subscription activated! ✨`, "success");
      setShowPayment(null);
      onUpgrade?.({ ...user, subscription_tier: tier });
    } catch (err) {
      toast(err.message, "error");
    }
    setLoading(null);
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Upgrade Your Plan</h2>
      <p style={{ color: "var(--sub)", marginBottom: 24 }}>More bids, better placement, lower commission.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          const isCurrent = currentTier === key;
          return (
            <Card key={key} style={{ padding: 24, border: `2px solid ${isCurrent ? plan.color : "var(--bdr)"}`, position: "relative", overflow: "hidden" }}>
              {isCurrent && <div style={{ position: "absolute", top: 10, right: 10, background: plan.color, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>CURRENT</div>}
              {key === "pro" && <div style={{ position: "absolute", top: 10, right: isCurrent ? 80 : 10, background: "var(--warn)", color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 99 }}>POPULAR</div>}
              <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 20, color: plan.color, marginBottom: 4 }}>{plan.label}</div>
              <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 28, marginBottom: 4 }}>{plan.price === 0 ? "Free" : `KES ${plan.price.toLocaleString()}`}</div>
              {plan.price > 0 && <div style={{ fontSize: 12, color: "var(--sub)", marginBottom: 16 }}>per month</div>}
              <div style={{ marginBottom: 16, fontSize: 13 }}>
                {plan.features.map(f => <div key={f} style={{ marginBottom: 5, display: "flex", gap: 6 }}><span style={{ color: "var(--g)" }}>✓</span>{f}</div>)}
              </div>
              {!isCurrent && key !== "free" && (
                <Btn style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowPayment(key)} loading={loading === key}>
                  Upgrade to {plan.label} →
                </Btn>
              )}
            </Card>
          );
        })}
      </div>

      {showPayment && (
        <div className="overlay" onClick={() => setShowPayment(null)}>
          <div className="modal" style={{ maxWidth: 400, padding: 28 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 18, marginBottom: 16 }}>Subscribe: {SUBSCRIPTION_PLANS[showPayment].label}</h3>
            <div style={{ background: "var(--gl)", borderRadius: 8, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{SUBSCRIPTION_PLANS[showPayment].label} Plan (30 days)</span>
              <span style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 16, color: "var(--gd)" }}>KES {SUBSCRIPTION_PLANS[showPayment].price.toLocaleString()}</span>
            </div>
            <Inp label="M-Pesa Number" value={phone} onChange={setPhone} placeholder="254712345678" />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <Btn loading={loading === showPayment} onClick={() => subscribe(showPayment)}>Pay & Subscribe →</Btn>
              <Btn variant="ghost" onClick={() => setShowPayment(null)}>Cancel</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// P2-2: ADVANCED BIDDING — Counter-offer
// =============================================================
export function CounterOfferModal({ application, job, onClose, onSaved, toast }) {
  const [form, setForm] = useState({ counter_offer: application.bid_amount || "", counter_message: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.counter_offer) return toast("Enter counter-offer amount", "error");
    setSaving(true);
    await supabase.from("applications").update({
      counter_offer: Number(form.counter_offer),
      counter_message: form.counter_message,
      status: "shortlisted",
      shortlisted_at: now(),
      bid_expires_at: new Date(Date.now() + 48 * 3600000).toISOString(),
    }).eq("id", application.id);
    await supabase.from("notifications").insert({
      user_id: application.user_id, type: "bid.counter_offer",
      title: "Counter-offer received!",
      message: `Admin countered your bid on "${job.title}" with ${fmtKES(form.counter_offer)}. Expires in 48h.`,
      is_read: false,
    });
    toast("Counter-offer sent!", "success");
    onSaved?.(); onClose();
    setSaving(false);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 420, padding: 28 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Counter Offer</h3>
        <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 16 }}>Original bid: {fmtKES(application.bid_amount)} from {application.user_name || "Freelancer"}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Inp label="Your Counter (KES)" type="number" value={form.counter_offer} onChange={v => setForm({ ...form, counter_offer: v })} placeholder={application.bid_amount} required />
          <Inp label="Message (optional)" value={form.counter_message} onChange={v => setForm({ ...form, counter_message: v })} rows={3} placeholder="Explain your counter-offer…" />
          <div style={{ background: "#FFFBEB", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#92400E" }}>⏰ Freelancer has 48 hours to accept or decline this counter-offer.</div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <Btn loading={saving} onClick={submit}>Send Counter →</Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// P2-4: DARK MODE TOGGLE
// =============================================================
export function useDarkMode() {
  const [dark, setDark] = useState(() => localStorage.getItem("ag3_dark") === "1");

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.style.setProperty("--surf", "#0F172A");
      root.style.setProperty("--wh", "#1E293B");
      root.style.setProperty("--navy", "#F1F5F9");
      root.style.setProperty("--mu", "#CBD5E1");
      root.style.setProperty("--sub", "#94A3B8");
      root.style.setProperty("--bdr", "#334155");
      root.style.setProperty("--ink", "#F8FAFC");
      root.style.setProperty("--sl", "#1E293B");
      document.body.style.background = "#0F172A";
      document.body.style.color = "#F1F5F9";
      document.querySelectorAll(".card").forEach(el => { el.style.background = "#1E293B"; el.style.borderColor = "#334155"; });
    } else {
      root.style.setProperty("--surf", "#F8FAFC");
      root.style.setProperty("--wh", "#fff");
      root.style.setProperty("--navy", "#111827");
      root.style.setProperty("--mu", "#374151");
      root.style.setProperty("--sub", "#6B7280");
      root.style.setProperty("--bdr", "#E5E7EB");
      root.style.setProperty("--ink", "#0C0F1A");
      root.style.setProperty("--sl", "#1F2937");
      document.body.style.background = "#F8FAFC";
      document.body.style.color = "#111827";
    }
    localStorage.setItem("ag3_dark", dark ? "1" : "0");
  }, [dark]);

  return { dark, toggle: () => setDark(v => !v) };
}

export function DarkModeToggle({ dark, toggle }) {
  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{ background: "none", border: "1.5px solid var(--bdr)", borderRadius: 8, width: 36, height: 36, cursor: "pointer", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--sub)", flexShrink: 0, transition: "all .15s" }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

// =============================================================
// P3-1: REFERRAL SYSTEM
// =============================================================
export function ReferralPanel({ user, toast }) {
  const [stats, setStats] = useState({ total: 0, rewarded: 0, pending: 0, earned: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("referrals").select("*").eq("referrer_id", user.id);
      const refs = data || [];
      setStats({
        total: refs.length,
        rewarded: refs.filter(r => r.status === "rewarded").length,
        pending: refs.filter(r => r.status === "pending").length,
        earned: refs.filter(r => r.status === "rewarded").reduce((s, r) => s + (r.reward_amount || 200), 0),
      });
      setLoading(false);
    })();
  }, [user.id]);

  const code = user.referral_code || "—";
  const link = `${window.location.origin}/?ref=${code}`;

  const copy = () => {
    navigator.clipboard.writeText(link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <Card style={{ padding: 24 }}>
      <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Referral Program</h3>
      <p style={{ fontSize: 13, color: "var(--sub)", marginBottom: 20 }}>Earn KES 200 for every freelancer you refer who gets approved on AfriGig.</p>

      {loading ? <Spinner /> : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
            {[["Referred", stats.total, "👥"], ["Approved", stats.rewarded, "✅"], ["Pending", stats.pending, "⏳"], ["Earned", `KES ${stats.earned.toLocaleString()}`, "💰"]].map(([label, value, icon]) => (
              <div key={label} style={{ background: "var(--surf)", borderRadius: 8, padding: "12px 14px", textAlign: "center", border: "1px solid var(--bdr)" }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 18 }}>{value}</div>
                <div style={{ fontSize: 11, color: "var(--sub)" }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--surf)", border: "1px solid var(--bdr)", borderRadius: 10, padding: "16px 18px" }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", letterSpacing: ".05em", display: "block", marginBottom: 8 }}>Your Referral Link</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input readOnly value={link} className="inp" style={{ flex: 1, fontSize: 13, fontFamily: "var(--fm)" }} />
              <Btn size="sm" variant={copied ? "outline" : "primary"} onClick={copy}>{copied ? "Copied! ✓" : "Copy"}</Btn>
            </div>
            <p style={{ fontSize: 12, color: "var(--sub)", marginTop: 8 }}>Share this link. When they register and get approved, you earn KES 200 credited to your wallet.</p>
          </div>
        </>
      )}
    </Card>
  );
}

// =============================================================
// P3-3: EXPORT REPORTS
// =============================================================
export function ExportReports({ toast }) {
  const [loading, setLoading] = useState(null);

  const doExport = async (type) => {
    setLoading(type);
    try {
      let rows = [], filename = "";
      if (type === "transactions") {
        const { data } = await supabase.from("transactions").select("*").order("created_at", { ascending: false });
        rows = (data || []).map(r => ({ Date: fmtDate(r.created_at), Type: r.type, Direction: r.entry_type, Amount_KES: r.amount, Currency: r.currency, Status: r.status, Reference: r.reference }));
        filename = `afrigig_transactions_${Date.now()}.csv`;
      } else if (type === "users") {
        const { data } = await supabase.from("profiles").select("id,name,email,role,freelancer_status,track,country,assessment_pct,created_at").order("created_at", { ascending: false });
        rows = (data || []).map(r => ({ Name: r.name, Email: r.email, Role: r.role, Status: r.freelancer_status, Track: r.track, Country: r.country, Score_Pct: r.assessment_pct, Joined: fmtDate(r.created_at) }));
        filename = `afrigig_users_${Date.now()}.csv`;
      } else if (type === "jobs") {
        const { data } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
        rows = (data || []).map(r => ({ Title: r.title, Category: r.category, Status: r.status, Min_KES: r.budget_min, Max_KES: r.budget_max, Duration_Days: r.duration_days, Apps: r.apps_count || 0, Created: fmtDate(r.created_at) }));
        filename = `afrigig_jobs_${Date.now()}.csv`;
      } else if (type === "withdrawals") {
        const { data } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
        rows = (data || []).map(r => ({ Date: fmtDate(r.created_at), Amount: r.amount, Fee: r.fee, Net: r.net_amount, Phone: r.phone, Status: r.status, Reference: r.reference }));
        filename = `afrigig_withdrawals_${Date.now()}.csv`;
      }
      if (!rows.length) return toast("No data to export", "warn");
      exportCSV(rows, filename);
      toast(`Exported ${rows.length} rows`, "success");
    } catch (err) {
      toast(err.message, "error");
    }
    setLoading(null);
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {[["transactions","💳","Transactions"],["users","👥","Users"],["jobs","💼","Jobs"],["withdrawals","💸","Withdrawals"]].map(([type, icon, label]) => (
        <Btn key={type} variant="outline" size="sm" loading={loading === type} onClick={() => doExport(type)}>{icon} Export {label} CSV</Btn>
      ))}
    </div>
  );
}

// =============================================================
// P3-4: REVENUE DASHBOARD (Admin)
// =============================================================
export function RevenueDashboard() {
  const [data, setData] = useState({ totalRevenue: 0, monthlyRevenue: [], assessmentRevenue: 0, commissionRevenue: 0, withdrawalFees: 0, subscriptionRevenue: 0, freelancerFunnel: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [{ data: txns }, { data: profiles }, { data: subs }] = await Promise.all([
        supabase.from("transactions").select("type,entry_type,amount,created_at"),
        supabase.from("profiles").select("freelancer_status,created_at"),
        supabase.from("subscriptions").select("amount_kes,created_at"),
      ]);

      const assessmentRevenue = (txns || []).filter(t => t.type === "assessment_fee").reduce((s, t) => s + t.amount, 0);
      const commissionRevenue = (txns || []).filter(t => t.type === "commission").reduce((s, t) => s + t.amount, 0);
      const withdrawalFees = (txns || []).filter(t => t.type === "withdrawal_fee").reduce((s, t) => s + t.amount, 0);
      const subscriptionRevenue = (subs || []).reduce((s, r) => s + r.amount_kes, 0);
      const totalRevenue = assessmentRevenue + commissionRevenue + withdrawalFees + subscriptionRevenue;

      // Monthly breakdown (last 6 months)
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
        return { label: d.toLocaleString("default", { month: "short" }), month: d.getMonth(), year: d.getFullYear(), revenue: 0 };
      });
      (txns || []).forEach(t => {
        const d = new Date(t.created_at);
        const m = months.find(mo => mo.month === d.getMonth() && mo.year === d.getFullYear());
        if (m) m.revenue += t.amount;
      });

      // Funnel
      const statuses = ["REGISTERED","PROFILE_COMPLETED","ASSESSMENT_PENDING","ASSESSMENT_SUBMITTED","UNDER_REVIEW","APPROVED"];
      const funnel = {};
      (profiles || []).forEach(p => {
        const s = p.freelancer_status || "REGISTERED";
        funnel[s] = (funnel[s] || 0) + 1;
      });

      setData({ totalRevenue, monthlyRevenue: months, assessmentRevenue, commissionRevenue, withdrawalFees, subscriptionRevenue, freelancerFunnel: funnel });
      setLoading(false);
    })();
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}><Spinner /></div>;

  const maxRev = Math.max(...data.monthlyRevenue.map(m => m.revenue), 1);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 28, marginBottom: 24 }}>Revenue Dashboard</h1>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 28 }}>
        {[["Total Revenue", fmtKES(data.totalRevenue), "💰", "var(--g)"], ["Assessment Fees", fmtKES(data.assessmentRevenue), "🧪", "var(--pur)"], ["Commissions", fmtKES(data.commissionRevenue), "✂️", "var(--info)"], ["Subscriptions", fmtKES(data.subscriptionRevenue), "💎", "var(--warn)"], ["Withdrawal Fees", fmtKES(data.withdrawalFees), "💸", "var(--err)"]].map(([label, value, icon, color]) => (
          <Card key={label} style={{ padding: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>{label}</p>
                <p style={{ fontFamily: "var(--fh)", fontWeight: 800, fontSize: 22, color: "var(--ink)" }}>{value}</p>
              </div>
              <div style={{ width: 40, height: 40, background: `${color}18`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Monthly Revenue (6 months)</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
            {data.monthlyRevenue.map(m => (
              <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 10, color: "var(--sub)", fontWeight: 700 }}>{m.revenue > 0 ? `${Math.round(m.revenue/1000)}k` : ""}</span>
                <div style={{ width: "100%", background: "linear-gradient(180deg,var(--g),var(--gd))", borderRadius: "4px 4px 0 0", height: `${Math.max(4, (m.revenue / maxRev) * 120)}px`, transition: "height .6s" }} />
                <span style={{ fontSize: 11, color: "var(--sub)", fontWeight: 600 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Funnel */}
        <Card style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 16, marginBottom: 20 }}>Freelancer Funnel</h3>
          {["REGISTERED","PROFILE_COMPLETED","ASSESSMENT_PENDING","UNDER_REVIEW","APPROVED"].map((s, i, arr) => {
            const count = data.freelancerFunnel[s] || 0;
            const maxCount = data.freelancerFunnel[arr[0]] || 1;
            const colors = ["#E0E7FF","#DBEAFE","#FEF3C7","#EDE9FE","#DCFCE7"];
            const textColors = ["#4338CA","#1D4ED8","#B45309","#6D28D9","#065F46"];
            return (
              <div key={s} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "var(--mu)", fontWeight: 600 }}>{s.replace(/_/g," ")}</span>
                  <span style={{ fontWeight: 800, color: textColors[i] }}>{count}</span>
                </div>
                <div style={{ height: 8, background: "var(--bdr)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(count / maxCount) * 100}%`, background: colors[i], transition: "width .6s" }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Export */}
      <Card style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Export Data</h3>
            <p style={{ fontSize: 13, color: "var(--sub)" }}>Download platform data as CSV</p>
          </div>
          <ExportReports toast={msg => alert(msg)} />
        </div>
      </Card>
    </div>
  );
}

// =============================================================
// P3-4: ANNOUNCEMENTS (Admin create + User view)
// =============================================================
export function AnnouncementBanner({ role }) {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ag3_dismissed_anns") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    supabase.from("announcements")
      .select("*")
      .eq("is_active", true)
      .or(`target_role.eq.all,target_role.eq.${role}`)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setAnnouncements((data || []).filter(a => !dismissed.includes(a.id))));
  }, [role]);

  const dismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("ag3_dismissed_anns", JSON.stringify(next));
    setAnnouncements(a => a.filter(x => x.id !== id));
  };

  const colors = { info: ["#EFF6FF","#1D4ED8","#DBEAFE"], warning: ["#FFFBEB","#B45309","#FDE68A"], success: ["#ECFDF5","#065F46","#A7F3D0"], urgent: ["#FEF2F2","#991B1B","#FECACA"] };

  if (!announcements.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
      {announcements.map(a => {
        const [bg, text, border] = colors[a.type] || colors.info;
        return (
          <div key={a.id} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div>
              <strong style={{ fontSize: 13, color: text }}>{a.title}</strong>
              <p style={{ fontSize: 13, color: text, opacity: .8, marginTop: 2 }}>{a.body}</p>
            </div>
            <button onClick={() => dismiss(a.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: text, opacity: .5, flexShrink: 0 }}>×</button>
          </div>
        );
      })}
    </div>
  );
}

export function AnnouncementsAdmin({ toast }) {
  const [anns, setAnns] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", type: "info", target_role: "all" });
  const [saving, setSaving] = useState(false);

  const load = () => supabase.from("announcements").select("*").order("created_at", { ascending: false }).then(({ data }) => setAnns(data || []));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.title || !form.body) return;
    setSaving(true);
    const { data: admin } = await supabase.from("profiles").select("id").eq("role","admin").limit(1).maybeSingle();
    await supabase.from("announcements").insert({ ...form, created_by: admin?.id, is_active: true });
    toast("Announcement published!", "success");
    setShowCreate(false); setForm({ title: "", body: "", type: "info", target_role: "all" }); load();
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 20 }}>Announcements</h3>
        <Btn size="sm" onClick={() => setShowCreate(true)}>+ New Announcement</Btn>
      </div>

      {showCreate && (
        <Card style={{ padding: 20, marginBottom: 20, background: "var(--surf)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ gridColumn: "1/-1" }}><Inp label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} required /></div>
            <div style={{ gridColumn: "1/-1" }}><Inp label="Message" value={form.body} onChange={v => setForm({ ...form, body: v })} rows={3} required /></div>
            <Sel label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={[{value:"info",label:"Info"},{value:"warning",label:"Warning"},{value:"success",label:"Success"},{value:"urgent",label:"Urgent"}]} />
            <Sel label="Audience" value={form.target_role} onChange={v => setForm({ ...form, target_role: v })} options={[{value:"all",label:"Everyone"},{value:"freelancer",label:"Freelancers"},{value:"support",label:"Support Team"}]} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" loading={saving} onClick={create}>Publish</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {anns.map(a => (
        <Card key={a.id} style={{ padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                <strong style={{ fontSize: 14 }}>{a.title}</strong>
                <span className={`badge ${a.is_active ? "bg" : "bgr"}`}>{a.is_active ? "Live" : "Inactive"}</span>
                <span className="badge tgr">{a.type}</span>
                <span className="badge tgr">{a.target_role}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--sub)" }}>{a.body}</p>
              <p style={{ fontSize: 11, color: "var(--sub)", marginTop: 6 }}>{fmtDate(a.created_at)}</p>
            </div>
            <Btn size="sm" variant="danger" onClick={async () => { await supabase.from("announcements").update({ is_active: false }).eq("id", a.id); load(); }}>Deactivate</Btn>
          </div>
        </Card>
      ))}
    </div>
  );
}

// =============================================================
// P3-4: PROMO CODES (Admin)
// =============================================================
export function PromoCodesAdmin({ toast }) {
  const [codes, setCodes] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ code: "", discount_type: "percent", discount_value: "", max_uses: "100", applies_to: "assessment" });
  const [saving, setSaving] = useState(false);

  const load = () => supabase.from("promo_codes").select("*").order("created_at", { ascending: false }).then(({ data }) => setCodes(data || []));
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.code || !form.discount_value) return toast("Code and discount required", "error");
    setSaving(true);
    const { data: admin } = await supabase.from("profiles").select("id").eq("role","admin").limit(1).maybeSingle();
    const { error } = await supabase.from("promo_codes").insert({ ...form, discount_value: Number(form.discount_value), max_uses: Number(form.max_uses), created_by: admin?.id });
    if (!error) { toast("Promo code created!", "success"); setShowCreate(false); load(); }
    else toast(error.message, "error");
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 20 }}>Promo Codes</h3>
        <Btn size="sm" onClick={() => setShowCreate(true)}>+ New Code</Btn>
      </div>

      {showCreate && (
        <Card style={{ padding: 20, marginBottom: 20, background: "var(--surf)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Inp label="Code" value={form.code} onChange={v => setForm({ ...form, code: v.toUpperCase() })} placeholder="LAUNCH50" required />
            <Sel label="Discount Type" value={form.discount_type} onChange={v => setForm({ ...form, discount_type: v })} options={[{value:"percent",label:"Percentage (%)"},{value:"fixed",label:"Fixed (KES)"}]} />
            <Inp label={form.discount_type === "percent" ? "Discount %" : "Discount KES"} type="number" value={form.discount_value} onChange={v => setForm({ ...form, discount_value: v })} required />
            <Inp label="Max Uses" type="number" value={form.max_uses} onChange={v => setForm({ ...form, max_uses: v })} />
            <Sel label="Applies To" value={form.applies_to} onChange={v => setForm({ ...form, applies_to: v })} options={[{value:"assessment",label:"Assessment Fee"},{value:"subscription",label:"Subscription"},{value:"all",label:"All"}]} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Btn size="sm" loading={saving} onClick={create}>Create Code</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      <Card style={{ padding: 0, overflow: "hidden" }}>
        {codes.length === 0 ? <Empty icon="🏷️" title="No promo codes" sub="Create discount codes for freelancers" /> : (
          <table><thead><tr><th>Code</th><th>Discount</th><th>Applies To</th><th>Uses</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {codes.map(c => (
              <tr key={c.id}>
                <td style={{ fontFamily: "var(--fm)", fontWeight: 700, fontSize: 13 }}>{c.code}</td>
                <td style={{ fontWeight: 700 }}>{c.discount_type === "percent" ? `${c.discount_value}%` : `KES ${c.discount_value}`}</td>
                <td style={{ color: "var(--sub)", fontSize: 13 }}>{c.applies_to}</td>
                <td style={{ color: "var(--sub)", fontSize: 13 }}>{c.uses_count}/{c.max_uses}</td>
                <td><Bdg status={c.is_active ? "active" : "cancelled"} label={c.is_active ? "Active" : "Disabled"} /></td>
                <td>
                  <Btn size="sm" variant={c.is_active ? "danger" : "outline"} onClick={async () => { await supabase.from("promo_codes").update({ is_active: !c.is_active }).eq("id", c.id); load(); }}>
                    {c.is_active ? "Disable" : "Enable"}
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody></table>
        )}
      </Card>
    </div>
  );
}

// =============================================================
// P3-5: EARNINGS CHART (Freelancer)
// =============================================================
export function EarningsChart({ userId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: wallets } = await supabase.from("wallets").select("id").eq("user_id", userId).maybeSingle();
      if (!wallets?.id) { setLoading(false); return; }
      const { data: txns } = await supabase.from("transactions").select("amount,entry_type,created_at").eq("wallet_id", wallets.id).eq("entry_type","credit").order("created_at");
      const months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date(); d.setMonth(d.getMonth() - (5 - i));
        return { label: d.toLocaleString("default", { month: "short" }), month: d.getMonth(), year: d.getFullYear(), amount: 0 };
      });
      (txns || []).forEach(t => {
        const d = new Date(t.created_at);
        const m = months.find(mo => mo.month === d.getMonth() && mo.year === d.getFullYear());
        if (m) m.amount += t.amount;
      });
      setData(months);
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <Spinner />;

  const maxAmt = Math.max(...data.map(d => d.amount), 1);
  const total = data.reduce((s, d) => s + d.amount, 0);

  return (
    <Card style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 16 }}>Earnings (6 months)</h3>
          <p style={{ fontSize: 13, color: "var(--sub)" }}>Total: <strong style={{ color: "var(--gd)" }}>{fmtKES(total)}</strong></p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
        {data.map(m => (
          <div key={m.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {m.amount > 0 && <span style={{ fontSize: 9, color: "var(--sub)", fontWeight: 700 }}>{Math.round(m.amount/1000)}k</span>}
            <div title={fmtKES(m.amount)} style={{ width: "100%", background: m.amount > 0 ? "linear-gradient(180deg,var(--g),var(--gd))" : "var(--bdr)", borderRadius: "4px 4px 0 0", height: `${Math.max(4, (m.amount / maxAmt) * 100)}px`, transition: "height .6s" }} />
            <span style={{ fontSize: 10, color: "var(--sub)", fontWeight: 600 }}>{m.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

// =============================================================
// P3-6: SUPPORT SLA MONITOR
// =============================================================
export function SLAMonitor({ toast }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("tickets")
      .select("*, profiles:user_id(name,email)")
      .in("status", ["open","in_progress"])
      .not("sla_deadline", "is", null)
      .order("sla_deadline");
    setTickets(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  const slaStatus = (deadline) => {
    const now = Date.now();
    const dl = new Date(deadline).getTime();
    const hoursLeft = (dl - now) / 3600000;
    if (hoursLeft < 0) return { label: "OVERDUE", color: "var(--err)", bg: "#FEF2F2" };
    if (hoursLeft < 4) return { label: "CRITICAL", color: "#DC2626", bg: "#FEF2F2" };
    if (hoursLeft < 24) return { label: "WARNING", color: "var(--warn)", bg: "#FFFBEB" };
    return { label: "OK", color: "var(--gd)", bg: "var(--gl)" };
  };

  const overdueCount = tickets.filter(t => new Date(t.sla_deadline) < new Date()).length;
  const criticalCount = tickets.filter(t => { const h = (new Date(t.sla_deadline) - Date.now()) / 3600000; return h >= 0 && h < 4; }).length;

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ fontFamily: "var(--fh)", fontWeight: 700, fontSize: 18 }}>SLA Monitor</h3>
        <div style={{ display: "flex", gap: 8 }}>
          {overdueCount > 0 && <span className="badge br">⚠️ {overdueCount} overdue</span>}
          {criticalCount > 0 && <span className="badge by">🔥 {criticalCount} critical</span>}
        </div>
      </div>
      {tickets.length === 0 ? <Empty icon="✅" title="All SLAs on track" sub="No tickets at risk" /> : (
        tickets.map(t => {
          const sla = slaStatus(t.sla_deadline);
          return (
            <div key={t.id} style={{ background: sla.bg, border: `1px solid ${sla.color}33`, borderRadius: 8, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{t.subject}</div>
                <div style={{ fontSize: 12, color: "var(--sub)" }}>{t.profiles?.name || "User"} · {t.category} · {t.priority}</div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontFamily: "var(--fm)", fontSize: 12, color: sla.color, fontWeight: 700 }}>{new Date(t.sla_deadline).toLocaleString()}</span>
                <span className="badge" style={{ background: sla.bg, color: sla.color, border: `1px solid ${sla.color}44` }}>{sla.label}</span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// =============================================================
// P3-6: BULK REPLY TEMPLATES
// =============================================================
const REPLY_TEMPLATES = [
  { label: "Payment delayed", body: "We apologise for the delay in your payment. Our team is investigating this and will have it resolved within 24 hours. Thank you for your patience." },
  { label: "Assessment fee query", body: "Thank you for reaching out. As stated in our Terms of Service (Section 3), assessment fees are non-refundable regardless of the outcome. This policy allows us to fund our expert review process." },
  { label: "Account suspension", body: "Your account has been suspended pending a review of recent activity. Please submit a formal appeal at support@afrigig.com with your full name and account email. We will respond within 2 business days." },
  { label: "KYC pending", body: "Your KYC documents are currently under review. This process typically takes 1–2 business days. You'll receive an email notification once a decision is made." },
  { label: "Dispute resolved", body: "Your dispute has been reviewed and resolved. Please check your notification centre for the full decision. If you have further questions, do not hesitate to contact us." },
  { label: "Job not visible", body: "Jobs are posted and managed by our admin team on behalf of clients. New opportunities are added regularly. Please check the Jobs section daily or ensure your profile and skills are up to date." },
];

export function TemplateReplies({ onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Btn size="sm" variant="outline" onClick={() => setOpen(v => !v)}>📋 Templates</Btn>
      {open && (
        <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 0, width: 320, background: "#fff", border: "1px solid var(--bdr)", borderRadius: 10, boxShadow: "var(--shx)", zIndex: 200 }} className="ai">
          {REPLY_TEMPLATES.map(t => (
            <div key={t.label} onClick={() => { onSelect(t.body); setOpen(false); }} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid var(--bdr)", fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{t.label}</div>
              <div style={{ color: "var(--sub)", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.body.slice(0, 80)}…</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================
// P3-2: SEO META TAGS
// =============================================================
export function SEOMeta({ title, description, image }) {
  useEffect(() => {
    document.title = title ? `${title} | AfriGig` : "AfriGig — Africa's Top Freelancing Platform";
    const setMeta = (name, content, prop = false) => {
      const sel = prop ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let el = document.querySelector(sel);
      if (!el) { el = document.createElement("meta"); prop ? el.setAttribute("property", name) : el.setAttribute("name", name); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };
    if (description) {
      setMeta("description", description);
      setMeta("og:description", description, true);
      setMeta("twitter:description", description);
    }
    if (title) {
      setMeta("og:title", title + " | AfriGig", true);
      setMeta("twitter:title", title + " | AfriGig");
    }
    if (image) {
      setMeta("og:image", image, true);
      setMeta("twitter:image", image);
    }
    setMeta("og:type", "website", true);
    setMeta("twitter:card", "summary_large_image");
  }, [title, description, image]);
  return null;
}

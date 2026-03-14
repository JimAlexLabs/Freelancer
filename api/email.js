/**
 * AfriGig Email API — Vercel Serverless Function
 * Uses Resend (https://resend.com) for production email delivery.
 *
 * POST /api/email
 * Body: { to, subject, html, text, templateId, templateData }
 *
 * Set env vars in Vercel:
 *   RESEND_API_KEY=re_xxxxxxxxxxxx
 *   EMAIL_FROM=AfriGig <noreply@afrigig.co.ke>
 */

const RESEND_API = "https://api.resend.com/emails";

// ─── Email Templates ───────────────────────────────────────────

function baseTemplate(content, preheader = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AfriGig</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',Arial,sans-serif;background:#F8FAFC;color:#111827;line-height:1.6}
.wrap{max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
.header{background:linear-gradient(135deg,#0C0F1A,#162032);padding:32px;text-align:center}
.logo{display:inline-flex;align-items:center;gap:10px}
.logo-icon{width:44px;height:44px;background:linear-gradient(135deg,#00D4A0,#00A880);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;color:#fff;font-family:Georgia,serif}
.logo-text{font-size:22px;font-weight:800;color:#fff;font-family:Georgia,serif}
.body{padding:36px 40px}
h1{font-size:24px;font-weight:700;color:#111827;margin-bottom:12px;font-family:Georgia,serif}
h2{font-size:18px;font-weight:600;color:#111827;margin-bottom:8px}
p{font-size:14px;color:#374151;margin-bottom:16px;line-height:1.75}
.btn{display:inline-block;padding:13px 28px;background:#00D4A0;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;margin:8px 0}
.info-box{background:#F0FDF9;border:1px solid #A7F3D0;border-radius:10px;padding:16px 20px;margin:20px 0}
.warn-box{background:#FFFBEB;border:1px solid #FDE68A;border-radius:10px;padding:16px 20px;margin:20px 0}
.error-box{background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:16px 20px;margin:20px 0}
.stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0}
.stat{background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;padding:12px 16px}
.stat-label{font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#6B7280;font-weight:600}
.stat-value{font-size:18px;font-weight:800;color:#111827;margin-top:4px}
.divider{height:1px;background:#E5E7EB;margin:24px 0}
.footer{background:#F8FAFC;padding:24px 40px;text-align:center;border-top:1px solid #E5E7EB}
.footer p{font-size:12px;color:#9CA3AF;margin:4px 0}
.footer a{color:#00A880;text-decoration:none}
</style>
</head>
<body>
${preheader ? `<div style="display:none;font-size:1px;color:#fff;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
<div class="wrap">
  <div class="header">
    <div class="logo">
      <div class="logo-icon">A</div>
      <div class="logo-text">AfriGig</div>
    </div>
  </div>
  <div class="body">${content}</div>
  <div class="footer">
    <p>AfriGig Technologies Ltd · Nairobi, Kenya</p>
    <p><a href="https://afrigig.co.ke/terms">Terms</a> · <a href="https://afrigig.co.ke/privacy">Privacy</a> · <a href="mailto:support@afrigig.com">Support</a></p>
    <p style="margin-top:8px;font-size:11px;color:#D1D5DB">This is a transactional email. You received it because you have an AfriGig account.</p>
  </div>
</div>
</body>
</html>`;
}

const TEMPLATES = {
  assessment_unlocked: ({ name, track, fee }) => ({
    subject: "🎉 Assessment Unlocked — AfriGig",
    html: baseTemplate(`
      <h1>Assessment Unlocked, ${name}!</h1>
      <p>Your payment of <strong>KES ${Number(fee).toLocaleString()}</strong> has been confirmed. Your <strong>${track}</strong> skills assessment is now unlocked and ready to begin.</p>
      <div class="info-box">
        <h2>What to expect</h2>
        <p>• 15 multiple-choice questions + track-specific challenges<br/>
        • 2-hour timed session — do not refresh the page<br/>
        • Immediate score on completion<br/>
        • Expert review within 15 business days</p>
      </div>
      <div class="warn-box">
        <p><strong>⚠️ Important:</strong> The assessment fee (KES ${Number(fee).toLocaleString()}) is non-refundable regardless of outcome, as agreed in our Terms of Service.</p>
      </div>
      <p>Log in to your AfriGig account to start your assessment at a time that suits you.</p>
    `, "Your assessment is ready — start when you're ready."),
  }),

  assessment_submitted: ({ name, score, track, reviewDeadline, queuePos }) => ({
    subject: "📋 Assessment Submitted — Under Expert Review",
    html: baseTemplate(`
      <h1>Assessment Submitted!</h1>
      <p>Hi ${name}, your <strong>${track}</strong> assessment has been submitted successfully. Our expert team will review it within the timeframe below.</p>
      <div class="stat-grid">
        <div class="stat"><div class="stat-label">Your Score</div><div class="stat-value">${score}%</div></div>
        <div class="stat"><div class="stat-label">Queue Position</div><div class="stat-value">#${queuePos}</div></div>
        <div class="stat"><div class="stat-label">Review By</div><div class="stat-value" style="font-size:14px">${reviewDeadline}</div></div>
        <div class="stat"><div class="stat-label">Track</div><div class="stat-value" style="font-size:14px">${track}</div></div>
      </div>
      <div class="info-box">
        <p>You will receive an email notification the moment a decision is made. Log in anytime to check your live queue position.</p>
      </div>
    `, `Score: ${score}% — Review by ${reviewDeadline}`),
  }),

  approved: ({ name, track, badge }) => ({
    subject: "✅ Congratulations! You've been Approved — AfriGig",
    html: baseTemplate(`
      <h1>Welcome to AfriGig, ${name}! 🎉</h1>
      <p>Your application has been <strong>approved</strong>! You are now a verified AfriGig freelancer on the <strong>${track}</strong> track.</p>
      <div class="info-box">
        <h2>Your Starting Badge: ${badge || "Bronze"}</h2>
        <p>Complete projects, earn 5-star reviews, and grow to Silver → Gold → Elite to unlock lower commission rates and priority placement.</p>
      </div>
      <p>You can now browse and apply to available jobs on the platform.</p>
      <a href="https://afrigig.co.ke/#/freelancer/jobs" class="btn">Browse Available Jobs →</a>
      <div class="divider"/>
      <p style="font-size:12px;color:#6B7280">Remember: the platform charges a commission on each project payment (Bronze: 15%, Silver: 12%, Gold: 10%, Elite: 8%). The non-circumvention clause applies — do not conduct business with clients outside the platform for 12 months.</p>
    `, "You're approved! Start browsing jobs now."),
  }),

  rejected: ({ name, reason }) => ({
    subject: "AfriGig Assessment Result",
    html: baseTemplate(`
      <h1>Assessment Decision — ${name}</h1>
      <div class="error-box">
        <h2>Application Not Approved at This Time</h2>
        <p>After careful review of your assessment and profile, we were unable to approve your application in this review cycle.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      </div>
      <p>Please note that assessment fees are non-refundable as stated in our Terms of Service.</p>
      <p>You may contact our support team at <a href="mailto:support@afrigig.com">support@afrigig.com</a> if you believe this decision was made in error. Appeals must be submitted within 14 days.</p>
    `, "Your AfriGig assessment result is ready."),
  }),

  payment_released: ({ name, amount, jobTitle, walletBalance }) => ({
    subject: `💰 Payment Released — ${amount} · AfriGig`,
    html: baseTemplate(`
      <h1>Payment Released!</h1>
      <p>Hi ${name}, your payment has been released to your AfriGig wallet.</p>
      <div class="stat-grid">
        <div class="stat"><div class="stat-label">Amount Released</div><div class="stat-value" style="color:#00A880">${amount}</div></div>
        <div class="stat"><div class="stat-label">Wallet Balance</div><div class="stat-value">${walletBalance}</div></div>
      </div>
      <p><strong>Project:</strong> ${jobTitle}</p>
      <p>You can withdraw your balance via M-Pesa from your AfriGig wallet. Minimum withdrawal is KES 500. A 2% processing fee applies.</p>
      <a href="https://afrigig.co.ke/#/freelancer/earnings" class="btn">Go to Wallet →</a>
    `, `${amount} has been credited to your AfriGig wallet.`),
  }),

  withdrawal_initiated: ({ name, amount, phone, reference }) => ({
    subject: `💸 Withdrawal Initiated — ${amount} · AfriGig`,
    html: baseTemplate(`
      <h1>Withdrawal in Progress</h1>
      <p>Hi ${name}, your withdrawal request has been initiated.</p>
      <div class="stat-grid">
        <div class="stat"><div class="stat-label">Amount</div><div class="stat-value">${amount}</div></div>
        <div class="stat"><div class="stat-label">M-Pesa</div><div class="stat-value" style="font-size:14px">${phone}</div></div>
        <div class="stat"><div class="stat-label">Reference</div><div class="stat-value" style="font-size:12px;font-family:monospace">${reference}</div></div>
        <div class="stat"><div class="stat-label">Processing</div><div class="stat-value" style="font-size:13px">24–72 hours</div></div>
      </div>
      <div class="warn-box"><p>If you did not initiate this withdrawal, contact support immediately at <a href="mailto:support@afrigig.com">support@afrigig.com</a>.</p></div>
    `, `Your withdrawal of ${amount} is being processed.`),
  }),

  ticket_reply: ({ name, ticketSubject, replyBody, agentName }) => ({
    subject: `Re: ${ticketSubject} — AfriGig Support`,
    html: baseTemplate(`
      <h1>Support Reply</h1>
      <p>Hi ${name}, your support ticket has received a response.</p>
      <div style="margin:20px 0">
        <p style="font-size:12px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em">Ticket: ${ticketSubject}</p>
        <p style="font-size:12px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-top:4px">Response from ${agentName || "AfriGig Support"}</p>
        <div style="background:#F8FAFC;border-left:3px solid #00D4A0;padding:16px;border-radius:0 8px 8px 0;margin-top:10px;font-size:14px;color:#374151;line-height:1.75">${replyBody}</div>
      </div>
      <a href="https://afrigig.co.ke/#/freelancer/tickets" class="btn">View Ticket →</a>
    `, `Reply to: ${ticketSubject}`),
  }),

  kyc_approved: ({ name }) => ({
    subject: "✅ KYC Verified — AfriGig",
    html: baseTemplate(`
      <h1>KYC Verification Complete</h1>
      <p>Hi ${name}, your identity has been successfully verified.</p>
      <div class="info-box">
        <p>Your KYC status is now <strong>Verified</strong>. This unlocks higher withdrawal limits and a verified badge on your profile.</p>
      </div>
    `, "Your AfriGig identity is now verified."),
  }),

  generic: ({ subject, body }) => ({
    subject,
    html: baseTemplate(`<h1>${subject}</h1><p>${body}</p>`),
  }),
};

// ─── Handler ───────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-key");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const API_KEY = process.env.RESEND_API_KEY;
  const FROM = process.env.EMAIL_FROM || "AfriGig <noreply@afrigig.co.ke>";

  if (!API_KEY) {
    // Dev fallback: log to console, return success
    console.log("[email-api] No RESEND_API_KEY — email would send:", JSON.stringify(req.body));
    return res.json({ id: `dev-${Date.now()}`, status: "logged" });
  }

  try {
    const { to, subject, html, text, templateId, templateData } = req.body || {};

    if (!to) return res.status(400).json({ error: "Recipient 'to' required" });

    let emailHtml = html;
    let emailSubject = subject;

    // Use a template if specified
    if (templateId && TEMPLATES[templateId]) {
      const rendered = TEMPLATES[templateId](templateData || {});
      emailHtml = rendered.html;
      emailSubject = rendered.subject;
    }

    if (!emailSubject) return res.status(400).json({ error: "Subject required" });
    if (!emailHtml && !text) return res.status(400).json({ error: "Email body required" });

    const payload = {
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject: emailSubject,
    };
    if (emailHtml) payload.html = emailHtml;
    if (text) payload.text = text;

    const r = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await r.json();

    if (!r.ok) {
      console.error("[email-api] Resend error:", data);
      return res.status(r.status).json({ error: data.message || "Email send failed" });
    }

    return res.json({ id: data.id, status: "sent" });
  } catch (err) {
    console.error("[email-api]", err.message);
    return res.status(500).json({ error: err.message });
  }
}

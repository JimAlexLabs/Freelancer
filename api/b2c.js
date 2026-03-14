/**
 * AfriGig M-Pesa B2C (Business to Customer) API — Vercel Serverless Function
 * Used for paying freelancers directly to M-Pesa.
 *
 * POST /api/b2c?action=payout
 * Body: { phone, amount, reference, remarks }
 *
 * POST /api/b2c?action=result (Daraja B2C Result URL)
 * POST /api/b2c?action=timeout (Daraja B2C Timeout URL)
 *
 * Env vars required (set in Vercel dashboard):
 *   MPESA_CONSUMER_KEY
 *   MPESA_CONSUMER_SECRET
 *   MPESA_B2C_INITIATOR_NAME    — Safaricom B2C initiator name
 *   MPESA_B2C_SECURITY_CRED    — Encrypted initiator security credential
 *   MPESA_B2C_SHORTCODE         — B2C shortcode (different from STK shortcode)
 *   SUPABASE_SERVICE_ROLE_KEY   — For server-side DB updates
 *   SUPABASE_URL
 */

const DARAJA_PROD = "https://api.safaricom.co.ke";
const DARAJA_SAND = "https://sandbox.safaricom.co.ke";

function getDaraja() {
  return process.env.MPESA_ENV === "production" ? DARAJA_PROD : DARAJA_SAND;
}

const CK = process.env.MPESA_CONSUMER_KEY || "Xml8kY4zKJQAGkDrgCANsJZpQRdrhsXHFricpYvscLI4IDk0";
const CS = process.env.MPESA_CONSUMER_SECRET || "vWIijx6cBoPqGcjuUOMyLLsBZhzYs1EIsemlae9Zb1bT4Zl1GXuf5q8ggLbhq7vs";
const INITIATOR = process.env.MPESA_B2C_INITIATOR_NAME || "testapi";
const SECURITY_CRED = process.env.MPESA_B2C_SECURITY_CRED || "Safaricom114!"; // encrypted in prod
const B2C_SHORTCODE = process.env.MPESA_B2C_SHORTCODE || "600996";

async function getToken() {
  const creds = Buffer.from(`${CK}:${CS}`).toString("base64");
  const r = await fetch(`${getDaraja()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` },
  });
  if (!r.ok) throw new Error(`B2C auth failed: ${r.status}`);
  const d = await r.json();
  if (!d.access_token) throw new Error("No B2C access token");
  return d.access_token;
}

async function updateWithdrawalStatus(reference, status, resultDesc) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return;

  // Update the transaction in Supabase
  await fetch(`${supabaseUrl}/rest/v1/transactions?reference=eq.${encodeURIComponent(reference)}`, {
    method: "PATCH",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      status: status === "0" ? "completed" : "failed",
      meta: { result_desc: resultDesc, updated_at: new Date().toISOString() },
    }),
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const action = req.query.action;

  // ─── B2C Payout ────────────────────────────────────────────
  if (action === "payout" && req.method === "POST") {
    const { phone, amount, reference = "AfriGigPayout", remarks = "Freelancer Payout" } = req.body || {};

    if (!phone || !amount) {
      return res.status(400).json({ error: "phone and amount required" });
    }

    // Minimum withdrawal: KES 500
    if (Number(amount) < 500) {
      return res.status(400).json({ error: "Minimum payout is KES 500" });
    }

    const normalised = String(phone).replace(/\s+/g, "").replace(/^\+/, "").replace(/^0/, "254");
    const host = req.headers.host || "afrigig.co.ke";

    try {
      const token = await getToken();

      const payload = {
        InitiatorName: INITIATOR,
        SecurityCredential: SECURITY_CRED,
        CommandID: "BusinessPayment",
        Amount: Math.floor(Number(amount)),
        PartyA: B2C_SHORTCODE,
        PartyB: normalised,
        Remarks: String(remarks).slice(0, 100),
        QueueTimeOutURL: `https://${host}/api/b2c?action=timeout`,
        ResultURL: `https://${host}/api/b2c?action=result`,
        Occasion: String(reference).slice(0, 100),
      };

      const r = await fetch(`${getDaraja()}/mpesa/b2c/v3/paymentrequest`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await r.json();

      if (!r.ok || data.ResponseCode !== "0") {
        console.error("[b2c] payout error:", data);
        return res.status(400).json({
          error: data.ResponseDescription || data.errorMessage || "B2C payout failed",
          details: data,
        });
      }

      return res.json({
        success: true,
        conversationId: data.ConversationID,
        originatorConversationId: data.OriginatorConversationID,
        responseDescription: data.ResponseDescription,
      });
    } catch (err) {
      console.error("[b2c]", err.message);
      return res.status(500).json({ error: err.message });
    }
  }

  // ─── B2C Result Callback ───────────────────────────────────
  if (action === "result") {
    try {
      const body = req.body || {};
      const result = body.Result || {};
      const code = result.ResultCode;
      const desc = result.ResultDesc;
      const params = result.ResultParameters?.ResultParameter || [];

      // Extract transaction details
      const txRef = params.find(p => p.Key === "TransactionReceipt")?.Value;
      const occasion = result.ReferenceData?.ReferenceItem?.Value;

      console.log(`[b2c-result] Code: ${code}, Desc: ${desc}, Ref: ${txRef || occasion}`);

      // Update withdrawal status in DB
      if (occasion) {
        await updateWithdrawalStatus(occasion, String(code), desc);
      }

      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    } catch (err) {
      console.error("[b2c-result]", err.message);
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" }); // Always ACK to Daraja
    }
  }

  // ─── B2C Timeout Callback ──────────────────────────────────
  if (action === "timeout") {
    console.log("[b2c-timeout] Request timed out:", JSON.stringify(req.body));
    // Mark transaction as failed/pending-review
    return res.json({ ResultCode: 0, ResultDesc: "Timeout acknowledged" });
  }

  return res.status(400).json({ error: `Unknown action: ${action}` });
}

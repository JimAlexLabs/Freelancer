/**
 * Vercel Serverless Function: M-Pesa Daraja Sandbox Proxy
 * Runs server-side → no CORS issues.
 * Routes:  GET  /api/mpesa?action=token
 *          POST /api/mpesa?action=stk      body: { phone, amount, reference, desc }
 *          POST /api/mpesa?action=status   body: { checkoutRequestId }
 *          POST /api/mpesa?action=callback (Daraja webhook)
 */

const DARAJA  = "https://sandbox.safaricom.co.ke";
const CK      = process.env.MPESA_CONSUMER_KEY     || "Xml8kY4zKJQAGkDrgCANsJZpQRdrhsXHFricpYvscLI4IDk0";
const CS      = process.env.MPESA_CONSUMER_SECRET  || "vWIijx6cBoPqGcjuUOMyLLsBZhzYs1EIsemlae9Zb1bT4Zl1GXuf5q8ggLbhq7vs";
const SC      = "174379";
const PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

function ts() {
  const d = new Date();
  const p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function token() {
  const creds = Buffer.from(`${CK}:${CS}`).toString("base64");
  const r = await fetch(`${DARAJA}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` },
  });
  if (!r.ok) throw new Error(`Daraja auth ${r.status}`);
  const d = await r.json();
  if (!d.access_token) throw new Error("No access_token from Daraja");
  return d.access_token;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const action = req.query.action;

  try {
    // ── Token ────────────────────────────────────────────────────────────────
    if (action === "token") {
      const t = await token();
      return res.json({ access_token: t });
    }

    // ── STK Push ─────────────────────────────────────────────────────────────
    if (action === "stk") {
      const { phone, amount, reference = "AfriGig", desc = "AssessmentFee" } = req.body || {};
      if (!phone || !amount) return res.status(400).json({ error: "phone and amount required" });

      const normalised = String(phone).replace(/\s+/g,"").replace(/^\+/,"").replace(/^0/,"254");
      const t   = await token();
      const now = ts();
      const pwd = Buffer.from(`${SC}${PASSKEY}${now}`).toString("base64");
      const host = req.headers.host || "freelancer-bice.vercel.app";
      const cb  = `https://${host}/api/mpesa?action=callback`;

      const r = await fetch(`${DARAJA}/mpesa/stkpush/v1/processrequest`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          BusinessShortCode: SC,
          Password:          pwd,
          Timestamp:         now,
          TransactionType:   "CustomerPayBillOnline",
          Amount:            Math.max(1, Math.ceil(Number(amount))),
          PartyA:            normalised,
          PartyB:            SC,
          PhoneNumber:       normalised,
          CallBackURL:       cb,
          AccountReference:  String(reference).slice(0, 12),
          TransactionDesc:   String(desc).slice(0, 13),
        }),
      });

      const d = await r.json();
      return res.status(r.ok ? 200 : 400).json(d);
    }

    // ── Query Status ──────────────────────────────────────────────────────────
    if (action === "status") {
      const { checkoutRequestId } = req.body || {};
      if (!checkoutRequestId) return res.status(400).json({ error: "checkoutRequestId required" });
      const t   = await token();
      const now = ts();
      const pwd = Buffer.from(`${SC}${PASSKEY}${now}`).toString("base64");

      const r = await fetch(`${DARAJA}/mpesa/stkpushquery/v1/query`, {
        method: "POST",
        headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          BusinessShortCode: SC,
          Password: pwd,
          Timestamp: now,
          CheckoutRequestID: checkoutRequestId,
        }),
      });

      const d = await r.json();
      return res.json(d);
    }

    // ── Daraja Callback (webhook) ─────────────────────────────────────────────
    if (action === "callback") {
      console.log("[mpesa-callback]", JSON.stringify(req.body));
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error("[mpesa-proxy]", err.message);
    return res.status(500).json({ error: err.message });
  }
}

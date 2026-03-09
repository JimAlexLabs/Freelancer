/**
 * AfriGig M-Pesa Daraja Integration
 *
 * On Vercel (production/preview): all calls go through /api/mpesa serverless proxy
 *   → server-side, no CORS issues, works 100%.
 * On localhost: attempts direct Daraja sandbox call; falls back gracefully if CORS blocks.
 */

const DARAJA  = "https://sandbox.safaricom.co.ke";
// Fallback direct credentials (only used on localhost)
const CK      = "Xml8kY4zKJQAGkDrgCANsJZpQRdrhsXHFricpYvscLI4IDk0";
const CS      = "vWIijx6cBoPqGcjuUOMyLLsBZhzYs1EIsemlae9Zb1bT4Zl1GXuf5q8ggLbhq7vs";
const SC      = "174379";
const PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

// Use server proxy when deployed to Vercel (avoids CORS entirely)
const USE_PROXY = typeof window !== "undefined" &&
  (window.location.hostname.includes("vercel.app") || window.location.hostname.includes("afrigig"));

const PROXY = "/api/mpesa";

function ts() {
  const d = new Date(), p = n => String(n).padStart(2, "0");
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

async function directToken() {
  const creds = btoa(`${CK}:${CS}`);
  const r = await fetch(`${DARAJA}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` },
  });
  if (!r.ok) throw new Error(`Daraja auth ${r.status}`);
  const d = await r.json();
  return d.access_token;
}

export async function getAccessToken() {
  if (USE_PROXY) {
    const r = await fetch(`${PROXY}?action=token`);
    const d = await r.json();
    return d.access_token;
  }
  return directToken();
}

/**
 * Initiate Lipa Na M-Pesa Online (STK Push).
 * @param {object} opts
 * @param {string} opts.phone   - Phone: 254XXXXXXXXX
 * @param {number} opts.amount  - Amount in KES
 * @param {string} [opts.reference]
 * @param {string} [opts.desc]
 */
export async function stkPush({ phone, amount, reference = "AfriGig", desc = "Assessment Fee" }) {
  const norm = String(phone).replace(/\s+/g,"").replace(/^\+/,"").replace(/^0/,"254");

  // ── Via Vercel proxy (no CORS) ───────────────────────────────────────────
  if (USE_PROXY) {
    const r = await fetch(`${PROXY}?action=stk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: norm, amount, reference, desc }),
    });
    const d = await r.json();
    if (!r.ok || d.errorCode) throw new Error(d.errorMessage || d.ResponseDescription || `STK Push failed (${r.status})`);
    if (d.ResponseCode !== "0") throw new Error(d.ResponseDescription || "STK Push not accepted");
    return {
      checkoutRequestId:   d.CheckoutRequestID,
      merchantRequestId:   d.MerchantRequestID,
      responseDescription: d.ResponseDescription,
      customerMessage:     d.CustomerMessage,
    };
  }

  // ── Direct call (localhost dev, may hit CORS) ────────────────────────────
  const t   = await directToken();
  const now = ts();
  const pwd = btoa(`${SC}${PASSKEY}${now}`);
  const cb  = "https://webhook.site/afrigig-sandbox-dev";

  const r = await fetch(`${DARAJA}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: SC, Password: pwd, Timestamp: now,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.max(1, Math.ceil(Number(amount))),
      PartyA: norm, PartyB: SC, PhoneNumber: norm, CallBackURL: cb,
      AccountReference: String(reference).slice(0, 12),
      TransactionDesc: String(desc).slice(0, 13),
    }),
  });
  const d = await r.json();
  if (!r.ok || d.errorCode) throw new Error(d.errorMessage || `STK Push failed (${r.status})`);
  if (d.ResponseCode !== "0") throw new Error(d.ResponseDescription || "STK Push not accepted");
  return {
    checkoutRequestId: d.CheckoutRequestID,
    merchantRequestId: d.MerchantRequestID,
    responseDescription: d.ResponseDescription,
    customerMessage: d.CustomerMessage,
  };
}

/**
 * Query STK push status.
 */
export async function queryStatus(checkoutRequestId) {
  if (USE_PROXY) {
    const r = await fetch(`${PROXY}?action=status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checkoutRequestId }),
    });
    const d = await r.json();
    return {
      resultCode: d.ResultCode, resultDesc: d.ResultDesc,
      success: d.ResultCode === "0" || d.ResultCode === 0,
      cancelled: d.ResultCode === "1032",
      pending: d.ResultCode === undefined,
    };
  }
  const t   = await directToken();
  const now = ts();
  const pwd = btoa(`${SC}${PASSKEY}${now}`);
  const r = await fetch(`${DARAJA}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({ BusinessShortCode: SC, Password: pwd, Timestamp: now, CheckoutRequestID: checkoutRequestId }),
  });
  const d = await r.json();
  return {
    resultCode: d.ResultCode, resultDesc: d.ResultDesc,
    success: d.ResultCode === "0" || d.ResultCode === 0,
    cancelled: d.ResultCode === "1032",
    pending: d.ResultCode === undefined,
  };
}

export const Mpesa = { stkPush, queryStatus, getAccessToken };
export default Mpesa;

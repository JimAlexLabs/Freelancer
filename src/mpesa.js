/**
 * AfriGig M-Pesa Daraja Sandbox Integration
 * Consumer Key / Secret from Safaricom Developer Portal (sandbox)
 * Uses test shortcode 174379 for Lipa Na M-Pesa Online (STK Push)
 */

const DARAJA_BASE      = "https://sandbox.safaricom.co.ke";
const CONSUMER_KEY     = "Xml8kY4zKJQAGkDrgCANsJZpQRdrhsXHFricpYvscLI4IDk0";
const CONSUMER_SECRET  = "vWIijx6cBoPqGcjuUOMyLLsBZhzYs1EIsemlae9Zb1bT4Zl1GXuf5q8ggLbhq7vs";

// Daraja sandbox test shortcode + passkey (replace with your live ones in production)
const SHORTCODE = "174379";
const PASSKEY   = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

// Callback URL: in production, point this to your backend / Supabase Edge Function
const CALLBACK_URL =
  (typeof window !== "undefined" && window.location.origin.includes("localhost"))
    ? "https://webhook.site/afrigig-sandbox-dev"
    : "https://freelancer-bice.vercel.app/api/mpesa/callback";

function getTimestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

/**
 * Fetch an OAuth2 access token from Daraja.
 * NOTE: This call may fail in-browser due to CORS on some networks;
 * a Supabase/Vercel edge-function proxy is recommended for production.
 */
async function getAccessToken() {
  const credentials = btoa(`${CONSUMER_KEY}:${CONSUMER_SECRET}`);
  const res = await fetch(
    `${DARAJA_BASE}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: { Authorization: `Basic ${credentials}` },
    }
  );
  if (!res.ok) throw new Error(`Daraja auth failed: ${res.status}`);
  const data = await res.json();
  if (!data.access_token) throw new Error("No access token in Daraja response");
  return data.access_token;
}

/**
 * Initiate Lipa Na M-Pesa Online (STK Push).
 * @param {object} opts
 * @param {string} opts.phone      - Phone in format 254XXXXXXXXX
 * @param {number} opts.amount     - Amount in KES (integer)
 * @param {string} opts.reference  - Account reference (≤12 chars)
 * @param {string} opts.desc       - Transaction description (≤13 chars)
 * @returns {Promise<{checkoutRequestId: string, responseDescription: string}>}
 */
async function stkPush({ phone, amount, reference = "AfriGig", desc = "Assessment Fee" }) {
  // Normalize phone: strip leading +/0, ensure 254XXXXXXXXX
  const normalizedPhone = phone
    .replace(/\s+/g, "")
    .replace(/^\+/, "")
    .replace(/^0/, "254");

  const token     = await getAccessToken();
  const timestamp = getTimestamp();
  const password  = btoa(`${SHORTCODE}${PASSKEY}${timestamp}`);

  const payload = {
    BusinessShortCode: SHORTCODE,
    Password:          password,
    Timestamp:         timestamp,
    TransactionType:   "CustomerPayBillOnline",
    Amount:            Math.max(1, Math.ceil(amount)),
    PartyA:            normalizedPhone,
    PartyB:            SHORTCODE,
    PhoneNumber:       normalizedPhone,
    CallBackURL:       CALLBACK_URL,
    AccountReference:  reference.slice(0, 12),
    TransactionDesc:   desc.slice(0, 13),
  };

  const res = await fetch(`${DARAJA_BASE}/mpesa/stkpush/v1/processrequest`, {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok || data.errorCode) {
    throw new Error(data.errorMessage || data.ResponseDescription || `STK Push failed (${res.status})`);
  }
  if (data.ResponseCode !== "0") {
    throw new Error(data.ResponseDescription || "STK Push was not accepted");
  }

  return {
    checkoutRequestId:  data.CheckoutRequestID,
    merchantRequestId:  data.MerchantRequestID,
    responseDescription: data.ResponseDescription,
    customerMessage:    data.CustomerMessage,
  };
}

/**
 * Query the status of a pending STK push.
 */
async function queryStatus(checkoutRequestId) {
  const token     = await getAccessToken();
  const timestamp = getTimestamp();
  const password  = btoa(`${SHORTCODE}${PASSKEY}${timestamp}`);

  const res = await fetch(`${DARAJA_BASE}/mpesa/stkpushquery/v1/query`, {
    method:  "POST",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      BusinessShortCode: SHORTCODE,
      Password:          password,
      Timestamp:         timestamp,
      CheckoutRequestID: checkoutRequestId,
    }),
  });

  const data = await res.json();
  // ResultCode 0 = success, 1032 = request cancelled by user, others = pending/error
  return {
    resultCode:       data.ResultCode,
    resultDesc:       data.ResultDesc,
    success:          data.ResultCode === "0" || data.ResultCode === 0,
    cancelled:        data.ResultCode === "1032",
    pending:          data.ResultCode === undefined,
  };
}

export const Mpesa = { stkPush, queryStatus, getAccessToken };
export default Mpesa;

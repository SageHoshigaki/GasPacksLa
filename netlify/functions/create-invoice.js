// netlify/functions/create-invoice.js  (ESM, Node runtime on Netlify)

const OK_ORIGINS = "*";

const cors = (statusCode, body) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": OK_ORIGINS,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json",
  },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") return cors(200, "OK");
  if (event.httpMethod !== "POST")
    return cors(405, { error: "Method not allowed" });

  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey)
      return cors(500, { error: "NOWPAYMENTS_API_KEY env var is missing" });

    const body = JSON.parse(event.body || "{}");

    // Basic validation / normalization
    const price_amount = Number(body.price_amount);
    if (!price_amount || price_amount <= 0) {
      return cors(400, { error: "Invalid price_amount" });
    }

    // Build payload for NOWPayments /v1/invoice
    // NOTE: Do NOT include `metadata` and do NOT force `pay_currency`
    const payload = {
      price_amount,
      price_currency: String(body.price_currency || "usd").toLowerCase(),
      order_id: String(body.order_id || `order_${Date.now()}`),
      order_description: String(body.order_description || "Order").slice(
        0,
        500
      ),
      customer_email: body.customer_email || undefined,
      customer_name: body.customer_name || undefined,
      ipn_callback_url: "https://gas-packs.com/api/np-ipn",
      success_url: "https://gas-packs.com/success",
      cancel_url: "https://gas-packs.com/cancel",
    };

    const resp = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const contentType = resp.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await resp.json()
      : await resp.text();

    // If NOWPayments returns an error, bubble it up as-is
    if (!resp.ok) return cors(resp.status, data);

    // Normalize response to { invoice_url }
    let invoiceUrl = null;
    if (data && typeof data === "object" && data.invoice_url) {
      invoiceUrl = data.invoice_url;
    } else if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        if (parsed && parsed.invoice_url) invoiceUrl = parsed.invoice_url;
      } catch {
        // leave null
      }
    }

    if (!invoiceUrl) {
      return cors(502, {
        error: "NOWPayments response did not include invoice_url",
        raw: data,
      });
    }

    return cors(200, { invoice_url: invoiceUrl });
  } catch (err) {
    return cors(500, { error: err?.message || "Internal error" });
  }
};

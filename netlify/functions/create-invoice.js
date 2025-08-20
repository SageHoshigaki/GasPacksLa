// netlify/functions/create-invoice.js  (ESM, Node runtime on Netlify)

const OK_ORIGINS = "*";

const cors = (statusCode, body) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": OK_ORIGINS,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
  },
  body: typeof body === "string" ? body : JSON.stringify(body),
});

export const handler = async (event) => {
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
    if (!price_amount || price_amount <= 0)
      return cors(400, { error: "Invalid price_amount" });

    const payload = {
      price_amount,
      price_currency: body.price_currency || "usd",
      pay_currency: body.pay_currency || "usdt",
      order_id: String(body.order_id || `order_${Date.now()}`),
      order_description: String(body.order_description || "Order").slice(
        0,
        500
      ),
      customer_email: body.customer_email || undefined,
      customer_name: body.customer_name || undefined,
      // point to your site so the flow looks finished
      ipn_callback_url: "https://gas-packs.com/api/np-ipn",
      success_url: "https://gas-packs.com/success",
      cancel_url: "https://gas-packs.com/cancel",
      // 🚫 metadata is NOT allowed by /v1/invoice
    };

    const resp = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const ct = resp.headers.get("content-type") || "";
    const data = ct.includes("application/json")
      ? await resp.json()
      : await resp.text();

    if (!resp.ok) return cors(resp.status, data); // bubble up NOWPayments error body

    // data typically includes { id, invoice_url, ... }
    return cors(200, { invoice_url: data?.invoice_url || null });
  } catch (err) {
    return cors(500, { error: err?.message || "Internal error" });
  }
};

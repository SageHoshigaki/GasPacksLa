// netlify/functions/create-invoice.js  (ESM)
// Works on Netlify + netlify dev (Node 18+ has global fetch)

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
  // CORS preflight
  if (event.httpMethod === "OPTIONS") return cors(200, "OK");
  if (event.httpMethod !== "POST")
    return cors(405, { error: "Method not allowed" });

  try {
    const apiKey = process.env.NOWPAYMENTS_API_KEY;
    if (!apiKey)
      return cors(500, { error: "NOWPAYMENTS_API_KEY env var is missing" });

    const body = JSON.parse(event.body || "{}");

    const resp = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: body.price_amount,
        price_currency: body.price_currency,
        pay_currency: body.pay_currency,
        order_id: body.order_id,
        order_description: body.order_description,
        customer_email: body.customer_email,
        customer_name: body.customer_name,
        ipn_callback_url: "https://yourdomain.com/webhook",
        success_url: "https://yourdomain.com/success",
        cancel_url: "https://yourdomain.com/cancel",
        metadata: body.metadata,
      }),
    });

    // Robust JSON/text handling (404 pages, etc.)
    const contentType = resp.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await resp.json()
      : await resp.text();

    return cors(resp.ok ? 200 : resp.status, payload);
  } catch (err) {
    return cors(500, { error: err?.message || "Internal error" });
  }
};

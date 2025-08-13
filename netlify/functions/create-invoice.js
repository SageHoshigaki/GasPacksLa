// netlify/functions/create-invoice.js  (ESM)
export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return cors(200, "OK");
  }
  if (event.httpMethod !== "POST") {
    return cors(405, { error: "Method not allowed" });
  }

  try {
    const body = JSON.parse(event.body || "{}");

    const resp = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY, // <-- server env var
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

    const data = await resp.json();
    return cors(resp.ok ? 200 : resp.status, data);
  } catch (err) {
    return cors(500, { error: err.message || "Internal error" });
  }
};

function cors(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

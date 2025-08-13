const fetch = require("node-fetch");

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  const response = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: {
      "x-api-key": import.meta.env.Vite_NOWPAYMENTS_API_KEY,
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
      ipn_callback_url: "https://yourdomain.com/webhook", // optional
      success_url: "https://yourdomain.com/success",
      cancel_url: "https://yourdomain.com/cancel",
      metadata: body.metadata,
    }),
  });

  const data = await response.json();

  return {
    statusCode: response.ok ? 200 : 500,
    body: JSON.stringify(data),
  };
};

// netlify/functions/create-payment.js
const fetch = require("node-fetch");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const {
      price_amount,
      price_currency,
      pay_currency,
      product_name,
      product_id,
    } = body;

    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount,
        price_currency,
        pay_currency, // usdt, btc, eth
        order_id: product_id,
        order_description: product_name,
        success_url: "https://yourdomain.com/success", // update later
        cancel_url: "https://yourdomain.com/cancel", // update later
      }),
    });

    const data = await response.json();
    if (data.invoice_url) {
      return {
        statusCode: 200,
        body: JSON.stringify({ invoice_url: data.invoice_url }),
      };
    } else {
      console.error("Payment creation error:", data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to create invoice." }),
      };
    }
  } catch (error) {
    console.error("Function error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error." }),
    };
  }
};

// netlify/functions/clerk-webhook.js

exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Webhook works!" }),
  };
};

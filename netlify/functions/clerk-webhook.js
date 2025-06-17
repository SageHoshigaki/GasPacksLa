const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  console.log("🟢 Webhook HIT");

  if (event.httpMethod !== "POST") {
    console.warn("🚫 Invalid method:", event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body);
    console.log("📦 Payload:", payload);

    const user = payload.data;

    if (!user) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing user object" }),
      };
    }

    const id = user.id;
    const email = user.email_addresses?.[0]?.email_address || "";
    const full_name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    const status = "pending";

    if (!id || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    const { error } = await supabase
      .from("users")
      .upsert({ id, email, full_name, status }, { onConflict: "id" });

    if (error) {
      console.error("❌ Supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    console.log("✅ Synced user:", email);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("🔥 Runtime error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

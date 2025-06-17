const { createClient } = require("@supabase/supabase-js");

// 🔐 Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  console.log("🟢 Webhook HIT");

  // ✅ Ensure it's a POST request
  if (event.httpMethod !== "POST") {
    console.warn("🚫 Method Not Allowed:", event.httpMethod);
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
      console.warn("⚠️ No user object in payload");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing user data" }),
      };
    }

    const id = user.id;
    const email = user.email_addresses?.[0]?.email_address || "";
    const full_name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    const status = "pending";

    if (!id || !email) {
      console.warn("⚠️ Missing required fields");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing user ID or email" }),
      };
    }

    const { error } = await supabase.from("users").upsert(
      { id, email, full_name, status },
      { onConflict: "id" } // assuming `id` is your primary key
    );

    if (error) {
      console.error("❌ Supabase error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      };
    }

    console.log("✅ User synced:", email);
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

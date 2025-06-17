import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

// 🔐 Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ✅ Netlify invokes this function at: /.netlify/functions/clerk-webhook
// So we match the internal route with "/"
app.post("/", async (c) => {
  console.log("🟢 Webhook HIT");

  try {
    const payload = await c.req.json();
    console.log("📦 Payload:", payload);

    const user = payload.data;

    if (!user) {
      console.warn("⚠️ Missing user data");
      return c.json({ success: false, error: "Missing user data" }, 400);
    }

    const id = user.id;
    const email = user.email_addresses?.[0]?.email_address || "";
    const full_name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    const status = "pending"; // Default status — update if needed

    console.log("🧬 Parsed:", { id, email, full_name });

    if (!id || !email) {
      return c.json({ success: false, error: "Missing ID or email" }, 400);
    }

    const { error } = await supabase.from("users").upsert(
      { id, email, full_name, status },
      { onConflict: "id" } // assumes "id" is your Supabase primary key
    );

    if (error) {
      console.error("❌ Supabase error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log("✅ User synced:", email);
    return c.json({ success: true });
  } catch (err) {
    console.error("🔥 Webhook error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export const handler = app.fetch;

import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

// 🔐 Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// 📡 Route must match function name on Netlify
app.post("/clerk-webhook", async (c) => {
  console.log("🟢 Webhook HIT!");

  try {
    const payload = await c.req.json();
    console.log("📦 Payload received:", payload);

    const user = payload.data;
    if (!user) {
      console.warn("⚠️ No user object in payload");
      return c.json({ success: false, error: "Missing user data" }, 400);
    }

    const id = user.id;
    const email = user.email_addresses?.[0]?.email_address || "";
    const full_name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    const status = "pending";

    console.log("🧬 Parsed user data:", { id, email, full_name });

    if (!id || !email) {
      console.warn("🚫 Missing ID or email");
      return c.json({ success: false, error: "Missing user ID or email" }, 400);
    }

    const { error } = await supabase.from("users").upsert(
      { id, email, full_name, status },
      { onConflict: "id" } // Upsert on primary key
    );

    if (error) {
      console.error("❌ Supabase error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log("✅ User synced to Supabase:", email);
    return c.json({ success: true });
  } catch (err) {
    console.error("🔥 Unhandled error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export const handler = app.fetch;

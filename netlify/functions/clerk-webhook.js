import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/", async (c) => {
  try {
    const payload = await c.req.json();
    const user = payload.data;

    const id = user.id;
    const email = user.email_addresses?.[0]?.email_address || "";
    const full_name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    const status = "pending";

    if (!id || !email) {
      return c.json({ success: false, error: "Missing user ID or email" }, 400);
    }

    const { error } = await supabase.from("users").upsert(
      {
        id,
        email,
        full_name,
        status,
      },
      { onConflict: "id" } // ensures updates don't create duplicates
    );

    if (error) {
      console.error("❌ Supabase error:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    console.log("✅ Synced:", email);
    return c.json({ success: true });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export const handler = app.fetch;

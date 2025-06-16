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

    const userId = user.id;
    const email = user.email_addresses?.[0]?.email_address || "";
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();
    const status = "pending";

    if (!userId || !email) {
      return c.json({ success: false, error: "Missing user ID or email" }, 400);
    }

    // Prefer upsert for simplicity
    const { error } = await supabase.from("users").upsert(
      {
        clerk_id: userId,
        email,
        full_name: fullName,
        status,
      },
      { onConflict: "clerk_id" }
    );

    if (error) {
      console.error("Error syncing user:", error);
      return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true });
  } catch (err) {
    console.error("Webhook Error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export const handler = app.fetch;

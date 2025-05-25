import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";

const app = new Hono();

// 🔐 Supabase client with service role key
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
    const status = "pending"; // Default status on signup

    // Check if user already exists (optional)
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existingUser) {
      const { error } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          full_name: fullName,
          status,
        },
      ]);

      if (error) {
        console.error("Error inserting user:", error);
        return c.json({ success: false, error: error.message }, 500);
      }

      return c.json({ success: true });
    } else {
      return c.json({ success: true, message: "User already exists" });
    }
  } catch (err) {
    console.error("Webhook Error:", err);
    return c.json({ success: false, error: "Internal server error" }, 500);
  }
});

export const handler = app.fetch;

// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// ✅ Vite exposes only variables that start with VITE_
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables – check your .env.local file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

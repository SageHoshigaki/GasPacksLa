import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kvvxoxmmpcwbuastztro.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2dnhveG1tcGN3YnVhc3R6dHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MTI1NDUsImV4cCI6MjA2MjI4ODU0NX0.aBDVL3OCOZJGOb74ZFBc6GXiMa4lzZKXKmwMegDBl48";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

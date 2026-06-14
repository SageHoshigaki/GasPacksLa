// hooks/useAccountStatus.js
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabaseClient";

export const useAccountStatus = () => {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from("users")           // ← was "user" (wrong table name)
        .select("status")
        .eq("id", user.id)       // ← was .eq("email", ...) — id is safer primary key
        .single();

      setStatus(error ? "unknown" : (data?.status ?? "pending"));
    };

    fetchStatus();
  }, [user, isLoaded]);

  return status;
};

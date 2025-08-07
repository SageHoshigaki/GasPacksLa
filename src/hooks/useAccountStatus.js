// hooks/useAccountStatus.js
import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabaseClient";

export const useAccountStatus = () => {
  const { user } = useUser();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const { data, error } = await supabase
        .from("user")
        .select("status")
        .eq("email", email)
        .single();

      setStatus(error ? "unknown" : data?.status);
    };

    fetchStatus();
  }, [user]);

  return status;
};

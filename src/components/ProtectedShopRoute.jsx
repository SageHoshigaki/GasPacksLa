import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const ProtectedShopRoute = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserStatus = async () => {
      if (!user?.primaryEmailAddress?.emailAddress) {
        setLoading(false); // fallback in case user.email is missing
        return;
      }

      const { data, error } = await supabase
        .from("user_profiles")
        .select("status")
        .eq("email", user.primaryEmailAddress.emailAddress)
        .single();

      if (error) {
        console.error("Supabase error:", error.message);
        setStatus("pending"); // fallback state
      } else {
        setStatus(data?.status || "pending");
      }

      setLoading(false);
    };

    if (isLoaded && user) {
      fetchUserStatus();
    }
  }, [user, isLoaded]);

  if (!isLoaded || loading) {
    return null; // Don’t render anything until the user and data are ready
  }

  if (status === "active") {
    return <>{children}</>;
  } else {
    return <Navigate to="/not-authorized" replace />;
  }
};

export default ProtectedShopRoute;
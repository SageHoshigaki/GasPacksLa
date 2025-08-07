import React, { useEffect, useState } from "react";
import { SignedIn, SignedOut, UserProfile, useUser } from "@clerk/clerk-react";
import { supabase } from "../../lib/supabaseClient";
import "../css/ClerkFullPage.css"

const ClerkAccountPage = () => {
  const { user } = useUser();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("user_profiles")
        .select("status")
        .eq("clerk_id", user.id)
        .single();

      setStatus(error ? "unknown" : data.status);
    };
    fetchStatus();
  }, [user]);

  return (
    <div className="clerk-page-wrapper">
      <SignedIn>
        <div>
           <progress class="progress is-danger" value="50" max="100">
            90%</progress>
             <div className="status-bar">Status: {status || "Loading..."}</div>
        </div>

        <UserProfile />
      </SignedIn>
      <SignedOut>
        <div className="has-text-white has-text-centered mt-6">
          You must be signed in to view this page.
        </div>
      </SignedOut>
    </div>
  );
};

export default ClerkAccountPage;
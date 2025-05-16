import React from "react";
import { SignedIn, SignedOut, UserProfile, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { supabase } from '../lib/supabaseClient'; // customize this import path

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

      if (error) {
        console.error("Error fetching status:", error);
        setStatus("unknown");
      } else {
        setStatus(data.status);
      }
    };

    fetchStatus();
  }, [user]);

  return (
    <div className="container p-6">
      <SignedIn>
        <h1 className="title is-4">Account Settings</h1>
        <div className="box mb-5">
          <p><strong>Status:</strong> {status || "Loading..."}</p>
        </div>
        <UserProfile />
      </SignedIn>

      <SignedOut>
        <p>You must be signed in to view this page.</p>
      </SignedOut>
    </div>
  );
};

export default ClerkAccountPage;
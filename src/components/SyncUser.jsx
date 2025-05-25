import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"; // Make sure this is your correct path

const SyncUser = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Logging entry into useEffect
    console.log("🔥 useEffect triggered", { isLoaded, isSignedIn, user });

    const syncUser = async () => {
      // Wait for Clerk to finish loading the session
      if (!isLoaded || !isSignedIn || !user) {
        console.log("⏳ Waiting for user to be ready...");
        return;
      }

      // Grab Clerk user data
      const id = user.id;
      const fullName = user.fullName || "";
      const email = user.emailAddresses[0]?.emailAddress || "";

      console.log("📤 Upserting to Supabase:", { id, fullName, email });

      // Check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("id", id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("❌ Error checking user:", checkError.message);
        return;
      }

      // If not, insert
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from("users")
          .upsert([
            {
              id,
              full_name: fullName,
              email,
              status: "pending",
            },
          ]);

        if (insertError) {
          console.error("❌ Error inserting user into Supabase:", insertError.message);
          return;
        }

        console.log("✅ New user added to Supabase");
      } else {
        console.log("✅ User already exists in Supabase");
      }

      // Redirect only after upsert completes
      console.log("➡️ Redirecting to /form...");
      navigate("/form");
    };

    // Slight delay gives Clerk time to fully initialize
    const timeout = setTimeout(syncUser, 300);

    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn, user, navigate]);

  return null;
};

export default SyncUser;
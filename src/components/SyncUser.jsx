import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase"; // adjust this path if needed

const SyncUser = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔥 useEffect triggered", { isLoaded, isSignedIn, user });

    const sync = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        console.log("⏳ User not ready");
        return;
      }

      const id = user.id;
      const fullName = user.fullName;
      const email = user.emailAddresses[0]?.emailAddress;

      console.log("📤 Attempting upsert to Supabase:", { id, fullName, email });

      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("id")
        .eq("id", id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("❌ Error checking user existence:", fetchError.message);
        return;
      }

      if (!existingUser) {
        const { error: insertError } = await supabase.from("users").upsert({
          id,
          full_name: fullName,
          email,
          status: "pending",
        });

        if (insertError) {
          console.error("❌ Error inserting user:", insertError.message);
          return;
        }

        console.log("✅ User inserted into Supabase");
      } else {
        console.log("✅ User already exists in Supabase");
      }

      console.log("➡️ Redirecting to /form");
      navigate("/form");
    };

    sync();
  }, [isSignedIn, isLoaded, user, navigate]);

  return null;
};

export default SyncUser;
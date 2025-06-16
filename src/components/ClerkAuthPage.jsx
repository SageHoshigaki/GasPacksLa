import React, { useState } from "react";
import { SignIn, SignUp, useUser } from "@clerk/clerk-react";
import SyncUser from "./SyncUser";

const ClerkAuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const { isSignedIn } = useUser();

  return (
    <div style={{ minHeight: "100vh", background: "#f9f9f9" }}>
      <div style={{ textAlign: "center", paddingTop: "2rem" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>Welcome</h2>
        <div style={{ marginBottom: "2rem" }}>
          <button
            onClick={() => setIsSignIn(true)}
            className={`button is-link ${isSignIn ? "" : "is-light"}`}
            style={{ marginRight: "1rem" }}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignIn(false)}
            className={`button is-link ${!isSignIn ? "" : "is-light"}`}
          >
            Sign Up
          </button>
        </div>
      </div>

      {isSignIn ? (
        <SignIn
          routing="virtual"
          appearance={{
            elements: {
              rootBox: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
              card: {
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderRadius: "8px",
              },
            },
          }}
        />
      ) : (
        <SignUp
          routing="virtual"
          appearance={{
            elements: {
              rootBox: {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
              card: {
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                borderRadius: "8px",
              },
            },
          }}
        />
      )}

      {/* Sync user only if signed in */}
      {isSignedIn && <SyncUser />}
    </div>
  );
};

export default ClerkAuthPage;

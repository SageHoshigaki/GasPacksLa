// src/pages/auth/SsoCallback.jsx
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export default function SsoCallback() {
  // Handles Google (and any other OAuth) redirects
  return <AuthenticateWithRedirectCallback />;
}
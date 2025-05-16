import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import "../src/css/index.css";
import App from "./App";

// Get Clerk publishable key from environment variables
const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

// Validate Clerk API key
if (!clerkPubKey) {
  throw new Error(
    "Missing Clerk API key. Please add REACT_APP_CLERK_PUBLISHABLE_KEY to your .env file"
  );
}

// Validate Clerk API key format
if (!clerkPubKey.startsWith("pk_")) {
  throw new Error(
    "Invalid Clerk API key format. The key should start with 'pk_'"
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ClerkProvider
    publishableKey={clerkPubKey}
    appearance={{
      baseTheme: undefined,
      variables: {
        colorPrimary: "#4a90e2",
        colorText: "#333333",
        colorBackground: "#ffffff",
        colorInputBackground: "#f5f5f5",
        colorInputText: "#333333",
        colorTextSecondary: "#666666",
        colorDanger: "#dc2626",
        colorSuccess: "#059669",
        borderRadius: "0.375rem",
      },
    }}
  >
    <App />
  </ClerkProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

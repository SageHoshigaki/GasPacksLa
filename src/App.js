import "./css/App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SignIn, SignUp } from "@clerk/clerk-react";

import LandingPage from "./components/Landing";
import IDUploadPage from "./components/IdUpload";
import MultiStepForm from "./components/MultiStepForm";
import ClerkAccountPage from "./components/ClerkAccountPage";
import Shop from "./components/Shop";
import ProtectedShopRoute from "./components/ProtectedShopRoute";
import NotAuthorized from "./components/NotAuthorized";
import AdminUserPanel from "./components/AdminUserPanel";

function App() {
  const clerkStyles = {
    rootBox: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      backgroundColor: "#121212",
    },
    card: {
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      borderRadius: "12px",
      backgroundColor: "#fff",
    },
  };

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/admin" element={<AdminUserPanel />} />
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/sign-in"
          element={
            <SignIn
              path="/sign-in"
              routing="path"
              appearance={{ elements: clerkStyles }}
            />
          }
        />
        <Route
          path="/sign-up"
          element={
            <SignUp
              path="/sign-up"
              routing="path"
              appearance={{ elements: clerkStyles }}
            />
          }
        />

        {/* PROTECTED ROUTES */}
        <Route path="/upload-id" element={<IDUploadPage />} />
        <Route path="/form" element={<MultiStepForm />} />
        <Route path="/account" element={<ClerkAccountPage />} />
        <Route
          path="/shop"
          element={
            <ProtectedShopRoute>
              <Shop />
            </ProtectedShopRoute>
          }
        />
        <Route path="/not-authorized" element={<NotAuthorized />} />

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            <div style={{ padding: "2rem" }}>
              <h2>404 - Page not found</h2>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

// components/ProtectedShopRoute.jsx
import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";

const ProtectedShopRoute = ({ children }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null; // optional: add a loader

  const accountStatus = user?.publicMetadata?.accountStatus;

  if (accountStatus === "active") {
    return children;
  } else {
    return <Navigate to="/not-authorized" replace />;
  }
};

export default ProtectedShopRoute;
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

import "./index.css";

/* ── Shared UI ──────────────────── */

import Footer from "./components/ui/SiteFooter";
import CartDrawer from "./components/bag/CartDrawer";

/* ── Pages ───────────────────────── */
import Home from "./pages/Landing";
import Shop from "./pages/Shop";
import ProductDetail from "./components/ecommerce/ProductDetail";
import AccountDashboard from "./components/ecommerce/AccountDashboard";
import Locator from "./pages/DispensaryLocator";
import AdminDashboard from "./pages/AdminDashboard";
import CheckoutPage from "./pages/CheckoutPage";
import TailwindTest from "./pages/TailwindTest";

/* ── Auth pages ─────────────────── */
import CustomSignIn from "./pages/auth/CustomSignIn";
import CustomSignUp from "./pages/auth/CustomSignUp";
import SsoCallback from "./pages/auth/SsoCallback";

/* ── FX ─────────────────────────── */
import PageTransition from "./components/PageTransition";
import SiteFooter from "./components/ui/SiteFooter";

/* ── Auth gate helper ───────────── */
function Protected({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

/* ── Animated route wrapper ─────── */
function AnimatedRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showFx, setShowFx] = useState(false);
  const [path, setPath] = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== path) {
      setShowFx(true);
      const id = setTimeout(() => {
        setPath(location.pathname);
        setShowFx(false);
      }, 1600); // sync with PageTransition length
      return () => clearTimeout(id);
    }
  }, [location, path]);

  return (
    <>
      {showFx && <PageTransition />}
      <Routes location={{ pathname: path }}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/locator" element={<Locator />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/test" element={<TailwindTest />} />

        <Route path="/sign-in" element={<CustomSignIn />} />
        <Route path="/sign-up" element={<CustomSignUp />} />
        <Route path="/sso-callback" element={<SsoCallback />} />

        <Route
          path="/account/*"
          element={
            <Protected>
              <AccountDashboard />
            </Protected>
          }
        />
        <Route
          path="/admin"
          element={
            <Protected>
              <AdminDashboard />
            </Protected>
          }
        />
      </Routes>
    </>
  );
}

/* ── App root ───────────────────── */
export default function App() {
  return (
    <Router>
            {/* persistent header */}
      <CartDrawer />    {/* off-canvas cart, also persistent */}
      <AnimatedRoutes />
      <SiteFooter />        {/* persistent footer */}
    </Router>
  );
}
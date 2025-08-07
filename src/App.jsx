import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

import './index.css';                       // Tailwind output

/* ─── Pages & components ─────────────────────────────── */
import Home from './pages/Landing';
import Shop from './pages/Shop';
import ProductDetail from './components/ecommerce/ProductDetail';
import AccountDashboard from './components/ecommerce/AccountDashboard';
import Locator from './pages/DispensaryLocator';
import AdminDashboard from './pages/AdminDashboard';
import CartDrawer from './components/bag/CartDrawer';
import CheckoutPage from './pages/CheckoutPage';
import TailwindTest from './pages/TailwindTest';
import PageTransition from './components/PageTransition';

import CustomSignIn from './pages/auth/CustomSignIn';
import CustomSignUp from './pages/auth/CustomSignUp';
import SsoCallback from './pages/auth/SsoCallback';

/* ─── Simple auth gate ───────────────────────────────── */
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

/* ─── Route wrapper with fancy transition ────────────── */
function AnimatedRoutes() {
  const location   = useLocation();
  const navigate   = useNavigate();
  const [showFx, setShowFx]     = useState(false);
  const [path,   setPath]       = useState(location.pathname);

  useEffect(() => {
    if (location.pathname !== path) {
      setShowFx(true);
      const id = setTimeout(() => {
        setPath(location.pathname);
        setShowFx(false);
      }, 1600);           // keep in sync with animation length
      return () => clearTimeout(id);
    }
  }, [location, path]);

  return (
    <>
      {showFx && <PageTransition />}
      <Routes location={{ pathname: path }}>
        <Route path="/"             element={<Home />}                />
        <Route path="/shop"         element={<Shop />}                />
        <Route path="/product/:id"  element={<ProductDetail />}       />
        <Route path="/locator"      element={<Locator />}             />
        <Route path="/checkout"     element={<CheckoutPage />}        />
        <Route path="/test"         element={<TailwindTest />}        />

        <Route path="/sign-in"      element={<CustomSignIn />}        />
        <Route path="/sign-up"      element={<CustomSignUp />}        />
        <Route path="/sso-callback" element={<SsoCallback />}         />

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

/* ─── Top-level app ───────────────────────────────────── */
export default function App() {
  return (
    <Router>
      <CartDrawer />
      <AnimatedRoutes />
    </Router>
  );
}
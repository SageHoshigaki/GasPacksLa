// src/components/ui/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBagShopping } from "@fortawesome/free-solid-svg-icons";
import { useCartUI } from "../../context/CartUIContext";
import { useCart } from "../../context/CartContext";

export default function Navbar() {
  const { toggleCart } = useCartUI();
  const { cart = [] } = useCart();
  const { pathname } = useLocation();
  const isLanding = pathname === "/";

  /* ---------------- scroll shadow / blur ---------------- */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------------- mobile menu state ---------------- */
  const [mobileOpen, setMobileOpen] = useState(false);

  /* ---------------- derived values ---------------- */
  const cartCount = cart.reduce((acc, i) => acc + (Number(i.qty) || 0), 0);

  const linkCls = ({ isActive }) =>
    [
      "relative text-sm font-medium text-white/90 hover:text-white transition-colors",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 rounded",
      "after:pointer-events-none after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-white after:transition-[width] after:duration-300",
      isActive ? "after:w-full" : "after:w-0 hover:after:w-full",
    ].join(" ");

  const NAV_H = isLanding ? "h-20" : "h-16"; 
  const LOGO_H = isLanding ? "h-[280px]" : "h-12";

  const shellCls = [
    "fixed top-0 left-0 right-0 z-50 text-white will-change-backdrop-filter",
    !isLanding || scrolled
      ? "bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/70 shadow-sm shadow-black/20"
      : "bg-transparent",
  ].join(" ");

  return (
    <>
      <nav className={shellCls} role="navigation" aria-label="Main">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between ${NAV_H}`}>
            
            {/* ---------- Left Links (desktop) ---------- */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/shop" className={linkCls}>Shop</NavLink>
              <NavLink to="/" end className={linkCls}>Gallery</NavLink>
            </div>

            {/* ---------- Mobile Hamburger ---------- */}
            <div className="md:hidden">
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="inline-flex items-center p-2 text-white/90 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? (
                  // X Icon
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.225 4.811 4.811 6.225 12 13.414l7.189-7.189-1.414-1.414L12 10.586l-5.775-5.775z" />
                  </svg>
                ) : (
                  // Hamburger Icon
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
                  </svg>
                )}
              </button>
            </div>

            {/* ---------- Center Logo ---------- */}
            <div className="flex -mb-15 justify-center flex-1 md:flex-none">
              <Link to="/" aria-label="GasPacks Home" className="block">
                <img
                  src="/images/product/gaspacksani.png"
                  alt="GasPacks Logo"
                  className={`${LOGO_H} w-auto select-none mt-10 transition-[height] duration-300`}
                  draggable="false"
                />
              </Link>
            </div>

            {/* ---------- Right Links (desktop) ---------- */}
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/locator" className={linkCls}>Stores</NavLink>
              <NavLink to="/account" className={linkCls}>Account</NavLink>

              <button
                aria-label="Open cart"
                className="relative inline-flex items-center text-white hover:opacity-90 transition"
                style={{ background: "none", border: "none", padding: 0 }}
                onClick={() => toggleCart(true)}
              >
                <FontAwesomeIcon icon={faBagShopping} size="lg" />
                {cartCount > 0 && (
                  <span
                    aria-label={`${cartCount} items in cart`}
                    className="absolute -top-2 -right-2 min-w-[1.25rem] h-5 px-1 rounded-full bg-white text-black text-[11px] leading-5 text-center font-semibold"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 🔥 FULLSCREEN MOBILE MENU (CANNOT BE BLOCKED)             */}
        {/* ========================================================= */}
        {mobileOpen && (
          <div
            className="
              fixed inset-0 
              z-[999999] 
              bg-black 
              flex flex-col 
              pt-28 pb-10 px-8 
              space-y-10
              overflow-y-auto
            "
          >
            {/* Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 text-white/80 hover:text-white transition"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.225 4.811 4.811 6.225 12 13.414l7.189-7.189-1.414-1.414L12 10.586l-5.775-5.775z" />
              </svg>
            </button>

            <NavLink
              to="/shop"
              onClick={() => setMobileOpen(false)}
              className="text-white text-3xl font-semibold tracking-wide"
            >
              Shop
            </NavLink>

            <NavLink
              to="/"
              end
              onClick={() => setMobileOpen(false)}
              className="text-white text-3xl font-semibold tracking-wide"
            >
              Gallery
            </NavLink>

            <NavLink
              to="/locator"
              onClick={() => setMobileOpen(false)}
              className="text-white text-3xl font-semibold tracking-wide"
            >
              Stores
            </NavLink>

            <NavLink
              to="/account"
              onClick={() => setMobileOpen(false)}
              className="text-white text-3xl font-semibold tracking-wide"
            >
              Account
            </NavLink>

            <button
              onClick={() => {
                toggleCart(true);
                setMobileOpen(false);
              }}
              className="text-white text-3xl font-semibold tracking-wide"
            >
              Cart {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>
        )}
      </nav>

      {/* push page content down by nav height when not landing */}
      {!isLanding && <div className={NAV_H} />}
    </>
  );
}
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

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  const cartCount = cart.reduce((acc, item) => {
    return acc + (Number(item.qty) || 0);
  }, 0);

  const navItems = [
    { label: "Shop", to: "/shop", number: "01" },
    { label: "Gallery", to: "/", number: "02", end: true },
    { label: "Stores", to: "/locator", number: "03" },
    { label: "Account", to: "/account", number: "04" },
  ];

  const linkCls = ({ isActive }) =>
    [
      "relative rounded text-[13px] font-medium uppercase tracking-[0.18em]",
      "text-white/75 transition-colors hover:text-white",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
      "after:pointer-events-none after:absolute after:left-0 after:-bottom-1 after:h-px after:bg-white after:transition-[width] after:duration-300",
      isActive ? "text-white after:w-full" : "after:w-0 hover:after:w-full",
    ].join(" ");

  const NAV_H = "h-24";

  const LOGO_H = isLanding
    ? "h-28 sm:h-32 md:h-36"
    : "h-20 sm:h-24 md:h-28";

  const shellCls = [
    "fixed left-0 right-0 top-0 z-50 text-white transition-all duration-300",
    scrolled
      ? "bg-black/25 backdrop-blur-md supports-[backdrop-filter]:bg-black/20 shadow-[0_1px_0_rgba(255,255,255,0.06)]"
      : "bg-transparent",
  ].join(" ");

  return (
    <>
      <nav className={shellCls} role="navigation" aria-label="Main">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className={`relative flex ${NAV_H} items-center justify-between`}>
            {/* Desktop Left Links */}
            <div className="hidden items-center gap-7 md:flex">
              <NavLink to="/shop" className={linkCls}>
                Shop
              </NavLink>

              <NavLink to="/" end className={linkCls}>
                Gallery
              </NavLink>
            </div>

            {/* Mobile Hamburger */}
            <div className="z-20 md:hidden">
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                onClick={() => setMobileOpen((value) => !value)}
              >
                <span className="flex w-4 flex-col gap-1.5">
                  <span
                    className={[
                      "block h-px w-full bg-white transition duration-300",
                      mobileOpen ? "translate-y-[3.5px] rotate-45" : "",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "block h-px w-full bg-white transition duration-300",
                      mobileOpen ? "-translate-y-[3.5px] -rotate-45" : "",
                    ].join(" ")}
                  />
                </span>
              </button>
            </div>

            {/* Center Logo */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <Link
                to="/"
                aria-label="GasPacks Home"
                className="pointer-events-auto block"
                onClick={closeMobile}
              >
                <img
                  src="/images/product/gaspacksani.png"
                  alt="GasPacks Logo"
                  className={`${LOGO_H} w-auto select-none object-contain transition-all duration-300`}
                  draggable="false"
                />
              </Link>
            </div>

            {/* Desktop Right Links */}
            <div className="hidden items-center gap-7 md:flex">
              <NavLink to="/locator" className={linkCls}>
                Stores
              </NavLink>

              <NavLink to="/account" className={linkCls}>
                Account
              </NavLink>

              <button
                type="button"
                aria-label="Open cart"
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-sm transition hover:bg-white/10"
                onClick={() => toggleCart(true)}
              >
                <FontAwesomeIcon icon={faBagShopping} size="sm" />

                {cartCount > 0 && (
                  <span
                    aria-label={`${cartCount} items in cart`}
                    className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold leading-none text-black"
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Cart */}
            <div className="z-20 md:hidden">
              <button
                type="button"
                aria-label="Open cart"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white backdrop-blur-md transition hover:bg-white/10"
                onClick={() => toggleCart(true)}
              >
                <FontAwesomeIcon icon={faBagShopping} size="sm" />

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold leading-none text-black">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* PREMIUM MOBILE MENU */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[999999] overflow-hidden bg-black text-white md:hidden">
          {/* Background atmosphere */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-[-120px] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/[0.06] blur-[120px]" />
            <div className="absolute bottom-[-160px] right-[-120px] h-[420px] w-[420px] rounded-full bg-[#f4efe8]/[0.06] blur-[130px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.055),transparent_42%)]" />
          </div>

          <div className="relative z-10 flex min-h-[100svh] flex-col px-5 pb-6 pt-5">
            {/* Mobile Menu Top Bar */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                aria-label="Close menu"
                onClick={closeMobile}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/85 backdrop-blur-md transition hover:bg-white/[0.08] hover:text-white"
              >
                <span className="relative block h-4 w-4">
                  <span className="absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 rotate-45 bg-white" />
                  <span className="absolute left-0 top-1/2 block h-px w-full -translate-y-1/2 -rotate-45 bg-white" />
                </span>
              </button>

              <Link to="/" onClick={closeMobile} aria-label="GasPacks Home">
                <img
                  src="/images/product/gaspacksani.png"
                  alt="GasPacks Logo"
                  className="h-24 w-auto object-contain"
                  draggable="false"
                />
              </Link>

              <button
                type="button"
                aria-label="Open cart"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white backdrop-blur-md transition hover:bg-white/[0.08]"
                onClick={() => {
                  toggleCart(true);
                  closeMobile();
                }}
              >
                <FontAwesomeIcon icon={faBagShopping} size="sm" />

                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-semibold leading-none text-black">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Brand Intro */}
            <div className="mt-10 border-b border-white/10 pb-7">
              <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-white/30">
                GasPacks Menu
              </p>

              <h2 className="mt-4 max-w-sm text-[clamp(2.7rem,13vw,4.8rem)] font-semibold leading-[0.84] tracking-[-0.09em] text-white">
                Premium access.
              </h2>
            </div>

            {/* Editorial Mobile Nav */}
            <div className="flex flex-1 flex-col justify-center py-8">
              <div className="flex flex-col">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={closeMobile}
                    className={({ isActive }) =>
                      [
                        "group flex items-end justify-between border-b border-white/10 py-5",
                        "transition hover:border-white/25",
                        isActive ? "text-white" : "text-white/82",
                      ].join(" ")
                    }
                  >
                    <span className="text-[clamp(3.15rem,15vw,5rem)] font-semibold leading-[0.82] tracking-[-0.1em]">
                      {item.label}
                    </span>

                    <span className="pb-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/28 transition group-hover:text-white/55">
                      {item.number}
                    </span>
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Bottom CTA Card */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">
              <div className="flex items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-white/30">
                    Curated Selection
                  </p>

                  <p className="mt-3 max-w-[250px] text-sm leading-6 text-white/48">
                    Premium products, local access, and a cleaner shopping
                    experience.
                  </p>
                </div>

                <Link
                  to="/shop"
                  onClick={closeMobile}
                  className="shrink-0 rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.24em] text-black transition hover:bg-white/85"
                >
                  Shop
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prevents white strip on non-landing pages */}
      {!isLanding && <div className="h-24 bg-black" />}
    </>
  );
}
// src/components/bag/CartDrawer.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCartUI } from "../../context/CartUIContext";
import { useCart } from "../../context/CartContext";

const drawerVariants = {
  hidden:  { x: "100%" },
  visible: { x: 0, transition: { type: "tween", ease: "easeInOut", duration: 0.35 } },
  exit:    { x: "100%", transition: { type: "tween", ease: "easeInOut", duration: 0.28 } },
};

export default function CartDrawer() {
  const navigate = useNavigate();
  const { isCartOpen, closeCart } = useCartUI();
  const { cart = [], updateQty, removeFromCart } = useCart();

  const subtotal = useMemo(
    () => cart.reduce((acc, i) => acc + (Number(i.price) || 0) * (Number(i.qty) || 1), 0),
    [cart]
  );

  // ---- REAL viewport height fix (iOS/Safari safe) ----
  const [vhPx, setVhPx] = useState(() => (typeof window !== "undefined" ? window.innerHeight : 0));
  useEffect(() => {
    const setSize = () => setVhPx(window.innerHeight);
    setSize();
    window.addEventListener("resize", setSize);
    window.addEventListener("orientationchange", setSize);
    return () => {
      window.removeEventListener("resize", setSize);
      window.removeEventListener("orientationchange", setSize);
    };
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (isCartOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isCartOpen]);

  const handleDec = (item) => updateQty(item, Math.max(1, (item.qty || 1) - 1));
  const handleInc = (item) => updateQty(item, (item.qty || 1) + 1);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer (grid: header | scroll | footer) */}
          <motion.aside
            role="dialog"
            aria-label="Shopping Cart"
            className="
              fixed right-0 top-0 z-[999]
              w-full max-w-[760px] bg-white shadow-2xl
              grid grid-rows-[auto_1fr_auto] pointer-events-auto
              overflow-hidden
            "
            style={{ height: vhPx ? `${vhPx}px` : "100dvh" }} // hard px height fallback
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="row-start-1 row-end-2 flex items-center justify-between px-8 pt-6 pb-4 border-b border-neutral-200">
              <h2 className="tracking-[0.18em] text-[13px] uppercase">Shopping Cart</h2>
              <button onClick={closeCart} className="text-[13px] uppercase tracking-[0.18em]">
                Back
              </button>
            </div>

            {/* Scrollable middle */}
            <div
              className="
                row-start-2 row-end-3 min-h-0
                overflow-y-auto px-8 py-6 cart-scroll
              "
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
                touchAction: "pan-y",
              }}
            >
              {cart.length === 0 ? (
                <p className="text-sm text-neutral-500">Your bag is empty.</p>
              ) : (
                <ul className="space-y-8">
                  {cart.map((item, idx) => {
                    const title = item.title ?? item.name ?? "Product";
                    const price = Number(item.price) || 0;
                    const qty = Number(item.qty) || 1;
                    const grams = item.grams || "";
                    const imgSrc =
                      item.image ??
                      item.image_url ??
                      item.imageUrl ??
                      item.images?.[0] ??
                      item.thumbnail ??
                      "/images/placeholder-product.png";

                    return (
                      <li
                        key={`${item.id}-${grams}-${price}-${idx}`}
                        className="grid grid-cols-[100px_1fr_auto] gap-4 border-b border-neutral-100 pb-6"
                      >
                        {/* Thumb */}
                        <div className="w-[100px] h-[120px] border border-neutral-100 overflow-hidden bg-white">
                          <img
                            src={imgSrc}
                            alt={title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>

                        {/* Info */}
                        <div className="min-w-0">
                          <p className="text-[15px] leading-5 font-medium line-clamp-2">{title}</p>
                          {grams && (
                            <p className="text-sm text-neutral-500 mt-1">{`${grams}g | $${price}`}</p>
                          )}

                          <div className="mt-3 flex items-center gap-3">
                            <span className="text-sm text-neutral-500">Qty:</span>
                            <div className="inline-flex items-center rounded-full border border-neutral-200 overflow-hidden">
                              <button
                                className="w-8 h-8 grid place-items-center text-sm"
                                onClick={() => handleDec(item)}
                                aria-label="Decrease quantity"
                              >
                                –
                              </button>
                              <span className="w-8 text-center text-sm select-none">{qty}</span>
                              <button
                                className="w-8 h-8 grid place-items-center text-sm"
                                onClick={() => handleInc(item)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item)}
                              className="ml-3 text-sm underline underline-offset-2"
                            >
                              Remove
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-sm">${price.toLocaleString()}</p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Total: {(price * qty).toFixed(2)}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
              {/* spacer so last item isn’t tight to footer */}
              <div className="h-2" />
            </div>

            {/* Footer */}
            <div className="row-start-3 row-end-4 border-t border-neutral-200 px-8 py-5 space-y-4 bg-white">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="tracking-[0.12em] uppercase text-neutral-600">Subtotal:</span>
                <span>
                  {subtotal.toLocaleString(undefined, {
                    style: "currency",
                    currency: "USD",
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>

              <button
                className="w-full h-12 bg-black text-white font-semibold tracking-wide"
                onClick={() => {
                  closeCart();
                  navigate("/checkout");
                }}
              >
                Checkout
              </button>

              <button
                className="w-full h-12 border border-black font-semibold tracking-wide"
                onClick={closeCart}
              >
                Continue Shopping
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
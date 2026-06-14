// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@clerk/clerk-react";

const CartContext = createContext();

const CART_KEY = "gaspacks_cart";
const CART_EXPIRATION_DAYS = 3;

const getCartKey = (item) => {
  if (item?.cart_key) return String(item.cart_key);

  const id = item?.id ?? item?.product_id ?? "unknown";
  const grams = Number(item?.grams ?? item?.selected_grams ?? 3.5);
  const price = Number(item?.price ?? item?.selected_price ?? 0);

  return `${id}-${grams}-${price}`;
};

const getDisplayName = (item) =>
  item?.strain_name ||
  item?.name ||
  item?.title ||
  item?.product_name ||
  item?.productTitle ||
  item?.product_title ||
  "Product";

const normalizeQty = (qty) => {
  const value = Number(qty);

  if (!Number.isFinite(value) || value < 1) return 1;

  return Math.floor(value);
};

const normalizeCartItem = (item) => {
  const grams = Number(item?.grams ?? item?.selected_grams ?? 3.5);
  const price = Number(item?.price ?? item?.selected_price ?? 0);
  const quantity = item?.quantity || item?.selected_quantity || `${grams}g`;

  return {
    ...item,
    name: getDisplayName(item),
    cart_key: getCartKey({
      ...item,
      grams,
      price,
    }),
    grams,
    quantity,
    selected_grams: grams,
    selected_quantity: quantity,
    selected_price: price,
    price,
    qty: normalizeQty(item?.qty),
  };
};

const isSameCartItem = (a, b) => getCartKey(a) === getCartKey(b);

function loadCartFromStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY));

    if (!stored) return [];

    if (Date.now() - stored.timestamp > CART_EXPIRATION_DAYS * 86400000) {
      localStorage.removeItem(CART_KEY);
      return [];
    }

    const items = Array.isArray(stored.items) ? stored.items : [];

    return items.map(normalizeCartItem);
  } catch {
    return [];
  }
}

function mergeCartItems(remoteItems = [], localItems = []) {
  const mergedMap = new Map();

  const addItem = (rawItem) => {
    const item = normalizeCartItem(rawItem);
    const key = getCartKey(item);
    const existing = mergedMap.get(key);

    if (!existing) {
      mergedMap.set(key, item);
      return;
    }

    /*
      Important:
      Do NOT blindly add existing.qty + item.qty here.

      If localStorage and Supabase already contain the same cart, adding them
      together creates the exploding quantity bug.

      Use the higher qty instead. This keeps the cart stable and prevents
      duplicate sync multiplication.
    */
    mergedMap.set(key, {
      ...existing,
      ...item,
      qty: Math.max(normalizeQty(existing.qty), normalizeQty(item.qty)),
    });
  };

  remoteItems.forEach(addItem);
  localItems.forEach(addItem);

  return Array.from(mergedMap.values());
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCartFromStorage);
  const { user } = useUser();

  const claimedRef = useRef(false);
  const syncedUserIdRef = useRef(null);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify({
        items: cart.map(normalizeCartItem),
        timestamp: Date.now(),
      })
    );
  }, [cart]);

  // Sync cart with Supabase once per signed-in user
  useEffect(() => {
    const syncCart = async () => {
      if (!user?.id) return;

      if (syncedUserIdRef.current === user.id) return;
      syncedUserIdRef.current = user.id;

      const localCart = cart.map(normalizeCartItem);

      const { data, error } = await supabase
        .from("carts")
        .select("items")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Cart sync error:", error);
        return;
      }

      const remoteCart = Array.isArray(data?.items)
        ? data.items.map(normalizeCartItem)
        : [];

      const merged = mergeCartItems(remoteCart, localCart);

      setCart(merged);

      if (data) {
        const { error: updateError } = await supabase
          .from("carts")
          .update({
            items: merged,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (updateError) console.error("Cart update error:", updateError);
      } else {
        const { error: insertError } = await supabase.from("carts").insert([
          {
            user_id: user.id,
            items: merged,
            updated_at: new Date().toISOString(),
          },
        ]);

        if (insertError) console.error("Cart insert error:", insertError);
      }
    };

    syncCart();
    // Intentionally do not depend on cart.
    // Depending on cart here causes sync loops / quantity multiplication.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Claim guest orders on sign-in
  useEffect(() => {
    const claimGuestOrders = async () => {
      if (!user || claimedRef.current) return;

      claimedRef.current = true;

      const email =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress;

      if (!email) return;

      const { data, error } = await supabase
        .from("orders")
        .update({ user_id: user.id })
        .eq("email", email)
        .is("user_id", null)
        .select("order_id");

      if (error) {
        console.error("Guest order claim error:", error);
      } else if (data?.length) {
        console.log(`Claimed ${data.length} guest order(s)`);
      }
    };

    claimGuestOrders();
  }, [user]);

  const addToCart = (product) => {
    const incomingItem = normalizeCartItem({
      ...product,
      qty: product?.qty || 1,
    });

    setCart((prev) => {
      const normalizedPrev = prev.map(normalizeCartItem);

      const idx = normalizedPrev.findIndex((item) =>
        isSameCartItem(item, incomingItem)
      );

      if (idx !== -1) {
        return normalizedPrev.map((item, i) =>
          i === idx
            ? {
                ...item,
                qty: normalizeQty(item.qty) + normalizeQty(incomingItem.qty),
              }
            : item
        );
      }

      return [...normalizedPrev, incomingItem];
    });
  };

  const decreaseQty = (product) => {
    const target = normalizeCartItem(product);

    setCart((prev) =>
      prev
        .map(normalizeCartItem)
        .map((item) =>
          isSameCartItem(item, target)
            ? {
                ...item,
                qty: normalizeQty(item.qty) - 1,
              }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (product) => {
    const target = normalizeCartItem(product);

    setCart((prev) =>
      prev.map(normalizeCartItem).filter((item) => !isSameCartItem(item, target))
    );
  };

  const updateQty = (product, qty) => {
    const target = normalizeCartItem(product);
    const nextQty = normalizeQty(qty);

    if (nextQty < 1) {
      removeFromCart(target);
      return;
    }

    setCart((prev) =>
      prev.map(normalizeCartItem).map((item) =>
        isSameCartItem(item, target)
          ? {
              ...item,
              qty: nextQty,
            }
          : item
      )
    );
  };

  const getItem = (product) => {
    const target = normalizeCartItem(product);
    return cart.map(normalizeCartItem).find((item) => isSameCartItem(item, target));
  };

  const isInCart = (product) => !!getItem(product);

  const clearCart = async () => {
    setCart([]);
    localStorage.removeItem(CART_KEY);

    if (user?.id) {
      const { error } = await supabase
        .from("carts")
        .update({
          items: [],
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) console.error("Clear remote cart error:", error);
    }
  };

  const normalizedCart = cart.map(normalizeCartItem);

  const subtotal = normalizedCart.reduce(
    (sum, item) => sum + Number(item.price || 0) * normalizeQty(item.qty),
    0
  );

  const taxRate = 0.08875;
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));
  const totalItems = normalizedCart.reduce(
    (sum, item) => sum + normalizeQty(item.qty),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart: normalizedCart,
        addToCart,
        decreaseQty,
        removeFromCart,
        updateQty,
        getItem,
        isInCart,
        clearCart,
        subtotal,
        tax,
        total,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
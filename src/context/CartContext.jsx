import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useUser } from "@clerk/clerk-react";

const CartContext = createContext();
const CART_KEY = "gaspacks_cart";
const CART_EXPIRATION_DAYS = 3;

// 🛠️ Composite key matcher
const isSameCartItem = (a, b) =>
  a.id === b.id && a.grams === b.grams && a.price === b.price;

function loadCartFromStorage() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_KEY));
    if (!stored) return [];

    const now = Date.now();
    if (now - stored.timestamp > CART_EXPIRATION_DAYS * 86400000) {
      localStorage.removeItem(CART_KEY);
      return [];
    }

    return stored.items || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCartFromStorage());
  const { user } = useUser();

  useEffect(() => {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify({ items: cart, timestamp: Date.now() })
    );
  }, [cart]);

  useEffect(() => {
    const syncCart = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("carts")
        .select("items")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Cart sync error:", error);
        return;
      }

      if (data) {
        const merged = [...data.items];

        cart.forEach(localItem => {
          const match = merged.find(i => isSameCartItem(i, localItem));
          if (match) {
            match.qty += localItem.qty;
          } else {
            merged.push(localItem);
          }
        });

        setCart(merged);

        await supabase
          .from("carts")
          .update({ items: merged, updated_at: new Date() })
          .eq("user_id", user.id);
      } else {
        await supabase.from("carts").insert([{ user_id: user.id, items: cart }]);
      }
    };

    syncCart();
  }, [user]);

const addToCart = (product) => {
  console.log("🛒 Adding to cart:", product); // 👈 Check this output

  const qtyToAdd = product.qty || 1;

  setCart(prev => {
    const existingIndex = prev.findIndex(item =>
      item.id === product.id &&
      item.grams === product.grams &&
      Number(item.price) === Number(product.price)
    );

    if (existingIndex !== -1) {
      return prev.map((item, index) =>
        index === existingIndex
          ? { ...item, qty: item.qty + qtyToAdd }
          : item
      );
    } else {
      return [...prev, { ...product, qty: qtyToAdd }];
    }
  });
};

  const decreaseQty = (product) => {
    setCart(prev =>
      prev
        .map(item =>
          isSameCartItem(item, product)
            ? { ...item, qty: item.qty - 1 }
            : item
        )
        .filter(item => item.qty > 0)
    );
  };

  const removeFromCart = (product) => {
    setCart(prev => prev.filter(item => !isSameCartItem(item, product)));
  };

  const updateQty = (product, qty) => {
    if (qty < 1) return removeFromCart(product);

    setCart(prev =>
      prev.map(item =>
        isSameCartItem(item, product) ? { ...item, qty } : item
      )
    );
  };

  const getItem = (product) => cart.find(item => isSameCartItem(item, product));
  const isInCart = (product) => !!getItem(product);

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxRate = 0.08875;
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
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
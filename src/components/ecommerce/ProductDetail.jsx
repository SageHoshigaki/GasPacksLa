import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useCart } from "../../context/CartContext";
import { useCartUI } from "../../context/CartUIContext";
import Navbar from "../ui/Navbar";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();
  const ui = useCartUI();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    const gramsDropdown = document.getElementById("variant");
    const grams = gramsDropdown?.value || "3.5g";

    const normalizedProduct = {
      ...product,
      grams: parseFloat(grams), // important for unique cart items
    };

    console.log("Adding to cart:", normalizedProduct);
    addToCart(normalizedProduct);

    if (ui?.openCart) ui.openCart();
    else if (ui?.toggleCart) ui.toggleCart(true);
  };

  if (!product) {
    return (
      <section className="min-h-[60vh] bg-black text-white flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-black text-white">
      <div className="mb-60">
        <Navbar />
      </div>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Product Image */}
          <div>
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/90">
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Right: Details */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="mt-2 text-xl text-gray-300">
              ${Number(product.price).toLocaleString()}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-gray-300">
              {product.description}
            </p>

            {/* Variant dropdown */}
            <div className="mt-6">
              <label
                htmlFor="variant"
                className="block text-xs font-medium text-gray-400 mb-2"
              >
                Select Option
              </label>
              <select
                id="variant"
                className="w-full rounded-lg border border-white/10 bg-black text-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-white/20"
                defaultValue="3.5"
              >
                <option value="3.5">3.5g</option>
                <option value="7">7g</option>
                <option value="14">14g</option>
              </select>
            </div>

            {/* Add to Bag */}
            <button
              onClick={handleAddToCart}
              className="mt-6 w-full rounded-lg bg-white text-black py-3.5 text-sm font-semibold tracking-wide hover:bg-white/90 active:scale-[0.99] transition"
            >
              Add to Bag
            </button>

            {/* Collapsible links */}
            <div className="mt-8 space-y-2 text-xs text-gray-400">
              <button className="block w-full text-left hover:text-white/90 transition">
                Details +
              </button>
              <button className="block w-full text-left hover:text-white/90 transition">
                Shipping Policy +
              </button>
              <button className="block w-full text-left hover:text-white/90 transition">
                Share +
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// src/components/Shop.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import Navbar from "../components/ui/Navbar";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase.from("products").select("*");
      if (error) console.error("Products error:", error);
      setProducts(data || []);
      setLoading(false);
    };
    loadProducts();
  }, []);

  return (
      
    <section className="bg-black min-h-screen">
     <div className="mb-40">
    <Navbar />
  </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        {/* 3 per row on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {(loading ? Array.from({ length: 6 }) : products).map((p, i) => (
            <Link
              key={p?.id ?? i}
              to={p?.id ? `/product/${p.id}` : "#"}
              className="group block"
            >
              {/* IMAGE CARD — square with rounded edges */}
              <div className="bg-white h-[480px] w-full flex items-center justify-center rounded-3xl overflow-hidden">
                {p ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="max-h-[440px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-[440px] w-full animate-pulse bg-neutral-200" />
                )}
              </div>

              {/* CAPTION */}
              <div className="pt-4">
                <p className="text-[11px] tracking-[0.18em] text-neutral-400 uppercase truncate">
                  {p?.brand ?? ""}
                </p>
                <p className="mt-1 text-[13px] text-neutral-200 truncate">
                  {p?.name ?? ""}
                </p>
                <p className="mt-1 text-[12px] text-neutral-300">
                  {p ? `$${Number(p.price).toLocaleString()}` : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
// src/components/Shop.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) console.error("Products error:", error);

      setProducts(data || []);
      setLoading(false);
    };

    loadProducts();
  }, []);

  const items = loading ? Array.from({ length: 6 }) : products;

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* BACKGROUND ATMOSPHERE */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-[-180px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[140px]" />
        <div className="absolute right-[-180px] top-[34vh] h-[560px] w-[560px] rounded-full bg-[#f4efe8]/[0.045] blur-[160px]" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[520px] w-[520px] rounded-full bg-white/[0.025] blur-[150px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1500px] px-4 pb-20 pt-28 sm:px-6 sm:pb-24 sm:pt-32 lg:px-10">
        {/* SHOP HEADER */}
        <div className="mb-10 border-b border-white/10 pb-8 sm:mb-12 sm:pb-10 md:mb-16">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <p className="text-[9px] font-semibold uppercase tracking-[0.36em] text-white/40 sm:text-[10px]">
                  Curated GasPacks Selection
                </p>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-white/35">
                  Verified Drops
                </span>
              </div>

              <h1 className="max-w-4xl text-[clamp(3.15rem,12vw,7.25rem)] font-semibold leading-[0.82] tracking-[-0.09em] text-white">
                Premium products, ready when you are.
              </h1>
            </div>

            <div className="max-w-sm md:text-right">
              <p className="text-sm leading-6 text-white/45">
                Explore verified drops, featured strains, and essentials
                selected for a cleaner, faster shopping experience.
              </p>

              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25">
                {loading
                  ? "Loading catalog"
                  : `${products.length} product${products.length === 1 ? "" : "s"} available`}
              </p>
            </div>
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-14 lg:grid-cols-3 lg:gap-x-6 xl:gap-x-8 xl:gap-y-20">
          {items.map((p, i) => {
            const productName = p?.name || p?.strain_name || "";
            const productBrand = p?.brand || "GasPacks";
            const productType = p?.type || p?.quantity || "Premium";

            return (
              <Link
                key={p?.id ?? i}
                to={p?.id ? `/product/${p.id}` : "#"}
                className="group block"
              >
                {/* PRODUCT IMAGE CARD */}
                <div
                  className={[
                    "relative overflow-hidden rounded-[1.8rem] border border-white/10 sm:rounded-[2.25rem]",
                    "bg-[#f4efe8] shadow-[0_24px_70px_rgba(0,0,0,0.42)] sm:shadow-[0_35px_100px_rgba(0,0,0,0.45)]",
                    "transition-all duration-500 ease-out",
                    "sm:group-hover:-translate-y-1 sm:group-hover:border-white/25",
                  ].join(" ")}
                >
                  {/* soft premium product stage */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,0.95),rgba(244,238,232,0.92)_46%,rgba(210,190,165,0.28)_100%)]" />

                  {/* top light wash */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/60 to-transparent opacity-70 sm:h-28" />

                  {/* bottom depth */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/15 to-transparent sm:h-32" />

                  {/* card micro labels */}
                  {p && (
                    <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-3 sm:left-5 sm:right-5 sm:top-5">
                      <span className="rounded-full border border-black/10 bg-white/55 px-3 py-2 text-[8px] font-black uppercase tracking-[0.24em] text-black/40 backdrop-blur-md sm:text-[9px]">
                        {productType}
                      </span>

                      <span className="rounded-full border border-black/10 bg-black/[0.06] px-3 py-2 text-[8px] font-black uppercase tracking-[0.24em] text-black/40 backdrop-blur-md sm:text-[9px]">
                        Verified
                      </span>
                    </div>
                  )}

                  {/* hover action - desktop/tablet only */}
                  <div className="absolute bottom-5 left-1/2 z-20 hidden -translate-x-1/2 translate-y-3 rounded-full bg-black px-5 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white opacity-0 shadow-2xl transition-all duration-300 sm:block sm:group-hover:translate-y-0 sm:group-hover:opacity-100">
                    View Product
                  </div>

                  {/* product image */}
                  <div className="relative flex h-[330px] items-center justify-center p-6 pt-12 sm:h-[400px] sm:p-7 sm:pt-14 md:h-[430px] lg:h-[480px] xl:h-[520px]">
                    {p ? (
                      <img
                        src={p.image_url}
                        alt={productName}
                        className="relative z-10 block h-auto w-auto max-h-full max-w-full object-contain drop-shadow-[0_22px_24px_rgba(0,0,0,0.35)] transition-transform duration-700 ease-out sm:drop-shadow-[0_28px_28px_rgba(0,0,0,0.35)] sm:group-hover:scale-[1.035]"
                        loading="lazy"
                        draggable="false"
                      />
                    ) : (
                      <div className="h-full w-full animate-pulse rounded-[1.35rem] bg-black/10 sm:rounded-[1.75rem]" />
                    )}
                  </div>
                </div>

                {/* PRODUCT CAPTION */}
                <div className="mt-4 flex items-start justify-between gap-4 sm:mt-5 sm:gap-6">
                  <div className="min-w-0">
                    <p className="mb-2 truncate text-[9px] font-semibold uppercase tracking-[0.3em] text-white/30 sm:text-[10px]">
                      {productBrand}
                    </p>

                    <h2 className="truncate text-[15px] font-medium tracking-[-0.03em] text-white sm:text-base">
                      {productName}
                    </h2>

                    {p?.strain_name && p?.name !== p?.strain_name && (
                      <p className="mt-2 truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30 sm:text-[11px] sm:tracking-[0.22em]">
                        {p.strain_name}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 pt-[1.25rem] text-sm font-medium tracking-[-0.02em] text-white sm:pt-[1.35rem]">
                    {p ? `$${Number(p.price).toLocaleString()}` : ""}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && products.length === 0 && (
          <div className="mt-16 flex min-h-[40vh] items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.03] p-10 text-center">
            <div>
              <p className="text-sm font-medium text-white">No products yet.</p>
              <p className="mt-2 text-sm text-white/40">
                New drops will appear here once they are added.
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
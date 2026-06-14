// src/components/ecommerce/ProductDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useCart } from "../../context/CartContext";
import { useCartUI } from "../../context/CartUIContext";

const FALLBACK_GRAM_OPTIONS = [
  { quantity: "3.5g", grams: 3.5, price: null, sort_order: 1 },
  { quantity: "7g", grams: 7, price: null, sort_order: 2 },
  { quantity: "14g", grams: 14, price: null, sort_order: 3 },
  { quantity: "28g", grams: 28, price: null, sort_order: 4 },
];

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCart();
  const { toggleCart } = useCartUI();

  useEffect(() => {
    const fetchProductAndVariants = async () => {
      setLoading(true);
      setNotFound(false);

      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (productError || !productData) {
        console.error("Product fetch error:", productError);
        setNotFound(true);
        setLoading(false);
        return;
      }

      setProduct(productData);

      const { data: variantData, error: variantError } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productData.id)
        .order("sort_order", { ascending: true });

      if (variantError) {
        console.error("Variant fetch error:", variantError);
        setVariants([]);
      } else {
        setVariants(variantData || []);
        if (variantData?.length) {
          setSelectedVariantId(variantData[0].id);
        }
      }

      setLoading(false);
    };

    fetchProductAndVariants();
  }, [id]);

  const displayName =
    product?.strain_name ||
    product?.strain ||
    product?.title ||
    product?.product_name ||
    product?.productTitle ||
    product?.product_title ||
    product?.name ||
    "GasPacks Product";

  const displayBrand = product?.brand || "GasPacks";
  const displayType = product?.type || "Premium Drop";

  const normalizedVariants = useMemo(() => {
    if (variants.length > 0) return variants;

    return FALLBACK_GRAM_OPTIONS.map((option, index) => ({
      id: `fallback-${index}`,
      product_id: product?.id,
      quantity: option.quantity,
      grams: option.grams,
      price: product?.price ?? option.price,
      in_stock: true,
      sort_order: option.sort_order,
    }));
  }, [variants, product]);

  const selectedVariant = useMemo(() => {
    if (!normalizedVariants.length) return null;

    return (
      normalizedVariants.find((variant) => variant.id === selectedVariantId) ||
      normalizedVariants[0]
    );
  }, [normalizedVariants, selectedVariantId]);

  const activePrice = Number(selectedVariant?.price ?? product?.price ?? 0);
  const activeQuantity =
    selectedVariant?.quantity || product?.quantity || "3.5g";
  const activeGrams = Number(selectedVariant?.grams || 3.5);

  const handleAddToCart = () => {
    if (!product) return;

    const cartProduct = {
      ...product,

      // selected variant data
      variant_id:
        typeof selectedVariant?.id === "number" ? selectedVariant.id : null,
      quantity: activeQuantity,
      grams: activeGrams,
      price: activePrice,

      // useful display fields for cart/checkout
      selected_quantity: activeQuantity,
      selected_grams: activeGrams,
      selected_price: activePrice,
      cart_key: `${product.id}-${activeQuantity}`,
    };

    console.log("Adding to cart:", cartProduct);

    addToCart(cartProduct);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    if (toggleCart) toggleCart(true);
  };

  if (loading) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="flex min-h-screen flex-col items-center justify-center gap-6 bg-black px-6 pt-28 text-center text-white">
        <p className="text-sm text-white/50">Product not found.</p>

        <Link
          to="/shop"
          className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
        >
          Back to Shop
        </Link>
      </section>
    );
  }

  return (
    <section className="min-h-screen overflow-hidden bg-black text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[140px]" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-[#f4efe8]/[0.05] blur-[150px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
        {/* PAGE TOP MICRO HEADER */}
        <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-white/30">
              <Link to="/shop" className="transition hover:text-white/60">
                Shop
              </Link>{" "}
              / Premium Drop
            </p>

            <p className="mt-3 text-sm leading-6 text-white/45">
              Verified product page with real-time cart checkout.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-white/40">
              Verified Drop
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[9px] font-bold uppercase tracking-[0.22em] text-white/40">
              {activeQuantity} Available
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* LEFT: PRODUCT CAMPAIGN IMAGE */}
          <div>
            <div className="relative z-20 mb-[-0.6rem] px-1 sm:mb-[-0.9rem]">
              <div className="mb-3 flex items-center justify-between gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.42em] text-white/35">
                  {displayBrand}
                </p>

                <span className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[9px] font-black uppercase tracking-[0.22em] text-white/35 sm:inline-flex">
                  GasPacks Selection
                </span>
              </div>

              <h1
                className="max-w-full break-words text-[clamp(4rem,15vw,9.5rem)] font-black uppercase leading-[0.72] tracking-[-0.13em] text-white"
                style={{
                  textShadow:
                    "0 5px 0 rgba(255, 94, 0, 0.45), 0 12px 0 rgba(255, 210, 0, 0.16), 0 22px 55px rgba(0,0,0,0.75)",
                }}
              >
                {displayName}
              </h1>
            </div>

            <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#f4efe8] shadow-[0_35px_110px_rgba(0,0,0,0.55)] sm:rounded-[2.75rem]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.98),rgba(244,239,232,0.96)_42%,rgba(208,188,160,0.30)_100%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/65 to-transparent opacity-75" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/18 to-transparent" />

              <div className="absolute left-4 top-4 z-30 rounded-full border border-black/10 bg-white/60 px-4 py-2 text-[9px] font-black uppercase tracking-[0.25em] text-black/45 backdrop-blur-md sm:left-6 sm:top-6 sm:text-[10px]">
                {displayType}
              </div>

              <div className="absolute right-4 top-4 z-30 rounded-full border border-black/10 bg-black/[0.06] px-4 py-2 text-[9px] font-black uppercase tracking-[0.25em] text-black/45 backdrop-blur-md sm:right-6 sm:top-6 sm:text-[10px]">
                Verified
              </div>

              <div className="relative flex h-[380px] w-full items-center justify-center p-6 sm:h-[560px] sm:p-8 lg:h-[640px] lg:p-10">
                <img
                  src={product.image_url}
                  alt={displayName}
                  className="relative z-10 block h-auto w-auto max-h-full max-w-full object-contain drop-shadow-[0_32px_34px_rgba(0,0,0,0.42)]"
                  draggable="false"
                />
              </div>
            </div>

            {/* TRUST STRIP */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                  Verified
                </p>

                <p className="mt-2 text-sm text-white/55">
                  GasPacks selection
                </p>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                  Fulfillment
                </p>

                <p className="mt-2 text-sm text-white/55">
                  Confirmed checkout
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div>
            <div className="border-b border-white/10 pb-7">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.38em] text-white/35">
                {displayBrand}
              </p>

              <h2 className="text-[clamp(3rem,7vw,5.75rem)] font-semibold leading-[0.86] tracking-[-0.085em] text-white">
                {product.name || displayName}
              </h2>

              {product.strain_name && product.name !== product.strain_name && (
                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
                  
                </p>
              )}
            </div>

            <div className="border-b border-white/10 py-7">
              <div className="flex items-end justify-between gap-8">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/30">
                    Price
                  </p>

                  <p className="text-4xl font-medium tracking-[-0.06em] text-white">
                    ${activePrice.toLocaleString()}
                  </p>

                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.26em] text-white/30">
                    {activeQuantity}
                  </p>
                </div>

                <p className="max-w-[210px] text-right text-xs leading-5 text-white/35">
                 
                </p>
              </div>
            </div>

            {product.description && (
              <p className="mt-6 text-sm leading-relaxed text-gray-300">
                {product.description}
              </p>
            )}

            {/* Variant selector from product_variants */}
            <div className="mt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-widest text-white/30">
                Select Size
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {normalizedVariants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isInStock = variant.in_stock !== false;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!isInStock}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={[
                        "rounded-xl border px-3 py-3 text-center transition",
                        isSelected
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-white/[0.03] text-white hover:border-white/25",
                        !isInStock
                          ? "cursor-not-allowed opacity-40"
                          : "cursor-pointer",
                      ].join(" ")}
                    >
                      <span className="block text-sm font-semibold">
                        {variant.quantity}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to Bag */}
            <button
              onClick={handleAddToCart}
              className={[
                "mt-6 w-full rounded-lg py-3.5 text-sm font-semibold tracking-wide transition",
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-black hover:bg-white/90 active:scale-[0.99]",
              ].join(" ")}
            >
              {added ? "Added to Bag ✓" : "Add to Bag"}
            </button>

            {/* Collapsible details */}
            <div className="mt-8 space-y-0 divide-y divide-white/10 border-t border-white/10">
              {[
                {
                  title: "Details",
                  body:
                    product.description ||
                    "Premium strain curated by GasPacks. Hand-trimmed, slow-cured, and selected for a cleaner experience.",
                },
                {
                  title: "Shipping Policy",
                  body:
                    "Shipping, pickup, and fulfillment options are confirmed during checkout based on location and availability.",
                },
                { title: "Share", body: null },
              ].map(({ title, body }) => (
                <details key={title} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white/70 hover:text-white">
                    {title}
                    <span className="text-white/35 transition group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  {body ? (
                    <p className="mt-4 text-sm leading-7 text-white/45">
                      {body}
                    </p>
                  ) : (
                    <div className="mt-4 flex gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(window.location.href)
                        }
                        className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/50 transition hover:text-white"
                      >
                        Copy link
                      </button>
                    </div>
                  )}
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
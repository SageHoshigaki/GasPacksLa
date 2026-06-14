// src/components/ProductPage.jsx
import React, { useState } from "react";

const ProductPage = ({ product }) => {
  const [selectedOption, setSelectedOption] = useState("");

  if (!product) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="mx-auto flex min-h-[70vh] max-w-[1500px] items-center justify-center px-4 pt-32 sm:px-6 lg:px-10">
          <div className="text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-pulse rounded-full border border-white/10 bg-white/[0.04]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/35">
              Loading product
            </p>
          </div>
        </section>
      </main>
    );
  }

  const {
    name,
    brand,
    strain_name,
    strain,
    title,
    type,
    thc,
    quantity,
    price,
    image_url,
    description = "Premium strain curated by GasPacks. Hand-trimmed, slow-cured, and selected for a cleaner shopping experience.",
  } = product;

  const displayName =
    strain_name ||
    strain ||
    title ||
    product.product_name ||
    product.productTitle ||
    product.product_title ||
    name ||
    "GasPacks Product";

  const displayBrand = brand || "GasPacks";
  const displayPrice = Number(price || 0).toLocaleString();

  const options = [quantity || "3.5g"].filter(Boolean);
  const activeOption = selectedOption || options[0];

  const metaItems = [type, thc ? `${thc} THC` : null, quantity].filter(Boolean);

  return (
    <main className="min-h-screen overflow-hidden bg-black text-white">
      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[140px]" />
        <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-[#f4efe8]/[0.05] blur-[150px]" />
      </div>

      <section className="relative z-10 mx-auto max-w-[1500px] px-4 pb-24 pt-32 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 xl:gap-24">
          {/* LEFT: IMAGE STAGE */}
          <div className="lg:sticky lg:top-10 lg:self-start">
            {/* PRODUCT TITLE ABOVE CARD - INLINE STYLE SO IT CANNOT FAIL */}
            <div
              style={{
                position: "relative",
                zIndex: 50,
                marginBottom: "-10px",
                paddingLeft: "4px",
                paddingRight: "4px",
              }}
            >
              <p
                style={{
                  marginBottom: "8px",
                  fontSize: "10px",
                  fontWeight: 900,
                  letterSpacing: "0.42em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.38)",
                }}
              >
                {displayBrand}
              </p>

              <h2
                style={{
                  margin: 0,
                  maxWidth: "100%",
                  fontSize: "clamp(56px, 16vw, 150px)",
                  lineHeight: "0.74",
                  fontWeight: 900,
                  letterSpacing: "-0.13em",
                  textTransform: "uppercase",
                  color: "#ffffff",
                  textShadow: "0 18px 40px rgba(0,0,0,0.55)",
                  wordBreak: "break-word",
                }}
              >
                {displayName}
              </h2>
            </div>

            <div className="relative overflow-hidden rounded-[2.75rem] border border-white/10 bg-[#f4efe8] shadow-[0_45px_140px_rgba(0,0,0,0.55)]">
              {/* Premium canvas lighting */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.98),rgba(244,239,232,0.96)_42%,rgba(208,188,160,0.30)_100%)]" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-white/65 to-transparent opacity-75" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/18 to-transparent" />

              <div className="relative flex h-[520px] w-full items-center justify-center p-6 sm:h-[620px] sm:p-8 lg:h-[680px] lg:p-10">
                {image_url ? (
                  <img
                    src={image_url}
                    alt={displayName}
                    className="relative z-10 block h-auto w-auto max-h-full max-w-full object-contain drop-shadow-[0_32px_34px_rgba(0,0,0,0.42)]"
                    loading="eager"
                    draggable="false"
                  />
                ) : (
                  <div className="relative z-10 flex h-full w-full items-center justify-center rounded-[2rem] bg-black/10">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-black/35">
                      No Image
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                  Verified
                </p>
                <p className="mt-2 text-sm text-white/55">GasPacks selection</p>
              </div>

              <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                  Fulfillment
                </p>
                <p className="mt-2 text-sm text-white/55">
                  Confirmed at checkout
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: DETAILS */}
          <div className="flex flex-col justify-center">
            <div className="border-b border-white/10 pb-8">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.38em] text-white/35">
                {displayBrand}
              </p>

              <h1 className="max-w-2xl text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.86] tracking-[-0.085em] text-white">
                {displayName}
              </h1>

              {strain_name && name && (
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
                  {strain_name}
                </p>
              )}

              {metaItems.length > 0 && (
                <div className="mt-7 flex flex-wrap gap-3">
                  {metaItems.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-b border-white/10 py-8">
              <p className="max-w-xl text-base leading-8 text-white/55 sm:text-lg sm:leading-9">
                {description}
              </p>
            </div>

            <div className="border-b border-white/10 py-8">
              <div className="flex items-end justify-between gap-8">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/30">
                    Price
                  </p>

                  <p className="text-4xl font-medium tracking-[-0.06em] text-white">
                    ${displayPrice}
                  </p>
                </div>

                <p className="max-w-[210px] text-right text-xs leading-5 text-white/35">
                  Final availability, pickup, and fulfillment details are
                  confirmed during checkout.
                </p>
              </div>

              <div className="mt-8">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/35">
                  Select Option
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSelectedOption(option)}
                      className={[
                        "rounded-2xl border px-5 py-4 text-left text-sm font-semibold transition",
                        activeOption === option
                          ? "border-white bg-white text-black"
                          : "border-white/10 bg-white/[0.03] text-white hover:border-white/25",
                      ].join(" ")}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="mt-6 flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-[11px] font-bold uppercase tracking-[0.28em] text-black transition duration-300 hover:bg-white/85 active:scale-[0.99]"
              >
                Add to Cart
              </button>
            </div>

            <div className="divide-y divide-white/10 border-b border-white/10">
              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white/70">
                  Details
                  <span className="text-white/35 transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/45">
                  {description}
                </p>
              </details>

              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white/70">
                  Shipping Policy
                  <span className="text-white/35 transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/45">
                  Shipping, pickup, and fulfillment options are confirmed during
                  checkout based on location and availability.
                </p>
              </details>

              <details className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white/70">
                  Share
                  <span className="text-white/35 transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <p className="mt-4 max-w-xl text-sm leading-7 text-white/45">
                  Copy this product link and send it to someone who needs the
                  drop.
                </p>
              </details>
            </div>

            <div className="grid gap-4 py-8 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                  Quality
                </p>
                <p className="text-sm leading-6 text-white/55">
                  Premium products curated for a cleaner experience.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                  Details
                </p>
                <p className="text-sm leading-6 text-white/55">
                  Product information shown clearly before checkout.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/30">
                  Support
                </p>
                <p className="text-sm leading-6 text-white/55">
                  Order help and policies available when needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ProductPage;
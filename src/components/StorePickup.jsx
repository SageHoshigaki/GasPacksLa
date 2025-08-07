// src/components/DualImageHero.jsx
import React from "react";

export default function StorePickup({
  leftImg  = "/images/orange.jpg",
  rightImg = "/images/chase.jpg",
}) {
  return (
    <section className="relative h-[90vh] md:h-screen overflow-hidden rounded-lg">
      <div className="grid h-full grid-cols-1 md:grid-cols-2">
        {/* LEFT COLUMN – bg image + gradient + copy */}
        <div
          className="relative flex items-center"
          style={{
            backgroundImage: `url("${leftImg}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* dark overlay to make white text pop */}
          <div className="absolute inset-0 bg-black/40" />

          {/* copy block */}
          <div className="relative z-10 px-6 lg:px-16">
            <h2 className="whitespace-pre-line text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.05] text-white max-w-xl">
              Everyone.<br />
              Everywhere.
            </h2>

            <p className="mt-10 max-w-md text-lg text-neutral-200">
              Closest Shop. Quick Pickup.
            </p>

            <button className="group mt-12 inline-flex items-center gap-4 rounded-full bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur hover:bg-white/20 transition">
              Find a Store
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition group-hover:bg-black group-hover:text-white">
                <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN – second bg image */}
        <div
          className="hidden md:block"
          style={{
            backgroundImage: `url("${rightImg}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>
    </section>
  );
}
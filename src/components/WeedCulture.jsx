// src/components/WeedCultureHero.jsx
import React from "react";

export default function WeedCulture() {
  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      /* file lives in public/images → served from /images/santos.png */
      style={{
        backgroundImage: 'url("/images/santos.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-6 lg:px-8">
        <h1 className="max-w-xl text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.05] text-white">
          Rooted in Culture.<br />
          Rolled in Science.<br />
          Shared with You.
        </h1>

        <p className="mt-6 max-w-md text-lg text-neutral-200">
          More than a dispensary—this is a community for growers, rollers, and
          thinkers. Stay in the loop for drops, events, and exclusive genetics.
        </p>

        <button className="group mt-10 inline-flex w-fit items-center gap-4 rounded-full bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur hover:bg-white/20 transition">
          Join the movement
          <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-black transition group-hover:bg-black group-hover:text-white">
            <svg
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
}
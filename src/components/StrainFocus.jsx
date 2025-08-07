// src/components/StrainFocus.jsx
import React from "react";

export default function StrainFocus() {
  const active = "Terpene Rich";

  const topics = [
    "Potency Boost",
    "Flavor Hunting",
    "Terpene Rich",
    "Slow-Burn Flowers",
    "Solvent-Free Extracts",
    "Small-Batch Cures",
  ];

  return (
    <section className="py-24 bg-black text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* headline */}
        <h2 className="text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-tight text-center lg:text-left">
          Your preferences are signals<br />
          We cultivate them with you
        </h2>

        {/* grid */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* left list */}
          <ul className="space-y-6 text-[clamp(1.5rem,3vw,3rem)] font-semibold leading-none">
            {topics.map((t) => (
              <li
                key={t}
                className={
                  t === active
                    ? "flex items-start text-white"
                    : "text-white/30 line-through"
                }
              >
                <span
                  className={
                    t === active
                      ? "mr-4 mt-3 h-[6px] w-[6px] rounded-full bg-red-500"
                      : "mr-4 mt-3 h-[6px] w-[6px]"
                  }
                />
                {t}
              </li>
            ))}
          </ul>

          {/* right image card */}
          <div className="relative h-[500px] w-full overflow-hidden rounded-[24px]">
            <img
              src="/images/weedbud.jpg"
              alt="Cultivating terpene-rich buds"
              className="h-full w-full object-cover"
            />

            {/* corner badge */}
            <div className="absolute bottom-6 right-6 flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
              <img src="/images/icons/flower.svg" alt="" className="h-6 w-6" />
              Limited drop Friday →
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
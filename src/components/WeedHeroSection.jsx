import React from "react";

export default function WeedHeroSection() {
  return (
    <section className="relative bg-black overflow-hidden text-white">
      {/* slim purple bar */}
     {/* <div className="absolute inset-x-0 top-0 h-[4px] bg-purple-600" />*/}

      {/* headline block */}
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <p className="flex items-center text-xs font-semibold uppercase tracking-wider text-neutral-300">
          <span className="mr-2 text-lg">✱</span>
          Ready to elevate your sesh?
        </p>

        <h1 className="mt-10 font-extrabold leading-[1.05] text-[clamp(2.5rem,6vw,5rem)]">
          A Curated, Personalised<br />
          Cannabis Platform — for&nbsp;Connoisseurs<br />
          and Creators.
        </h1>
      </div>

      {/* marquee or other content here */}
    </section>
  );
}
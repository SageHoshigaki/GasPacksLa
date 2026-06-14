// src/pages/LandingPage.jsx
import React, { useState, useEffect } from "react";

import LoadingScreen from "../components/LoadingScreen";
import AgeVerification from "../components/AgeVerification";
import WeedHeroSection from "../components/WeedHeroSection";
import FeaturedStrainSection from "@/components/FeaturedStrainSection";
import WeedCulture from "@/components/WeedCulture";
import StorePickup from "@/components/StorePickup";
import StrainFocus from "@/components/StrainFocus";

const LandingPage = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(null);

  useEffect(() => {
    const alreadyVisited = localStorage.getItem("visited");
    const ageCheck = localStorage.getItem("ageConfirmed");

    if (!alreadyVisited) {
      setShowLoading(true);

      const t = setTimeout(() => {
        setShowLoading(false);
        localStorage.setItem("visited", "true");
      }, 3000);

      return () => clearTimeout(t);
    }

    if (ageCheck === "true") setAgeConfirmed(true);
    else if (ageCheck === "false") setAgeConfirmed(false);
  }, []);

  const handleAgeConfirmation = (isConfirmed) => {
    localStorage.setItem("ageConfirmed", String(isConfirmed));
    setAgeConfirmed(isConfirmed);
  };

  if (showLoading) return <LoadingScreen />;

  if (ageConfirmed === null) {
    return <AgeVerification onConfirm={handleAgeConfirmation} />;
  }

  if (!ageConfirmed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black px-6 text-center font-cherry text-white">
        <h1 className="text-3xl">You must be 21 or older to enter.</h1>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 overflow-x-hidden bg-black font-roboto text-white">

      {/* GLOBAL BACKGROUND ATMOSPHERE */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute left-1/2 top-[-160px] h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[140px]" />
        <div className="absolute right-[-180px] top-[38vh] h-[560px] w-[560px] rounded-full bg-[#f4efe8]/[0.035] blur-[160px]" />
        <div className="absolute bottom-[-220px] left-[-160px] h-[520px] w-[520px] rounded-full bg-white/[0.025] blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* HERO VIDEO */}
        <section className="relative pt-24 sm:pt-28 md:h-screen md:pt-0">
          <div className="relative overflow-hidden">
            <video
              src="/videos/face.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              className="block h-[58vh] min-h-[420px] w-full object-cover sm:h-[68vh] md:h-screen"
            />

            {/* cinematic overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black to-transparent" />

            {/* small editorial hero stamp */}
            <div className="absolute bottom-6 left-4 right-4 z-10 sm:left-6 sm:right-6 md:bottom-10 lg:left-10 lg:right-10">
              <div className="mx-auto flex max-w-[1500px] items-end justify-between gap-6 border-t border-white/10 pt-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-white/35">
                    GasPacks
                  </p>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-white/55">
                    Premium drops, verified access, and a cleaner shopping
                    experience.
                  </p>
                </div>

                <p className="hidden text-right text-[10px] font-semibold uppercase tracking-[0.32em] text-white/30 sm:block">
                  Scroll
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT FLOW */}
        <section className="relative -mt-8 pb-8 sm:-mt-12 md:-mt-20 md:pb-0">
          <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
            <div className="border-t border-white/10 pt-8 sm:pt-10">
              <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-white/30">
                Curated Cannabis Culture
              </p>
            </div>
          </div>
        </section>

        {/* On mobile: natural content height.
            On desktop: keep the original cinematic full-screen pacing. */}
        <section className="relative py-10 sm:py-12 md:min-h-screen md:py-0 md:-mb-60">
          <WeedHeroSection />
        </section>

        <section className="relative py-10 sm:py-12 md:min-h-screen md:py-0 md:-mt-20 md:mb-60">
          <StrainFocus />
        </section>

        <section className="relative py-10 sm:py-12 md:min-h-screen md:py-0">
          <WeedCulture />
        </section>

        <section className="relative py-10 sm:py-12 md:min-h-screen md:py-0">
          <FeaturedStrainSection />
        </section>

        <section className="relative py-10 sm:py-12 md:min-h-screen md:py-0">
          <StorePickup />
        </section>

        {/* Optional footer later */}
        {/* <SiteFooter /> */}
      </div>
    </div>
  );
};

export default LandingPage;
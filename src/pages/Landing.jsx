import React, { useState, useEffect } from "react";
import Navbar from "../components/ui/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import AgeVerification from "../components/AgeVerification";
import WeedHeroSection from "../components/WeedHeroSection";
import FeaturedStrainSection from "@/components/FeaturedStrainSection";
import SiteFooter from "@/components/ui/SiteFooter";
import WeedCulture from "@/components/WeedCulture";
import StorePickup from "@/components/StorePickup";
import StrainFocus from "@/components/StrainFocus";

const LandingPage = () => {
  const [showLoading, setShowLoading] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(null);

  // On mount, decide if loading and age check are needed (client-only)
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
  if (ageConfirmed === null) return <AgeVerification onConfirm={handleAgeConfirmation} />;
  if (!ageConfirmed)
    return (
      <div className="flex items-center justify-center min-h-dvh md:h-screen bg-black text-white text-center font-cherry">
        <h1 className="text-3xl">You must be 21 or older to enter.</h1>
      </div>
    );

  return (
    <div className="bg-black text-white font-roboto overflow-x-hidden min-w-0">
      <Navbar />

      {/* Hero Section: mobile uses min-h-dvh to avoid address-bar jump; desktop keeps h-screen */}
      <section className="min-h-dvh md:h-screen py-8">
        <div className="w-full overflow-hidden">
          <video
            src="/videos/face.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="w-full block aspect-video md:h-full md:aspect-auto object-cover"
          />
        </div>
      </section>

      {/* Keep your spacing vibe on desktop; limit risky negative margins to md+ */}
      <section className="min-h-dvh md:h-screen md:-mb-60">
        <WeedHeroSection />
      </section>

      <section className="min-h-dvh md:h-screen md:mb-60 md:-mt-20">
        <StrainFocus />
      </section>

      <section className="min-h-dvh md:h-screen">
        <WeedCulture />
      </section>

      <section className="min-h-dvh md:h-screen">
        <FeaturedStrainSection />
      </section>

      <section className="min-h-dvh md:h-screen">
        <StorePickup />
      </section>

      {/* <SiteFooter /> */}
    </div>
  );
};

export default LandingPage;
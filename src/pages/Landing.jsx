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

  // On mount, decide if loading and age check are needed
  useEffect(() => {
    const alreadyVisited = localStorage.getItem("visited");
    const ageCheck = localStorage.getItem("ageConfirmed");

    if (!alreadyVisited) {
      setShowLoading(true);
      setTimeout(() => {
        setShowLoading(false);
        localStorage.setItem("visited", "true");
      }, 3000);
    }

    if (ageCheck === "true") {
      setAgeConfirmed(true);
    } else if (ageCheck === "false") {
      setAgeConfirmed(false);
    }
  }, []);

  const handleAgeConfirmation = (isConfirmed) => {
    localStorage.setItem("ageConfirmed", isConfirmed);
    setAgeConfirmed(isConfirmed);
  };

  if (showLoading) return <LoadingScreen />;
  if (ageConfirmed === null) return <AgeVerification onConfirm={handleAgeConfirmation} />;
  if (!ageConfirmed)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-center font-cherry">
        <h1 className="text-3xl">You must be 21 or older to enter.</h1>
      </div>
    );

  return (
    
    <div className="bg-black text-white font-roboto">
      <Navbar />

      {/* Hero Section */}
      <section className="h-screen py-8">
        <div className="w-full">
          <video
            src="/videos/face.mp4"
            autoPlay
            muted
            loop
            className="w-full block"
          />
        </div>
      </section>

   
 <section className="h-screen -mb-60">
        <WeedHeroSection/>

      </section>


    <section className="h-screen mb-60 -mt-20">
      <StrainFocus/>
    </section>
<section className="h-screen">
        <WeedCulture/>
      </section>
       <section className="h-screen">
        <FeaturedStrainSection/>
      </section>

   <section className="h-screen">
        <StorePickup/>
      </section>

     
     

     
     
    </div>
  );
};

export default LandingPage;
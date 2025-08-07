import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import StrainCard from "@/components/StrainCard";

export default function WeedStrainCarousel() {
  const strains = [
    { img: "/images/product/405.png", name: "405", type: "HYBRID", thc: "24%" },
    { img: "/images/product/93.png",  name: "93",  type: "SATIVA", thc: "21%" },
    { img: "/images/product/e85.png", name: "E-85", type: "HYBRID", thc: "23%" },
    { img: "/images/product/rainbow-cookies.png", name: "Rainbow Cookies", type: "INDICA", thc: "22%" },
  ];

  return (
    <Carousel
      opts={{ loop: true, align: "start", dragFree: true }}
      plugins={[Autoplay({ delay: 0, speed: 4, stopOnInteraction: false })]}
      className="w-full border-t border-neutral-200 bg-white"
    >
      <CarouselContent className="-ml-3 gap-3">
        {strains.map((s, i) => (
          <CarouselItem key={i} className="flex-none w-[280px]">
            <StrainCard {...s} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  );
}
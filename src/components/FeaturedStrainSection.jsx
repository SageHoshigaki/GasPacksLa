import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
} from "@/components/ui/carousel";

export default function FeaturedStrainSection() {
  const slides = [
    {
      img: "/images/product/405.png",
      name: "Relax with\n 405",
      subtitle: "HYBRID",
      desc: "Earthy grape on the inhale, creamy vanilla on the exhale—405 melts stress without knocking you out."
  },
    {
      img: "/images/product/93.png",
      name: "93 \nPerfect Start\nTo Your Day",
      subtitle: "SATIVA",
      desc: "Bright citrus and pine hit first, then a laser-focused uplift that makes morning tasks feel effortless.",
    },
    {
      img: "/images/product/E85.png",
      name: "E-85 Full\nSpectrum Blend",
      subtitle: "HYBRID",
      desc: "Gelato sweetness meets diesel funk, delivering a smooth, euphoric body buzz that won’t glue you to the couch.",
    },
  ];

  return (
    <section className="bg-black py-20 text-white overflow-hidden">
      <Carousel opts={{ loop: true }} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <CarouselContent className="gap-12">
          {slides.map(({ img, name, subtitle, desc }, i) => (
            <CarouselItem key={i} className="flex flex-col md:flex-row items-center md:h-[500px] gap-8">
              {/* --- text block --- */}
              <div className="flex-1 md:flex-[0_0_55%] whitespace-pre-line">
                <h2 className="text-[clamp(2.5rem,5vw,5rem)] font-extrabold leading-none uppercase">
                  {name}
                </h2>
                {subtitle && (
                  <h3 className="mt-2 text-2xl font-semibold uppercase tracking-wider text-neutral-300">
                    {subtitle}
                  </h3>
                )}
                {desc && <p className="mt-8 max-w-md text-lg">{desc}</p>}
                <button className="mt-8 inline-flex items-center gap-2 rounded-full border border-white px-6 py-2 text-sm font-semibold hover:bg-white hover:text-black transition">
                  Shop Now
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right">
                    <path d="M5 12l5-5-5-5" />
                  </svg>
                </button>
              </div>

              {/* --- product card with arrow overlay --- */}
              <div className="relative flex-1 md:flex-[0_0_45%] flex items-center justify-center">
                <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-lg relative">
                  <img src={img} alt={name} className="max-h-[360px] w-auto object-contain" loading="lazy" />

                  {/* next arrow inside card */}
                  <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 border border-black text-black hover:bg-black hover:text-white" />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}

import React from "react";

export default function StrainCard({ img, name, type, thc }) {
  const match = (thc ?? "").match(/\d+/);
  const value = match ? match[0] : "";
  const unit  = match ? thc.replace(match[0], "") : "";

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] text-white">
      <img src={img} alt={name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/35" />

      <header className="relative z-10 flex items-end px-4 pt-4 pb-2">
        <span className="text-[42px] font-extrabold leading-none">{value}</span>
        <span className="ml-[2px] mb-[6px] text-[13px] font-bold">{unit}</span>
        <span className="ml-auto flex space-x-[3px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="block h-[4px] w-[4px] rounded-full bg-white/80" />
          ))}
        </span>
      </header>

      <div className="absolute inset-x-0 top-[74px] h-[1px] bg-white/35" />

      <footer className="relative z-10 mt-auto px-4 pb-4">
        <p className="text-[17px] font-semibold leading-tight">{name}</p>
        <p className="uppercase tracking-wider text-[13px] opacity-80">{type}</p>
      </footer>
    </div>
  );
}
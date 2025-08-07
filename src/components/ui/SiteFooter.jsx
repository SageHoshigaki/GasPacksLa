// src/components/SiteFooter.jsx
import React from "react";
 // if lucide-react is installed

export default function SiteFooter() {
  return (
    <footer className="bg-black text-white px-6 md:px-12 py-14">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-12">
        {/* === left: site nav === */}
        <nav className="text-sm uppercase tracking-wider space-y-2 md:w-1/4">
          {["Collection", "Find Us", "About", "FAQ", "Contact Us"].map((link) => (
            <a key={link} href="#" className="block hover:text-neutral-400">
              {link}
            </a>
          ))}
        </nav>

        {/* === center: logo mark === */}
        <div className="flex-shrink-0 md:w-1/2 flex justify-center">
          {/* replace with your actual SVG / logo image */}
          <img
            src="/images/product/gaspacksani.png"
            alt="Gaspacks"
            className="w-full max-w-[500px] object-contain"
          />
        </div>

   
      </div>

      {/* bottom copyright strip */}
      <div className="mt-14 text-xs text-neutral-400">
        © {new Date().getFullYear()}, GASPacks
      </div>
    </footer>
  );
}
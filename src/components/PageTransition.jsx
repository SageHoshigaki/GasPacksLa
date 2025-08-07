// src/components/PageTransition.jsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Vertical columns that fill top→bottom (scaleY), staggered left→right.
 * Each column uses a slightly different duration to create the staircase feel.
 */
export default function PageTransition({ cols = 7, onComplete = () => {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const fills = containerRef.current.querySelectorAll(".fill");

    // Start collapsed at the top of each column.
    gsap.set(fills, { scaleY: 0, transformOrigin: "top" });

    const tl = gsap.timeline({ onComplete });

    // ENTER: each column fills downward (top → bottom)
    tl.to(fills, {
      scaleY: 1,
      duration: (i) => 0.35 + i * 0.06, // different speeds per column
      ease: "power2.out",
      stagger: { each: 0.07, from: "start" }, // LEFT → RIGHT
    });

    // Hold briefly when fully covered
    tl.to({}, { duration: 0.35 });

    // EXIT: each column collapses downward (bottom anchor)
    tl.to(fills, {
      transformOrigin: "bottom",
      scaleY: 0,
      duration: (i) => 0.30 + i * 0.05,
      ease: "power2.in",
      stagger: { each: 0.07, from: "start" }, // LEFT → RIGHT
    });
  }, [cols, onComplete]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] pointer-events-none grid"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="relative overflow-hidden">
          {/* This element is what we scale vertically */}
          <div className="fill absolute inset-0 bg-black" />
        </div>
      ))}
    </div>
  );
}
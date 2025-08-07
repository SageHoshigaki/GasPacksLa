import React, { useEffect, useRef } from "react";

export default function AuthLayout({
  title,
  subtitle,
  children,
  overline = "GASPACKS",
  videoSrc = "/videos/auth-hero.mp4",   // put file in public/videos/
  poster   = "/images/auth-poster.jpg", // optional poster in public/images/
}) {
  const videoRef = useRef(null);

  // Respect prefers-reduced-motion (don’t autoplay if user opts out)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches && videoRef.current) {
      videoRef.current.pause();
    }
  }, []);

  return (
    <div className="relative min-h-[100svh] w-full bg-black text-white">
      {/* FULLSCREEN VIDEO BACKGROUND */}
      <video
        ref={videoRef}
        src={videoSrc}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="pointer-events-none fixed inset-0 h-full w-full object-cover object-center"
      />

      {/* Overlays for legibility & cinematic fade */}
      <div className="fixed inset-0 bg-black/45" />
      <div className="fixed inset-0 bg-gradient-to-l from-black/55 via-black/30 to-transparent" />
      {/* Radial vignette */}
      <div
        aria-hidden="true"
        className="fixed inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* CONTENT (on top of video) */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl items-center gap-8 px-4 py-10 lg:py-16">
        {/* Auth Card */}
        <div className="w-full lg:w-[540px]">
          <div className="rounded-3xl bg-white text-black shadow-2xl p-8 sm:p-10">
            {overline ? (
              <div className="mb-6 text-sm font-semibold tracking-wide text-neutral-500 uppercase">
                {overline}
              </div>
            ) : null}

            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">{title}</h1>
            {subtitle ? (
              <p className="mt-2 text-base text-neutral-600">{subtitle}</p>
            ) : null}

            <div className="mt-8">{children}</div>

            <div className="mt-8 flex items-center gap-4 text-xs text-neutral-500">
              <a className="hover:underline" href="/privacy">Privacy Policy</a>
              <span>•</span>
              <a className="hover:underline" href="/terms">Terms of Service</a>
            </div>
          </div>
        </div>

        {/* Right side headline (optional) */}
        <div className="hidden flex-1 lg:flex items-center">
          <div className="ml-auto max-w-xl">
            <h2 className="text-5xl sm:text-6xl font-semibold leading-tight">
              Every body has
              <br />
              <span className="opacity-90">100 year potential</span>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}
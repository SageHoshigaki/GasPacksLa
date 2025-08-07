// src/pages/DispensaryLocator.jsx
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { supabase } from "../lib/supabaseClient";


/* map box */
const mapContainerStyle = {
  width: "100%",
  height: "50vh",
  borderRadius: "16px",
};

/* miles calc */
const miles = (la1, lo1, la2, lo2) => {
  const R = 3958.8;
  const dLat = ((la2 - la1) * Math.PI) / 180;
  const dLon = ((lo2 - lo1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((la1 * Math.PI) / 180) *
      Math.cos((la2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function DispensaryLocator() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [query, setQuery]       = useState("");
  const [disp, setDisp]         = useState([]);
  const [searched, setSearched] = useState(false);
  const [loc, setLoc]           = useState(null);
  const [busy, setBusy]         = useState(false);

  /* geocode */
  const geocode = async (addr) => {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        addr
      )}&key=${apiKey}`
    );
    const j = await res.json();
    return j.results?.[0]?.geometry?.location ?? null;
  };

  /* supabase search */
  const sbSearch = async (term) => {
    const { data } = await supabase
      .from("Dispensaries")
      .select("*")
      .ilike("address", `%${term}%`);
    if (!data?.length) return [];

    const enriched = await Promise.all(
      data.map(async (s) => {
        const g = await geocode(s.address);
        return g ? { ...s, lat: g.lat, lng: g.lng } : null;
      })
    );
    return enriched.filter(Boolean);
  };

  /* auto-locate */
  useEffect(() => {
    if (!apiKey || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const here = { lat: coords.latitude, lng: coords.longitude };
      setLoc(here);

      const { data } = await supabase.from("Dispensaries").select("*");
      if (!data?.length) return;

      const enriched = await Promise.all(
        data.map(async (s) => {
          const g = await geocode(s.address);
          return g ? { ...s, lat: g.lat, lng: g.lng } : null;
        })
      );

      setDisp(
        enriched
          .filter(Boolean)
          .filter((s) => miles(here.lat, here.lng, s.lat, s.lng) <= 20)
      );
      setSearched(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  /* manual search */
  const handleSearch = async () => {
    if (!query.trim()) return;
    setBusy(true);
    const res = await sbSearch(query.trim());
    setDisp(res);
    setSearched(true);
    res.length && setLoc({ lat: res[0].lat, lng: res[0].lng });
    setBusy(false);
  };

  /* key check */
  if (!apiKey)
    return (

      <section className="h-screen grid place-content-center bg-black text-white px-4">
        
         
        
        <p className="max-w-md text-center">
          <span className="font-semibold">Google Maps key missing.</span>
          Add <code className="font-mono">VITE_GOOGLE_MAPS_API_KEY</code> to
          <code>.env</code> and restart.
        </p>
      </section>
    );

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      {/* changed h-screen → min-h-screen */}
      <section className="min-h-screen flex flex-col bg-black text-white">
        <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-[clamp(3rem,8vw,5.5rem)] font-semibold text-center leading-none mb-16">
            Find Nearby Dispensaries
          </h1>

          {loc && (
            <div className="mb-8 rounded-2xl overflow-hidden ring-1 ring-white/10">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={loc}
                zoom={12}
                options={{
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: false,
                }}
              >
                <Marker position={loc} label="You" />
                {disp.map((d) => (
                  <Marker key={d.id} position={{ lat: d.lat, lng: d.lng }} label={d.name} />
                ))}
              </GoogleMap>
            </div>
          )}

          {/* search */}
          <div className="mx-auto w-full max-w-2xl flex flex-col sm:flex-row gap-3 mb-6">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter ZIP, City, or State"
              className="flex-1 rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 placeholder:text-white/40 focus:ring-2 focus:ring-white/20 outline-none"
            />
            <button
              onClick={handleSearch}
              disabled={busy}
              className="shrink-0 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-3 font-medium transition disabled:opacity-60"
            >
              {busy ? "Searching…" : "Search"}
            </button>
          </div>

          {/* results */}
          <div className="flex-1 overflow-y-auto space-y-5 bg-black min-h-0">
            <AnimatePresence>
              {searched && disp.length === 0 && (
                <motion.p
                  key="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-white/60"
                >
                  No dispensaries found in your area.
                </motion.p>
              )}

              {disp.map((d) => {
                const dist = loc && miles(loc.lat, loc.lng, d.lat, d.lng);

                return (
                  <motion.div
                    key={d.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="p-5 rounded-2xl bg-white/5 ring-1 ring-white/10"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                      <div className="w-full md:w-56 overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
                        <img
                          src="/images/Stores/rickstore.jpg"
                          alt={d.name}
                          className="h-40 w-full object-cover"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <h2 className="text-xl font-semibold">{d.name}</h2>
                          {typeof dist === "number" && (
                            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 ring-1 ring-white/15">
                              {dist.toFixed(1)} mi
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-white/80">{d.address}</p>
                        {d.phone && (
                          <p className="mt-0.5 text-white/60">
                            <a href={`tel:${d.phone}`} className="hover:text-white">
                              {d.phone}
                            </a>
                          </p>
                        )}
                        <div className="mt-3 flex gap-3">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              d.address
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm ring-1 ring-white/10"
                          >
                            View in Maps
                          </a>
                          {d.website && (
                            <a
                              href={d.website}
                              target="_blank"
                              rel="noreferrer"
                              className="rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-sm ring-1 ring-white/10"
                            >
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </LoadScript>
  );
}
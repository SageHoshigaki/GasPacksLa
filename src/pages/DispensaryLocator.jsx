// src/components/DispensaryLocator.jsx
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import { supabase } from "../lib/supabaseClient";

// --- Map container size (wrapped so Tailwind can control width) ---
const mapContainerStyle = {
  width: "100%",
  height: "360px",
  borderRadius: "16px",
};

// --- Haversine distance (miles) ---
const getDistanceMiles = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export default function DispensaryLocator() {
  const [query, setQuery] = useState("");
  const [dispensaries, setDispensaries] = useState([]);
  const [searched, setSearched] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
// ✅ Vite-style
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Geocode a single address → {lat,lng} | null
  const geocodeAddress = async (address) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`
      );
      const json = await res.json();
      return json.results?.[0]?.geometry?.location ?? null;
    } catch {
      return null;
    }
  };

  // Search dispensaries in Supabase by query (zip/city/state/address)
  const searchDispensaries = async (term) => {
    // Look in address; you can add other fields if present (city/state)
    const { data, error } = await supabase
      .from("Dispensaries")
      .select("*")
      .ilike("address", `%${term}%`);

    if (error || !data?.length) return [];

    const enriched = await Promise.all(
      data.map(async (store) => {
        const loc = await geocodeAddress(store.address);
        return loc ? { ...store, lat: loc.lat, lng: loc.lng } : null;
      })
    );

    return enriched.filter(Boolean);
  };

  // Auto-locate and show nearby stores (within ~20 miles)
  useEffect(() => {
    if (!apiKey) return;
    if (!("geolocation" in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const loc = { lat: coords.latitude, lng: coords.longitude };
        setUserLocation(loc);

        const { data, error } = await supabase.from("Dispensaries").select("*");
        if (error || !data?.length) return;

        const enriched = await Promise.all(
          data.map(async (store) => {
            const g = await geocodeAddress(store.address);
            return g ? { ...store, lat: g.lat, lng: g.lng } : null;
          })
        );

        const nearby = enriched
          .filter(Boolean)
          .filter(
            (s) =>
              getDistanceMiles(loc.lat, loc.lng, s.lat, s.lng) <= 20 // tweak radius if needed
          );

        setDispensaries(nearby);
        setSearched(true);
      },
      () => {
        // user denied location; no-op
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const results = await searchDispensaries(query.trim());
    setDispensaries(results);
    setSearched(true);
    if (results.length > 0) {
      setUserLocation({ lat: results[0].lat, lng: results[0].lng });
    }
    setLoading(false);
  };

  // If no API key, show helpful message
  if (!apiKey) {
    return (
      <section className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-xl text-center">
          <h1 className="text-2xl font-semibold mb-2">Google Maps key missing</h1>
          <p className="text-white/70">
            Set <code className="font-mono">REACT_APP_GOOGLE_MAPS_API_KEY</code> in
            your <code>.env</code>, then restart the dev server.
          </p>
        </div>
      </section>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <section className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-120">
          <h1 className="text-[86px] mb-[80px] font-semibold text-center leading-none">
            Find Nearby<br/> Dispensaries
          </h1>

          {/* Map */}
          {userLocation && (
            <div className="rounded-2xl overflow-hidden mb-8 ring-1 ring-white/10">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation}
                zoom={12}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                <Marker position={userLocation} label="You" />
                {dispensaries.map((store) => (
                  <Marker
                    key={store.id}
                    position={{ lat: store.lat, lng: store.lng }}
                    label={store.name}
                  />
                ))}
              </GoogleMap>
            </div>
          )}

          {/* Search */}
          <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Enter ZIP, City, or State"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 rounded-xl bg-white/5 ring-1 ring-white/10 px-4 py-3 outline-none placeholder:text-white/40 focus:ring-2 focus:ring-white/20"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="shrink-0 px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-medium rounded-xl transition disabled:opacity-60"
            >
              {loading ? "Searching…" : "Search"}
            </button>
          </div>

          {/* No results */}
          <AnimatePresence>
            {searched && dispensaries.length === 0 && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-center text-white/60"
              >
                No dispensaries found in your area.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="mt-6 grid grid-cols-1 gap-5">
            {dispensaries.map((d) => {
              const dist =
                userLocation &&
                getDistanceMiles(userLocation.lat, userLocation.lng, d.lat, d.lng);

              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-5"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-5">
                    {/* Image */}
                    <div className="md:w-56 w-full overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/10">
                      <img
                        src={"/images/Stores/rickstore.jpg"}
                        alt={d.name}
                        className="h-40 w-full object-cover"
                      />
                    </div>

                    {/* Info */}
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
          </div>
        </div>
       
      </section>
    </LoadScript>
  );
}
// src/pages/DispensaryLocator.jsx
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { supabase } from "../lib/supabaseClient";

/* Google Places library for autocomplete */
const libraries = ["places"];

/* map box */
const mapContainerStyle = {
  width: "100%",
  height: "50vh",
  borderRadius: "28px",
};

/* fallback center: NYC */
const defaultCenter = {
  lat: 40.7128,
  lng: -74.006,
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

const mapOptions = {
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  gestureHandling: "greedy",
};

export default function DispensaryLocator() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [query, setQuery] = useState("");
  const [allDispensaries, setAllDispensaries] = useState([]);
  const [disp, setDisp] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loc, setLoc] = useState(defaultCenter);
  const [userLoc, setUserLoc] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [autocomplete, setAutocomplete] = useState(null);

  /* geocode address */
  const geocode = async (addr) => {
    if (!addr || !apiKey) return null;

    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          addr
        )}&key=${apiKey}`
      );

      const json = await res.json();

      if (json.status !== "OK") {
        console.warn("Geocode failed:", json.status, json.error_message);
        return null;
      }

      return json.results?.[0]?.geometry?.location ?? null;
    } catch (error) {
      console.error("Geocode error:", error);
      return null;
    }
  };

  /* load all dispensaries from Supabase */
  const loadDispensaries = async () => {
    const { data, error } = await supabase.from("Dispensaries").select("*");

    if (error) {
      console.error("Dispensaries error:", error);
      setMessage("Could not load dispensaries right now.");
      return [];
    }

    if (!data?.length) {
      setMessage("No dispensaries are currently listed.");
      return [];
    }

    const enriched = await Promise.all(
      data.map(async (store) => {
        /*
          If you add lat/lng columns to Supabase later,
          this uses them and avoids extra Google geocoding.
        */
        if (store.lat && store.lng) {
          return {
            ...store,
            lat: Number(store.lat),
            lng: Number(store.lng),
          };
        }

        /*
          Otherwise, geocode the address stored in Supabase.
          Your table must have an address column.
        */
        const geo = await geocode(store.address);

        if (!geo) return null;

        return {
          ...store,
          lat: geo.lat,
          lng: geo.lng,
        };
      })
    );

    const cleanStores = enriched.filter(Boolean);

    setAllDispensaries(cleanStores);
    return cleanStores;
  };

  /* filter nearby stores */
  const getNearbyStores = (stores, centerPoint, radius = 35) => {
    if (!centerPoint || !stores?.length) return [];

    return stores
      .map((store) => ({
        ...store,
        distance: miles(centerPoint.lat, centerPoint.lng, store.lat, store.lng),
      }))
      .filter((store) => store.distance <= radius)
      .sort((a, b) => a.distance - b.distance);
  };

  /* initial load */
  useEffect(() => {
    if (!apiKey) return;

    const init = async () => {
      setBusy(true);

      const stores = await loadDispensaries();

      /*
        Show all stores immediately if no location permission yet.
        This prevents the page from looking empty even if geolocation is denied.
      */
      setDisp(stores);
      setSearched(false);
      setBusy(false);

      if (!navigator.geolocation) {
        setMessage("Search by ZIP, city, or state to find nearby stores.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const here = {
            lat: coords.latitude,
            lng: coords.longitude,
          };

          setUserLoc(here);
          setLoc(here);

          const nearby = getNearbyStores(stores, here, 35);

          setDisp(nearby.length ? nearby : stores);
          setSearched(true);

          if (!nearby.length) {
            setMessage(
              "No stores found near your current location. Showing all listed locations."
            );
          } else {
            setMessage("");
          }
        },
        () => {
          setMessage("Location access was not enabled. Search manually instead.");
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 1000 * 60 * 5,
        }
      );
    };

    init();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  /* manual search using typed text */
  const handleSearch = async () => {
    const cleanQuery = query.trim();

    if (!cleanQuery) {
      setMessage("Enter a ZIP, city, or state to search.");
      return;
    }

    setBusy(true);
    setMessage("");

    const searchLoc = await geocode(cleanQuery);

    if (!searchLoc) {
      setBusy(false);
      setSearched(true);
      setDisp([]);
      setMessage("Could not find that location. Try a ZIP code or city name.");
      return;
    }

    const stores =
      allDispensaries.length > 0 ? allDispensaries : await loadDispensaries();

    const nearby = getNearbyStores(stores, searchLoc, 35);

    setLoc(searchLoc);
    setDisp(nearby);
    setSearched(true);
    setBusy(false);

    if (!nearby.length) {
      setMessage("No dispensaries found near that area.");
    }
  };

  /* autocomplete place select */
  const handlePlaceChanged = async () => {
    if (!autocomplete) return;

    const place = autocomplete.getPlace();
    const placeLocation = place?.geometry?.location;

    if (!placeLocation) return;

    const selectedLoc = {
      lat: placeLocation.lat(),
      lng: placeLocation.lng(),
    };

    const selectedLabel =
      place.formatted_address || place.name || query || "Selected location";

    setQuery(selectedLabel);
    setLoc(selectedLoc);
    setBusy(true);
    setMessage("");

    const stores =
      allDispensaries.length > 0 ? allDispensaries : await loadDispensaries();

    const nearby = getNearbyStores(stores, selectedLoc, 35);

    setDisp(nearby);
    setSearched(true);
    setBusy(false);

    if (!nearby.length) {
      setMessage("No dispensaries found near that area.");
    }
  };

  const resultCountLabel = useMemo(() => {
    if (busy) return "Searching locations";
    if (searched) return `${disp.length} location${disp.length === 1 ? "" : "s"} found`;
    return `${disp.length} listed location${disp.length === 1 ? "" : "s"}`;
  }, [busy, searched, disp.length]);

  if (!apiKey) {
    return (
      <main className="min-h-screen bg-black text-white">
        <section className="grid min-h-screen place-content-center px-4 pt-32">
          <div className="max-w-xl rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/35">
              Configuration Needed
            </p>

            <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white">
              Google Maps key missing.
            </h1>

            <p className="mt-4 text-sm leading-7 text-white/50">
              Add{" "}
              <code className="rounded bg-white/10 px-2 py-1 font-mono text-white">
                VITE_GOOGLE_MAPS_API_KEY
              </code>{" "}
              to your{" "}
              <code className="rounded bg-white/10 px-2 py-1 font-mono text-white">
                .env
              </code>{" "}
              and restart the dev server.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <main className="min-h-screen overflow-hidden bg-black text-white">
        {/* background atmosphere */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-white/[0.035] blur-[140px]" />
          <div className="absolute bottom-[-180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-[#f4efe8]/[0.05] blur-[150px]" />
        </div>

        <section className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          {/* 1. HEADING */}
          <div className="mb-10 text-center">
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.38em] text-white/35">
              GasPacks Locator
            </p>

            <h1 className="mx-auto max-w-5xl text-[clamp(3rem,8vw,5.5rem)] font-semibold leading-none tracking-[-0.08em] text-white">
              Find Nearby Dispensaries
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/45">
              Search your area and find nearby GasPacks locations with maps,
              directions, and store details.
            </p>
          </div>

          {/* 2. MAP */}
          <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-2 shadow-[0_35px_120px_rgba(0,0,0,0.45)]">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={loc}
              zoom={disp.length ? 12 : 10}
              options={mapOptions}
            >
              {userLoc && <Marker position={userLoc} label="You" />}

              {disp
                .filter((d) => d.lat && d.lng)
                .map((d) => (
                  <Marker
                    key={d.id}
                    position={{ lat: d.lat, lng: d.lng }}
                    label={d.name}
                  />
                ))}
            </GoogleMap>
          </div>

          {/* 3. SEARCH WITH GOOGLE PLACES AUTOCOMPLETE */}
          <div className="mx-auto mb-8 max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.035] p-3 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Autocomplete
                  onLoad={(auto) => setAutocomplete(auto)}
                  onPlaceChanged={handlePlaceChanged}
                  options={{
                    fields: ["geometry", "formatted_address", "name"],
                    types: ["geocode"],
                    componentRestrictions: { country: "us" },
                  }}
                >
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    placeholder="Enter ZIP, City, or State"
                    className="min-h-14 w-full rounded-[1.35rem] border border-white/10 bg-black/40 px-5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-white/25 focus:bg-black/60"
                  />
                </Autocomplete>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={busy}
                className="min-h-14 rounded-[1.35rem] bg-white px-7 text-[11px] font-bold uppercase tracking-[0.26em] text-black transition hover:bg-white/85 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? "Searching" : "Search"}
              </button>
            </div>
          </div>

          {message && (
            <div className="mx-auto mb-8 max-w-3xl rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-5 py-4 text-center text-sm text-white/45">
              {message}
            </div>
          )}

          {/* 4. RESULTS */}
          <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/35">
                Nearby Locations
              </p>

              <p className="mt-2 text-sm text-white/45">{resultCountLabel}</p>
            </div>

            <div className="hidden rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35 sm:block">
              35 mi radius
            </div>
          </div>

          <div className="space-y-5">
            <AnimatePresence>
              {searched && disp.length === 0 && (
                <motion.div
                  key="none"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center"
                >
                  <p className="text-sm font-medium text-white">
                    No dispensaries found in your area.
                  </p>
                  <p className="mt-2 text-sm text-white/40">
                    Try another ZIP code, city, or state.
                  </p>
                </motion.div>
              )}

              {disp.map((d) => (
                <motion.article
                  key={d.id}
                  layout
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-4 shadow-[0_25px_90px_rgba(0,0,0,0.35)] transition hover:border-white/20 hover:bg-white/[0.055]"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="h-44 w-full overflow-hidden rounded-[1.5rem] bg-white/10 md:h-36 md:w-56">
                      <img
                        src="/images/Stores/rickstore.jpg"
                        alt={d.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-semibold tracking-[-0.05em] text-white">
                            {d.name}
                          </h2>

                          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                            {d.address}
                          </p>

                          {d.phone && (
                            <a
                              href={`tel:${d.phone}`}
                              className="mt-2 block text-sm text-white/45 transition hover:text-white"
                            >
                              {d.phone}
                            </a>
                          )}
                        </div>

                        {typeof d.distance === "number" && (
                          <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/65">
                            {d.distance.toFixed(1)} mi
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            d.address
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-white px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-black transition hover:bg-white/85"
                        >
                          View in Maps
                        </a>

                        {d.website && (
                          <a
                            href={d.website}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition hover:border-white/25"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </section>
      </main>
    </LoadScript>
  );
}
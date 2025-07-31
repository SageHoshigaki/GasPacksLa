// 📦 External Imports
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";
import { supabase } from "../lib/supabaseClient";
// 🔐 Supabase Client Setup


// 🗺️ Google Map Style
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
  marginBottom: "1.5rem",
};

// 📏 Haversine Distance Calculation
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
  const [zip, setZip] = useState("");
  const [dispensaries, setDispensaries] = useState([]);
  const [searched, setSearched] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // 🔍 Search Supabase Dispensaries by ZIP / City / State
  const searchDispensaries = async (query) => {
    let { data, error } = await supabase
      .from("Dispensaries")
      .select("*")
      .ilike("address", `%${query}%`);

    if (error) {
      console.error("Supabase Search Error:", error.message);
      return [];
    }

    const enriched = await Promise.all(
      data.map(async (store) => {
        const geo = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            store.address
          )}&key=${apiKey}`
        );
        const geoData = await geo.json();
        const location = geoData.results?.[0]?.geometry?.location;
        return location ? { ...store, lat: location.lat, lng: location.lng } : null;
      })
    );

    return enriched.filter(Boolean);
  };

  // 📍 Auto-locate on Load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);

          // Find nearby dispensaries from DB
          const { data } = await supabase.from("Dispensaries").select("*");

          const enriched = await Promise.all(
            data.map(async (store) => {
              const geo = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                  store.address
                )}&key=${apiKey}`
              );
              const geoData = await geo.json();
              const location = geoData.results?.[0]?.geometry?.location;
              return location ? { ...store, lat: location.lat, lng: location.lng } : null;
            })
          );

          const nearby = enriched
            .filter(Boolean)
            .filter((store) =>
              getDistanceMiles(latitude, longitude, store.lat, store.lng) <= 20
            );

          setDispensaries(nearby);
          setSearched(true);
        },
        (error) => {
          console.error("Geolocation denied or failed:", error);
        }
      );
    }
  }, [apiKey]);

  // 🔍 Handle Manual ZIP / City / State Search
  const handleSearch = async () => {
    const results = await searchDispensaries(zip);
    setDispensaries(results);
    setSearched(true);
    if (results.length > 0) {
      setUserLocation({ lat: results[0].lat, lng: results[0].lng });
    }
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <section className="hero is-black is-fullheight">
        <div className="hero-body">
          <div className="container">
            <h1 className="title has-text-white has-text-centered mb-6">
              Find Nearby Dispensaries
            </h1>

            {/* 🗺️ Google Map */}
            {userLocation && (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={userLocation}
                zoom={12}
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
            )}

            {/* 🔍 Search Box */}
            <div className="field has-addons is-justify-content-center mb-3">
              <div className="control is-expanded">
                <input
                  className="input is-medium"
                  type="text"
                  placeholder="Enter ZIP, City, or State"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
              <div className="control">
                <button
                  className="button is-medium is-danger"
                  onClick={handleSearch}
                >
                  <span className="icon">
                    <i className="fas fa-search"></i>
                  </span>
                </button>
              </div>
            </div>

            {/* 🚫 No Results */}
            <AnimatePresence>
              {searched && dispensaries.length === 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="has-text-grey-light has-text-centered"
                >
                  No dispensaries found in your area.
                </motion.p>
              )}
            </AnimatePresence>

            {/* 🧾 Dispensary Cards */}
            <div className="columns is-multiline is-centered">
              {dispensaries.map((dispensary) => (
                <motion.div
                  key={dispensary.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="column is-10"
                >
                  <div className="box">
                    <div className="columns is-vcentered">
                      <div className="column is-8">
                        <h2 className="title is-4">{dispensary.name}</h2>
                        <p>{dispensary.address}</p>
                        <p className="has-text-grey">{dispensary.phone}</p>
                      </div>
                      <div className="column is-4 has-text-centered">
                        <figure className="image is-4by3">
                          <img
                            src={`/images/Stores/rickstore.jpg`}
                            alt={`${dispensary.name}`}
                            style={{
                              borderRadius: "8px",
                              maxHeight: "160px",
                              objectFit: "cover",
                              width: "100%",
                            }}
                          />
                        </figure>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </LoadScript>
  );
}
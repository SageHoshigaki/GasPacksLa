import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

// Dispensary data (with coordinates)
const dummyDispensaries = [
  {
    id: "disp_001",
    name: "Green Street Buds",
    phone: "(212) 555-4312",
    address: "123 Green St, New York, NY 10001",
    lat: 40.7465,
    lng: -73.9934,
  },
  {
    id: "disp_002",
    name: "Herbal Vibes",
    phone: "(917) 555-2199",
    address: "456 Chill Ave, Brooklyn, NY 11211",
    lat: 40.7092,
    lng: -73.9571,
  }
];

// Distance formula
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

// Google Maps styling
const mapContainerStyle = {
  width: "100%",
  height: "300px",
  borderRadius: "8px",
  marginBottom: "1.5rem",
};

export default function DispensaryLocator() {
  const [zip, setZip] = useState("");
  const [dispensaries, setDispensaries] = useState([]);
  const [searched, setSearched] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  // 🔥 Auto-locate on load
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { lat: latitude, lng: longitude };
          setUserLocation(location);

          const nearby = dummyDispensaries.filter((store) => {
            const dist = getDistanceMiles(latitude, longitude, store.lat, store.lng);
            return dist <= 20;
          });

          setDispensaries(nearby);
          setSearched(true);
        },
        (error) => {
          console.error("Geolocation denied or failed:", error);
        }
      );
    }
  }, []);

  const handleSearch = () => {
    const results = dummyDispensaries.filter((d) => d.address.includes("NY"));
    setDispensaries(results);
    setSearched(true);
  };

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <section className="hero is-black is-fullheight">
        <div className="hero-body">
          <div className="container">
            <h1 className="title has-text-white has-text-centered mb-6">
              Find Nearby Dispensaries
            </h1>

            {/* 🗺️ Interactive Map */}
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

            {/* Search Box */}
            <div className="field has-addons is-justify-content-center mb-3">
              <div className="control is-expanded">
                <input
                  className="input is-medium"
                  type="text"
                  placeholder="Enter ZIP code"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                />
              </div>
              <div className="control">
                <button className="button is-medium is-danger" onClick={handleSearch}>
                  <span className="icon"><i className="fas fa-search"></i></span>
                </button>
              </div>
            </div>

            {/* No Results */}
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

            {/* Dispensary Cards */}
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
                      {/* Left: Info */}
                      <div className="column is-8">
                        <h2 className="title is-4">{dispensary.name}</h2>
                        <p>{dispensary.address}</p>
                        <p className="has-text-grey">{dispensary.phone}</p>
                      </div>

                      {/* Right: Image */}
                      <div className="column is-4 has-text-centered">
                        <figure className="image is-4by3">
                          {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                          <img
                            src={`/images/Stores/rickstore.jpg`}
                            alt={`${dispensary.name}`}
                            style={{
                              borderRadius: "8px",
                              maxHeight: "160px",
                              objectFit: "cover",
                              width: "100%"
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
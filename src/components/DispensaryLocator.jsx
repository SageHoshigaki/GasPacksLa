import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const dummyDispensaries = [
  {
    id: "disp_001",
    name: "Green Street Buds",
    phone: "(212) 555-4312",
    address: "123 Green St, New York, NY 10001",
    mapUrl: "https://maps.googleapis.com/maps/api/staticmap?center=123+Green+St+New+York+NY&zoom=15&size=400x200&key=YOUR_API_KEY"
  },
  {
    id: "disp_002",
    name: "Herbal Vibes",
    phone: "(917) 555-2199",
    address: "456 Chill Ave, Brooklyn, NY 11211",
    mapUrl: "https://maps.googleapis.com/maps/api/staticmap?center=456+Chill+Ave+Brooklyn+NY&zoom=15&size=400x200&key=YOUR_API_KEY"
  }
];

export default function DispensaryLocator() {
  const [zip, setZip] = useState("");
  const [dispensaries, setDispensaries] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    const results = dummyDispensaries.filter((d) => d.address.includes("NY"));
    setDispensaries(results);
    setSearched(true);
  };

  return (
    <section className="hero is-black is-fullheight">
      <div className="hero-body">
        <div className="container">
          <h1 className="title has-text-white has-text-centered mb-6">
            Find Nearby Dispensaries
          </h1>

          {/* Search Box */}
          <div className="field has-addons is-justify-content-center mb-6">
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

          {/* No Results Message */}
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
                    <div className="column">
                      <h2 className="title is-4">{dispensary.name}</h2>
                      <p>{dispensary.address}</p>
                      <p className="has-text-grey">{dispensary.phone}</p>
                    </div>
                    {/* Right: Static Map */}
                    <div className="column is-narrow">
                      <figure className="image is-4by3">
                        <img
                          src={dispensary.mapUrl}
                          alt={`Map of ${dispensary.name}`}
                          style={{ maxWidth: "300px", borderRadius: "8px" }}
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
  );
}
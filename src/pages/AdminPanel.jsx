import React from "react";
import "../css/AdminPanel.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faChartLine,
  faDollarSign,
  faCogs,
  faSyncAlt,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import { syncDispensariesOnce } from "../utils/syncOnce"; // ✅ make sure this exists


const cardData = [
  {
    icon: faUsers,
    title: "Users",
    description: "Manage user accounts and permissions.",
    onClick: () => {},
  },
  {
    icon: faChartLine,
    title: "Data Analytics",
    description: "View system stats and user insights.",
    onClick: () => {},
  },
  {
    icon: faDollarSign,
    title: "Finance",
    description: "Monitor revenue and transactions.",
    onClick: () => {},
  },
  {
    icon: faCogs,
    title: "System",
    description: "DevOps tools and system health.",
    onClick: () => {},
  },
  {
    icon: faSyncAlt,
    title: "Sync Dispensaries",
    description: "One-time sync from JSON → DB",
    onClick: async () => {
      try {
        const res = await syncDispensariesOnce();
        console.log("Sync successful:", res);
        alert("Dispensaries synced successfully!");
      } catch (err) {
        console.error("Sync failed:", err);
        alert("Sync failed. Check console.");
      }
    },
  },
];

const AdminUserPanel = () => {
  return (
    <section
      className="section has-background-black is-flex is-justify-content-center is-align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div className="card-grid">
        {cardData.map((card, idx) => (
          <motion.div
            key={idx}
            className="admin-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: idx * 0.1,
              duration: 0.6,
              ease: "easeOut",
            }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 10px 25px rgba(0, 123, 255, 0.5)",
            }}
            onClick={card.onClick}
            style={{ cursor: "pointer" }}
          >
            <div className="icon-wrapper">
              <FontAwesomeIcon
                icon={card.icon}
                className="icon is-large has-text-link"
              />
            </div>
            <h2 className="title is-5 has-text-white mt-3">{card.title}</h2>
            <p className="has-text-white is-size-7 has-text-centered px-2">
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default AdminUserPanel;
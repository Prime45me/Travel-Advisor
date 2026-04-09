import { motion, AnimatePresence } from "framer-motion";

export default function DetailsPanel({ place, onClose }) {
  return (
    <AnimatePresence>
      {place && (
        <motion.div
          initial={{ opacity: 0, y: 120, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 120, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "400px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            padding: "20px",
            zIndex: 2000,
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              border: "none",
              background: "transparent",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          <h2 style={{ marginTop: 0 }}>
            {place.properties.name}
          </h2>

          <p style={{ color: "#555" }}>
            {place.properties.formatted}
          </p>

          {place.properties.website && (
            <a
              href={place.properties.website}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#007bff", fontWeight: "bold" }}
            >
              Visit Website
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
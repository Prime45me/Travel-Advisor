import { motion, AnimatePresence } from "framer-motion";

export default function DetailsPanel({ place, onClose, isMobile }) {
  return (
    <AnimatePresence>
      {place && (
        <motion.div
          initial={{ opacity: 0, y: isMobile ? "100%" : 120, scale: isMobile ? 1 : 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: isMobile ? "100%" : 120, scale: isMobile ? 1 : 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          drag={isMobile ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={(e, info) => {
            if (info.offset.y > 100 || info.velocity.y > 500) {
              onClose();
            }
          }}
          style={{
            position: "absolute",
            bottom: isMobile ? 0 : "30px",
            left: isMobile ? 0 : "50%",
            transform: isMobile ? "none" : "translateX(-50%)",
            width: isMobile ? "100%" : "420px",
            background: isMobile ? "white" : "rgba(255, 255, 255, 0.95)",
            backdropFilter: isMobile ? "none" : "blur(12px)",
            WebkitBackdropFilter: isMobile ? "none" : "blur(12px)",
            borderRadius: isMobile ? "28px 28px 0 0" : "24px",
            boxShadow: isMobile ? "0 -8px 32px rgba(0,0,0,0.12)" : "0 20px 50px rgba(0,0,0,0.15)",
            border: isMobile ? "none" : "1px solid rgba(255,255,255,0.6)",
            padding: "24px 20px",
            zIndex: 3000,
          }}
        >
          {isMobile && (
            <div 
              style={{ width: "100%", position: "absolute", top: "12px", left: 0, display: "flex", justifyContent: "center", cursor: "grab" }}
            >
              <div style={{ width: "40px", height: "5px", background: "#d1d5db", borderRadius: "3px" }} />
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: isMobile ? "15px" : "10px",
              right: "15px",
              border: "none",
              background: "#eee",
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              cursor: "pointer",
              zIndex: 10
            }}
          >
            ✕
          </button>

          <h2 style={{ marginTop: isMobile ? "10px" : 0, fontSize: isMobile ? "20px" : "24px", color: "#222" }}>
            {place.properties.name}
          </h2>

          <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5", marginBottom: "20px" }}>
            {place.properties.formatted}
          </p>

          <div style={{ display: "flex", gap: "10px" }}>
            {place.properties.website && (
              <a
                href={place.properties.website}
                target="_blank"
                rel="noreferrer"
                style={{ 
                  flex: 1,
                  textAlign: "center",
                  background: "linear-gradient(135deg, #007bff, #0056b3)",
                  color: "white",
                  padding: "14px",
                  borderRadius: "14px",
                  textDecoration: "none",
                  fontWeight: "600",
                  fontSize: "15px",
                  boxShadow: "0 4px 10px rgba(0,123,255,0.3)",
                  transition: "all 0.2s"
                }}
              >
                Visit Website
              </a>
            )}
              <button
                 onClick={onClose}
                 style={{ 
                    flex: 1,
                    background: "#f0f2f5",
                    color: "#333",
                    padding: "14px",
                    borderRadius: "14px",
                    border: "none",
                    fontWeight: "600",
                    fontSize: "15px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
              >
                Close
              </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { motion, AnimatePresence } from "framer-motion";

export default function DetailsPanel({ place, onClose, isMobile }) {
  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    return (
      <div style={{ display: "inline-flex", gap: "2px", marginBottom: "15px" }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{
            color: i < fullStars ? "#ffd700" : "#d1d5db",
            fontSize: "18px"
          }}>
            ★
          </span>
        ))}
        <span style={{ fontSize: "14px", fontWeight: "bold", color: "#666", marginLeft: "6px", alignSelf: "center" }}>
          {Number(rating || 0).toFixed(1)}
        </span>
      </div>
    );
  };
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

          <h2 style={{ marginTop: isMobile ? "10px" : 0, fontSize: isMobile ? "20px" : "24px", color: "#222", marginBottom: "12px" }}>
            {place.properties.name}
          </h2>

          {renderStars(place.properties.rating)}

          <p style={{ color: "#666", fontSize: "14px", lineHeight: "1.5", marginBottom: "15px" }}>
            {place.properties.formatted}
          </p>

          <div style={{ marginBottom: "20px", background: "#f8fafc", padding: "15px", borderRadius: "16px", border: "1px solid #eef2f6" }}>
            {place.properties.opening_hours && (
              <div style={{ marginBottom: "16px" }}>
                <strong style={{ display: "block", fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Opening Hours</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {place.properties.opening_hours.split(';').map((segment, i) => (
                    <div key={i} style={{ 
                      background: "white", 
                      border: "1px solid #eef2f6", 
                      padding: "8px 12px", 
                      borderRadius: "10px", 
                      fontSize: "12px", 
                      color: "#334155",
                      fontWeight: "600",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.03)"
                    }}>
                      <span style={{ fontSize: "14px" }}>🕒</span>
                      {segment.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: "25px", flexWrap: "wrap", marginBottom: "12px" }}>
              {place.properties.contact?.phone && (
                <div style={{ fontSize: "13px", color: "#444" }}>
                  <strong style={{ display: "block", fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Phone</strong>
                  {place.properties.contact.phone}
                </div>
              )}
              {place.properties.contact?.email && (
                <div style={{ fontSize: "13px", color: "#444" }}>
                  <strong style={{ display: "block", fontSize: "10px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Email</strong>
                  {place.properties.contact.email}
                </div>
              )}
            </div>

            {place.properties.facilities && (
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                {Object.entries(place.properties.facilities).filter(([_, v]) => v === true).map(([key]) => (
                  <span key={key} style={{ background: "white", padding: "4px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", color: "#555", border: "1px solid #e2e8f0", textTransform: "capitalize" }}>
                    {key.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>

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
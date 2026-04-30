import { motion } from "framer-motion";

// Single skeleton card that mimics the real place card shape
function SkeletonCard({ index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{
        background: "white",
        marginBottom: "18px",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #eee",
        boxShadow: "0 3px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* Image placeholder */}
      <div style={{ position: "relative", height: "160px", overflow: "hidden" }}>
        <motion.div
          animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 37%, #f0f0f0 63%)",
            backgroundSize: "400% 100%",
          }}
        />
        {/* Badge placeholder */}
        <div style={{ position: "absolute", top: "10px", left: "10px" }}>
          <motion.div
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              width: "60px",
              height: "22px",
              borderRadius: "10px",
              background: "rgba(200, 200, 200, 0.7)",
            }}
          />
        </div>
        {/* Rating placeholder */}
        <div style={{ position: "absolute", top: "10px", right: "10px" }}>
          <motion.div
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            style={{
              width: "50px",
              height: "22px",
              borderRadius: "8px",
              background: "rgba(200, 200, 200, 0.7)",
            }}
          />
        </div>
      </div>

      {/* Content placeholder */}
      <div style={{ padding: "16px" }}>
        {/* Title */}
        <motion.div
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
          style={{
            width: "70%",
            height: "16px",
            borderRadius: "8px",
            background: "#e8e8e8",
            marginBottom: "10px",
          }}
        />
        {/* Address line 1 */}
        <motion.div
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          style={{
            width: "90%",
            height: "12px",
            borderRadius: "6px",
            background: "#efefef",
            marginBottom: "6px",
          }}
        />
        {/* Address line 2 */}
        <motion.div
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          style={{
            width: "55%",
            height: "12px",
            borderRadius: "6px",
            background: "#efefef",
            marginBottom: "16px",
          }}
        />
        {/* Action buttons placeholder */}
        <div style={{ display: "flex", gap: "8px" }}>
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            style={{
              width: "80px",
              height: "28px",
              borderRadius: "8px",
              background: "#f0f2f5",
            }}
          />
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            style={{
              width: "65px",
              height: "28px",
              borderRadius: "8px",
              background: "#f0f2f5",
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Renders a list of skeleton cards
export default function SkeletonCards({ count = 5 }) {
  return (
    <div style={{ padding: "15px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} index={i} />
      ))}
    </div>
  );
}

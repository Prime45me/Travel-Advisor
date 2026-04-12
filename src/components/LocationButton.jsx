import React from "react";
import { useMap } from "react-leaflet";

export default function LocationButton({ position }) {
  const map = useMap();

  const handleRecenter = () => {
    if (position) {
      // 2-Step Drop-in Animation (Google Earth style)
      // Stage 1: Fly above the location
      map.flyTo(position, 13, { duration: 2.0, easeLinearity: 0.25 });
      
      // Stage 2: Dive into street level
      map.once('moveend', () => {
        // Ensure user didn't drag map away mid-flight before zooming
        const center = map.getCenter();
        if (Math.abs(center.lat - position[0]) < 0.05 && Math.abs(center.lng - position[1]) < 0.05) {
          map.flyTo(position, 17, { duration: 1.5 });
        }
      });
    } else {
      console.warn("User position not yet acquired.");
    }
  };

  return (
    <div 
      className="leaflet-bottom leaflet-right" 
      style={{ marginBottom: "30px", marginRight: "10px", zIndex: 1000 }}
    >
      <div className="leaflet-control">
        <button
          onClick={handleRecenter}
          title="Recenter to my location"
          style={{
            backgroundColor: "white",
            width: "45px",
            height: "45px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid #ddd",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f8f9fa";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "white";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {/* Professional Crosshair Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff4d4d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="1" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="23" />
            <line x1="1" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="23" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
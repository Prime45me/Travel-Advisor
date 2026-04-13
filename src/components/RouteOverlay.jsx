import { Polyline } from "react-leaflet";

export default function RouteOverlay({ routeCoords, routeInfo }) {
  return (
    <>
      {/* Route line on the map — this must be rendered inside MapContainer */}
      {routeCoords && (
        <Polyline
          positions={routeCoords}
          pathOptions={{
            color: "#007bff",
            weight: 6,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}
    </>
  );
}

// Separate component for the info badge (rendered outside MapContainer)
export function RouteInfoBadge({ routeInfo }) {
  if (!routeInfo) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "white",
        padding: "12px 20px",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        zIndex: 2000,
        fontWeight: "600",
        display: "flex",
        gap: "15px",
        alignItems: "center"
      }}
    >
      🚗 <span>{routeInfo.distance} km</span>
      ⏱ <span>{routeInfo.duration} min</span>
    </div>
  );
}

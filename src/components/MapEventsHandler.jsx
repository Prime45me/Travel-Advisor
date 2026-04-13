import { useRef } from "react";
import { useMapEvents } from "react-leaflet";

export default function MapEventsHandler({ setSelectedPlace, setDroppedPin }) {
  const isDragging = useRef(false);

  useMapEvents({
    mousedown: () => {
      isDragging.current = false;
    },
    mousemove: () => {
      isDragging.current = true;
    },
    mouseup: () => {
      // Only clear selected on genuine drag, not on click
      if (isDragging.current) {
        setSelectedPlace(null);
      }
    },
    zoomstart: () => {
      setSelectedPlace(null);
    },
    click: async (e) => {
      // Don't drop pin if user was dragging
      if (isDragging.current) return;

      const { lat, lng } = e.latlng;
      setSelectedPlace(null);

      // Reverse geocode the clicked location
      let address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await res.json();
        if (data.display_name) {
          address = data.display_name;
        }
      } catch (err) {
        console.error("Reverse geocode error:", err);
      }

      setDroppedPin({ lat, lng, address });
    }
  });
  return null;
}

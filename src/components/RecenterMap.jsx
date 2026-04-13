import { useEffect, useRef } from "react";
import { useMap, useMapEvents } from "react-leaflet";

// Smoothly flies to the selected place or new search position
export default function RecenterMap({ position, selectedPlace, setSelectedPlace }) {
  const map = useMap();
  const hasInitialMoved = useRef(false); // Track if we've done the first GPS center
  const lastFlownId = useRef(null);      // Track the last clicked town
  const lastPositionCoords = useRef(null); // Track the last searched coordinate string

  useMapEvents({
    // The MOMENT the user interacts (drag, zoom, click), kill the auto-fly logic
    movestart: (e) => {
      // If the movement was triggered by the user (not code), stop the snap
      if (e.originalEvent) {
        setSelectedPlace(null);
        lastFlownId.current = "user-controlled";
        lastPositionCoords.current = "user-controlled";
      }
    }
  });

  useEffect(() => {
    // PRIORITY 1: If a town is selected, go there.
    if (selectedPlace) {
      const currentId = selectedPlace.properties.place_id;
      if (currentId !== lastFlownId.current) {
        const coords = selectedPlace.geometry.coordinates;
        const target = [coords[1], coords[0]];

        // 2-Step Drop-in Animation (Google Earth style)
        map.flyTo(target, 13, { duration: 2.0 }); // Stage 1: Fly above

        map.once('moveend', () => {
          // Ensure they didn't manually cancel by dragging (which changes lastFlownId)
          if (lastFlownId.current === currentId) {
            map.flyTo(target, 16, { duration: 1.5 }); // Stage 2: Dive in
          }
        });

        lastFlownId.current = currentId;
      }
      return; // Exit so we don't hit the GPS logic
    }

    // PRIORITY 2: Search Query / New Position Tracker
    if (position) {
      const posStr = `${position[0].toFixed(5)},${position[1].toFixed(5)}`;

      if (!hasInitialMoved.current) {
        // Initial load GPS center 
        map.setView(position, 11);
        hasInitialMoved.current = true;
        lastPositionCoords.current = posStr;
      }
      else if (lastPositionCoords.current !== posStr) {
        // The red pulse position changed (user searched for a new place)
        lastPositionCoords.current = posStr;

        // 2-Step Drop-in Animation for Search
        map.flyTo(position, 13, { duration: 2.0 });

        map.once('moveend', () => {
          // Ensure map wasn't dragged mid-flight
          if (lastPositionCoords.current === posStr) {
            map.flyTo(position, 16, { duration: 1.5 });
          }
        });
      }
    }
  }, [position, selectedPlace, map]);

  return null;
}

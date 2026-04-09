import { useState, useEffect, useRef } from "react"; // Added useRef

export default function Sidebar({ 
  places, 
  selectedPlace, 
  onSelect, 
  userLocation,
  category,
  setCategory,
  onHover,         // NEW: Prop from MapView to tell the map we are hovering
  hoveredPlaceId   // NEW: Prop from MapView to tell us which marker is hovered
}) {
  const [images, setImages] = useState({});
  const cardRefs = useRef({}); // NEW: Stores references to each card for auto-scroll

  // Scroll to the card when a marker is clicked on the Map
  useEffect(() => {
    if (selectedPlace && cardRefs.current[selectedPlace.properties.place_id]) {
      cardRefs.current[selectedPlace.properties.place_id].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [selectedPlace]);

  const fetchImage = async (name) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`
      );
      const data = await res.json();
      return data.thumbnail?.source || null;
    } catch {
      return null;
    }
  };

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  }

  const getPlaceMeta = (categories, placeId) => {
    const seed = placeId ? placeId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 1000 : 101;
    if (!categories) return { type: 'Place', color: '#6c757d', img: `https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
    if (categories.some(c => c.includes('hotel'))) return { type: 'Hotel', color: '#007bff', img: `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
    if (categories.some(c => c.includes('restaurant'))) return { type: 'Restaurant', color: '#28a745', img: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
    return { type: 'Attraction', color: '#ffc107', img: `https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
  };

  useEffect(() => {
    const loadImages = async () => {
      const newImages = {};
      for (let place of places.slice(0, 10)) {
        const name = place.properties.name;
        if (!name) continue;
        const img = await fetchImage(name);
        if (img) newImages[name] = img;
      }
      setImages(newImages);
    };
    loadImages();
  }, [places]);

  const filteredPlaces = places.filter((place) => {
    if (category === "all") return true;
    const cats = place.properties.categories || [];
    if (category === "hotels") return cats.some(c => c.includes("hotel"));
    if (category === "restaurants") return cats.some(c => c.includes("restaurant"));
    if (category === "attractions") return cats.some(c => c.includes("tourism"));
    return true;
  });

  return (
    <div style={{ width: "380px", height: "100vh", background: "#f8f9fb", overflowY: "auto", boxShadow: "4px 0 15px rgba(0,0,0,0.08)", fontFamily: "Segoe UI, sans-serif", scrollBehavior: "smooth" }}>
      <div style={{ padding: "20px", background: "white", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 10 }}>
        <h2 style={{ margin: 0 }}>Explore</h2>
        <div style={{ marginTop: "12px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["all", "hotels", "restaurants", "attractions"].map((type) => (
            <button
              key={type}
              onClick={() => setCategory(type)}
              style={{ padding: "6px 12px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600", background: category === type ? "#007bff" : "#e9ecef", color: category === type ? "white" : "#333", transition: "all 0.2s ease" }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "15px" }}>
        {filteredPlaces.map((place) => {
          const { name, categories, formatted, website, place_id } = place.properties;
          const coords = place.geometry?.coordinates;
          if (!name || !coords) return null;

          const isSelected = selectedPlace?.properties?.place_id === place_id;
          const isHovered = hoveredPlaceId === place_id; // Check if marker is hovered on map
          
          const meta = getPlaceMeta(categories, place_id);
          const distance = userLocation ? calculateDistance(userLocation[0], userLocation[1], coords[1], coords[0]) : null;

          return (
            <div
              key={place_id || name}
              ref={el => cardRefs.current[place_id] = el} // Register card reference
              onClick={() => onSelect(place)}
              onMouseEnter={() => onHover && onHover(place_id)} // Tell map we are hovering card
              onMouseLeave={() => onHover && onHover(null)}    // Tell map we stopped hovering
              style={{
                background: "white",
                marginBottom: "18px",
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: isSelected || isHovered ? `3px solid ${meta.color}` : "1px solid #eee",
                boxShadow: isSelected || isHovered ? `0 12px 24px rgba(0,0,0,0.12)` : "0 3px 8px rgba(0,0,0,0.05)",
                transform: isSelected || isHovered ? "translateX(8px) scale(1.01)" : "translateX(0) scale(1)",
              }}
            >
              <div style={{ position: "relative", height: "160px" }}>
                <img src={images[name] || meta.img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: "10px", left: "10px", background: meta.color, color: "white", padding: "4px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>
                  {meta.type}
                </div>
                {distance && <div style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px" }}>📍 {distance} km</div>}
              </div>

              <div style={{ padding: "14px" }}>
                <h4 style={{ margin: "0 0 6px 0" }}>{name}</h4>
                <p style={{ fontSize: "13px", color: "#666", marginBottom: "10px" }}>{formatted}</p>
                {website && <a href={website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: "12px", color: meta.color, fontWeight: "600", textDecoration: "none" }}>Visit Website →</a>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
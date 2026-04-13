import { useState, useEffect, useRef } from "react"; // Added useRef

export default function Sidebar({ 
  places, 
  selectedPlace, 
  onSelect, 
  userLocation,
  category,
  setCategory,
  onHover,
  hoverPlaceId,
  routeInfo,
  itinerary,
  toggleItinerary,
  sidebarView,
  setSidebarView
}) {
  const [images, setImages] = useState({});
  const cardRefs = useRef({});

  const fetchImage = async (name) => {
    try {
      const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`);
      const data = await res.json();
      return data.thumbnail?.source || null;
    } catch { return null; }
  };

  useEffect(() => {
    const loadImages = async () => {
      const placesWithNames = places.filter(p => p.properties.name);
      const results = await Promise.allSettled(
        placesWithNames.map(async (place) => {
          const name = place.properties.name;
          const img = await fetchImage(name);
          return { name, img };
        })
      );
      const newImages = {};
      results.forEach(result => {
        if (result.status === "fulfilled" && result.value.img) {
          newImages[result.value.name] = result.value.img;
        }
      });
      setImages(prev => ({ ...prev, ...newImages }));
    };
    if (places.length > 0) loadImages();
  }, [places]);

  // Scroll to the card when a marker is clicked on the Map
  useEffect(() => {
    if (selectedPlace && cardRefs.current[selectedPlace.properties.place_id]) {
      cardRefs.current[selectedPlace.properties.place_id].scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [selectedPlace]);

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
    const seed = placeId ? String(placeId).split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 1000 : 101;
    if (!categories) return { type: 'Place', color: '#6c757d', img: `https://images.unsplash.com/photo-1499092346589-b9b6be3e94b2?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
    if (categories.some(c => c.includes('hotel'))) return { type: 'Hotel', color: '#007bff', img: `https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
    if (categories.some(c => c.includes('restaurant'))) return { type: 'Restaurant', color: '#28a745', img: `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
    return { type: 'Attraction', color: '#ffc107', img: `https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
  };



  const filteredPlaces = places.filter((place) => {
    if (category === "all") return true;
    const cats = place.properties.categories || [];
    if (category === "hotels") return cats.some(c => c.includes("hotel"));
    if (category === "restaurants") return cats.some(c => c.includes("restaurant"));
    if (category === "attractions") return cats.some(c => c.includes("tourism"));
    return true;
  });

  const placesToRender = sidebarView === "explore" ? filteredPlaces : itinerary;

  return (
    <div style={{ width: "380px", height: "100vh", background: "#f8f9fb", overflowY: "auto", boxShadow: "4px 0 15px rgba(0,0,0,0.08)", fontFamily: "Segoe UI, sans-serif", scrollBehavior: "smooth" }}>
      <div style={{ padding: "20px 20px 10px 20px", background: "white", borderBottom: "1px solid #eee", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
          <button 
            onClick={() => setSidebarView("explore")} 
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", background: sidebarView === "explore" ? "#000" : "#eee", color: sidebarView === "explore" ? "white" : "#333", transition: "0.2s" }}
          >
            Explore
          </button>
          <button 
            onClick={() => setSidebarView("itinerary")} 
            style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", background: sidebarView === "itinerary" ? "#000" : "#eee", color: sidebarView === "itinerary" ? "white" : "#333", transition: "0.2s" }}
          >
            My Itinerary ({itinerary?.length || 0})
          </button>
        </div>

        {sidebarView === "explore" && (
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
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
        )}
      </div>

      <div style={{ padding: "15px" }}>
        {placesToRender.map((place) => {
          const { name, categories, formatted, website, contact, place_id, rating, photos } = place.properties;
          const coords = place.geometry?.coordinates;
          if (!name || !coords) return null;

          const isSelected = selectedPlace?.properties?.place_id === place_id;
          const isHovered = hoverPlaceId === place_id; // Check if marker is hovered on map
          
          const meta = getPlaceMeta(categories, place_id);
          
          let displayDistance = null;
          if (userLocation) {
            if (isSelected && routeInfo) {
              displayDistance = `🚗 ${routeInfo.distance} km`;
            } else {
              const straightLine = calculateDistance(userLocation[0], userLocation[1], coords[1], coords[0]);
              displayDistance = `✈️ ${straightLine} km`;
            }
          }

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
                {rating && (
                  <div style={{ position: "absolute", top: "10px", right: "10px", background: "#333", color: "#ffd700", padding: "4px 8px", borderRadius: "8px", fontSize: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "4px", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" }}>
                    ⭐ {Number(rating).toFixed(1)}
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleItinerary(place); }}
                  style={{
                    position: "absolute", bottom: "10px", left: "10px", 
                    background: itinerary.some(p => p.properties.place_id === place_id) ? "#ff4d4d" : "rgba(255,255,255,0.9)", 
                    color: itinerary.some(p => p.properties.place_id === place_id) ? "white" : "#333", 
                    border: "none", padding: "6px 15px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", cursor: "pointer",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.2)", transition: "0.2s"
                  }}
                >
                  {itinerary.some(p => p.properties.place_id === place_id) ? "❤️ Saved" : "🤍 Save"}
                </button>
                {displayDistance && <div style={{ position: "absolute", bottom: "10px", right: "10px", background: "rgba(255,255,255,0.9)", padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: "600", color: isSelected ? "#007bff" : "#555" }}>{displayDistance}</div>}
              </div>

              <div style={{ padding: "16px" }}>
                <h4 style={{ margin: "0 0 6px 0", fontSize: "15px", color: "#222", lineHeight: "1.3" }}>{name}</h4>
                <p style={{ fontSize: "12px", color: "#777", marginBottom: "16px", lineHeight: "1.4" }}>{formatted}</p>
                
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  {contact?.phone && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "#555", background: "#f0f2f5", padding: "6px 10px", borderRadius: "8px", fontWeight: "600" }} onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${contact.phone}`; }}>
                      📞 <span>{contact.phone}</span>
                    </div>
                  )}
                  {website && (
                    <a href={website} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", color: "white", background: meta.color, padding: "6px 12px", borderRadius: "8px", textDecoration: "none", fontWeight: "600", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.opacity = 0.85} onMouseLeave={(e) => e.currentTarget.style.opacity = 1}>
                      🌐 <span>Website</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
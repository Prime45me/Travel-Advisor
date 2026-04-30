import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonCards from "./SkeletonCards";

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
  setSidebarView,
  loading,
  isMobile,
  mobileSheetState,
  setMobileSheetState,
  wikiData
}) {
  const cardRefs = useRef({});



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
    if (categories.some(c => c.includes('shopping_mall'))) return { type: 'Mall', color: '#e83e8c', img: `https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
    if (categories.some(c => c.includes('supermarket'))) return { type: 'Supermarket', color: '#6f42c1', img: `https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
    return { type: 'Attraction', color: '#ffc107', img: `https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=400&q=80&sig=${seed}` };
  };

  const filteredPlaces = places.filter((place) => {
    if (category === "all") return true;
    const cats = place.properties.categories || [];
    if (category === "hotels") return cats.some(c => c.includes("hotel"));
    if (category === "restaurants") return cats.some(c => c.includes("restaurant"));
    if (category === "attractions") return cats.some(c => c.includes("tourism"));
    if (category === "shopping") return cats.some(c => c.includes("shopping_mall"));
    if (category === "supermarkets") return cats.some(c => c.includes("supermarket"));
    return true;
  });

  const placesToRender = sidebarView === "explore" ? filteredPlaces : itinerary;

  const sidebarBg = "#f8f9fb";
  const headerBg = "white";
  const cardBg = "white";
  const textColor = "#222";
  const subtextColor = "#777";
  const borderColor = "#eee";

  const isOpen = (hours) => {
    if (!hours) return null;
    try {
      const now = new Date();
      const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
      const currentDay = dayNames[now.getDay()];
      const currentTime = now.getHours() * 60 + now.getMinutes();

      if (hours.includes('24/7')) return { status: 'Open 24/7', color: '#28a745' };

      const regex = /(\d{2}:\d{2})-(\d{2}:\d{2})/;
      const match = hours.match(regex);
      if (match) {
        const [_, start, end] = match;
        const [startH, startM] = start.split(':').map(Number);
        const [endH, endM] = end.split(':').map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;

        if (currentTime >= startTotal && currentTime <= endTotal) {
          return { status: 'Open Now', color: '#28a745' };
        } else {
          return { status: 'Closed', color: '#dc3545' };
        }
      }
      return { status: 'See Hours', color: '#6c757d' };
    } catch {
      return null;
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating || 0);
    return (
      <div style={{ display: "inline-flex", gap: "1px" }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ 
            color: i < fullStars ? "#ffd700" : "#d1d5db",
            fontSize: "14px"
          }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const mobileVariants = {
    collapsed: { y: "calc(100% - 70px)" },
    half: { y: "40vh" },
    full: { y: 0 }
  };

  const containerStyle = isMobile ? {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
    height: "100vh",
    zIndex: 2500,
    borderRadius: "24px 24px 0 0",
    background: sidebarBg,
    boxShadow: "0 -4px 20px rgba(0,0,0,0.15)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  } : {
    width: "380px",
    height: "100vh",
    background: sidebarBg,
    overflowY: "auto",
    boxShadow: "4px 0 15px rgba(0,0,0,0.08)",
    fontFamily: "Segoe UI, sans-serif",
    scrollBehavior: "smooth",
    transition: "all 0.3s ease"
  };

  return (
    <motion.div
      style={containerStyle}
      initial={isMobile ? "collapsed" : false}
      animate={isMobile ? mobileSheetState : false}
      variants={isMobile ? mobileVariants : {}}
      drag={isMobile ? "y" : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(e, info) => {
        const isUp = info.offset.y < -50 || info.velocity.y < -500;
        const isDown = info.offset.y > 50 || info.velocity.y > 500;

        if (isUp) {
          if (mobileSheetState === "collapsed") setMobileSheetState("half");
          else if (mobileSheetState === "half") setMobileSheetState("full");
        } else if (isDown) {
          if (mobileSheetState === "full") setMobileSheetState("half");
          else if (mobileSheetState === "half") setMobileSheetState("collapsed");
        }
      }}
    >
      {isMobile && (
        <div
          onClick={() => {
            if (mobileSheetState === "collapsed") setMobileSheetState("half");
            else if (mobileSheetState === "half") setMobileSheetState("full");
            else setMobileSheetState("collapsed");
          }}
          style={{ width: "100%", padding: "12px 0", display: "flex", justifyContent: "center", cursor: "grab" }}
        >
          <div style={{ width: "40px", height: "5px", background: "#d1d5db", borderRadius: "3px" }} />
        </div>
      )}
      <div style={{ padding: isMobile ? "0 20px 10px 20px" : "20px 20px 10px 20px", background: headerBg, borderBottom: `1px solid ${borderColor}`, position: "sticky", top: 0, zIndex: 10 }}>
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
          <div style={{ position: "relative", marginBottom: "5px" }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                borderRadius: "12px",
                border: `1px solid ${borderColor}`,
                background: "#f8f9fb",
                color: "#333",
                fontSize: "14px",
                fontWeight: "600",
                appearance: "none",
                cursor: "pointer",
                outline: "none",
                transition: "all 0.2s"
              }}
            >
              <option value="all">All Categories</option>
              <option value="hotels">🏨 Hotels</option>
              <option value="restaurants">🍽️ Restaurants</option>
              <option value="attractions">🏛️ Attractions</option>
              <option value="shopping">🛍️ Shopping Malls</option>
              <option value="supermarkets">🛒 Supermarkets</option>
            </select>
            <div style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", fontSize: "12px", color: "#888" }}>
              ▼
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "15px", flex: 1, overflowY: "auto" }}>
        <AnimatePresence mode="wait">
          {loading && sidebarView === "explore" ? (
            <motion.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <SkeletonCards count={5} />
            </motion.div>
          ) : (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {placesToRender.map((place, index) => {
                const { name, categories, formatted, website, contact, place_id, rating, opening_hours } = place.properties;
                const coords = place.geometry?.coordinates;
                if (!name || !coords) return null;

                const isSelected = selectedPlace?.properties?.place_id === place_id;
                const isHovered = hoverPlaceId === place_id;

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
                  <motion.div
                    key={place_id || name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: isSelected || isHovered ? 1.02 : 1,
                      x: isSelected || isHovered ? 8 : 0
                    }}
                    transition={{ duration: 0.35, delay: index * 0.04 }}
                    ref={el => cardRefs.current[place_id] = el}
                    onClick={() => onSelect(place)}
                    onMouseEnter={() => onHover && onHover(place_id)}
                    onMouseLeave={() => onHover && onHover(null)}
                    style={{
                      background: cardBg,
                      marginBottom: "20px",
                      borderRadius: "20px",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: isSelected || isHovered ? `2px solid ${meta.color}` : `1px solid ${borderColor}`,
                      boxShadow: isSelected || isHovered
                        ? `0 15px 30px rgba(${meta.color === '#007bff' ? '0,123,255' : meta.color === '#28a745' ? '40,167,69' : meta.color === '#ffc107' ? '255,193,7' : '0,0,0'},0.15)`
                        : "0 4px 15px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div style={{ position: "relative", height: "160px" }}>
                      <img src={wikiData[name]?.img || meta.img} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: "10px", left: "10px", background: meta.color, color: "white", padding: "4px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "bold" }}>
                        {meta.type}
                      </div>
                      {rating && (
                        <div style={{ 
                          position: "absolute", 
                          top: "10px", 
                          right: "10px", 
                          background: "rgba(255,255,255,0.95)", 
                          padding: "4px 8px", 
                          borderRadius: "12px", 
                          boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                          display: "flex", 
                          alignItems: "center", 
                          gap: "4px" 
                        }}>
                          {renderStars(rating)}
                          <span style={{ fontSize: "11px", fontWeight: "bold", color: "#333", marginLeft: "2px" }}>
                            {Number(rating).toFixed(1)}
                          </span>
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
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                        <h4 style={{ margin: 0, fontSize: "15px", color: textColor, lineHeight: "1.3", flex: 1 }}>{name}</h4>
                        {opening_hours && (
                          <div style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            color: isOpen(opening_hours)?.color || "#6c757d",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            background: `${isOpen(opening_hours)?.color}15`,
                            border: `1px solid ${isOpen(opening_hours)?.color}30`,
                            marginLeft: "8px"
                          }}>
                            {isOpen(opening_hours)?.status || "Hours"}
                          </div>
                        )}
                      </div>
                      <p style={{ fontSize: "12px", color: subtextColor, marginBottom: "16px", lineHeight: "1.4", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {wikiData[name]?.extract || formatted}
                      </p>

                      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        {contact?.phone && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "11px",
                              color: textColor,
                              background: "#f0f2f5",
                              padding: "8px 12px",
                              borderRadius: "10px",
                              fontWeight: "600",
                              cursor: "pointer",
                              border: "1px solid #e0e0e0",
                              transition: "all 0.2s"
                            }}
                            onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${contact.phone}`; }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#e8eaed"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "#f0f2f5"}
                          >
                            📞 <span>Call</span>
                          </div>
                        )}
                        {website && (
                          <a
                            href={website}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "11px",
                              color: "white",
                              background: "linear-gradient(135deg, #007bff, #0056b3)",
                              padding: "8px 14px",
                              borderRadius: "10px",
                              textDecoration: "none",
                              fontWeight: "600",
                              boxShadow: "0 4px 8px rgba(0,123,255,0.2)",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
                          >
                            🌐 <span>Website</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
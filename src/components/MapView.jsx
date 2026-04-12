import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { useState, useEffect, useRef } from "react";
import L from "leaflet"; // Added Leaflet import for custom icons
import "leaflet/dist/leaflet.css";
import Sidebar from "./Sidebar";
import LocationButton from "./LocationButton";

// --- RED PULSE ICON DEFINITION ---
const userLocationIcon = L.divIcon({
  html: `
    <div class="user-marker-red">
      <div class="pulse-red"></div>
      <div class="dot-red"></div>
    </div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

function MapEventsHandler({ setSelectedPlace }) {
  useMapEvents({
    mousedown: () => {
      // As soon as the user clicks to drag the map, 
      // we clear the selected place so RecenterMap stops fighting them.
      setSelectedPlace(null);
    },
    zoomstart: () => {
      setSelectedPlace(null);
    }
  });
  return null;
}

// Smoothly flies to the selected place
// 1. Update the component to accept setSelectedPlace

function RecenterMap({ position, selectedPlace, setSelectedPlace }) {
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

const createCustomIcon = (color, isActive) => L.divIcon({
  html: `
    <div style="
      background-color: ${color}; 
      width: ${isActive ? '35px' : '25px'}; 
      height: ${isActive ? '35px' : '25px'}; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      border: 2px solid white; 
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: ${isActive ? `0 0 20px ${color}, 0 0 10px white` : '0 2px 5px rgba(0,0,0,0.2)'};
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: ${isActive ? 9999 : 1};
    ">
      <div style="width: 6px; height: 6px; background: white; border-radius: 50%; transform: rotate(45deg);"></div>
    </div>`,
  className: "",
  iconSize: [35, 35],
  iconAnchor: [17, 35]
});

export default function MapView() {
  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState(null);
  const [places, setPlaces] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [query, setQuery] = useState("");
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [category, setCategory] = useState("all");
  const [hoverPlaceId, setHoverPlaceId] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [sidebarView, setSidebarView] = useState("explore");

  useEffect(() => {
    setTimeout(() => setReady(true), 100);
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
      },
      (err) => {
        console.error("Location error:", err);
      }
    );
  }, []);

  useEffect(() => {
    if (!position) return;
    const fetchPlaces = async () => {
      try {
        const [lat, lon] = position;
        // Geoapify requires [lat, lon] for circle center in fetch filter but order is circle:lon,lat
        const res = await fetch(
          `https://api.geoapify.com/v2/places?categories=tourism.sights,accommodation.hotel,catering.restaurant&filter=circle:${lon},${lat},10000&limit=100&apiKey=${import.meta.env.VITE_GEOAPIFY_API_KEY}`
        );
        const data = await res.json();

        // Map Geoapify response back to the generic structure required by Sidebar
        const mappedPlaces = (data.features || []).map(place => {
          // Generate a deterministic pseudo-rating between 3.5 and 5.0 for UI testing since Geoapify doesn't have ratings
          const pseudoRating = place.properties.place_id
            ? 3.5 + ((place.properties.place_id.charCodeAt(0) + place.properties.place_id.length) % 16) / 10
            : 4.0;

          return {
            properties: {
              place_id: place.properties.place_id,
              name: place.properties.name,
              categories: place.properties.categories || [],
              formatted: place.properties.formatted || "No address",
              website: place.properties.website || null,
              contact: { phone: place.properties.contact?.phone || null },
              rating: pseudoRating,
              photos: [] // Trigger Wikipedia fetch in Sidebar
            },
            geometry: {
              coordinates: place.geometry.coordinates // [lon, lat]
            }
          };
        });

        setPlaces(mappedPlaces);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchPlaces();
  }, [position]);
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        let coordsString = "";

        if (sidebarView === "itinerary" && itinerary.length > 0 && position) {
          const [lat1, lon1] = position;
          const itineraryCoords = itinerary.map(p => {
            const [iLon, iLat] = p.geometry.coordinates;
            return `${iLon},${iLat}`;
          });
          coordsString = `${lon1},${lat1};${itineraryCoords.join(';')}`;
        } else if (position && selectedPlace) {
          const [lat1, lon1] = position;
          const [lon2, lat2] = selectedPlace.geometry.coordinates;
          coordsString = `${lon1},${lat1};${lon2},${lat2}`;
        } else {
          setRouteCoords(null);
          setRouteInfo(null);
          return;
        }

        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`
        );

        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates;
          const formatted = coords.map(([lon, lat]) => [lat, lon]);
          const route = data.routes[0];

          setRouteCoords(formatted);
          setRouteInfo({
            distance: (route.distance / 1000).toFixed(1), // km
            duration: Math.round(route.duration / 60),   // minutes
          });
        }
      } catch (err) {
        console.error("Route error:", err);
      }
    };

    fetchRoute();
  }, [position, selectedPlace, sidebarView, itinerary]);

  const handleSearch = async () => {
    if (!query) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const data = await res.json();
      if (data.length > 0) {
        setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelect = (place) => {
    setPosition([parseFloat(place.lat), parseFloat(place.lon)]);
    setQuery(place.display_name);
    setSuggestions([]);
  };

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
  };

  const handleToggleItinerary = (place) => {
    setItinerary(prev => {
      const exists = prev.some(p => p.properties.place_id === place.properties.place_id);
      if (exists) {
        return prev.filter(p => p.properties.place_id !== place.properties.place_id);
      } else {
        return [...prev, place];
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = () => setSuggestions([]);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const getPlaceMeta = (categories) => {
    if (!categories) return { type: 'Place', color: '#6c757d' };
    if (categories.some(c => c.includes('hotel'))) return { type: 'Hotel', color: '#007bff' };
    if (categories.some(c => c.includes('restaurant'))) return { type: 'Restaurant', color: '#28a745' };
    return { type: 'Attraction', color: '#ffc107' };
  };

  if (!ready) return <div>Loading map...</div>;
  const routePosition =
    position && selectedPlace
      ? [
        position,
        [
          selectedPlace.geometry.coordinates[1],
          selectedPlace.geometry.coordinates[0],
        ],
      ]
      : null;

  return (
    <div style={{ height: "100vh", display: "flex", fontFamily: 'sans-serif' }}>
      <Sidebar
        onHover={setHoverPlaceId}
        hoverPlaceId={hoverPlaceId}
        places={places}
        selectedPlace={selectedPlace}
        onSelect={handlePlaceSelect}
        userLocation={position}
        category={category}
        setCategory={setCategory}
        routeInfo={routeInfo}
        itinerary={itinerary}
        toggleItinerary={handleToggleItinerary}
        sidebarView={sidebarView}
        setSidebarView={setSidebarView}
      />

      <div style={{ flex: 1, position: "relative" }}>
        {/* SEARCH BAR */}
        <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "white", padding: "8px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
          <input
            type="text"
            placeholder="Search any place..."
            value={query}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              const val = e.target.value;
              setQuery(val);
              if (debounceTimeout) clearTimeout(debounceTimeout);
              const timeout = setTimeout(async () => {
                if (val.length < 3) { setSuggestions([]); return; }
                try {
                  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}`);
                  const data = await res.json();
                  setSuggestions(data.slice(0, 5));
                } catch (err) { console.error(err); }
              }, 300);
              setDebounceTimeout(timeout);
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ padding: "6px", marginRight: "5px" }}
          />
          {suggestions.length > 0 && (
            <div style={{ background: "white", marginTop: "5px", maxHeight: "200px", overflowY: "auto", borderRadius: "6px" }} onClick={(e) => e.stopPropagation()}>
              {suggestions.map((place, index) => (
                <div key={index} onClick={() => handleSelect(place)} style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}>
                  {place.display_name}
                </div>
              ))}
            </div>
          )}
          <button onClick={handleSearch} style={{ padding: "6px", cursor: "pointer" }}>Search</button>
        </div>

        {/* MAP */}
        <MapContainer
          center={[5.6037, -0.1870]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
          onMoveStart={() => {
            // Optional: If you want to stop the "flyTo" if the user grabs the map mid-flight
            if (selectedPlace) setSelectedPlace(null);
          }}
        >
          <MapEventsHandler setSelectedPlace={setSelectedPlace} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          <RecenterMap position={position} selectedPlace={selectedPlace} setSelectedPlace={setSelectedPlace} />

          <LocationButton position={position} />


          {/* RED PULSE USER MARKER */}
          {position && (
            <Marker position={position} icon={userLocationIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {places.map((place, index) => {
            const coords = place.geometry.coordinates;
            const { name, categories, formatted, website, contact, place_id } = place.properties;
            if (!coords || !name) return null;
            const meta = getPlaceMeta(categories);
            const isActive =
              selectedPlace?.properties?.place_id === place_id ||
              hoverPlaceId === place_id;

            const icon = createCustomIcon(meta.color, isActive);

            return (
              <Marker
                key={place_id || index}
                position={[coords[1], coords[0]]}
                icon={icon}
                eventHandlers={{
                  mouseover: () => setHoverPlaceId(place.properties.place_id),
                  mouseout: () => setHoverPlaceId(null),
                  click: () => handlePlaceSelect(place)
                }}
              >
                <Popup>
                  <div style={{ minWidth: '150px' }}>
                    <span style={{ backgroundColor: meta.color, color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                      {meta.type.toUpperCase()}
                    </span>
                    <h4 style={{ margin: '8px 0 4px 0' }}>{name}</h4>
                    <p style={{ fontSize: '11px', color: '#666', margin: '0 0 8px 0' }}>{formatted}</p>
                    {contact?.phone && <div style={{ fontSize: '11px' }}>📞 {contact.phone}</div>}
                    {website && (
                      <a href={website} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#007bff', textDecoration: 'none', display: 'block', marginTop: '5px' }}>
                        Visit Website ↗
                      </a>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
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
        </MapContainer>
        {routeInfo && (
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
        )}
      </div>

      {/* PULSE ANIMATION CSS */}
      <style>{`
        .user-marker-red {
          position: relative;
          width: 20px;
          height: 20px;
        }
        .dot-red {
          width: 12px;
          height: 12px;
          background-color: #ff4d4d;
          border: 2px solid white;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 2;
          box-shadow: 0 0 5px rgba(0,0,0,0.3);
        }
        .pulse-red {
          width: 20px;
          height: 20px;
          background-color: rgba(255, 77, 77, 0.4);
          border-radius: 50%;
          position: absolute;
          top: 0;
          left: 0;
          animation: pulse-red-animation 2s infinite;
          z-index: 1;
        }
        @keyframes pulse-red-animation {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(3); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
import { MapContainer, TileLayer, Marker, Popup, useMap,useMapEvents } from "react-leaflet";
import { useState, useEffect,useRef } from "react";
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
  const lastId = useRef(null);

  // 2. Add an internal listener to "kill" the flight immediately on user touch
  useMapEvents({
    mousedown: () => {
      setSelectedPlace(null);
      lastId.current = null; // Reset ref so it's ready for a new selection later
    },
    dragstart: () => {
      setSelectedPlace(null);
    }
  });

  useEffect(() => {
    if (selectedPlace) {
      const currentId = selectedPlace.properties.place_id;
      
      // Only fly if it's a NEW selection and hasn't been cleared by a click
      if (currentId !== lastId.current) {
        const coords = selectedPlace.geometry.coordinates;
        map.flyTo([coords[1], coords[0]], 15, { duration: 1.5 });
        lastId.current = currentId;
      }
    } else if (position && !lastId.current) {
      map.flyTo(position, 11);
      // We set a dummy ID so it doesn't keep snapping back to user position
      lastId.current = "initial-load"; 
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

  const API_KEY = "d37876d799ce48b28b05ab85a9ba19f5";

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
        const res = await fetch(
          `https://api.geoapify.com/v2/places?categories=tourism.sights,accommodation.hotel,catering.restaurant&filter=circle:${lon},${lat},10000&limit=100&apiKey=${API_KEY}`
        );
        const data = await res.json();
        setPlaces(data.features || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    fetchPlaces();
  }, [position]);

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

          <RecenterMap position={position} selectedPlace={selectedPlace} />

            <LocationButton position={position}/>


          {/* RED PULSE USER MARKER */}
          {position && (
            <Marker position={position} icon={userLocationIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {places.map((place, index) => {
            const coords = place.geometry.coordinates;
            const { name, categories, formatted, website, contact } = place.properties;
            if (!coords || !name) return null;
            const meta = getPlaceMeta(categories);

            return (
              <Marker
                key={index}
                position={[coords[1], coords[0]]}
                eventHandlers={{
                  mouseover: () => setHoverPlaceId(place.properties.place_id),
                  mouseout: () => setHoverPlaceId(null),
                  click: () => handlePlaceSelect(place) }}
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
        </MapContainer>
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
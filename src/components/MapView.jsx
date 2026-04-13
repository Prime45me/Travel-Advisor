import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useState, useEffect } from "react";
import "leaflet/dist/leaflet.css";

// Extracted components
import Sidebar from "./Sidebar";
import LocationButton from "./LocationButton";
import DetailsPanel from "./DetailsPanel";
import MapEventsHandler from "./MapEventsHandler";
import RecenterMap from "./RecenterMap";
import SearchBar from "./SearchBar";
import PlaceMarkers from "./PlaceMarkers";
import DroppedPinMarker from "./DroppedPinMarker";
import RouteOverlay, { RouteInfoBadge } from "./RouteOverlay";
import MapStyles from "./MapStyles";
import { userLocationIcon } from "./mapIcons";

const DEFAULT_POSITION = [5.6037, -0.1870]; // Accra, Ghana fallback

export default function MapView() {
  const [ready, setReady] = useState(false);
  const [position, setPosition] = useState(null);
  const [places, setPlaces] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [query, setQuery] = useState("");
  const [geoError, setGeoError] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [category, setCategory] = useState("all");
  const [hoverPlaceId, setHoverPlaceId] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [itinerary, setItinerary] = useState([]);
  const [sidebarView, setSidebarView] = useState("explore");
  const [droppedPin, setDroppedPin] = useState(null);

  // --- EFFECTS ---

  useEffect(() => {
    setTimeout(() => setReady(true), 100);
  }, []);

  // GPS detection with fallback
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
      },
      (err) => {
        console.error("Location error:", err);
        setGeoError(true);
        setPosition(DEFAULT_POSITION); // Fall back to Accra so places still load
      }
    );
  }, []);

  // Fetch nearby places from Geoapify
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

  // Fetch driving route
  useEffect(() => {
    // Guard: only fetch route when we actually have something to route to
    const hasItineraryRoute = sidebarView === "itinerary" && itinerary.length > 0 && position;
    const hasSingleRoute = position && selectedPlace;

    if (!hasItineraryRoute && !hasSingleRoute) {
      setRouteCoords(null);
      setRouteInfo(null);
      return;
    }

    const fetchRoute = async () => {
      try {
        let coordsString = "";

        if (hasItineraryRoute) {
          const [lat1, lon1] = position;
          const itineraryCoords = itinerary.map(p => {
            const [iLon, iLat] = p.geometry.coordinates;
            return `${iLon},${iLat}`;
          });
          coordsString = `${lon1},${lat1};${itineraryCoords.join(';')}`;
        } else {
          const [lat1, lon1] = position;
          const [lon2, lat2] = selectedPlace.geometry.coordinates;
          coordsString = `${lon1},${lat1};${lon2},${lat2}`;
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

  // --- HANDLERS ---

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

  // --- RENDER ---

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
        routeInfo={routeInfo}
        itinerary={itinerary}
        toggleItinerary={handleToggleItinerary}
        sidebarView={sidebarView}
        setSidebarView={setSidebarView}
      />

      <div style={{ flex: 1, position: "relative" }}>
        <SearchBar
          query={query}
          setQuery={setQuery}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
          onSearch={handleSearch}
          onSelect={handleSelect}
        />

        {/* GPS denial warning banner */}
        {geoError && (
          <div style={{ position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)", zIndex: 1001, background: "#fff3cd", color: "#856404", padding: "8px 16px", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
            ⚠️ Location access denied — showing default area. Use the search bar to navigate.
            <button onClick={() => setGeoError(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", padding: "0 4px", color: "#856404" }}>✕</button>
          </div>
        )}

        <MapContainer
          center={DEFAULT_POSITION}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <MapEventsHandler setSelectedPlace={setSelectedPlace} setDroppedPin={setDroppedPin} />
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

          <PlaceMarkers
            places={places}
            selectedPlace={selectedPlace}
            hoverPlaceId={hoverPlaceId}
            setHoverPlaceId={setHoverPlaceId}
            onSelect={handlePlaceSelect}
          />

          <DroppedPinMarker
            droppedPin={droppedPin}
            setDroppedPin={setDroppedPin}
            setPosition={setPosition}
            setQuery={setQuery}
            setSelectedPlace={setSelectedPlace}
          />

          <RouteOverlay routeCoords={routeCoords} routeInfo={routeInfo} />
        </MapContainer>

        <RouteInfoBadge routeInfo={routeInfo} />
        <DetailsPanel place={selectedPlace} onClose={() => setSelectedPlace(null)} />
      </div>

      <MapStyles />
    </div>
  );
}
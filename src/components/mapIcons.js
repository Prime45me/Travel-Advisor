import L from "leaflet";

// --- RED PULSE USER LOCATION ICON ---
export const userLocationIcon = L.divIcon({
  html: `
    <div class="user-marker-red">
      <div class="pulse-red"></div>
      <div class="dot-red"></div>
    </div>`,
  className: "",
  iconSize: [20, 20],
  iconAnchor: [10, 10]
});

// --- DROPPED PIN ICON ---
export const droppedPinIcon = L.divIcon({
  html: `
    <div class="dropped-pin-wrapper">
      <div class="dropped-pin-shadow"></div>
      <div class="dropped-pin-marker">
        <div class="dropped-pin-head"></div>
      </div>
    </div>`,
  className: "",
  iconSize: [30, 42],
  iconAnchor: [15, 42]
});

// --- CUSTOM PLACE MARKER ICON ---
export const createCustomIcon = (color, isActive) => L.divIcon({
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

// --- PLACE META (type + color from categories) ---
export const getPlaceMeta = (categories) => {
  if (!categories) return { type: 'Place', color: '#6c757d' };
  if (categories.some(c => c.includes('hotel'))) return { type: 'Hotel', color: '#007bff' };
  if (categories.some(c => c.includes('restaurant'))) return { type: 'Restaurant', color: '#28a745' };
  return { type: 'Attraction', color: '#ffc107' };
};

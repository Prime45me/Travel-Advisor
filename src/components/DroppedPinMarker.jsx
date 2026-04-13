import { Marker, Popup } from "react-leaflet";
import { droppedPinIcon } from "./mapIcons";

export default function DroppedPinMarker({ droppedPin, setDroppedPin, setPosition, setQuery, setSelectedPlace }) {
  if (!droppedPin) return null;

  return (
    <Marker position={[droppedPin.lat, droppedPin.lng]} icon={droppedPinIcon}>
      <Popup>
        <div style={{ minWidth: '220px', fontFamily: 'Segoe UI, sans-serif' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span style={{ background: '#6c5ce7', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold' }}>📍 DROPPED PIN</span>
          </div>
          <p style={{ fontSize: '12px', color: '#444', margin: '0 0 12px 0', lineHeight: '1.4' }}>{droppedPin.address}</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPosition([droppedPin.lat, droppedPin.lng]);
                setQuery(droppedPin.address.split(',').slice(0, 2).join(','));
                setDroppedPin(null);
              }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '700', background: '#6c5ce7', color: 'white', transition: '0.2s' }}
            >
              🔍 Explore Here
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Create a temporary place object for routing
                const tempPlace = {
                  properties: {
                    place_id: `pin-${Date.now()}`,
                    name: droppedPin.address.split(',')[0],
                    formatted: droppedPin.address,
                    categories: [],
                  },
                  geometry: {
                    coordinates: [droppedPin.lng, droppedPin.lat]
                  }
                };
                setSelectedPlace(tempPlace);
                setDroppedPin(null);
              }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #6c5ce7', cursor: 'pointer', fontSize: '11px', fontWeight: '700', background: 'white', color: '#6c5ce7', transition: '0.2s' }}
            >
              🚗 Directions
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setDroppedPin(null); }}
            style={{ width: '100%', marginTop: '6px', padding: '6px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#999', background: '#f5f5f5', transition: '0.2s' }}
          >
            ✕ Remove Pin
          </button>
        </div>
      </Popup>
    </Marker>
  );
}

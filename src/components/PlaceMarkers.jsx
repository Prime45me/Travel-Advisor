import { Marker, Popup } from "react-leaflet";
import { createCustomIcon, getPlaceMeta } from "./mapIcons";

export default function PlaceMarkers({ places, selectedPlace, hoverPlaceId, setHoverPlaceId, onSelect }) {
  return places.map((place, index) => {
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
          click: () => onSelect(place)
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
  });
}

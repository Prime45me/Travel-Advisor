import { useEffect, useRef } from "react";

export default function SearchBar({ query, setQuery, suggestions, setSuggestions, onSearch, onSelect }) {
  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = () => setSuggestions([]);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [setSuggestions]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(async () => {
      if (val.length < 3) { setSuggestions([]); return; }
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${val}`);
        const data = await res.json();
        setSuggestions(data.slice(0, 5));
      } catch (err) { console.error(err); }
    }, 300);
  };

  return (
    <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "white", padding: "8px", borderRadius: "8px", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
      <input
        type="text"
        placeholder="Search any place..."
        value={query}
        onClick={(e) => e.stopPropagation()}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        style={{ padding: "6px", marginRight: "5px" }}
      />
      {suggestions.length > 0 && (
        <div style={{ background: "white", marginTop: "5px", maxHeight: "200px", overflowY: "auto", borderRadius: "6px" }} onClick={(e) => e.stopPropagation()}>
          {suggestions.map((place, index) => (
            <div key={index} onClick={() => onSelect(place)} style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}>
              {place.display_name}
            </div>
          ))}
        </div>
      )}
      <button onClick={onSearch} style={{ padding: "6px", cursor: "pointer" }}>Search</button>
    </div>
  );
}

import { useEffect, useRef } from "react";

export default function SearchBar({ query, setQuery, suggestions, setSuggestions, onSearch, onSelect, isMobile }) {
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
    <div style={{ 
      position: "absolute", 
      top: isMobile ? "15px" : "20px", 
      left: isMobile ? "50px" : "50%", 
      right: isMobile ? "10px" : "auto",
      transform: isMobile ? "none" : "translateX(-50%)", 
      zIndex: 1000, 
      background: "rgba(255, 255, 255, 0.75)", 
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255, 255, 255, 0.6)",
      padding: "8px", 
      borderRadius: "16px", 
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      display: "flex",
      alignItems: "center",
      transition: "all 0.3s ease",
      width: isMobile ? "auto" : "auto",
      minWidth: isMobile ? "unset" : "340px"
    }}>
      <input
        type="text"
        placeholder="Search any place..."
        value={query}
        onClick={(e) => e.stopPropagation()}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        style={{ 
          padding: "10px 14px", 
          marginRight: "8px", 
          border: "1px solid rgba(255, 255, 255, 0.5)",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.6)",
          color: "#333",
          flex: 1,
          outline: "none",
          fontSize: isMobile ? "16px" : "15px",
          transition: "all 0.2s"
        }}
      />
      
      <button 
        onClick={onSearch} 
        style={{ 
          padding: isMobile ? "10px 16px" : "10px 20px", 
          cursor: "pointer", 
          borderRadius: "12px",
          background: "linear-gradient(135deg, #007bff, #0056b3)",
          color: "white",
          border: "none",
          fontWeight: "600",
          boxShadow: "0 4px 10px rgba(0,123,255,0.3)",
          transition: "transform 0.2s"
        }}
      >
        {isMobile ? "🔍" : "Search"}
      </button>

      {suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          left: 0,
          right: 0,
          background: "rgba(255, 255, 255, 0.95)", 
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          maxHeight: "300px", 
          overflowY: "auto", 
          borderRadius: "16px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
          border: "1px solid rgba(255, 255, 255, 0.6)"
        }} onClick={(e) => e.stopPropagation()}>
          {suggestions.map((place, index) => (
            <div 
              key={index} 
              onClick={() => onSelect(place)} 
              style={{ 
                padding: "12px", 
                cursor: "pointer", 
                borderBottom: "1px solid #eee",
                fontSize: "13px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {place.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

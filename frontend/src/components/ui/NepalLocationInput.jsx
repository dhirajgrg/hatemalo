import { useState, useEffect, useRef, useCallback } from "react";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

export default function NepalLocationInput({
  label = "Location",
  value,
  onChange,
  error,
  required,
  placeholder = "Search a location in Nepal...",
  className = "",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);
  const pickedRef = useRef(false);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const searchLocation = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      setNotFound(false);
      return;
    }
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=np&limit=5`,
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
      setNotFound(data.length === 0);
    } catch {
      setSuggestions([]);
      setNotFound(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    pickedRef.current = false;
    setNotFound(false);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(val), 400);
  };

  const selectSuggestion = (item) => {
    const name = item.display_name.split(",")[0];
    onChange(name);
    pickedRef.current = true;
    setShowSuggestions(false);
    setNotFound(false);
    setSuggestions([]);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-secondary mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        className={`w-full rounded-lg border px-3 py-2 text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 ${
          error ? "border-red-500" : "border-border"
        }`}
      />
      {showSuggestions && (
        <ul className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((item) => (
            <li
              key={item.place_id}
              onClick={() => selectSuggestion(item)}
              className="px-3 py-2 text-sm text-text-primary hover:bg-surface-alt cursor-pointer border-b border-border last:border-0"
            >
              {item.display_name}
            </li>
          ))}
        </ul>
      )}
      {notFound && !showSuggestions && (
        <p className="mt-1 text-xs text-red-500">
          Location not available. Please enter a location within Nepal.
        </p>
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

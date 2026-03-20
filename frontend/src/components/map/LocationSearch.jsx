import { useState, useEffect, useRef, useCallback } from "react";
import { HiOutlineLocationMarker } from "react-icons/hi";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

const NEPAL_BOUNDS = {
  minLat: 26.347,
  maxLat: 30.447,
  minLng: 80.058,
  maxLng: 88.201,
};
const isInNepal = (lat, lng) =>
  lat >= NEPAL_BOUNDS.minLat &&
  lat <= NEPAL_BOUNDS.maxLat &&
  lng >= NEPAL_BOUNDS.minLng &&
  lng <= NEPAL_BOUNDS.maxLng;

export default function LocationSearch({
  value,
  onChange,
  variant = "hero",
  className = "",
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

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
      return;
    }
    try {
      const res = await fetch(
        `${NOMINATIM_BASE}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=np&limit=5`,
      );
      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(e.target.value), 400);
  };

  const selectSuggestion = (item) => {
    onChange(item.display_name.split(",")[0]);
    setShowSuggestions(false);
  };

  const handleAutoLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!isInNepal(lat, lng)) {
          setLocating(false);
          return;
        }
        try {
          const res = await fetch(
            `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const data = await res.json();
          if (data.address?.country_code === "np" && data.address) {
            const parts = [
              data.address.suburb ||
                data.address.neighbourhood ||
                data.address.village,
              data.address.city || data.address.town || data.address.county,
            ].filter(Boolean);
            onChange(parts.join(", ") || data.display_name.split(",")[0]);
          }
        } catch {
          // silent
        }
        setLocating(false);
      },
      () => setLocating(false),
    );
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative flex items-center gap-2 ${
        variant === "hero"
          ? "flex-1 px-4 py-3 rounded-xl bg-surface-alt sm:border-l sm:border-border sm:rounded-l-none"
          : "w-full px-3 py-2 rounded-lg border border-border bg-surface"
      } ${className}`}
    >
      <input
        type="text"
        placeholder="Location..."
        value={value}
        onChange={handleInputChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        className="w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none text-sm md:text-base"
      />
      <div className="h-6 border-l border-border" />
      <button
        type="button"
        onClick={handleAutoLocate}
        disabled={locating}
        className="shrink-0 text-primary-600 hover:text-primary-700 disabled:opacity-50"
        title="Use my current location"
      >
        {locating ? (
          <span className="inline-block w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        ) : (
          <HiOutlineLocationMarker className="w-5 h-5" />
        )}
      </button>
      {showSuggestions && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
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
    </div>
  );
}

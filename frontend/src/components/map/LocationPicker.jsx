import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { HiOutlineLocationMarker } from "react-icons/hi";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const NEPAL_CENTER = [27.7172, 85.324];
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

// Nepal bounding box
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

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({
  location,
  coordinates,
  onLocationChange,
  onCoordinatesChange,
  error,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapCenter, setMapCenter] = useState(
    coordinates?.lat ? [coordinates.lat, coordinates.lng] : NEPAL_CENTER,
  );
  const [locating, setLocating] = useState(false);
  const [outsideNepal, setOutsideNepal] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const debounceRef = useRef(null);
  const mapRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Search Nominatim for suggestions
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
    const value = e.target.value;
    onLocationChange(value);
    setNotFound(false);
    setOutsideNepal(false);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchLocation(value), 400);
  };

  const selectSuggestion = (item) => {
    // Build a short but descriptive location name
    const parts = item.display_name.split(",").map((p) => p.trim());
    // Take first 2-3 meaningful parts (e.g. "Rupandehi, Lumbini Province")
    const name = parts.slice(0, Math.min(parts.length - 1, 3)).join(", ");
    onLocationChange(name || parts[0]);
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    onCoordinatesChange({ lat, lng });
    setMapCenter([lat, lng]);
    if (mapRef.current) {
      mapRef.current.flyTo([lat, lng], 15);
    }
    setShowSuggestions(false);
    setNotFound(false);
  };

  // Reverse geocode from coordinates
  const reverseGeocode = useCallback(
    async (lat, lng) => {
      try {
        const res = await fetch(
          `${NOMINATIM_BASE}/reverse?format=json&lat=${lat}&lon=${lng}`,
        );
        const data = await res.json();
        if (data.address?.country_code !== "np") {
          setOutsideNepal(true);
          onLocationChange("");
          onCoordinatesChange({ lat: null, lng: null });
          return;
        }
        setOutsideNepal(false);
        if (data.address) {
          const parts = [
            data.address.suburb ||
              data.address.neighbourhood ||
              data.address.village ||
              data.address.town,
            data.address.city || data.address.county || data.address.district,
            data.address.state,
          ].filter(Boolean);
          onLocationChange(parts.join(", ") || data.display_name.split(",")[0]);
        }
      } catch {
        // silent
      }
    },
    [onLocationChange, onCoordinatesChange],
  );

  const handleMapClick = (latlng) => {
    if (!isInNepal(latlng.lat, latlng.lng)) {
      setOutsideNepal(true);
      return;
    }
    setOutsideNepal(false);
    onCoordinatesChange({ lat: latlng.lat, lng: latlng.lng });
    reverseGeocode(latlng.lat, latlng.lng);
  };

  const handleAutoLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!isInNepal(lat, lng)) {
          setOutsideNepal(true);
          setLocating(false);
          return;
        }
        setOutsideNepal(false);
        onCoordinatesChange({ lat, lng });
        setMapCenter([lat, lng]);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15);
        }
        reverseGeocode(lat, lng);
        setLocating(false);
      },
      () => {
        setLocating(false);
      },
    );
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-secondary">
        Location
      </label>

      {/* Search input + auto-locate */}
      <div className="relative z-20" ref={wrapperRef}>
        <div className="flex items-stretch">
          <div className="flex-1">
            <div className="flex items-center gap-2 border border-r-0 border-border rounded-l-lg px-3 py-2 bg-surface focus-within:ring-2 focus-within:ring-primary-500">
              <input
                type="text"
                placeholder="Type to search e.g. Rupandehi, Kathmandu..."
                value={location}
                onChange={handleInputChange}
                onFocus={() =>
                  suggestions.length > 0 && setShowSuggestions(true)
                }
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAutoLocate}
            disabled={locating}
            className="flex items-center gap-1.5 px-3 text-sm font-medium rounded-r-lg border border-l-0 border-border bg-surface hover:bg-surface-alt transition-colors text-primary-600 shrink-0 disabled:opacity-50"
            title="Use my current location"
          >
            <div className="border-l border-border h-6 mr-1" />
            {locating ? (
              <span className="inline-block w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <HiOutlineLocationMarker className="w-5 h-5" />
            )}
          </button>
        </div>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 z-50 mt-1 bg-surface border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((item) => (
              <li
                key={item.place_id}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(item)}
                className="px-3 py-2 text-sm text-text-primary hover:bg-surface-alt cursor-pointer border-b border-border last:border-0"
              >
                <span className="font-medium">
                  {item.display_name.split(",")[0]}
                </span>
                <span className="text-text-muted">
                  {item.display_name.includes(",")
                    ? `, ${item.display_name.split(",").slice(1).join(",").trim()}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {outsideNepal && !showSuggestions && (
        <p className="text-xs text-red-500">
          Location not available. Please select a location within Nepal.
        </p>
      )}
      {notFound && !showSuggestions && (
        <p className="text-xs text-amber-600">
          No results found. Click on the map below to pin your location.
        </p>
      )}

      {/* Map */}
      <div className="rounded-lg overflow-hidden border border-border h-64">
        <MapContainer
          center={mapCenter}
          zoom={coordinates?.lat ? 15 : 7}
          className="h-full w-full"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          {coordinates?.lat && (
            <Marker position={[coordinates.lat, coordinates.lng]} />
          )}
        </MapContainer>
      </div>
      <p className="text-xs text-text-muted">
        Click on the map to set location, use the search, or auto-detect your
        location.
      </p>
    </div>
  );
}

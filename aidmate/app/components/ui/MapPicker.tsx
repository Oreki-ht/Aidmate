"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import dynamic from "next/dynamic";

// Fix Leaflet icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

interface LocationMarker {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  setAddress: (address: string) => void;
}

function LocationMarker({ position, setPosition, setAddress }: LocationMarker) {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      fetchAddress(e.latlng.lat, e.latlng.lng)
        .then(address => setAddress(address));
    },
  });

  useEffect(() => {
    if (position[0] !== 0 && position[1] !== 0) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position[0] !== 0 ? <Marker position={position} /> : null;
}

// Function to fetch address from coordinates using Nominatim (OpenStreetMap)
async function fetchAddress(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Error fetching address:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
}

interface MapPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: string, latitude: number, longitude: number) => void;
  initialLocation?: string;
  initialCoordinates?: [number, number];
}

export default function MapPicker({
  isOpen,
  onClose,
  onSave,
  initialLocation = "",
  initialCoordinates = [0, 0],
}: MapPickerProps) {
  const [position, setPosition] = useState<[number, number]>(initialCoordinates);
  const [address, setAddress] = useState<string>(initialLocation);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Initialize map with user's current location if no initial coordinates
  useEffect(() => {
    if (initialCoordinates[0] === 0 && initialCoordinates[1] === 0) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setPosition([position.coords.latitude, position.coords.longitude]);
            fetchAddress(position.coords.latitude, position.coords.longitude)
              .then(address => setAddress(address));
          },
          (error) => {
            console.error("Error getting location:", error);
            // Default to a central location if geolocation fails
            setPosition([9.0192, 38.7525]); // Addis Ababa
          }
        );
      }
    }
  }, [initialCoordinates]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setPosition([parseFloat(lat), parseFloat(lon)]);
        setAddress(data[0].display_name);
      }
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  const handleSave = () => {
    onSave(address, position[0], position[1]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-charcoal/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-charcoal">Select Location</h3>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-accent-dark"
          >
            {/* Close Icon SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Content Area - Add overflow-y-auto here */}
        <div className="p-5 overflow-y-auto"> 
          <form onSubmit={handleSearch} className="mb-4 flex gap-2">
            {/* Search Input and Button */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location"
              className="flex-1 px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
            >
              Search
            </button>
          </form>
          
          <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
            {/* MapContainer */}
            <MapContainer
              center={position[0] !== 0 ? position : [51.505, -0.09]} // Default center if needed
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker
                position={position}
                setPosition={setPosition}
                setAddress={setAddress}
              />
            </MapContainer>
          </div>
          
          <div className="mt-4">
            {/* Address Input */}
            <label className="block text-sm font-medium text-charcoal-light mb-1">
              Selected Location
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-surface border border-gray-200 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Click on map or search to select a location"
            />
          </div>
          
          {/* Buttons - Should now be visible even if content is long */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 rounded-lg text-charcoal hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={position[0] === 0 || position[1] === 0}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50"
            >
              Save Location
            </button>
          </div>
        </div> {/* End of scrollable content area */}
      </div>
    </div>
  );
}

// Create a version that can be dynamically imported with no SSR
// This avoids the "window is not defined" error in Next.js
export const DynamicMapPicker = dynamic(() => Promise.resolve(MapPicker), {
  ssr: false,
});
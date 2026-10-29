import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { MapPin } from "lucide-react";
import "../utils/leafletFix";

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
}

function LocationMarker({
  position,
  onChange,
}: {
  position: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  const defaultCenter: [number, number] = [20.5937, 78.9629]; // India center
  const position: [number, number] | null =
    latitude !== null && longitude !== null ? [latitude, longitude] : null;

  const [map, setMap] = useState<L.Map | null>(null);

  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-slate-500" />
        Location on map (click to place a pin)
      </label>
      <div className="rounded-xl overflow-hidden border border-slate-200" style={{ height: 320 }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 15 : 5}
          style={{ height: "100%", width: "100%" }}
          ref={setMap}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onChange={onChange} />
        </MapContainer>
      </div>
      {position && (
        <p className="text-xs text-slate-500 mt-1.5">
          📍 {position[0].toFixed(5)}, {position[1].toFixed(5)}
        </p>
      )}
    </div>
  );
}
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "../utils/leafletFix";

interface ItemMapProps {
  latitude: number;
  longitude: number;
  title: string;
}

export default function ItemMap({ latitude, longitude, title }: ItemMapProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200" style={{ height: 280 }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[latitude, longitude]}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
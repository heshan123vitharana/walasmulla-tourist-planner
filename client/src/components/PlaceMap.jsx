/**
 * PlaceMap.jsx — Leaflet map showing one or more places.
 * Pass a single `place` or an array of `stops` (itinerary view).
 */
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon paths (broken in Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const numberIcon = (n) =>
  L.divIcon({
    html: `<div style="
      width:26px;height:26px;border-radius:50%;
      background:#0d9488;color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:12px;font-weight:700;
      border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5)">
      ${n}
    </div>`,
    className: '',
    iconSize:   [26, 26],
    iconAnchor: [13, 13],
  });

export default function PlaceMap({ place, stops, height = '360px' }) {
  // Determine markers from props
  let markers = [];
  let polylineCoords = [];

  if (stops && stops.length > 0) {
    markers = stops.map((s, i) => {
      const [lng, lat] = s.place.location.coordinates;
      return { lat, lng, label: s.place.name, index: i + 1 };
    });
    polylineCoords = markers.map((m) => [m.lat, m.lng]);
  } else if (place) {
    const [lng, lat] = place.location.coordinates;
    markers = [{ lat, lng, label: place.name, index: null }];
  }

  if (markers.length === 0) return null;

  const center = [markers[0].lat, markers[0].lng];
  const zoom   = stops ? 11 : 13;

  return (
    <MapContainer center={center} zoom={zoom} style={{ height, width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {polylineCoords.length > 1 && (
        <Polyline positions={polylineCoords} color="#0d9488" weight={3} dashArray="6 4" />
      )}
      {markers.map((m, i) => (
        <Marker
          key={i}
          position={[m.lat, m.lng]}
          icon={m.index ? numberIcon(m.index) : new L.Icon.Default()}
        >
          <Popup>{m.label}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

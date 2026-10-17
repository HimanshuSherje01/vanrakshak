import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Popup } from 'react-leaflet';
import { colorOf } from './layers.js';
import { formatDateTime } from '../../utils/format.js';

const CENTER = [20.22, 79.37];
const ZONE_STYLE = {
  reserve: { color: '#17365d', weight: 2, dashArray: '6 6', fill: false },
  buffer: { color: '#8a9a2b', weight: 1, fillColor: '#8a9a2b', fillOpacity: 0.12 },
  core: { color: '#1f6b3c', weight: 2, fillColor: '#1f6b3c', fillOpacity: 0.2 },
};
const PATROL_COLOR = { Completed: '#e8821a', 'In Progress': '#b3261e', Planned: '#566879' };

function Pin({ lat, lng, color, radius = 7, children }) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  return (
    <CircleMarker center={[lat, lng]} radius={radius} pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 1 }}>
      <Popup>{children}</Popup>
    </CircleMarker>
  );
}

export default function ForestMap({ data, visible, height = 420 }) {
  return (
    <div className="map-box" style={{ height }}>
      <MapContainer center={CENTER} zoom={10} scrollWheelZoom style={{ height: '100%' }}>
        <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {data?.zones?.map((z) => visible[z.key] && (
          <Polygon key={z.key} positions={z.positions} pathOptions={ZONE_STYLE[z.key]}>
            <Popup><strong>{z.name}</strong></Popup>
          </Polygon>
        ))}

        {visible.patrols && data?.patrols?.map((p) => (
          <Polyline key={p._id} positions={p.path} pathOptions={{ color: PATROL_COLOR[p.status], weight: 4 }}>
            <Popup><strong>{p.name}</strong><br />{p.distanceKm} km - {p.status}</Popup>
          </Polyline>
        ))}

        {data?.features?.map((f) => visible[f.kind] && (
          <Pin key={f._id} lat={f.lat} lng={f.lng} color={colorOf(f.kind)} radius={f.kind === 'village' ? 6 : 7}>
            <strong>{f.name}</strong><br />{f.status}
          </Pin>
        ))}

        {visible.observations && data?.observations?.map((o) => (
          <Pin key={o._id} lat={o.location?.lat} lng={o.location?.lng} color={colorOf('observations')}>
            <strong>{o.species}</strong> ({o.confidence}%)<br />{o.location?.name}<br />{formatDateTime(o.observedAt)}
          </Pin>
        ))}

        {visible.incidents && data?.incidents?.map((i) => (
          <Pin key={i._id} lat={i.location?.lat} lng={i.location?.lng} color={colorOf('incidents')} radius={8}>
            <strong>{i.incidentId}: {i.title}</strong><br />{i.type} - {i.priority}<br />{formatDateTime(i.occurredAt)}
          </Pin>
        ))}
      </MapContainer>
    </div>
  );
}

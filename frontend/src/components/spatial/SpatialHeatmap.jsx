import { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  CircleMarker,
  Tooltip,
  Popup,
  useMap,
} from 'react-leaflet';
import HeatmapLayer from './HeatmapLayer.jsx';

export const CRIME_COLORS = {
  forest_fire_set: '#e65100',
  illegal_felling: '#8d6e63',
  illegal_grazing_encroachment: '#558b2f',
  retaliatory_livestock_killing: '#c2185b',
  herbivore_snaring: '#7b1fa2',
  tiger_poaching: '#d50000',
  human_death_wildlife: '#b71c1c',
  poisoning: '#00838f',
  electrocution: '#fbc02d',
};

export const RISK_CLASS_COLORS = {
  Low: '#2e7d32',
  Moderate: '#f57c00',
  High: '#e65100',
  Critical: '#b71c1c',
};

const CENTER = [20.25, 79.35];

const ZONE_STYLE = {
  reserve: { color: '#17365d', weight: 2, dashArray: '6 6', fill: false },
  buffer: { color: '#8a9a2b', weight: 1.5, fillColor: '#8a9a2b', fillOpacity: 0.1 },
  core: { color: '#1f6b3c', weight: 2, fillColor: '#1f6b3c', fillOpacity: 0.16 },
};

function MapController({ targetLoc, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (targetLoc && typeof targetLoc.lat === 'number' && typeof targetLoc.lon === 'number') {
      map.flyTo([targetLoc.lat, targetLoc.lon], zoom || Math.max(map.getZoom(), 12), {
        animate: true,
        duration: 0.8,
      });
    }
  }, [targetLoc, zoom, map]);
  return null;
}

export default function SpatialHeatmap({
  incidents = [],
  rangeRiskData = [],
  staticFeatures = [],
  zones = [],
  selectedYear = 2025,
  useSeverityWeight = true,
  showHeatmap = true,
  showIncidentPoints = false,
  showRangeCentroids = true,
  showZones = true,
  selectedRange = null,
  onSelectRange = null,
  height = 560,
}) {
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Format points for leaflet.heat: [lat, lon, intensity]
  // Normalize intensity between 0.1 and 1.0 based on severity_weight
  const heatmapPoints = incidents.map((inc) => {
    const lat = inc.lat;
    const lon = inc.lon;
    const weight = useSeverityWeight ? Math.min(Math.max((inc.severity_weight || 1) / 10, 0.2), 1.0) : 0.5;
    return [lat, lon, weight];
  });

  // Build risk lookup for each range in selectedYear
  const rangeRiskMap = {};
  rangeRiskData
    .filter((r) => String(r.year) === String(selectedYear))
    .forEach((r) => {
      rangeRiskMap[r.range] = r;
    });

  return (
    <div className="map-box spatial-map-box" style={{ height }}>
      <MapContainer center={CENTER} zoom={10} scrollWheelZoom style={{ height: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic pan when a range is selected from filters or table */}
        {selectedRange && (
          <MapController
            targetLoc={staticFeatures.find((s) => s.range === selectedRange)}
            zoom={12}
          />
        )}

        {/* 1. Reserve Zone Boundaries (Illustrative Core/Buffer) */}
        {showZones &&
          zones.map((z) => (
            <Polygon key={z.key} positions={z.positions} pathOptions={ZONE_STYLE[z.key]}>
              <Popup>
                <strong>{z.name}</strong>
                <br />
                <span className="small muted">Illustrative GIS boundary</span>
              </Popup>
            </Polygon>
          ))}

        {/* 2. Leaflet Heatmap Layer */}
        {showHeatmap && heatmapPoints.length > 0 && (
          <HeatmapLayer
            points={heatmapPoints}
            radius={28}
            blur={20}
            maxZoom={14}
            maxIntensity={1.0}
            minOpacity={0.28}
          />
        )}

        {/* 3. Range Centroids & Annual Vulnerability Badges */}
        {showRangeCentroids &&
          staticFeatures.map((sf) => {
            const riskInfo = rangeRiskMap[sf.range] || {};
            const score = riskInfo.risk_score_0_100 ?? 0;
            const riskClass = riskInfo.risk_class || 'Moderate';
            const color = RISK_CLASS_COLORS[riskClass] || '#1f6b3c';
            const isSelected = selectedRange === sf.range;

            return (
              <CircleMarker
                key={sf.range}
                center={[sf.lat, sf.lon]}
                radius={isSelected ? 16 : 12}
                pathOptions={{
                  color: isSelected ? '#ffffff' : '#ffffff',
                  weight: isSelected ? 3.5 : 2,
                  fillColor: color,
                  fillOpacity: isSelected ? 1 : 0.9,
                }}
                eventHandlers={{
                  click: () => onSelectRange && onSelectRange(sf.range),
                }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={0.98}>
                  <div className="map-tooltip-box">
                    <div className="tooltip-head">
                      <span
                        className="tooltip-badge"
                        style={{ background: color, color: '#fff' }}
                      >
                        {riskClass} Risk ({score.toFixed(1)}/100)
                      </span>
                      <span className="small muted">Year {selectedYear}</span>
                    </div>
                    <div className="tooltip-title">{sf.range} Range</div>
                    <div className="tooltip-sub">
                      <span>🏛️ Zone: <strong>{sf.zone.toUpperCase()}</strong></span>
                      <span>📐 Area: <strong>{sf.area_km2} km²</strong></span>
                      <span>🏘️ Villages (5km): <strong>{sf.villages_5km}</strong></span>
                      <span>🐾 Relative Tiger Density: <strong>{sf.tiger_density_rel}</strong></span>
                      {riskInfo.total_incidents !== undefined && (
                        <span>⚠️ Total Incidents ({selectedYear}): <strong>{riskInfo.total_incidents}</strong></span>
                      )}
                    </div>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="popup-box">
                    <h3 style={{ margin: '0 0 .3rem' }}>{sf.range} Forest Range</h3>
                    <div style={{ display: 'flex', gap: '.4rem', marginBottom: '.4rem' }}>
                      <span className="tooltip-badge" style={{ background: color, color: '#fff' }}>
                        {riskClass} Risk ({score.toFixed(1)}/100)
                      </span>
                      <span className="tooltip-badge obs-badge">{sf.zone}</span>
                    </div>
                    <p style={{ margin: '0 0 .25rem', fontSize: '.85rem' }}>
                      <strong>Year {selectedYear} Incidents:</strong> {riskInfo.total_incidents ?? 'N/A'} (Severity Sum: {riskInfo.severity_sum ?? 'N/A'})
                    </p>
                    <p style={{ margin: '0 0 .25rem', fontSize: '.85rem' }}>
                      <strong>Range Area:</strong> {sf.area_km2} km² &bull; <strong>Dist to Village:</strong> {sf.dist_village_km} km
                    </p>
                    <p style={{ margin: 0, fontSize: '.85rem' }}>
                      <strong>Centroid GPS:</strong> {sf.lat.toFixed(4)}°N, {sf.lon.toFixed(4)}°E
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* 4. Individual Synthetic Incident Points (Toggleable, capped for performance) */}
        {showIncidentPoints &&
          incidents.slice(0, 1000).map((inc) => {
            const crimeColor = CRIME_COLORS[inc.crime_type] || '#555';
            return (
              <CircleMarker
                key={inc.incident_id}
                center={[inc.lat, inc.lon]}
                radius={4.5}
                pathOptions={{
                  color: '#ffffff',
                  weight: 1,
                  fillColor: crimeColor,
                  fillOpacity: 0.85,
                }}
                eventHandlers={{
                  click: () => setSelectedIncident(inc),
                }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <strong>{inc.incident_id}</strong> (SIMULATED)
                  <br />
                  Type: {inc.crime_type.replace(/_/g, ' ')}
                  <br />
                  Date: {inc.date} | Range: {inc.range}
                  <br />
                  Severity: {inc.severity_weight}
                </Tooltip>
                <Popup>
                  <div className="popup-box">
                    <span className="tooltip-badge" style={{ background: '#d32f2f', color: '#fff', marginBottom: '.3rem', display: 'inline-block' }}>
                      SYNTHETIC INCIDENT
                    </span>
                    <h4 style={{ margin: '0 0 .25rem' }}>{inc.incident_id}: {inc.crime_type.replace(/_/g, ' ')}</h4>
                    <p style={{ margin: '0 0 .2rem', fontSize: '.85rem' }}><strong>Date:</strong> {inc.date} (Year {inc.year})</p>
                    <p style={{ margin: '0 0 .2rem', fontSize: '.85rem' }}><strong>Range:</strong> {inc.range} ({inc.zone})</p>
                    <p style={{ margin: '0 0 .2rem', fontSize: '.85rem' }}><strong>Severity Weight:</strong> {inc.severity_weight}</p>
                    <p style={{ margin: 0, fontSize: '.85rem' }}><strong>GPS:</strong> {inc.lat.toFixed(5)}, {inc.lon.toFixed(5)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
      </MapContainer>

      {/* Floating Heatmap Intensity Legend */}
      <div className="spatial-map-overlay-legend">
        <div className="overlay-legend-header">
          <span>Heatmap Intensity</span>
          <span className="overlay-legend-note">{useSeverityWeight ? 'Severity Weighted' : 'Raw Incident Count'}</span>
        </div>
        <div className="overlay-gradient-bar" />
        <div className="overlay-gradient-labels">
          <span>Low Density</span>
          <span>Moderate</span>
          <span>High</span>
          <span>Hotspot</span>
        </div>
      </div>
    </div>
  );
}

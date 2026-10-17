import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Ensure global Leaflet is present for UMD plugin
if (typeof window !== 'undefined' && !window.L) {
  window.L = L;
}
import 'leaflet.heat';

export default function HeatmapLayer({
  points = [],
  radius = 26,
  blur = 18,
  maxZoom = 14,
  maxIntensity = 1.0,
  minOpacity = 0.25,
}) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Check if L.heatLayer exists
    if (typeof L.heatLayer !== 'function') {
      console.warn('L.heatLayer is unavailable in this environment');
      return;
    }

    // Gradient tuned for wildlife risk & spatial intensity:
    // Cool cyan/blue -> yellow -> orange -> intense crimson
    const gradient = {
      0.15: '#3182bd',
      0.35: '#31a354',
      0.55: '#d95f0e',
      0.75: '#e65100',
      0.95: '#b71c1c',
    };

    const validPoints = points
      .filter((p) => p && typeof p[0] === 'number' && typeof p[1] === 'number')
      .map((p) => [p[0], p[1], p[2] || 0.5]);

    if (!layerRef.current) {
      layerRef.current = L.heatLayer(validPoints, {
        radius,
        blur,
        maxZoom,
        max: maxIntensity,
        minOpacity,
        gradient,
      });
      layerRef.current.addTo(map);
    } else {
      layerRef.current.setOptions({ radius, blur, maxZoom, max: maxIntensity, minOpacity, gradient });
      layerRef.current.setLatLngs(validPoints);
    }

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map, points, radius, blur, maxZoom, maxIntensity, minOpacity]);

  return null;
}

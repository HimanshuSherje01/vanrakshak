import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { asyncHandler } from '../utils/asyncHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(__dirname, '../assets');

function parseCSV(content) {
  const lines = content.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const header = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const values = [];
    let insideQuote = false;
    let current = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[c];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));

    const row = {};
    header.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : null;
    });
    rows.push(row);
  }
  return rows;
}

// In-memory cache for loaded datasets
let cachedSpatialData = null;

function loadAllDatasets() {
  if (cachedSpatialData) return cachedSpatialData;

  const incidentsPath = path.join(assetsDir, 'tadoba_incidents_synthetic_2001_2025.csv');
  const rangeRiskPath = path.join(assetsDir, 'tadoba_range_year_risk_2001_2025.csv');
  const staticFeaturesPath = path.join(assetsDir, 'tadoba_range_static_features.csv');
  const realAnchorsPath = path.join(assetsDir, 'real_data_anchors.csv');

  // 1. Incidents (Synthetic)
  const rawIncidents = fs.existsSync(incidentsPath) ? fs.readFileSync(incidentsPath, 'utf8') : '';
  const incidents = parseCSV(rawIncidents).map((r) => ({
    incident_id: r.incident_id,
    date: r.date,
    year: parseInt(r.year, 10),
    month: parseInt(r.month, 10),
    crime_type: r.crime_type,
    severity_weight: parseFloat(r.severity_weight) || 1.0,
    range: r.range,
    zone: r.zone,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    data_origin: r.data_origin || 'SYNTHETIC',
  }));

  // 2. Range Year Risk
  const rawRangeRisk = fs.existsSync(rangeRiskPath) ? fs.readFileSync(rangeRiskPath, 'utf8') : '';
  const rangeRisk = parseCSV(rawRangeRisk).map((r) => ({
    range: r.range,
    year: parseInt(r.year, 10),
    electrocution: parseInt(r.electrocution, 10) || 0,
    forest_fire_set: parseInt(r.forest_fire_set, 10) || 0,
    herbivore_snaring: parseInt(r.herbivore_snaring, 10) || 0,
    human_death_wildlife: parseInt(r.human_death_wildlife, 10) || 0,
    illegal_felling: parseInt(r.illegal_felling, 10) || 0,
    illegal_grazing_encroachment: parseInt(r.illegal_grazing_encroachment, 10) || 0,
    poisoning: parseInt(r.poisoning, 10) || 0,
    retaliatory_livestock_killing: parseInt(r.retaliatory_livestock_killing, 10) || 0,
    tiger_poaching: parseInt(r.tiger_poaching, 10) || 0,
    total_incidents: parseInt(r.total_incidents, 10) || 0,
    severity_sum: parseFloat(r.severity_sum) || 0,
    zone: r.zone,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    area_km2: parseFloat(r.area_km2) || 0,
    villages_5km: parseInt(r.villages_5km, 10) || 0,
    dist_village_km: parseFloat(r.dist_village_km) || 0,
    road_km_per_100km2: parseFloat(r.road_km_per_100km2) || 0,
    waterholes_per_100km2: parseFloat(r.waterholes_per_100km2) || 0,
    tiger_density_rel: parseFloat(r.tiger_density_rel) || 0,
    risk_score_0_100: parseFloat(r.risk_score_0_100) || 0,
    risk_class: r.risk_class || 'Moderate',
  }));

  // 3. Static Range Features
  const rawStatic = fs.existsSync(staticFeaturesPath) ? fs.readFileSync(staticFeaturesPath, 'utf8') : '';
  const staticFeatures = parseCSV(rawStatic).map((r) => ({
    range: r.range,
    zone: r.zone,
    lat: parseFloat(r.lat),
    lon: parseFloat(r.lon),
    area_km2: parseFloat(r.area_km2) || 0,
    villages_5km: parseInt(r.villages_5km, 10) || 0,
    dist_village_km: parseFloat(r.dist_village_km) || 0,
    road_km_per_100km2: parseFloat(r.road_km_per_100km2) || 0,
    waterholes_per_100km2: parseFloat(r.waterholes_per_100km2) || 0,
    tiger_density_rel: parseFloat(r.tiger_density_rel) || 0,
  }));

  // 4. Real Data Anchors
  const rawAnchors = fs.existsSync(realAnchorsPath) ? fs.readFileSync(realAnchorsPath, 'utf8') : '';
  const realAnchors = parseCSV(rawAnchors).map((r) => ({
    period: r.period,
    scope: r.scope,
    published_figure: r.published_figure,
    source: r.source,
  }));

  cachedSpatialData = {
    metadata: {
      generatedAt: new Date().toISOString(),
      incidentsCount: incidents.length,
      rangeRiskCount: rangeRisk.length,
      staticFeaturesCount: staticFeatures.length,
      realAnchorsCount: realAnchors.length,
      yearMin: 2001,
      yearMax: 2025,
      ranges: staticFeatures.map((s) => s.range),
      crimeTypes: [
        'forest_fire_set',
        'illegal_felling',
        'illegal_grazing_encroachment',
        'retaliatory_livestock_killing',
        'herbivore_snaring',
        'tiger_poaching',
        'human_death_wildlife',
        'poisoning',
        'electrocution',
      ],
      riskClasses: ['Low', 'Moderate', 'High', 'Critical'],
      provenance: {
        incidents: 'Synthetic / Simulated Wildlife Crime Events (2001-2025)',
        rangeRisk: 'Supplied Range-Level Composite Vulnerability Index (0-100)',
        staticFeatures: 'Forest Range Physical & Anthropogenic Baseline Indicators',
        realAnchors: 'Official Published Reference Records (RTI, Lok Sabha, NTCA, Press Reports)',
      },
    },
    incidents,
    rangeRisk,
    staticFeatures,
    realAnchors,
  };

  return cachedSpatialData;
}

export const getSpatialData = asyncHandler(async (_req, res) => {
  const data = loadAllDatasets();
  res.json(data);
});

export const getSpatialSummary = asyncHandler(async (_req, res) => {
  const data = loadAllDatasets();
  res.json(data.metadata);
});

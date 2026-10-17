// Usage: npm run seed        (only when the database is empty)
//        npm run seed:reset  (wipes all portal collections first)
// All records below are SAMPLE data for UI development, not real field data.
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Observation } from '../models/Observation.js';
import { Incident } from '../models/Incident.js';
import { Patrol } from '../models/Patrol.js';
import { Alert } from '../models/Alert.js';
import { VegetationRecord } from '../models/VegetationRecord.js';
import { MapFeature } from '../models/MapFeature.js';
import { Dataset } from '../models/Dataset.js';
import { MLModel } from '../models/MLModel.js';
import { Report } from '../models/Report.js';
import { Counter } from '../models/Counter.js';

const ago = (hours) => new Date(Date.now() - hours * 3600000);
const loc = (name, zone, lat, lng) => ({ name, zone, lat, lng });

const GATES = {
  moharli: loc('Near Moharli Gate', 'Buffer Zone', 20.255, 79.31),
  kolsa: loc('Kolsa Range', 'Buffer Zone', 20.14, 79.28),
  navegaon: loc('Navegaon Zone', 'Buffer Zone', 20.2, 79.52),
  core: loc('Core Zone', 'Core Zone', 20.22, 79.38),
  ramdegi: loc('Near Ramdegi', 'Core Zone', 20.16, 79.4),
  northern: loc('Northern Zone', 'Buffer Zone', 20.34, 79.4),
};

async function run() {
  await connectDB();
  const reset = process.argv.includes('--reset');
  if (!reset && (await User.countDocuments()) > 0) {
    console.log('Database already has data. Use "npm run seed:reset" to wipe and reseed.');
    return;
  }
  if (reset) {
    await Promise.all([User, Observation, Incident, Patrol, Alert, VegetationRecord, MapFeature, Dataset, MLModel, Report, Counter].map((M) => M.deleteMany({})));
  }

  const admin = await User.create({
    ...env.seedAdmin,
    role: 'admin',
    designation: 'Forest Officer',
    range: 'Tadoba Andhari Tiger Reserve',
  });
  await User.create({ name: 'Field Officer (Sample)', email: 'officer@tadoba.local', password: env.seedAdmin.password, role: 'forest_officer', designation: 'Sub-Divisional Forest Officer', range: 'Core Zone' });
  await User.create({ name: 'Range Officer (Sample)', email: 'ranger@tadoba.local', password: env.seedAdmin.password, role: 'ranger', designation: 'Range Forest Officer', range: 'Moharli Range' });
  await User.create({ name: 'Analyst (Sample)', email: 'analyst@tadoba.local', password: env.seedAdmin.password, role: 'analyst', designation: 'GIS Analyst', range: 'Tadoba TR' });


  const camera = (i, name, lat, lng, status = 'Active') => ({ kind: 'camera_node', name: `CAM-${String(i).padStart(2, '0')} ${name}`, lat, lng, status });
  await MapFeature.insertMany([
    camera(1, 'Moharli', 20.26, 79.32), camera(2, 'Tadoba Lake', 20.21, 79.36), camera(3, 'Kolsa', 20.15, 79.29),
    camera(4, 'Ramdegi', 20.17, 79.41), camera(5, 'Navegaon', 20.21, 79.5), camera(6, 'Pandharpauni', 20.28, 79.38),
    camera(7, 'Jamunbodi', 20.19, 79.33, 'Maintenance'), camera(8, 'Kesalghat', 20.13, 79.36), camera(9, 'Bamboo Block', 20.25, 79.45),
    camera(10, 'Zari Gate', 20.33, 79.37, 'Inactive'),
    { kind: 'gate', name: 'Moharli Gate', lat: 20.255, lng: 79.31 }, { kind: 'gate', name: 'Kolsa Gate', lat: 20.14, lng: 79.28 },
    { kind: 'gate', name: 'Navegaon Gate', lat: 20.2, lng: 79.53 },
    { kind: 'village', name: 'Moharli Village', lat: 20.27, lng: 79.25 }, { kind: 'village', name: 'Kolsa Village', lat: 20.1, lng: 79.25 },
    { kind: 'village', name: 'Navegaon Village', lat: 20.18, lng: 79.57 },
    { kind: 'water_body', name: 'Tadoba Lake', lat: 20.205, lng: 79.355 }, { kind: 'water_body', name: 'Kolsa Lake', lat: 20.145, lng: 79.31 },
  ]);

  const obs = (species, category, confidence, location, hours, source = 'Camera Trap') => ({ species, category, confidence, location, source, observedAt: ago(hours), createdBy: admin._id });
  await Observation.insertMany([
    obs('Tiger', 'Tiger', 96, GATES.kolsa, 2), obs('Leopard', 'Leopard', 89, GATES.moharli, 4), obs('Wild Boar', 'Wild Boar', 87, GATES.navegaon, 6),
    obs('Sambar Deer', 'Deer', 91, GATES.navegaon, 26), obs('Indian Gaur', 'Others', 84, GATES.core, 30), obs('Sloth Bear', 'Others', 86, GATES.ramdegi, 50, 'Patrol'),
    obs('Chital', 'Deer', 93, GATES.core, 52), obs('Nilgai', 'Deer', 78, GATES.northern, 75), obs('Tiger', 'Tiger', 94, GATES.core, 100),
    obs('Wild Boar', 'Wild Boar', 90, GATES.kolsa, 120, 'Patrol'), obs('Leopard', 'Leopard', 82, GATES.northern, 150), obs('Chital', 'Deer', 88, GATES.ramdegi, 200),
  ]);

  const incident = (type, title, location, hours, status, priority, evidenceCount, description) => ({ type, title, location, occurredAt: ago(hours), status, priority, evidenceCount, description, createdBy: admin._id });
  for (const data of [
    incident('Snare', 'Snare detected', GATES.moharli, 6, 'Under Review', 'High', 3, 'Wire snare found near a game trail. Possible poaching attempt. Area shows recent animal movement.'),
    incident('Human Intrusion', 'Suspicious human movement', GATES.core, 14, 'Verified', 'High', 2, 'Camera node recorded two unidentified persons after dark.'),
    incident('Vehicle Activity', 'Unusual vehicle activity', GATES.kolsa, 40, 'Pending', 'Medium', 1, 'Vehicle tracks seen on a closed forest road.'),
    incident('Fire', 'Smoke reported', GATES.navegaon, 68, 'Verified', 'Medium', 2, 'Small ground fire reported by a watchtower; extinguished by fire watchers.'),
    incident('Poaching', 'Human footprints and carcass remains', GATES.northern, 90, 'Under Review', 'Low', 1, 'Footprints found near water body with partial carcass.'),
  ]) await Incident.create(data);

  const alert = (title, type, severity, location, hours) => ({ title, type, severity, location, raisedAt: ago(hours), createdBy: admin._id });
  await Alert.insertMany([
    alert('Unusual Vehicle Activity', 'Vehicle Activity', 'High', GATES.moharli, 2), alert('Suspicious Human Movement', 'Human Intrusion', 'High', GATES.core, 5),
    alert('Snare Detected', 'Snare', 'Medium', GATES.kolsa, 8), alert('Fire / Smoke', 'Fire', 'Medium', GATES.navegaon, 12),
    alert('Multiple Animal Sightings', 'Others', 'Low', GATES.core, 24),
  ]);

  const path = (pts) => pts;
  await Patrol.insertMany([
    { name: 'Route A - Core Zone', zone: 'Core Zone', date: ago(100), distanceKm: 8, observationsCount: 12, status: 'Completed', team: 'Team Alpha', path: path([[20.3, 79.31], [20.27, 79.36], [20.24, 79.4], [20.2, 79.38]]), createdBy: admin._id },
    { name: 'Route B - Buffer Zone', zone: 'Buffer Zone', date: ago(120), distanceKm: 6, observationsCount: 8, status: 'Completed', team: 'Team Bravo', path: path([[20.15, 79.28], [20.17, 79.33], [20.14, 79.38]]), createdBy: admin._id },
    { name: 'Route C - Moharli', zone: 'Buffer Zone', date: ago(150), distanceKm: 10, observationsCount: 15, status: 'Completed', team: 'Team Alpha', path: path([[20.26, 79.28], [20.29, 79.33], [20.34, 79.4], [20.31, 79.44]]), createdBy: admin._id },
    { name: 'Route D - Navegaon', zone: 'Buffer Zone', date: ago(180), distanceKm: 7, observationsCount: 9, status: 'Completed', team: 'Team Charlie', path: path([[20.24, 79.47], [20.2, 79.5], [20.16, 79.48]]), createdBy: admin._id },
    { name: 'Route E - Kolsa Ridge', zone: 'Buffer Zone', date: ago(-24), distanceKm: 9, observationsCount: 0, status: 'Planned', team: 'Team Bravo', path: [], createdBy: admin._id },
  ]);

  const veg = (area, zone, ndvi, canopyCover, habitatSuitability, health, hours) => ({ area, zone, ndvi, canopyCover, habitatSuitability, health, recordedAt: ago(hours), createdBy: admin._id });
  await VegetationRecord.insertMany([
    veg('Tadoba Lake Catchment', 'Core Zone', 0.71, 78, 91, 'Healthy', 72), veg('Kolsa Range', 'Buffer Zone', 0.58, 61, 74, 'Healthy', 96),
    veg('Moharli Plateau', 'Buffer Zone', 0.49, 52, 66, 'Moderate', 120), veg('Navegaon Teak Block', 'Buffer Zone', 0.43, 47, 58, 'Moderate', 144),
    veg('Northern Fringe', 'Periphery', 0.31, 29, 38, 'Stressed', 168),
  ]);

  await Dataset.insertMany([
    { name: 'Camera Trap Images', type: 'Animal', source: 'Field cameras', records: 52340, coverage: 'Tadoba TR', status: 'Active', createdBy: admin._id },
    { name: 'Satellite Imagery', type: 'Remote Sensing', source: 'Sentinel-2', records: 0, coverage: 'Tadoba + 20 km buffer', status: 'Active', createdBy: admin._id },
    { name: 'Land Cover Map', type: 'Vegetation', source: 'ESA WorldCover', records: 0, coverage: 'Maharashtra', status: 'Active', createdBy: admin._id },
    { name: 'Patrol Records', type: 'Field Data', source: 'M-STrIPES (ref.)', records: 8400, coverage: '2023-2026', status: 'Active', createdBy: admin._id },
    { name: 'Incident Records', type: 'Incident', source: 'Official Reports', records: 1230, coverage: 'Tadoba TR', status: 'Active', createdBy: admin._id },
  ]);
  await MLModel.insertMany([
    { name: 'Animal Detection', version: 'v1.1', accuracy: 92, status: 'Active', createdBy: admin._id },
    { name: 'Vegetation Classifier', version: 'v1.0', accuracy: 89, status: 'Active', createdBy: admin._id },
    { name: 'Risk Analysis', version: 'v0.1', accuracy: 76, status: 'Testing', createdBy: admin._id },
  ]);

  console.log(`Seed complete. Sign in with ${env.seedAdmin.email} / (SEED_ADMIN_PASSWORD from .env)`);
}

run()
  .catch((err) => { console.error('Seed failed:', err.message); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());

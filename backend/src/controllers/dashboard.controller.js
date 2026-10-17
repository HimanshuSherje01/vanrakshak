import { MapFeature } from '../models/MapFeature.js';
import { Observation } from '../models/Observation.js';
import { Patrol } from '../models/Patrol.js';
import { Alert } from '../models/Alert.js';
import { Incident } from '../models/Incident.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { zones } from '../config/zones.js';

export const getSummary = asyncHandler(async (_req, res) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [cameraNodes, sightings, patrols, flaggedAreas, openIncidents, latestAlerts, recentObservations] = await Promise.all([
    MapFeature.countDocuments({ kind: 'camera_node', status: 'Active' }),
    Observation.countDocuments({ observedAt: { $gte: weekAgo } }),
    Patrol.countDocuments({ date: { $gte: monthStart } }),
    Alert.distinct('location.name', { status: 'Open' }).then((names) => names.filter(Boolean).length),
    Incident.countDocuments({ status: { $in: ['Pending', 'Under Review'] } }),
    Alert.find({ status: 'Open' }).sort('-raisedAt').limit(5),
    Observation.find().sort('-observedAt').limit(4),
  ]);

  res.json({
    stats: { cameraNodes, sightings, patrols, flaggedAreas, openIncidents },
    latestAlerts,
    recentObservations,
  });
});

export const getMapLayers = asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
  const since = new Date(Date.now() - days * 86400000);

  const [features, observations, incidents, patrols] = await Promise.all([
    MapFeature.find(),
    Observation.find({ observedAt: { $gte: since }, 'location.lat': { $exists: true } }).sort('-observedAt').limit(300),
    Incident.find({ occurredAt: { $gte: since }, 'location.lat': { $exists: true } }).sort('-occurredAt').limit(300),
    Patrol.find({ date: { $gte: since }, 'path.0': { $exists: true } }).limit(100),
  ]);
  res.json({ zones, features, observations, incidents, patrols });
});

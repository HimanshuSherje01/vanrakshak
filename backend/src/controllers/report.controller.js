import { Report } from '../models/Report.js';
import { Observation } from '../models/Observation.js';
import { Incident } from '../models/Incident.js';
import { Alert } from '../models/Alert.js';
import { Patrol } from '../models/Patrol.js';
import { createCrud } from '../utils/crudFactory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const reportCrud = createCrud(Report, {
  searchFields: ['title'],
  filterFields: ['type'],
  defaultSort: '-createdAt',
  populate: { path: 'generatedBy', select: 'name designation' },
});

const countBy = (Model, dateField, field, start, end) =>
  Model.aggregate([
    { $match: { [dateField]: { $gte: start, $lte: end } } },
    { $group: { _id: `$${field}`, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).then((rows) => Object.fromEntries(rows.map((r) => [r._id, r.count])));

const fmt = (d) => d.toISOString().slice(0, 10);

export const generateReport = asyncHandler(async (req, res) => {
  const { type = 'Monthly Summary', from, to } = req.body || {};
  const end = to ? new Date(to) : new Date();
  end.setHours(23, 59, 59, 999);
  const start = from ? new Date(from) : new Date(end.getTime() - 30 * 86400000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    throw new ApiError(400, 'Provide a valid date range');
  }

  const [observationsBySpecies, incidentsByType, incidentsByStatus, alertsBySeverity, patrolAgg] = await Promise.all([
    countBy(Observation, 'observedAt', 'species', start, end),
    countBy(Incident, 'occurredAt', 'type', start, end),
    countBy(Incident, 'occurredAt', 'status', start, end),
    countBy(Alert, 'raisedAt', 'severity', start, end),
    Patrol.aggregate([
      { $match: { date: { $gte: start, $lte: end } } },
      { $group: { _id: null, routes: { $sum: 1 }, distanceKm: { $sum: '$distanceKm' }, observations: { $sum: '$observationsCount' } } },
    ]),
  ]);

  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
  const report = await Report.create({
    title: `${type} (${fmt(start)} to ${fmt(end)})`,
    type,
    periodStart: start,
    periodEnd: end,
    generatedBy: req.user._id,
    summary: {
      totals: {
        observations: sum(observationsBySpecies),
        incidents: sum(incidentsByType),
        alerts: sum(alertsBySeverity),
        patrolRoutes: patrolAgg[0]?.routes || 0,
        patrolDistanceKm: patrolAgg[0]?.distanceKm || 0,
      },
      observationsBySpecies,
      incidentsByType,
      incidentsByStatus,
      alertsBySeverity,
    },
  });
  await report.populate({ path: 'generatedBy', select: 'name designation' });
  res.status(201).json(report);
});

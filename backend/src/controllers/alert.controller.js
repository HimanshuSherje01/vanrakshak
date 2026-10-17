import { Alert } from '../models/Alert.js';
import { Incident } from '../models/Incident.js';
import { createCrud } from '../utils/crudFactory.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';

export const alertCrud = createCrud(Alert, {
  searchFields: ['title', 'location.name'],
  filterFields: ['severity', 'status', 'type'],
  dateField: 'raisedAt',
  defaultSort: '-raisedAt',
  populate: 'reviewedBy linkedIncident',
});

const REVIEW_ACTIONS = ['Reviewed', 'Dismissed', 'Escalated'];

/** PATCH /alerts/:id/review  { status, note } — Escalated also opens an incident. */
export const reviewAlert = asyncHandler(async (req, res) => {
  const { status, note } = req.body || {};
  if (!REVIEW_ACTIONS.includes(status)) throw new ApiError(400, `Status must be one of: ${REVIEW_ACTIONS.join(', ')}`);

  const alert = await Alert.findById(req.params.id);
  if (!alert) throw new ApiError(404, 'Alert not found');
  if (alert.status !== 'Open') throw new ApiError(409, 'This alert has already been reviewed');

  if (status === 'Escalated') {
    const incident = await Incident.create({
      type: alert.type,
      title: alert.title,
      description: note || `Escalated from alert raised on ${alert.raisedAt.toISOString()}`,
      location: alert.location,
      priority: alert.severity,
      status: 'Under Review',
      createdBy: req.user._id,
    });
    alert.linkedIncident = incident._id;
  }
  alert.status = status;
  alert.reviewNote = note;
  alert.reviewedBy = req.user._id;
  alert.reviewedAt = new Date();
  await alert.save();
  await alert.populate('reviewedBy linkedIncident');
  res.json(alert);
});

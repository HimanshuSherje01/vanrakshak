import mongoose from 'mongoose';
import { ALERT_STATUS, INCIDENT_TYPES, PRIORITIES } from '../config/constants.js';
import { locationSchema } from './schemas.js';

const alertSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    type: { type: String, enum: INCIDENT_TYPES, default: 'Others' },
    severity: { type: String, enum: PRIORITIES, default: 'Medium' },
    status: { type: String, enum: ALERT_STATUS, default: 'Open' },
    location: { type: locationSchema, default: {} },
    raisedAt: { type: Date, default: Date.now, index: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    reviewNote: { type: String, trim: true },
    linkedIncident: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Alert = mongoose.model('Alert', alertSchema);

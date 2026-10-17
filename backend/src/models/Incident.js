import mongoose from 'mongoose';
import { INCIDENT_TYPES, INCIDENT_STATUS, PRIORITIES } from '../config/constants.js';
import { locationSchema } from './schemas.js';
import { Counter } from './Counter.js';

const incidentSchema = new mongoose.Schema(
  {
    incidentId: { type: String, unique: true, sparse: true },
    type: { type: String, enum: INCIDENT_TYPES, required: [true, 'Incident type is required'] },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true },
    location: { type: locationSchema, default: {} },
    occurredAt: { type: Date, default: Date.now, index: true },
    status: { type: String, enum: INCIDENT_STATUS, default: 'Pending' },
    priority: { type: String, enum: PRIORITIES, default: 'Medium' },
    evidenceCount: { type: Number, min: 0, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

incidentSchema.pre('validate', async function assignIncidentId() {
  if (this.isNew && !this.incidentId) {
    const counter = await Counter.findOneAndUpdate({ key: 'incident' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
    this.incidentId = `INC${String(counter.seq).padStart(4, '0')}`;
  }
});

export const Incident = mongoose.model('Incident', incidentSchema);

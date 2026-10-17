import mongoose from 'mongoose';
import { PATROL_STATUS, ZONES } from '../config/constants.js';

const patrolSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Route name is required'], trim: true },
    zone: { type: String, enum: ZONES, default: 'Core Zone' },
    date: { type: Date, default: Date.now, index: true },
    distanceKm: { type: Number, min: 0, default: 0 },
    observationsCount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: PATROL_STATUS, default: 'Planned' },
    team: { type: String, trim: true },
    path: { type: [[Number]], default: [] }, // [[lat, lng], ...]
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Patrol = mongoose.model('Patrol', patrolSchema);

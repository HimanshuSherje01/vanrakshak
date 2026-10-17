import mongoose from 'mongoose';
import { SPECIES_CATEGORIES, OBSERVATION_SOURCES } from '../config/constants.js';
import { locationSchema } from './schemas.js';

const observationSchema = new mongoose.Schema(
  {
    species: { type: String, required: [true, 'Species is required'], trim: true },
    category: { type: String, enum: SPECIES_CATEGORIES, default: 'Others' },
    confidence: { type: Number, min: 0, max: 100, default: 100 },
    source: { type: String, enum: OBSERVATION_SOURCES, default: 'Manual Entry' },
    location: { type: locationSchema, default: {} },
    observedAt: { type: Date, default: Date.now, index: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Observation = mongoose.model('Observation', observationSchema);

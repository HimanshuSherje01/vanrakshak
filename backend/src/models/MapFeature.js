import mongoose from 'mongoose';
import { FEATURE_KINDS, FEATURE_STATUS } from '../config/constants.js';

const mapFeatureSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: FEATURE_KINDS, required: true },
    name: { type: String, required: [true, 'Name is required'], trim: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lng: { type: Number, required: true, min: -180, max: 180 },
    status: { type: String, enum: FEATURE_STATUS, default: 'Active' },
  },
  { timestamps: true }
);

export const MapFeature = mongoose.model('MapFeature', mapFeatureSchema);

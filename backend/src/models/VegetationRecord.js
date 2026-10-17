import mongoose from 'mongoose';
import { HEALTH_STATUS, ZONES } from '../config/constants.js';

const vegetationSchema = new mongoose.Schema(
  {
    area: { type: String, required: [true, 'Area name is required'], trim: true },
    zone: { type: String, enum: ZONES, default: 'Core Zone' },
    ndvi: { type: Number, min: -1, max: 1, required: [true, 'NDVI is required'] },
    canopyCover: { type: Number, min: 0, max: 100, default: 0 },
    habitatSuitability: { type: Number, min: 0, max: 100, default: 0 },
    health: { type: String, enum: HEALTH_STATUS, default: 'Healthy' },
    source: { type: String, trim: true, default: 'Sentinel-2' },
    recordedAt: { type: Date, default: Date.now, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const VegetationRecord = mongoose.model('VegetationRecord', vegetationSchema);

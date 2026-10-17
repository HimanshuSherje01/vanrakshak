import mongoose from 'mongoose';
import { ZONES } from '../config/constants.js';

export const locationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    zone: { type: String, enum: ZONES },
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
  },
  { _id: false }
);

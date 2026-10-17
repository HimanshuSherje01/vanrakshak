import mongoose from 'mongoose';
import { MODEL_STATUS } from '../config/constants.js';

const modelSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Model name is required'], trim: true },
    version: { type: String, trim: true, default: 'v0.1' },
    accuracy: { type: Number, min: 0, max: 100, default: 0 },
    status: { type: String, enum: MODEL_STATUS, default: 'Testing' },
    description: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const MLModel = mongoose.model('MLModel', modelSchema);

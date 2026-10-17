import mongoose from 'mongoose';
import { DATA_STATUS } from '../config/constants.js';

const datasetSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Dataset name is required'], trim: true },
    type: { type: String, trim: true },
    source: { type: String, trim: true },
    records: { type: Number, min: 0, default: 0 },
    coverage: { type: String, trim: true },
    status: { type: String, enum: DATA_STATUS, default: 'Active' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Dataset = mongoose.model('Dataset', datasetSchema);

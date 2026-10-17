import mongoose from 'mongoose';
import { REPORT_TYPES } from '../config/constants.js';

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: { type: String, enum: REPORT_TYPES, default: 'Monthly Summary' },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    summary: { type: mongoose.Schema.Types.Mixed, default: {} },
    generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);

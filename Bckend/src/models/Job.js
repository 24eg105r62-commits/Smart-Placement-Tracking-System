import { Schema, model } from 'mongoose';
import { BRANCHES } from '../constants/branches.js';

const jobSchema = new Schema(
  {
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    package: { type: Number, required: true, min: 0 }, // annual CTC in LPA
    location: { type: String, default: '', trim: true },
    eligibilityCgpa: { type: Number, required: true, min: 0, max: 10, default: 0 },
    eligibleBranches: { type: [String], enum: BRANCHES, default: [] },
    requiredSkills: { type: [String], default: [] },
    deadline: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', location: 'text' });
jobSchema.index({ deadline: 1 });
jobSchema.index({ package: 1 });
jobSchema.index({ requiredSkills: 1 });

export const JobModel = model('Job', jobSchema);

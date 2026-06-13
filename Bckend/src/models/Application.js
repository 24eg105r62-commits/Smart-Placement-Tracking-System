import { Schema, model } from 'mongoose';
import { APPLICATION_STATUS, APPLICATION_STATUS_VALUES } from '../constants/applicationStatus.js';

const applicationSchema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    status: { type: String, enum: APPLICATION_STATUS_VALUES, default: APPLICATION_STATUS.APPLIED },
    appliedAt: { type: Date, default: Date.now },
    statusHistory: {
      type: [
        {
          status: { type: String, enum: APPLICATION_STATUS_VALUES },
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: () => [{ status: APPLICATION_STATUS.APPLIED, changedAt: new Date() }],
    },
  },
  { timestamps: true }
);

// A student may only apply once per job
applicationSchema.index({ studentId: 1, jobId: 1 }, { unique: true });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ studentId: 1, status: 1 });

export const ApplicationModel = model('Application', applicationSchema);

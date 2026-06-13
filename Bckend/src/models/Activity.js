import { Schema, model } from 'mongoose';

const activitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'REGISTER',
        'PROFILE_UPDATED',
        'JOB_CREATED',
        'JOB_UPDATED',
        'APPLICATION_SUBMITTED',
        'APPLICATION_STATUS_CHANGED',
        'COMPANY_CREATED',
        'NOTIFICATION_SENT',
      ],
    },
    description: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

activitySchema.index({ userId: 1, timestamp: -1 });

export const ActivityModel = model('Activity', activitySchema);

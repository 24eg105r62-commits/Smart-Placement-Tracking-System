import { Schema, model } from 'mongoose';

const recruiterSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyName: { type: String, trim: true, default: '' },
    designation: { type: String, trim: true, default: '' },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', default: null },
  },
  { timestamps: true }
);

export const RecruiterModel = model('Recruiter', recruiterSchema);

import { Schema, model } from 'mongoose';

const companySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    logo: { type: String, default: '' },
    location: { type: String, default: '', trim: true },
    industry: { type: String, default: '', trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

companySchema.index({ name: 'text', industry: 'text', location: 'text' });

export const CompanyModel = model('Company', companySchema);

import { Schema, model } from 'mongoose';
import { BRANCHES } from '../constants/branches.js';

const studentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNumber: { type: String, trim: true, default: '' },
    branch: { type: String, enum: [...BRANCHES, ''], default: '' },
    cgpa: { type: Number, min: 0, max: 10, default: 0 },
    skills: { type: [String], default: [] },
    phone: { type: String, trim: true, default: '' },
    graduationYear: { type: Number, default: null },
    resumeUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

studentSchema.index({ branch: 1, cgpa: 1 });
studentSchema.index({ skills: 1 });

export const StudentModel = model('Student', studentSchema);

import mongoose from 'mongoose';

// Single-document counter pattern: one doc with _id='site' holds the running total.
const visitorSchema = new mongoose.Schema({
  _id: { type: String, default: 'site' },
  count: { type: Number, default: 0 },
});

export default mongoose.model('Visitor', visitorSchema);

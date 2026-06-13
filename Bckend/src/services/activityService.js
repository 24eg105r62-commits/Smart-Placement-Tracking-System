import { ActivityModel } from '../models/Activity.js';

export const logActivity = async (userId, action, description = '') => {
  try {
    await ActivityModel.create({ userId, action, description, timestamp: new Date() });
  } catch (err) {
    // Activity logging must never break the primary request flow
    console.error('Failed to log activity:', err.message);
  }
};

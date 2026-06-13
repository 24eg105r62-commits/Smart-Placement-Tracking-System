import { NotificationModel } from '../models/Notification.js';

export const createNotification = async ({ userId, title, message, type = 'GENERAL' }) =>
  NotificationModel.create({ userId, title, message, type });

export const createNotificationsForUsers = async (userIds, { title, message, type = 'GENERAL' }) => {
  if (!userIds || userIds.length === 0) return [];
  const docs = userIds.map((userId) => ({ userId, title, message, type }));
  return NotificationModel.insertMany(docs);
};

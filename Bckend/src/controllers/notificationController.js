import { NotificationModel } from '../models/Notification.js';
import { UserModel } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createNotificationsForUsers } from '../services/notificationService.js';
import { logActivity } from '../services/activityService.js';
import { ROLE_VALUES } from '../constants/roles.js';

// GET /api/notifications/me — query: unreadOnly, page, limit
export const myNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly, page = 1, limit = 20 } = req.query;
  const match = { userId: req.user.id };
  if (unreadOnly === 'true') match.isRead = false;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));

  const [notifications, total, unreadCount] = await Promise.all([
    NotificationModel.find(match).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    NotificationModel.countDocuments(match),
    NotificationModel.countDocuments({ userId: req.user.id, isRead: false }),
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      notifications,
      unreadCount,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    }, 'Notifications fetched')
  );
});

// PATCH /api/notifications/:id/read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );
  if (!notification) throw new ApiError(404, 'Notification not found');
  return res.status(200).json(new ApiResponse(200, { notification }, 'Notification marked as read'));
});

// PATCH /api/notifications/read-all
export const markAllAsRead = asyncHandler(async (req, res) => {
  await NotificationModel.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
  return res.status(200).json(new ApiResponse(200, null, 'All notifications marked as read'));
});

// POST /api/notifications/send (admin) — { title, message, audience: 'ALL' | 'STUDENT' | 'RECRUITER' | 'ADMIN', userIds? }
export const sendNotification = asyncHandler(async (req, res) => {
  const { title, message, audience = 'ALL', userIds } = req.body;
  if (!title || !message) throw new ApiError(400, 'title and message are required');

  let targetIds = [];
  if (Array.isArray(userIds) && userIds.length) {
    targetIds = userIds;
  } else if (audience === 'ALL') {
    const users = await UserModel.find().select('_id');
    targetIds = users.map((u) => u._id);
  } else if (ROLE_VALUES.includes(audience)) {
    const users = await UserModel.find({ role: audience }).select('_id');
    targetIds = users.map((u) => u._id);
  } else {
    throw new ApiError(400, `audience must be one of ALL, ${ROLE_VALUES.join(', ')}`);
  }

  await createNotificationsForUsers(targetIds, { title, message, type: 'GENERAL' });
  await logActivity(req.user.id, 'NOTIFICATION_SENT', `Sent "${title}" to ${targetIds.length} user(s) (${audience})`);

  return res.status(201).json(new ApiResponse(201, { recipientCount: targetIds.length }, 'Notification sent'));
});
